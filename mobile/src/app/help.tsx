import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../components/screen-header';
import { useTheme } from '../context/theme-context';

const faqs = [
  {
    question: 'How do I download a paper?',
    answer:
      'Open any paper, then tap "Download PDF" at the bottom. Downloaded papers appear in the Downloads tab.',
  },
  {
    question: 'Why can\'t I find a specific paper?',
    answer:
      'It may not have been approved yet, or hasn\'t been uploaded. Use "Submit Papers" in the More tab to add it yourself.',
  },
  {
    question: 'How do I report a problem with a paper?',
    answer:
      'Go to More -> Report Issues, and describe what\'s wrong. An admin will review it.',
  },
];

export default function HelpScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScreenHeader title="Help & Support" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Frequently Asked Questions
        </Text>

        {faqs.map((faq) => (
          <View
            key={faq.question}
            style={[
              styles.faqCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.faqQuestion, { color: colors.text }]}>
              {faq.question}
            </Text>
            <Text style={[styles.faqAnswer, { color: colors.textMuted }]}>
              {faq.answer}
            </Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Still need help?
        </Text>

        <TouchableOpacity
          style={[
            styles.contactCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => Linking.openURL('mailto:support@example.com')}
        >
          <View
            style={[styles.contactIcon, { backgroundColor: colors.surfaceAlt }]}
          >
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.contactText}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>
              Email Support
            </Text>
            <Text style={[styles.contactSubtitle, { color: colors.textMuted }]}>
              techai1899@gmail.com
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.contactCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.push('/report')}
        >
          <View
            style={[styles.contactIcon, { backgroundColor: colors.surfaceAlt }]}
          >
            <Ionicons name="flag-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.contactText}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>
              Report an Issue
            </Text>
            <Text style={[styles.contactSubtitle, { color: colors.textMuted }]}>
              Tell us about a problem in the app
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 8,
  },
  faqCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },
  faqAnswer: {
    fontSize: 12,
    lineHeight: 18,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactText: { flex: 1 },
  contactTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  contactSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
});