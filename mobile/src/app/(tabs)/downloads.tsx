import { Ionicons } from '@expo/vector-icons';
import { Directory, File, Paths } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import { useTheme } from '../../context/theme-context';

type DownloadedPaper = {
  id: string;
  uri: string;
  fileName: string;
  code: string;
  title: string;
  year: string;
  sizeLabel: string;
};

const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/*
 * File names are written by pdf-viewer.tsx as `${code}-${title}-${year}.pdf`,
 * with spaces/other characters collapsed to underscores. We reverse that
 * here just well enough to display something readable.
 */
const parseFileName = (fileName: string) => {
  const nameWithoutExt = fileName.replace(/\.pdf$/i, '');
  const parts = nameWithoutExt.split('-');

  const code = (parts[0] ?? nameWithoutExt).replace(/_/g, ' ');
  const year = parts.length > 1 ? parts[parts.length - 1] : '';
  const title =
    parts.length > 2
      ? parts.slice(1, -1).join('-').replace(/_/g, ' ')
      : '';

  return {
    code,
    title: title || 'Untitled Paper',
    year,
  };
};

export default function DownloadsScreen() {
  const { colors } = useTheme();
  const [downloads, setDownloads] = useState<DownloadedPaper[]>([]);
  const [search, setSearch] = useState('');

  const loadDownloads = useCallback(() => {
    try {
      const documentsDir = new Directory(Paths.document);

      if (!documentsDir.exists) {
        setDownloads([]);
        return;
      }

      const entries = documentsDir.list();

      const pdfFiles: DownloadedPaper[] = entries
        .filter(
          (entry): entry is File =>
            entry instanceof File &&
            entry.name.toLowerCase().endsWith('.pdf')
        )
        .map((file) => {
          const { code, title, year } = parseFileName(file.name);

          return {
            id: file.uri,
            uri: file.uri,
            fileName: file.name,
            code,
            title,
            year,
            sizeLabel: formatFileSize(file.size),
          };
        })
        .sort((a, b) => a.fileName.localeCompare(b.fileName));

      setDownloads(pdfFiles);
    } catch (error) {
      console.error('Error loading downloads:', error);
      setDownloads([]);
    }
  }, []);

  // Refresh every time this tab comes into focus, so a paper
  // downloaded from pdf-viewer shows up immediately.
  useFocusEffect(
    useCallback(() => {
      loadDownloads();
    }, [loadDownloads])
  );

  const filteredDownloads = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return downloads;
    }

    return downloads.filter(
      (paper) =>
        paper.code.toLowerCase().includes(query) ||
        paper.title.toLowerCase().includes(query) ||
        paper.year.toLowerCase().includes(query)
    );
  }, [downloads, search]);

  const removeDownload = (item: DownloadedPaper) => {
    Alert.alert(
      'Remove Download',
      'Remove this paper from your downloads? This will permanently delete the file.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            try {
              const file = new File(item.uri);
              file.delete();

              setDownloads((current) =>
                current.filter((paper) => paper.id !== item.id)
              );
            } catch (error) {
              console.error('Delete PDF error:', error);
              Alert.alert(
                'Delete Error',
                'Unable to delete this file.'
              );
            }
          },
        },
      ]
    );
  };

  const openPaper = async (item: DownloadedPaper) => {
    try {
      if (Platform.OS === 'android') {
        const contentUri = await FileSystemLegacy.getContentUriAsync(
          item.uri
        );

        await IntentLauncher.startActivityAsync(
          'android.intent.action.VIEW',
          {
            data: contentUri,
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
            type: 'application/pdf',
          }
        );
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(item.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Open PDF',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert(
            'Cannot Open PDF',
            'No application is available to open this PDF.'
          );
        }
      }
    } catch (error) {
      console.error('Open PDF error:', error);
      Alert.alert('Open Error', 'Unable to open the downloaded PDF.');
    }
  };

  const hasQuery = search.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER (pinned, same style as Home and Search) */}
      <LinearGradient
        colors={colors.primaryGradient}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Ionicons
              name="download-outline"
              size={29}
              color="#FFFFFF"
            />

            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>
                My Downloads
              </Text>

              <Text style={styles.headerSubtitle}>
                Saved past examination papers
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.headerMenu}
            onPress={() =>
              Alert.alert(
                'Downloads',
                `${downloads.length} saved paper${
                  downloads.length === 1 ? '' : 's'
                }`
              )
            }
          >
            <Ionicons
              name="ellipsis-vertical"
              size={23}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textMuted}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search downloaded papers..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SECTION HEADER */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Downloaded Papers
          </Text>

          <Text style={[styles.viewCount, { color: colors.primary }]}>
            {filteredDownloads.length} {hasQuery ? 'found' : 'saved'}
          </Text>
        </View>

        {/* PAPER LIST */}
        {filteredDownloads.length > 0 ? (
          filteredDownloads.map((paper) => (
            <View
              key={paper.id}
              style={[
                styles.paperCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {/* PDF ICON */}
              <View style={[styles.pdfIcon, { backgroundColor: colors.danger }]}>
                <View style={styles.pdfTop} />
                <Text style={styles.pdfText}>PDF</Text>
              </View>

              {/* PAPER INFORMATION */}
              <View style={styles.paperInfo}>
                <Text style={[styles.paperTitle, { color: colors.text }]}>
                  {paper.code} - {paper.title}
                </Text>

                <Text style={[styles.paperDetails, { color: colors.textMuted }]}>
                  {[paper.year, paper.sizeLabel]
                    .filter(Boolean)
                    .join(' \u2022 ')}
                </Text>

                <View style={styles.bottomRow}>
                  <View style={styles.pdfLabel}>
                    <Ionicons
                      name="document-text"
                      size={12}
                      color={colors.danger}
                    />

                    <Text style={[styles.pdfLabelText, { color: colors.textMuted }]}>
                      PDF
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.downloadButton,
                      { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => openPaper(paper)}
                  >
                    <Ionicons
                      name="eye-outline"
                      size={14}
                      color={colors.primary}
                    />

                    <Text style={[styles.downloadText, { color: colors.primary }]}>
                      Open
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* DELETE */}
              <TouchableOpacity
                style={styles.deleteButton}
                activeOpacity={0.7}
                onPress={() => removeDownload(paper)}
              >
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons
                name={downloads.length === 0 ? 'download-outline' : 'search-outline'}
                size={42}
                color={colors.primary}
              />
            </View>

            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {downloads.length === 0
                ? 'No Downloaded Papers'
                : 'No Matching Papers'}
            </Text>

            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {downloads.length === 0
                ? 'Papers you download will appear here for easy access.'
                : 'Try a different course code, title or year.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 22,
    paddingBottom: 35,
  },

  /* HEADER (matches Home and Search) */

  header: {
    paddingTop: 52,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerText: {
    marginLeft: 11,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#E7F0FF',
    fontSize: 12,
    marginTop: 2,
  },

  headerMenu: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchContainer: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
  },

  /* SECTION */

  sectionHeader: {
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  viewCount: {
    fontSize: 11,
  },

  /* PAPER CARD */

  paperCard: {
    marginHorizontal: 14,
    marginBottom: 8,
    minHeight: 94,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* RED PDF ICON */

  pdfIcon: {
    width: 43,
    height: 50,
    borderRadius: 5,
    marginRight: 11,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  pdfTop: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 13,
    height: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  pdfText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  /* INFORMATION */

  paperInfo: {
    flex: 1,
  },

  paperTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },

  paperDetails: {
    fontSize: 10,
    marginBottom: 6,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pdfLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },

  pdfLabelText: {
    marginLeft: 3,
    fontSize: 9,
  },

  downloadButton: {
    height: 25,
    paddingHorizontal: 9,
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  downloadText: {
    marginLeft: 4,
    fontSize: 9,
    fontWeight: '700',
  },

  /* DELETE */

  deleteButton: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
  },

  /* EMPTY STATE */

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 35,
    paddingTop: 80,
  },

  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  emptyText: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 19,
  },
});