import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL } from '../constants/api';
import { useTheme } from '../context/theme-context';

export default function ReportScreen() {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = async () => {
    if (!message.trim()) {
      Alert.alert(
        'Message Required',
        'Please describe the issue before submitting.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }

      Alert.alert(
        'Report Submitted',
        'Thanks for letting us know. An admin will review it shortly.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Submit report error:', error);

      Alert.alert(
        'Submission Failed',
        error instanceof Error
          ? error.message
          : 'Something went wrong while submitting your report.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>Report an Issue</Text>
            <Text style={styles.headerSubtitle}>
              Tell us what went wrong
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Describe the issue
          </Text>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="e.g. The PDF for CSC 221 2025 won't open, or a paper is listed under the wrong department..."
            placeholderTextColor={colors.textMuted}
            style={[
              styles.textArea,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
            ]}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.primary },
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={submitReport}
            activeOpacity={0.85}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="flag-outline" size={20} color="#FFFFFF" />
                <Text style={styles.submitText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#DCE9FF',
    fontSize: 12,
    marginTop: 2,
  },

  content: {
    padding: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },

  textArea: {
    minHeight: 160,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
  },

  submitButton: {
    marginTop: 18,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});