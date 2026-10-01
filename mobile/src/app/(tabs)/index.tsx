import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { API_ORIGIN } from '../../constants/api';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { resolvePdfUrl } from '../../utils/pdf-url';
import { School } from '../../data/schools';
import { usePapers } from '../../hooks/use-papers';
import { useTheme } from '../../context/theme-context';

export default function HomeScreen() {
  const { colors } = useTheme();

   const {
    schools: displaySchools,
    allPapers,
    recentPapers,
    getPapersForSchool,
    getDepartmentsForSchool,
    refreshing,
    refresh,
  } = usePapers();
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const [search, setSearch] = useState('');
  const [paperSearch, setPaperSearch] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredPapers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return [];
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

  const selectedPapers = useMemo(() => {
    if (!selectedSchool) {
      return [];
    }

    const schoolPapers = getPapersForSchool(selectedSchool.name);

    const query = paperSearch.trim().toLowerCase();

    if (!query) {
      return schoolPapers;
    }

    return schoolPapers.filter((paper) => {
      return (
        paper.code.toLowerCase().includes(query) ||
        paper.title.toLowerCase().includes(query) ||
        paper.year.toLowerCase().includes(query) ||
        paper.semester.toLowerCase().includes(query) ||
        paper.type.toLowerCase().includes(query) ||
        paper.departmentName?.toLowerCase().includes(query)
      );
    });
  }, [selectedSchool, paperSearch, getPapersForSchool]);

  const filteredSchools = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return displaySchools;
    }

    return displaySchools.filter((school) =>
      school.name.toLowerCase().includes(query)
    );
  }, [search, displaySchools]);

  const handleDrawerNavigation = (screen: string) => {
    setDrawerOpen(false);

    if (screen === 'home') {
      setSelectedSchool(null);
      setSearch('');
      setPaperSearch('');
      return;
    }

    if (screen === 'search') {
      router.push('/search');
      return;
    }

    if (screen === 'upload') {
      router.push('/upload');
      return;
    }

    if (screen === 'downloads') {
      router.push('/downloads');
      return;
    }

    if (screen === 'more') {
      router.push('/more');
      return;
    }

    if (screen === 'settings') {
      router.push('/settings');
      return;
    }

    if (screen === 'help') {
      router.push('/help');
      return;
    }

    if (screen === 'about') {
      router.push('/about');
      return;
    }
  };

  /*
   * SCHOOL VIEW
   */
  if (selectedSchool) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={colors.primaryGradient}
          style={styles.departmentHeader}
        >
          <View style={styles.departmentHeaderTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSelectedSchool(null);
                setPaperSearch('');
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.departmentHeaderText}>
              <Text style={styles.departmentHeaderTitle} numberOfLines={2}>
                {selectedSchool.name}
              </Text>

              <Text style={styles.departmentHeaderSubtitle}>
                {selectedSchool.papers} papers
              </Text>
            </View>
          </View>

          <View
            style={[styles.departmentSearchContainer, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="search-outline" size={20} color={colors.textMuted} />

            <TextInput
              value={paperSearch}
              onChangeText={setPaperSearch}
              placeholder="Search papers..."
              placeholderTextColor={colors.textMuted}
              style={[styles.departmentSearchInput, { color: colors.text }]}
            />

            {paperSearch.length > 0 && (
              <TouchableOpacity onPress={() => setPaperSearch('')}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
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
          {getDepartmentsForSchool(selectedSchool.name).length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>
                Departments
              </Text>

              <View style={styles.deptChipRow}>
                {getDepartmentsForSchool(selectedSchool.name).map((dept) => (
                  <View
                    key={dept.name}
                    style={[
                      styles.deptChip,
                      { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.deptChipText, { color: colors.text }]}>
                      {dept.name}
                    </Text>
                    <Text style={[styles.deptChipCount, { color: colors.primary }]}>
                      {dept.count}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Papers</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                Select a paper to view its past paper
              </Text>
            </View>

            <View style={[styles.countBadge, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                {selectedPapers.length}
              </Text>
            </View>
          </View>

          {selectedPapers.length > 0 ? (
            <View style={styles.courseList}>
              {selectedPapers.map((paper) => (
                <TouchableOpacity
                  key={`${paper.code}-${paper.year}-${paper.semester}-${paper.type}`}
                  style={[styles.courseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
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
                  <View style={[styles.courseIconContainer, { backgroundColor: colors.dangerSurface }]}>
                    <Ionicons name="document-text" size={22} color={colors.danger} />
                  </View>

                  <View style={styles.courseInfo}>
                    <Text style={[styles.courseCode, { color: colors.primary }]}>
                      {paper.code}
                    </Text>

                    <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={1}>
                      {paper.title}
                    </Text>

                    <View style={styles.paperMetaRow}>
                      <Text style={[styles.paperMetaText, { color: colors.textMuted }]}>
                        {paper.departmentName}
                      </Text>
                      <Text style={[styles.paperMetaDot, { color: colors.textMuted }]}>•</Text>
                      <Text style={[styles.paperMetaText, { color: colors.textMuted }]}>
                        {paper.year}
                      </Text>
                      <Text style={[styles.paperMetaDot, { color: colors.textMuted }]}>•</Text>
                      <Text style={[styles.paperMetaText, { color: colors.textMuted }]}>
                        {paper.semester}
                      </Text>
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={22} color={colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="document-text-outline" size={52} color={colors.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No papers found
              </Text>
              <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                Try searching using a different paper code, department, year or semester.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  /*
   * HOME VIEW
   */
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={colors.primaryGradient} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandContainer}>
            <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
              <Image
                source={require('../../../assets/images/maseno-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <View>
              <Text style={styles.brandTitle}>Past Papers</Text>
              <Text style={styles.brandSubtitle}>Maseno University</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.menuButton}
            activeOpacity={0.8}
            onPress={() => setDrawerOpen(true)}
          >
            <Ionicons name="menu" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search papers..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
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
        {search.trim().length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Papers</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                  Search results for your papers
                </Text>
              </View>

              <View style={[styles.countBadge, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                  {filteredPapers.length}
                </Text>
              </View>
            </View>

            {filteredPapers.length > 0 ? (
              <View style={styles.searchResultsList}>
                {filteredPapers.map((paper) => (
                  <TouchableOpacity
                    key={`${paper.schoolName ?? 'unknown'}-${paper.code}-${paper.year}-${paper.semester}-${paper.type}`}
                    style={[styles.searchDepartmentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    activeOpacity={0.85}
                    onPress={() => {
                      if (!paper.schoolName) {
                        return;
                      }

                      const school = displaySchools.find((item) => item.name === paper.schoolName);

                      if (school) {
                        setSelectedSchool(school);
                        setPaperSearch(paper.code);
                        setSearch('');
                      }
                    }}
                  >
                    <View style={[styles.searchDepartmentIcon, { backgroundColor: colors.dangerSurface }]}>
                      <Ionicons name="document-text" size={22} color={colors.danger} />
                    </View>

                    <View style={styles.searchDepartmentInfo}>
                      <Text style={[styles.searchDepartmentCode, { color: colors.primary }]}>
                        {paper.code}
                      </Text>

                      <Text style={[styles.searchDepartmentName, { color: colors.text }]} numberOfLines={1}>
                        {paper.title}
                      </Text>

                      <View style={styles.paperMetaRow}>
                        <Text style={[styles.paperMetaText, { color: colors.textMuted }]}>
                          {paper.year}
                        </Text>
                        <Text style={[styles.paperMetaDot, { color: colors.textMuted }]}>•</Text>
                        <Text style={[styles.paperMetaText, { color: colors.textMuted }]}>
                          {paper.semester}
                        </Text>
                        <Text style={[styles.paperMetaDot, { color: colors.textMuted }]}>•</Text>
                        <Text style={[styles.paperMetaText, { color: colors.textMuted }]}>
                          {paper.type}
                        </Text>
                      </View>

                      {paper.schoolName && (
                        <Text style={[styles.searchDepartmentPapers, { color: colors.primary }]} numberOfLines={1}>
                          {paper.departmentName} • {paper.schoolName}
                        </Text>
                      )}
                    </View>

                    <Ionicons name="chevron-forward" size={22} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="search-outline" size={52} color={colors.textMuted} />
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                  No papers found
                </Text>
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                  Try searching using a paper code, title, department, year, semester, or type.
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Schools & Departments
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                  Browse past papers by school
                </Text>
              </View>

              <View style={[styles.countBadge, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                  {displaySchools.length}
                </Text>
              </View>
            </View>

            <View style={styles.departmentGrid}>
              {filteredSchools.map((school) => (
                <TouchableOpacity
                  key={school.name}
                  style={[styles.departmentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setSelectedSchool(school);
                    setPaperSearch('');
                  }}
                >
                  <LinearGradient colors={school.colors} style={styles.departmentIcon}>
                    <Ionicons name={school.icon} size={25} color="#FFFFFF" />
                  </LinearGradient>

                  <Text style={[styles.departmentName, { color: colors.text }]} numberOfLines={3}>
                    {school.name}
                  </Text>

                  <Text style={[styles.departmentPapers, { color: colors.textMuted }]}>
                    {school.papers} papers
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recently Added</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                  Latest past papers
                </Text>
              </View>

              <TouchableOpacity onPress={() => router.push('/search')}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>View all</Text>
              </TouchableOpacity>
            </View>

            {recentPapers.length > 0 ? (
              <View style={styles.recentList}>
                {recentPapers.map((paper) => (
                  <TouchableOpacity
                    key={`${paper.code}-${paper.year}-${paper.semester}-${paper.type}`}
                    style={[styles.recentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
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
                    <View style={[styles.recentIcon, { backgroundColor: colors.dangerSurface }]}>
                      <Ionicons name="document-text" size={21} color={colors.danger} />
                    </View>

                    <View style={styles.recentInfo}>
                      <Text style={[styles.recentCode, { color: colors.primary }]}>
                        {paper.code}
                      </Text>
                      <Text style={[styles.recentTitle, { color: colors.text }]} numberOfLines={1}>
                        {paper.title}
                      </Text>
                      <Text style={[styles.recentMeta, { color: colors.textMuted }]}>
                        {paper.year} • {paper.semester}
                      </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={21} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                No recent papers to show yet.
              </Text>
            )}

            <View style={[styles.infoCard, { backgroundColor: colors.surfaceAlt }]}>
              <View style={[styles.infoIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name="information-circle-outline" size={25} color={colors.primary} />
              </View>

              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  Need a specific paper?
                </Text>
                <Text style={[styles.infoText, { color: colors.textMuted }]}>
                  Use Search to quickly find past papers by paper code or paper title.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {drawerOpen && (
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setDrawerOpen(false)}
          />

          <View style={[styles.drawer, { backgroundColor: colors.background }]}>
            <LinearGradient colors={colors.primaryGradient} style={styles.drawerHeader}>
              <View style={[styles.drawerLogo, { backgroundColor: colors.surface }]}>
                <Image
                  source={require('../../../assets/images/maseno-logo.png')}
                  style={styles.drawerLogoImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.drawerHeaderText}>
                <Text style={styles.drawerTitle}>Past Papers</Text>
                <Text style={styles.drawerSubtitle}>Maseno University</Text>
              </View>

              <TouchableOpacity
                style={styles.drawerCloseButton}
                onPress={() => setDrawerOpen(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
              <Text style={[styles.drawerSectionTitle, { color: colors.textMuted }]}>MAIN</Text>

              <TouchableOpacity
                style={styles.drawerItem}
                activeOpacity={0.75}
                onPress={() => handleDrawerNavigation('home')}
              >
                <View style={[styles.drawerIconContainer, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="home-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.drawerItemText, { color: colors.text }]}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                activeOpacity={0.75}
                onPress={() => handleDrawerNavigation('search')}
              >
                <View style={[styles.drawerIconContainer, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="search-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.drawerItemText, { color: colors.text }]}>Search</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                activeOpacity={0.75}
                onPress={() => handleDrawerNavigation('upload')}
              >
                <View style={[styles.drawerIconContainer, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.drawerItemText, { color: colors.text }]}>Upload Papers</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                activeOpacity={0.75}
                onPress={() => handleDrawerNavigation('downloads')}
              >
                <View style={[styles.drawerIconContainer, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="download-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.drawerItemText, { color: colors.text }]}>Downloads</Text>
              </TouchableOpacity>

              <View style={[styles.drawerDivider, { backgroundColor: colors.border }]} />

              <Text style={[styles.drawerSectionTitle, { color: colors.textMuted }]}>OPTIONS</Text>

              <TouchableOpacity
                style={styles.drawerItem}
                activeOpacity={0.75}
                onPress={() => handleDrawerNavigation('more')}
              >
                <View style={[styles.drawerIconContainer, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="ellipsis-horizontal-circle-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.drawerItemText, { color: colors.text }]}>More</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                activeOpacity={0.75}
                onPress={() => handleDrawerNavigation('settings')}
              >
                <View style={[styles.drawerIconContainer, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="settings-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.drawerItemText, { color: colors.text }]}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                activeOpacity={0.75}
                onPress={() => handleDrawerNavigation('help')}
              >
                <View style={[styles.drawerIconContainer, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.drawerItemText, { color: colors.text }]}>Help & Support</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                activeOpacity={0.75}
                onPress={() => handleDrawerNavigation('about')}
              >
                <View style={[styles.drawerIconContainer, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.drawerItemText, { color: colors.text }]}>About App</Text>
              </TouchableOpacity>

              <View style={[styles.drawerDivider, { backgroundColor: colors.border }]} />

              <Text style={[styles.drawerSectionTitle, { color: colors.textMuted }]}>ADMINISTRATION</Text>

              <TouchableOpacity
                style={[styles.adminDrawerItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.8}
                onPress={() => {
                  setDrawerOpen(false);
                  console.log('Admin Access selected');
                }}
              >
                <View style={[styles.adminIconContainer, { backgroundColor: colors.primary }]}>
                  <Ionicons name="shield-checkmark-outline" size={22} color="#FFFFFF" />
                </View>

                <View style={styles.adminTextContainer}>
                  <Text style={[styles.adminTitle, { color: colors.text }]}>Admin Access</Text>
                  <Text style={[styles.adminSubtitle, { color: colors.textMuted }]}>
                    Administration panel
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </TouchableOpacity>

              <View style={styles.drawerFooter}>
                <Text style={[styles.drawerFooterTitle, { color: colors.text }]}>
                  Maseno University Past Papers
                </Text>
                <Text style={[styles.drawerFooterSubtitle, { color: colors.textMuted }]}>
                  Knowledge • Excellence • Service
                </Text>
                <Text style={[styles.drawerVersion, { color: colors.textMuted }]}>
                  Version 1.0.0
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  brandContainer: { flexDirection: 'row', alignItems: 'center' },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    overflow: 'hidden',
  },
  logoImage: { width: 32, height: 32 },
  brandTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },
  brandSubtitle: { color: '#DCE9FF', fontSize: 12, marginTop: 2 },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
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
  searchInput: { flex: 1, marginLeft: 9, fontSize: 14 },
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 35 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionSubtitle: { fontSize: 12, marginTop: 3 },
  countBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deptChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  deptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  deptChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deptChipCount: {
    fontSize: 11,
    fontWeight: '800',
  },

  countBadgeText: { fontSize: 12, fontWeight: '800' },
  departmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  departmentCard: {
    width: '48.2%',
    borderRadius: 18,
    padding: 15,
    marginBottom: 13,
    borderWidth: 1,
    minHeight: 140,
  },
  departmentIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  departmentName: { fontSize: 13, fontWeight: '800', minHeight: 54 },
  departmentPapers: { fontSize: 11, marginTop: 6 },
  recentList: { marginBottom: 22 },
  recentCard: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  recentInfo: { flex: 1 },
  recentCode: { fontSize: 11, fontWeight: '800' },
  recentTitle: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  recentMeta: { fontSize: 10, marginTop: 3 },
  viewAllText: { fontSize: 12, fontWeight: '700' },
  infoCard: {
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '800' },
  infoText: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  departmentHeader: {
    paddingTop: 52,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  departmentHeaderTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  departmentHeaderText: { flex: 1 },
  departmentHeaderTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  departmentHeaderSubtitle: { color: '#DCE9FF', fontSize: 12, marginTop: 3 },
  departmentSearchContainer: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  departmentSearchInput: { flex: 1, marginLeft: 9, fontSize: 14 },
  courseList: { marginBottom: 25 },
  courseCard: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  courseIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  courseInfo: { flex: 1 },
  courseCode: { fontSize: 11, fontWeight: '800' },
  courseTitle: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  paperMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 4 },
  paperMetaText: { fontSize: 10 },
  paperMetaDot: { fontSize: 10, marginHorizontal: 4 },
  emptyState: {
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 42,
  },
  emptyStateTitle: { fontSize: 16, fontWeight: '800', marginTop: 12 },
  emptyStateText: { fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 5 },
  searchResultsList: { marginBottom: 25 },
  searchDepartmentCard: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchDepartmentIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  searchDepartmentInfo: { flex: 1 },
  searchDepartmentCode: { fontSize: 11, fontWeight: '800' },
  searchDepartmentName: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  searchDepartmentPapers: { fontSize: 10, fontWeight: '600', marginTop: 3 },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 100,
    elevation: 100,
  },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  drawer: {
    width: '82%',
    maxWidth: 350,
    height: '100%',
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  drawerHeader: { paddingTop: 55, paddingHorizontal: 18, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' },
  drawerLogo: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  drawerLogoImage: { width: 36, height: 36 },
  drawerHeaderText: { flex: 1 },
  drawerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  drawerSubtitle: { color: '#DCE9FF', fontSize: 11, marginTop: 3 },
  drawerCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerContent: { flex: 1, paddingHorizontal: 14, paddingTop: 18 },
  drawerSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginHorizontal: 8,
    marginBottom: 7,
  },
  drawerItem: {
    height: 52,
    borderRadius: 13,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  drawerIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  drawerItemText: { flex: 1, fontSize: 14, fontWeight: '700' },
  drawerDivider: { height: 1, marginVertical: 13 },
  adminDrawerItem: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  adminIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  adminTextContainer: { flex: 1 },
  adminTitle: { fontSize: 13, fontWeight: '800' },
  adminSubtitle: { fontSize: 10, marginTop: 3 },
  drawerFooter: { alignItems: 'center', paddingTop: 10, paddingBottom: 30 },
  drawerFooterTitle: { fontSize: 12, fontWeight: '800' },
  drawerFooterSubtitle: { fontSize: 10, marginTop: 4 },
  drawerVersion: { fontSize: 9, marginTop: 7 },
});