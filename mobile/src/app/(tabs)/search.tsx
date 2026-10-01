import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
   RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { usePapers } from '../../hooks/use-papers';
import { useTheme } from '../../context/theme-context';
import { API_ORIGIN } from '@/constants/api';

import { resolvePdfUrl } from '../../utils/pdf-url';

export default function SearchScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const { allPapers, loading , refreshing, refresh } = usePapers();

  const filteredPapers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return allPapers;
    }

    return allPapers.filter((paper) => {
      return (
        paper.code.toLowerCase().includes(query) ||
        paper.title.toLowerCase().includes(query) ||
        paper.year.toLowerCase().includes(query) ||
        paper.semester.toLowerCase().includes(query) ||
        paper.type.toLowerCase().includes(query) ||
        paper.departmentName?.toLowerCase().includes(query) ||
        paper.schoolName?.toLowerCase().includes(query)
      );
    });
  }, [allPapers, search]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.primaryGradient}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.brandContainer}>
            <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
              <Ionicons
                name="search"
                size={22}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.brandTitle}>
                Search Papers
              </Text>

              <Text style={styles.brandSubtitle}>
                Across all departments
              </Text>
            </View>
          </View>
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
            placeholder="Search course, unit or year..."
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
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {search ? 'Search Results' : 'All Papers'}
            </Text>

            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              {search
                ? 'Matching your search'
                : 'Browse every paper in the system'}
            </Text>
          </View>

          <View style={[styles.countBadge, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.countBadgeText, { color: colors.primary }]}>
              {loading ? '…' : filteredPapers.length}
            </Text>
          </View>
        </View>

        {filteredPapers.length > 0 ? (
          <View style={styles.resultsList}>
            {filteredPapers.map((paper) => (
              <TouchableOpacity
                key={`${paper.departmentName ?? 'unknown'}-${paper.code}-${paper.year}-${paper.semester}-${paper.type}`}
                style={[styles.paperCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: '/pdf-viewer',
                    params: {
                      code: paper.code,
                      title: paper.title,
                      year: paper.year,
                      semester: paper.semester,
                      type: paper.type,
                      pdfUrl: resolvePdfUrl(paper.pdf_url),
                    },
                  })
                }
              >
                <View style={[styles.paperIcon, { backgroundColor: colors.dangerSurface }]}>
                  <Ionicons
                    name="document-text"
                    size={22}
                    color={colors.danger}
                  />
                </View>

                <View style={styles.paperInfo}>
                  <Text style={[styles.paperCode, { color: colors.primary }]}>
                    {paper.code}
                  </Text>

                  <Text
                    style={[styles.paperTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {paper.title}
                  </Text>

                  <View style={styles.paperMetaRow}>
                    <Text style={[styles.paperMetaText, { color: colors.textMuted }]}>
                      {paper.year}
                    </Text>

                    <Text style={[styles.paperMetaDot, { color: colors.textMuted }]}>
                      •
                    </Text>

                    <Text style={[styles.paperMetaText, { color: colors.textMuted }]}>
                      {paper.semester}
                    </Text>

                    <Text style={[styles.paperMetaDot, { color: colors.textMuted }]}>
                      •
                    </Text>

                    <Text style={[styles.paperMetaText, { color: colors.textMuted }]}>
                      {paper.type}
                    </Text>
                  </View>

                  {paper.departmentName && (
                  <Text style={styles.paperDepartment} numberOfLines={1}>
                    {paper.departmentName}
                    {paper.schoolName ? ` • ${paper.schoolName}` : ''}
                  </Text>
                )}
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          !loading && (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons
                name="document-text-outline"
                size={52}
                color={colors.textMuted}
              />

              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No papers found
              </Text>

              <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                Try searching using a different paper code, title,
                year, semester, or paper type.
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

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
    marginBottom: 18,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  brandTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  brandSubtitle: {
    color: '#DCE9FF',
    fontSize: 12,
    marginTop: 2,
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

  content: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 35,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },

  sectionSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },

  resultsList: {
    marginBottom: 25,
  },

  paperCard: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  paperIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  paperInfo: {
    flex: 1,
  },

  paperCode: {
    fontSize: 11,
    fontWeight: '800',
  },

  paperTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },

  paperMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },

  paperMetaText: {
    fontSize: 10,
  },

  paperMetaDot: {
    fontSize: 10,
    marginHorizontal: 4,
  },

  paperDepartment: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },

  emptyState: {
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 42,
  },

  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },

  emptyStateText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 5,
  },
});