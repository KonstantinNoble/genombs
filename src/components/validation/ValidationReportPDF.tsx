import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ValidationResult } from '@/hooks/useMultiAIValidation';
import { AVAILABLE_MODELS } from './ModelSelector';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#4FD183',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4FD183',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    fontSize: 9,
    color: '#888',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  sectionTitlePremium: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#d97706',
  },
  mainRecommendation: {
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#166534',
  },
  recommendationDesc: {
    fontSize: 11,
    color: '#333',
    marginBottom: 8,
  },
  confidenceBadge: {
    fontSize: 10,
    color: '#4FD183',
    fontWeight: 'bold',
  },
  actionItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 5,
  },
  actionNumber: {
    width: 20,
    fontWeight: 'bold',
    color: '#4FD183',
  },
  actionText: {
    flex: 1,
    color: '#333',
  },
  pointCard: {
    padding: 10,
    marginBottom: 8,
    borderRadius: 4,
  },
  consensusCard: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
  },
  majorityCard: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  dissentCard: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  pointTopic: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pointDesc: {
    fontSize: 10,
    color: '#555',
  },
  premiumSection: {
    backgroundColor: '#fffbeb',
    padding: 15,
    borderRadius: 6,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  premiumBadge: {
    fontSize: 8,
    color: '#d97706',
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  alternativeCard: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
  },
  alternativeTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  prosConsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  prosConsCol: {
    flex: 1,
  },
  prosConsTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  prosTitle: {
    color: '#22c55e',
  },
  consTitle: {
    color: '#ef4444',
  },
  prosConsItem: {
    fontSize: 9,
    color: '#555',
    marginBottom: 2,
  },
  bestFor: {
    fontSize: 9,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  outlookRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  outlookCol: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 4,
  },
  outlookTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  outlookText: {
    fontSize: 10,
    color: '#333',
  },
  milestoneItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  milestoneNumber: {
    width: 15,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4FD183',
  },
  milestoneText: {
    flex: 1,
    fontSize: 9,
    color: '#555',
  },
  competitorBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 4,
  },
  competitorText: {
    fontSize: 10,
    color: '#333',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#aaa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  modelInfo: {
    fontSize: 9,
    color: '#666',
    marginBottom: 4,
  },
});

interface ValidationReportPDFProps {
  result: ValidationResult;
  prompt: string;
}

export function ValidationReportPDF({ result, prompt }: ValidationReportPDFProps) {
  const {
    finalRecommendation,
    overallConfidence,
    consensusPoints,
    majorityPoints,
    dissentPoints,
    selectedModels,
    processingTimeMs,
    isPremium,
    strategicAlternatives,
    longTermOutlook,
    competitorInsights,
  } = result;

  const modelNames = selectedModels
    .map(key => AVAILABLE_MODELS[key]?.name || key)
    .join(', ');

  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Synoptas</Text>
          <Text style={styles.subtitle}>Multi-AI Validation Report</Text>
          <View style={styles.metaRow}>
            <Text>Generated: {generatedDate}</Text>
            <Text>Confidence: {overallConfidence}%</Text>
            <Text>Processing: {(processingTimeMs / 1000).toFixed(1)}s</Text>
          </View>
        </View>

        {/* Query */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Question</Text>
          <Text style={styles.modelInfo}>Models used: {modelNames}</Text>
          <Text>{prompt}</Text>
        </View>

        {/* Main Recommendation */}
        <View style={styles.mainRecommendation}>
          <Text style={styles.recommendationTitle}>{finalRecommendation.title}</Text>
          <Text style={styles.recommendationDesc}>{finalRecommendation.description}</Text>
          <Text style={styles.confidenceBadge}>Confidence: {overallConfidence}%</Text>
        </View>

        {/* Top Actions */}
        {finalRecommendation.topActions && finalRecommendation.topActions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority Actions</Text>
            {finalRecommendation.topActions.map((action, i) => (
              <View key={i} style={styles.actionItem}>
                <Text style={styles.actionNumber}>{i + 1}.</Text>
                <Text style={styles.actionText}>{action}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Consensus Points */}
        {consensusPoints && consensusPoints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consensus (All Models Agree)</Text>
            {consensusPoints.slice(0, 3).map((point, i) => (
              <View key={i} style={[styles.pointCard, styles.consensusCard]}>
                <Text style={styles.pointTopic}>{point.topic}</Text>
                <Text style={styles.pointDesc}>{point.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Majority Points */}
        {majorityPoints && majorityPoints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Majority View</Text>
            {majorityPoints.slice(0, 2).map((point, i) => (
              <View key={i} style={[styles.pointCard, styles.majorityCard]}>
                <Text style={styles.pointTopic}>{point.topic}</Text>
                <Text style={styles.pointDesc}>{point.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Dissent Points */}
        {dissentPoints && dissentPoints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Different Perspectives</Text>
            {dissentPoints.slice(0, 2).map((point, i) => (
              <View key={i} style={[styles.pointCard, styles.dissentCard]}>
                <Text style={styles.pointTopic}>{point.topic}</Text>
                {point.positions.slice(0, 2).map((pos, j) => (
                  <Text key={j} style={styles.pointDesc}>
                    {pos.modelName}: {pos.position}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated by Synoptas | Multi-AI Validation Platform</Text>
          <Text>synoptas.com</Text>
        </View>
      </Page>

      {/* Premium Page - Only if premium user */}
      {isPremium && (strategicAlternatives || longTermOutlook || competitorInsights) && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.logo}>Synoptas</Text>
            <Text style={styles.subtitle}>Premium Insights</Text>
          </View>

          {/* Strategic Alternatives */}
          {strategicAlternatives && strategicAlternatives.length > 0 && (
            <View style={styles.premiumSection}>
              <Text style={styles.premiumBadge}>★ Premium</Text>
              <Text style={styles.sectionTitlePremium}>Strategic Alternatives</Text>
              {strategicAlternatives.slice(0, 2).map((alt, i) => (
                <View key={i} style={styles.alternativeCard}>
                  <Text style={styles.alternativeTitle}>{alt.scenario}</Text>
                  <View style={styles.prosConsRow}>
                    <View style={styles.prosConsCol}>
                      <Text style={[styles.prosConsTitle, styles.prosTitle]}>Pros</Text>
                      {alt.pros.slice(0, 3).map((pro, j) => (
                        <Text key={j} style={styles.prosConsItem}>+ {pro}</Text>
                      ))}
                    </View>
                    <View style={styles.prosConsCol}>
                      <Text style={[styles.prosConsTitle, styles.consTitle]}>Cons</Text>
                      {alt.cons.slice(0, 3).map((con, j) => (
                        <Text key={j} style={styles.prosConsItem}>− {con}</Text>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.bestFor}>Best for: {alt.bestFor}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Long-term Outlook */}
          {longTermOutlook && (
            <View style={styles.premiumSection}>
              <Text style={styles.premiumBadge}>★ Premium</Text>
              <Text style={styles.sectionTitlePremium}>Long-term Outlook</Text>
              <View style={styles.outlookRow}>
                <View style={styles.outlookCol}>
                  <Text style={styles.outlookTitle}>6-Month Outlook</Text>
                  <Text style={styles.outlookText}>{longTermOutlook.sixMonths}</Text>
                </View>
                <View style={styles.outlookCol}>
                  <Text style={styles.outlookTitle}>12-Month Outlook</Text>
                  <Text style={styles.outlookText}>{longTermOutlook.twelveMonths}</Text>
                </View>
              </View>
              {longTermOutlook.keyMilestones && longTermOutlook.keyMilestones.length > 0 && (
                <View>
                  <Text style={styles.outlookTitle}>Key Milestones</Text>
                  {longTermOutlook.keyMilestones.slice(0, 4).map((milestone, i) => (
                    <View key={i} style={styles.milestoneItem}>
                      <Text style={styles.milestoneNumber}>{i + 1}.</Text>
                      <Text style={styles.milestoneText}>{milestone}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Competitor Insights */}
          {competitorInsights && (
            <View style={styles.premiumSection}>
              <Text style={styles.premiumBadge}>★ Premium</Text>
              <Text style={styles.sectionTitlePremium}>Competitor Insights</Text>
              <View style={styles.competitorBox}>
                <Text style={styles.competitorText}>{competitorInsights}</Text>
              </View>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>Generated by Synoptas | Multi-AI Validation Platform</Text>
            <Text>synoptas.com</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
