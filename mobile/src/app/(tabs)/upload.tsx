import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { API_BASE_URL } from '../../constants/api';
import { ALL_SCHOOL_NAMES } from '../../data/schools';
import { useTheme } from '../../context/theme-context';

const semesters = ['Semester 1', 'Semester 2'];

const paperTypes = ['CAT', 'Main Exam', 'Supplementary Exam'];

export default function UploadScreen() {
  const { colors } = useTheme();

  const [school, setSchool] = useState('');
  const [department, setDepartment] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [paperType, setPaperType] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUri, setFileUri] = useState('');

  const [showSchools, setShowSchools] = useState(false);
  const [showSemesters, setShowSemesters] = useState(false);
  const [showPaperTypes, setShowPaperTypes] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        const file = result.assets[0];
        setFileName(file.name);
        setFileUri(file.uri);
      }
    } catch (error) {
      Alert.alert('File Selection Error', 'Something went wrong while selecting the PDF.');
    }
  };

  const resetForm = () => {
    setSchool('');
    setDepartment('');
    setCourseCode('');
    setCourseName('');
    setYear('');
    setSemester('');
    setPaperType('');
    setFileName('');
    setFileUri('');
  };

  const submitPaper = async () => {
    if (
      !school ||
      !department.trim() ||
      !courseCode.trim() ||
      !courseName.trim() ||
      !year.trim() ||
      !semester ||
      !paperType ||
      !fileName ||
      !fileUri
    ) {
      Alert.alert(
        'Incomplete Information',
        'Please complete all fields and select a PDF before submitting.'
      );
      return;
    }

    if (year.length !== 4) {
      Alert.alert('Invalid Year', 'Please enter a valid 4-digit academic year.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('school', school);
      formData.append('department', department.trim());
      formData.append('code', courseCode.trim());
      formData.append('title', courseName.trim());
      formData.append('year', year);
      formData.append('semester', semester);
      formData.append('type', paperType);

      const fileResponse = await fetch(fileUri);
      const rawBlob = await fileResponse.blob();
      const pdfBlob = rawBlob.slice(0, rawBlob.size, 'application/pdf');
      formData.append('pdf', pdfBlob, fileName);

      const response = await fetch(`${API_BASE_URL}/papers`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      Alert.alert('Paper Submitted', 'Your paper has been uploaded successfully.');
      resetForm();
    } catch (error) {
  console.error('Submit paper error:', error);

  const errorMessage = error instanceof Error ? error.message : String(error);

  const isNetworkError =
    error instanceof TypeError ||
    errorMessage.includes('Network request failed') ||
    errorMessage.includes('UnknownHostException') ||
    errorMessage.includes('Unable to resolve host') ||
    errorMessage.includes('Failed to fetch');

  if (isNetworkError) {
    Alert.alert(
      'No Internet Connection',
      'Please check your internet connection and try again.'
    );
  } else {
    Alert.alert(
      'Upload Failed',
      errorMessage || 'Something went wrong while uploading your paper.'
    );
  }
}finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Submit Paper</Text>
            <Text style={styles.headerSubtitle}>Help other students access past papers</Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="cloud-upload-outline" size={25} color="#FFFFFF" />
          </View>
        </View>

        <View
          style={[styles.infoCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
        >
          <View style={[styles.infoIcon, { backgroundColor: colors.surface }]}>
            <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          </View>

          <View style={styles.infoText}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Paper Submission</Text>
            <Text style={[styles.infoDescription, { color: colors.textMuted }]}>
              Submit a clear PDF of a past examination paper. All submissions are reviewed before
              being added to the system.
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Paper Details</Text>

        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* School */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>School</Text>

          <TouchableOpacity
            style={[styles.selectBox, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => {
              setShowSchools(!showSchools);
              setShowSemesters(false);
              setShowPaperTypes(false);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="business-outline" size={20} color={colors.primary} />

            <Text
              style={[styles.selectText, { color: school ? colors.text : colors.textMuted }]}
              numberOfLines={1}
            >
              {school || 'Select school'}
            </Text>

            <Ionicons
              name={showSchools ? 'chevron-up' : 'chevron-down'}
              size={19}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {showSchools && (
            <View
              style={[styles.dropdown, styles.dropdownScrollable, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <ScrollView nestedScrollEnabled>
                {ALL_SCHOOL_NAMES.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setSchool(item);
                      setShowSchools(false);
                    }}
                  >
                    <Text style={[styles.dropdownText, { color: colors.text }]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Department (free text) */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Department</Text>

          <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="git-branch-outline" size={20} color={colors.primary} />

            <TextInput
              value={department}
              onChangeText={setDepartment}
              placeholder="e.g. Computer Science"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          {/* Course Code */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Course / Unit Code</Text>

          <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="code-slash-outline" size={20} color={colors.primary} />

            <TextInput
              value={courseCode}
              onChangeText={setCourseCode}
              placeholder="e.g. CSC 221"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          {/* Course Name */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Course / Unit Name</Text>

          <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="book-outline" size={20} color={colors.primary} />

            <TextInput
              value={courseName}
              onChangeText={setCourseName}
              placeholder="e.g. Database Systems"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          {/* Year */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Academic Year</Text>

          <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />

            <TextInput
              value={year}
              onChangeText={(text) => setYear(text.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 2025"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={4}
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          {/* Semester */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Semester</Text>

          <TouchableOpacity
            style={[styles.selectBox, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => {
              setShowSemesters(!showSemesters);
              setShowSchools(false);
              setShowPaperTypes(false);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="layers-outline" size={20} color={colors.primary} />

            <Text style={[styles.selectText, { color: semester ? colors.text : colors.textMuted }]}>
              {semester || 'Select semester'}
            </Text>

            <Ionicons
              name={showSemesters ? 'chevron-up' : 'chevron-down'}
              size={19}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {showSemesters && (
            <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {semesters.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setSemester(item);
                    setShowSemesters(false);
                  }}
                >
                  <Text style={[styles.dropdownText, { color: colors.text }]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Paper Type */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Paper Type</Text>

          <TouchableOpacity
            style={[styles.selectBox, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => {
              setShowPaperTypes(!showPaperTypes);
              setShowSchools(false);
              setShowSemesters(false);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />

            <Text style={[styles.selectText, { color: paperType ? colors.text : colors.textMuted }]}>
              {paperType || 'Select paper type'}
            </Text>

            <Ionicons
              name={showPaperTypes ? 'chevron-up' : 'chevron-down'}
              size={19}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {showPaperTypes && (
            <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {paperTypes.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setPaperType(item);
                    setShowPaperTypes(false);
                  }}
                >
                  <Text style={[styles.dropdownText, { color: colors.text }]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Past Paper PDF</Text>

        <TouchableOpacity
          style={[
            styles.uploadBox,
            {
              borderColor: fileName ? colors.success : colors.primary,
              backgroundColor: fileName ? colors.successSurface : colors.surfaceAlt,
            },
          ]}
          onPress={selectFile}
          activeOpacity={0.8}
        >
          <View
            style={[styles.pdfCircle, { backgroundColor: fileName ? colors.successSurface : colors.surface }]}
          >
            <Ionicons
              name={fileName ? 'checkmark-circle-outline' : 'document-attach-outline'}
              size={29}
              color={fileName ? colors.success : colors.primary}
            />
          </View>

          {fileName ? (
            <>
              <Text style={[styles.fileSelected, { color: colors.success }]} numberOfLines={2}>
                {fileName}
              </Text>
              <Text style={[styles.fileHint, { color: colors.textMuted }]}>
                Tap to select another PDF
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.uploadTitle, { color: colors.text }]}>Select Past Paper PDF</Text>
              <Text style={[styles.uploadHint, { color: colors.textMuted }]}>
                Tap here to choose a PDF file
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={submitPaper}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={22} color="#FFFFFF" />
              <Text style={styles.submitText}>Submit Paper</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.bottomNote, { color: colors.textMuted }]}>
          Submitted papers are reviewed by an administrator before publication.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 110 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: { flex: 1, paddingRight: 12 },
  headerTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '800' },
  headerSubtitle: { color: '#DCE9FF', fontSize: 12, marginTop: 4 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 15,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
  },
  infoIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  infoText: { flex: 1, marginLeft: 12 },
  infoTitle: { fontSize: 14, fontWeight: '800' },
  infoDescription: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  sectionTitle: { marginHorizontal: 18, marginTop: 22, marginBottom: 10, fontSize: 14, fontWeight: '800' },
  formCard: { marginHorizontal: 16, padding: 16, borderRadius: 18, borderWidth: 1 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 7, marginTop: 4 },
  inputBox: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 14,
  },
  input: { flex: 1, fontSize: 13, marginLeft: 10 },
  selectBox: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 8,
  },
  selectText: { flex: 1, fontSize: 13, marginLeft: 10 },
  dropdown: { borderWidth: 1, borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  dropdownScrollable: { maxHeight: 260 },
  dropdownItem: { paddingHorizontal: 15, paddingVertical: 13, borderBottomWidth: 1 },
  dropdownText: { fontSize: 13 },
  uploadBox: {
    marginHorizontal: 16,
    minHeight: 145,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pdfCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadTitle: { fontSize: 14, fontWeight: '800' },
  uploadHint: { fontSize: 11, marginTop: 4 },
  fileSelected: { fontSize: 13, fontWeight: '800', textAlign: 'center', maxWidth: '90%' },
  fileHint: { fontSize: 11, marginTop: 5 },
  submitButton: {
    marginHorizontal: 16,
    marginTop: 22,
    height: 53,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  bottomNote: { marginHorizontal: 30, textAlign: 'center', fontSize: 10, lineHeight: 15, marginTop: 12 },
});