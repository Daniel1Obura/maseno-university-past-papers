import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../context/theme-context';

const PDF_VIEWER_HTML_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #525659; }
  #viewer { display: flex; flex-direction: column; align-items: center; padding: 10px 0; }
  canvas { margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); max-width: 100%; background: #FFFFFF; }
  #status { color: #FFFFFF; text-align: center; padding-top: 60px; font-family: sans-serif; font-size: 14px; }
</style>
</head>
<body>
<div id="status">Loading pages…</div>
<div id="viewer"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const base64Data = "BASE64_PLACEHOLDER";

  function base64ToUint8Array(base64) {
    const raw = atob(base64);
    const array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }

  const loadingTask = pdfjsLib.getDocument({ data: base64ToUint8Array(base64Data) });

  loadingTask.promise.then(function (pdf) {
    document.getElementById('status').style.display = 'none';
    const viewer = document.getElementById('viewer');

    function renderPage(pageNum) {
      pdf.getPage(pageNum).then(function (page) {
        const containerWidth = document.documentElement.clientWidth - 16;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        viewer.appendChild(canvas);

        const context = canvas.getContext('2d');
        page.render({ canvasContext: context, viewport: viewport });
      });
    }

    for (let i = 1; i <= pdf.numPages; i++) {
      renderPage(i);
    }
  }).catch(function (error) {
    document.getElementById('status').textContent = 'Failed to load PDF preview.';
  });
</script>
</body>
</html>`;

export default function PdfViewerScreen() {
  const { colors } = useTheme();

  const params = useLocalSearchParams<{
    code?: string;
    title?: string;
    year?: string;
    semester?: string;
    type?: string;
    pdfUrl?: string;
  }>();

  const code = params.code || 'CSC 221';
  const title = params.title || 'Database Systems';
  const year = params.year || '2025';
  const semester = params.semester || 'Semester 1';
  const type = params.type || 'Exam';
  const pdfUrl = params.pdfUrl || '';

  const [isWorking, setIsWorking] = useState(false);
  const [pdfHtml, setPdfHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const buildFileName = () => {
    return `${code}-${title}-${year}.pdf`.replace(/[^a-zA-Z0-9.-]+/g, '_');
  };

  /*
   * Used for actual "Download"/"Share" — saved permanently
   * into the app's document storage, visible in My Downloads.
   */
  const ensureLocalCopy = async (): Promise<InstanceType<typeof File>> => {
    const fileName = buildFileName();
    const destinationFile = new File(Paths.document, fileName);

    if (destinationFile.exists) {
      return destinationFile;
    }

    await FileSystemLegacy.downloadAsync(pdfUrl, destinationFile.uri);

    return destinationFile;
  };

  /*
   * Used only for the in-app preview — a temporary cached copy,
   * so simply viewing a paper doesn't clutter My Downloads.
   */
  const ensureCachedCopy = async (): Promise<InstanceType<typeof File>> => {
    const fileName = buildFileName();
    const cachedFile = new File(Paths.cache, fileName);

    if (cachedFile.exists) {
      return cachedFile;
    }

    await FileSystemLegacy.downloadAsync(pdfUrl, cachedFile.uri);

    return cachedFile;
  };

  useEffect(() => {
    if (!pdfUrl) {
      return;
    }

    let cancelled = false;

    const loadPreview = async () => {
      setPreviewLoading(true);
      setPreviewError(false);

      try {
        const cachedFile = await ensureCachedCopy();

        const base64 = await FileSystemLegacy.readAsStringAsync(
          cachedFile.uri,
          { encoding: FileSystemLegacy.EncodingType.Base64 }
        );

        if (cancelled) {
          return;
        }

        const html = PDF_VIEWER_HTML_TEMPLATE.replace(
          'BASE64_PLACEHOLDER',
          base64
        );

        setPdfHtml(html);
      } catch (error) {
        console.error('Preview load error:', error);
        if (!cancelled) {
          setPreviewError(true);
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  const sharePdf = async () => {
    if (!pdfUrl) {
      Alert.alert('No File', 'This paper has no PDF file to share.');
      return;
    }

    setIsWorking(true);

    try {
      const localFile = await ensureLocalCopy();

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          'Sharing unavailable',
          'Sharing is not available on this device.'
        );
        return;
      }

      await Sharing.shareAsync(localFile.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share PDF',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error('Share PDF error:', error);
      Alert.alert('Share Error', 'Unable to share the PDF. Please try again.');
    } finally {
      setIsWorking(false);
    }
  };

  const openPdf = async (fileUri: string) => {
    try {
      if (Platform.OS === 'android') {
        const contentUri = await FileSystemLegacy.getContentUriAsync(fileUri);

        await IntentLauncher.startActivityAsync(
          'android.intent.action.VIEW',
          {
            data: contentUri,
            flags: 1,
            type: 'application/pdf',
          }
        );
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
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

  const downloadPdf = async () => {
    if (!pdfUrl) {
      Alert.alert('No File', 'This paper has no PDF file to download.');
      return;
    }

    setIsWorking(true);

    try {
      const fileName = buildFileName();
      const destinationFile = new File(Paths.document, fileName);

      if (destinationFile.exists) {
        Alert.alert(
          'Already Downloaded',
          `${fileName} is already saved in the app.`,
          [
            { text: 'Open', onPress: () => openPdf(destinationFile.uri) },
            {
              text: 'Share',
              onPress: () => sharePdf(),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      await FileSystemLegacy.downloadAsync(pdfUrl, destinationFile.uri);

      Alert.alert(
        'Download Complete',
        `${fileName} has been downloaded successfully.`,
        [
          { text: 'Open', onPress: () => openPdf(destinationFile.uri) },
          { text: 'OK', style: 'default' },
        ]
      );
    } catch (error) {
      console.error('Download PDF error:', error);
      Alert.alert(
        'Download Error',
        'Unable to download the PDF. Please try again.'
      );
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.primaryGradient}
        style={styles.toolbar}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.toolbarInfo}>
          <Text style={styles.toolbarTitle} numberOfLines={1}>
            {code}
          </Text>
          <Text style={styles.toolbarSubtitle} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={sharePdf}
          disabled={isWorking}
        >
          <Ionicons name="share-outline" size={23} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <View
        style={[
          styles.infoCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={[styles.pdfIcon, { backgroundColor: colors.dangerSurface }]}>
          <Ionicons name="document-text" size={28} color={colors.danger} />
        </View>

        <View style={styles.paperInfo}>
          <Text style={[styles.paperCode, { color: colors.primary }]}>{code}</Text>
          <Text style={[styles.paperTitle, { color: colors.text }]}>{title}</Text>

          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.textMuted }]}>{year}</Text>
            <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
            <Text style={[styles.metaText, { color: colors.textMuted }]}>{semester}</Text>
            <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
            <Text style={[styles.metaText, { color: colors.textMuted }]}>{type}</Text>
          </View>
        </View>
      </View>

      {pdfUrl ? (
        previewLoading ? (
          <View style={styles.webviewLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.webviewLoadingText, { color: colors.textMuted }]}>
              Preparing preview...
            </Text>
          </View>
        ) : previewError || !pdfHtml ? (
          <View style={styles.noFileContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text style={[styles.noFileTitle, { color: colors.text }]}>
              Preview Unavailable
            </Text>
            <Text style={[styles.noFileText, { color: colors.textMuted }]}>
              Couldn't load a preview. You can still download the PDF
              below.
            </Text>
          </View>
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html: pdfHtml }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
          />
        )
      ) : (
        <View style={styles.noFileContainer}>
          <Ionicons
            name="document-text-outline"
            size={48}
            color={colors.textMuted}
          />
          <Text style={[styles.noFileTitle, { color: colors.text }]}>
            No PDF Available
          </Text>
          <Text style={[styles.noFileText, { color: colors.textMuted }]}>
            This paper doesn't have a file attached yet.
          </Text>
        </View>
      )}

      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.downloadButton,
            { backgroundColor: colors.primary },
            (!pdfUrl || isWorking) && styles.downloadButtonDisabled,
          ]}
          onPress={downloadPdf}
          disabled={!pdfUrl || isWorking}
        >
          {isWorking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="download-outline" size={22} color="#FFFFFF" />
              <Text style={styles.downloadText}>Download PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  toolbar: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  toolbarInfo: {
    flex: 1,
    marginHorizontal: 8,
  },

  toolbarTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  toolbarSubtitle: {
    color: '#DCE9FF',
    fontSize: 12,
    marginTop: 2,
  },

  toolbarButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoCard: {
    marginHorizontal: 12,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },

  pdfIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  paperInfo: {
    flex: 1,
  },

  paperCode: {
    fontSize: 14,
    fontWeight: '800',
  },

  paperTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  metaText: {
    fontSize: 11,
  },

  dot: {
    marginHorizontal: 5,
  },

  webview: {
    flex: 1,
    marginTop: 8,
  },

  webviewLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  webviewLoadingText: {
    marginTop: 10,
    fontSize: 13,
  },

  noFileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  noFileTitle: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: '700',
  },

  noFileText: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
  },

  bottomBar: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
  },

  downloadButton: {
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  downloadButtonDisabled: {
    opacity: 0.5,
  },

  downloadText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },
});