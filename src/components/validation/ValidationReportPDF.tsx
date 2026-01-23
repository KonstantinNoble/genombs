import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ValidationResult } from '@/hooks/useMultiAIValidation';
import { AVAILABLE_MODELS } from './ModelSelector';

// Compact styles optimized for multi-page layout without overflow
const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: '#4FD183',
    paddingBottom: 12,
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4FD183',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: '#666',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    fontSize: 8,
    color: '#888',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitlePremium: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#7c3aed',
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
    marginTop: 6,
  },
  queryBox: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 14,
  },
  queryLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  queryText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
  },
  modelInfo: {
    fontSize: 8,
    color: '#666',
    marginBottom: 6,
  },
  mainRecommendation: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    marginBottom: 14,
  },
  recommendationTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#065f46',
  },
  recommendationDesc: {
    fontSize: 9,
    color: '#047857',
    lineHeight: 1.5,
  },
  confidenceBadge: {
    fontSize: 9,
    color: '#10b981',
    fontWeight: 'bold',
    marginTop: 6,
  },
  actionItem: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 4,
  },
  actionNumber: {
    width: 16,
    fontWeight: 'bold',
    color: '#10b981',
    fontSize: 9,
  },
  actionText: {
    flex: 1,
    color: '#374151',
    fontSize: 9,
    lineHeight: 1.4,
  },
  // Point cards with colored borders
  pointCard: {
    padding: 8,
    marginBottom: 6,
    borderRadius: 4,
    borderLeftWidth: 3,
  },
  consensusCard: {
    backgroundColor: '#f0fdf4',
    borderLeftColor: '#22c55e',
  },
  majorityCard: {
    backgroundColor: '#eff6ff',
    borderLeftColor: '#3b82f6',
  },
  dissentCard: {
    backgroundColor: '#fffbeb',
    borderLeftColor: '#f59e0b',
  },
  pointTopic: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#1f2937',
  },
  pointDesc: {
    fontSize: 8,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  pointModels: {
    fontSize: 7,
    color: '#9ca3af',
    marginTop: 3,
    fontStyle: 'italic',
  },
  // Premium section styles
  premiumSection: {
    marginBottom: 14,
  },
  premiumBadge: {
    fontSize: 7,
    color: '#7c3aed',
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alternativeCard: {
    backgroundColor: '#f5f3ff',
    padding: 10,
    marginBottom: 8,
    borderRadius: 4,
  },
  alternativeTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#5b21b6',
  },
  prosConsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prosConsCol: {
    flex: 1,
  },
  prosBox: {
    backgroundColor: '#dcfce7',
    padding: 6,
    borderRadius: 3,
  },
  consBox: {
    backgroundColor: '#fee2e2',
    padding: 6,
    borderRadius: 3,
  },
  prosConsTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  prosTitle: {
    color: '#166534',
  },
  consTitle: {
    color: '#991b1b',
  },
  prosConsItem: {
    fontSize: 8,
    color: '#4b5563',
    marginBottom: 2,
  },
  bestFor: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  outlookRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  outlookCol: {
    flex: 1,
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 4,
  },
  outlookTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#92400e',
  },
  outlookText: {
    fontSize: 8,
    color: '#b45309',
    lineHeight: 1.4,
  },
  milestoneItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  milestoneNumber: {
    width: 14,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#10b981',
  },
  milestoneText: {
    flex: 1,
    fontSize: 8,
    color: '#4b5563',
  },
  competitorBox: {
    backgroundColor: '#fdf2f8',
    padding: 10,
    borderRadius: 4,
  },
  competitorText: {
    fontSize: 9,
    color: '#be185d',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 35,
    right: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
});

// Helper to truncate long text to prevent overflow
const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

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

  // Limit items to fit properly on pages
  const limitedActions = (finalRecommendation?.topActions || []).slice(0, 5);
  const limitedConsensus = (consensusPoints || []).slice(0, 3);
  const limitedMajority = (majorityPoints || []).slice(0, 3);
  const limitedDissent = (dissentPoints || []).slice(0, 3);
  const limitedAlternatives = (strategicAlternatives || []).slice(0, 2);

  const hasAnalysisPoints = limitedConsensus.length > 0 || limitedMajority.length > 0 || limitedDissent.length > 0;
  const hasPremiumContent = isPremium && (limitedAlternatives.length > 0 || longTermOutlook || competitorInsights);

  return (
    <Document>
      {/* Page 1: Executive Summary */}
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

        {/* Query Section */}
        <View style={styles.queryBox}>
          <Text style={styles.queryLabel}>Your Question</Text>
          <Text style={styles.modelInfo}>Models: {modelNames}</Text>
          <Text style={styles.queryText}>{truncateText(prompt, 400)}</Text>
        </View>

        {/* Main Recommendation */}
        <View style={styles.mainRecommendation} wrap={false}>
          <Text style={styles.recommendationTitle}>
            {truncateText(finalRecommendation?.title, 100) || 'AI Recommendation'}
          </Text>
          <Text style={styles.recommendationDesc}>
            {truncateText(finalRecommendation?.description, 500)}
          </Text>
          <Text style={styles.confidenceBadge}>Confidence: {overallConfidence}%</Text>
        </View>

        {/* Priority Actions */}
        {limitedActions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority Actions</Text>
            {limitedActions.map((action, i) => (
              <View key={i} style={styles.actionItem} wrap={false}>
                <Text style={styles.actionNumber}>{i + 1}.</Text>
                <Text style={styles.actionText}>{truncateText(action, 150)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated by Synoptas | Multi-AI Validation Platform</Text>
          <Text>Page 1</Text>
        </View>
      </Page>

      {/* Page 2: Detailed Analysis */}
      {hasAnalysisPoints && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.logo}>Synoptas</Text>
            <Text style={styles.subtitle}>Detailed Model Analysis</Text>
          </View>

          {/* Consensus Points */}
          {limitedConsensus.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.categoryLabel}>✓ Consensus (All Models Agree)</Text>
              {limitedConsensus.map((point, i) => (
                <View key={i} style={[styles.pointCard, styles.consensusCard]} wrap={false}>
                  <Text style={styles.pointTopic}>{truncateText(point.topic, 80)}</Text>
                  <Text style={styles.pointDesc}>{truncateText(point.description, 250)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Majority Points */}
          {limitedMajority.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.categoryLabel}>◐ Majority View</Text>
              {limitedMajority.map((point, i) => (
                <View key={i} style={[styles.pointCard, styles.majorityCard]} wrap={false}>
                  <Text style={styles.pointTopic}>{truncateText(point.topic, 80)}</Text>
                  <Text style={styles.pointDesc}>{truncateText(point.description, 250)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Dissent Points */}
          {limitedDissent.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.categoryLabel}>⚡ Different Perspectives</Text>
              {limitedDissent.map((point, i) => (
                <View key={i} style={[styles.pointCard, styles.dissentCard]} wrap={false}>
                  <Text style={styles.pointTopic}>{truncateText(point.topic, 80)}</Text>
                  {point.positions?.slice(0, 2).map((pos, j) => (
                    <Text key={j} style={styles.pointDesc}>
                      {pos.modelName}: {truncateText(pos.position, 150)}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>Generated by Synoptas | Multi-AI Validation Platform</Text>
            <Text>Page 2</Text>
          </View>
        </Page>
      )}

      {/* Page 3: Premium Insights */}
      {hasPremiumContent && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.logo}>Synoptas</Text>
            <Text style={styles.subtitle}>Premium Insights</Text>
          </View>

          {/* Strategic Alternatives */}
          {limitedAlternatives.length > 0 && (
            <View style={styles.premiumSection}>
              <Text style={styles.premiumBadge}>★ Premium</Text>
              <Text style={styles.sectionTitlePremium}>Strategic Alternatives</Text>
              {limitedAlternatives.map((alt, i) => (
                <View key={i} style={styles.alternativeCard} wrap={false}>
                  <Text style={styles.alternativeTitle}>{truncateText(alt.scenario, 80)}</Text>
                  <View style={styles.prosConsRow}>
                    <View style={[styles.prosConsCol, styles.prosBox]}>
                      <Text style={[styles.prosConsTitle, styles.prosTitle]}>Pros</Text>
                      {alt.pros?.slice(0, 3).map((pro, j) => (
                        <Text key={j} style={styles.prosConsItem}>+ {truncateText(pro, 50)}</Text>
                      ))}
                    </View>
                    <View style={[styles.prosConsCol, styles.consBox]}>
                      <Text style={[styles.prosConsTitle, styles.consTitle]}>Cons</Text>
                      {alt.cons?.slice(0, 3).map((con, j) => (
                        <Text key={j} style={styles.prosConsItem}>− {truncateText(con, 50)}</Text>
                      ))}
                    </View>
                  </View>
                  {alt.bestFor && (
                    <Text style={styles.bestFor}>Best for: {truncateText(alt.bestFor, 80)}</Text>
                  )}
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
                  <Text style={styles.outlookText}>{truncateText(longTermOutlook.sixMonths, 180)}</Text>
                </View>
                <View style={styles.outlookCol}>
                  <Text style={styles.outlookTitle}>12-Month Outlook</Text>
                  <Text style={styles.outlookText}>{truncateText(longTermOutlook.twelveMonths, 180)}</Text>
                </View>
              </View>
              {longTermOutlook.keyMilestones && longTermOutlook.keyMilestones.length > 0 && (
                <View>
                  <Text style={styles.outlookTitle}>Key Milestones</Text>
                  {longTermOutlook.keyMilestones.slice(0, 4).map((milestone, i) => (
                    <View key={i} style={styles.milestoneItem}>
                      <Text style={styles.milestoneNumber}>{i + 1}.</Text>
                      <Text style={styles.milestoneText}>{truncateText(milestone, 80)}</Text>
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
                <Text style={styles.competitorText}>{truncateText(competitorInsights, 400)}</Text>
              </View>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>Generated by Synoptas | Multi-AI Validation Platform</Text>
            <Text>Page 3</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
