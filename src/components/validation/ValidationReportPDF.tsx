import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ValidationResult } from '@/hooks/useMultiAIValidation';
import { AVAILABLE_MODELS } from './ModelSelector';

// Styles optimized for flowing multi-page layout
const styles = StyleSheet.create({
  page: {
    padding: 35,
    paddingBottom: 60, // Extra space for footer
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#4FD183',
    paddingBottom: 10,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4FD183',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 9,
    color: '#666',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
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
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#c4b5fd',
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
    lineHeight: 1.5,
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
    marginTop: 8,
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
    borderLeftWidth: 4,
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
    marginBottom: 2,
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
    marginTop: 10,
  },
  premiumBadge: {
    fontSize: 8,
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
    borderLeftWidth: 3,
    borderLeftColor: '#8b5cf6',
  },
  alternativeTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#5b21b6',
  },
  prosConsRow: {
    flexDirection: 'row',
  },
  prosConsCol: {
    flex: 1,
  },
  prosBox: {
    backgroundColor: '#dcfce7',
    padding: 6,
    borderRadius: 3,
    marginRight: 4, // Replace gap with marginRight
  },
  consBox: {
    backgroundColor: '#fee2e2',
    padding: 6,
    borderRadius: 3,
    marginLeft: 4, // Add marginLeft for spacing
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
    lineHeight: 1.3,
  },
  bestFor: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  outlookCard: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
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
    marginBottom: 6,
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
    lineHeight: 1.3,
  },
  competitorBox: {
    backgroundColor: '#fdf2f8',
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#ec4899',
  },
  competitorTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#9d174d',
  },
  competitorText: {
    fontSize: 8,
    color: '#be185d',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 35,
    right: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginVertical: 12,
  },
});

// Helper to truncate long text - higher limits for more content
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
  });

  // NO LIMITS - show ALL content, let @react-pdf/renderer handle pagination
  const allActions = finalRecommendation?.topActions || [];
  const allConsensus = consensusPoints || [];
  const allMajority = majorityPoints || [];
  const allDissent = dissentPoints || [];
  const allAlternatives = strategicAlternatives || [];
  const allMilestones = longTermOutlook?.keyMilestones || [];

  const hasAnalysisPoints = allConsensus.length > 0 || allMajority.length > 0 || allDissent.length > 0;
  const hasStrategicAlternatives = isPremium && allAlternatives.length > 0;
  const hasOutlook = isPremium && longTermOutlook;
  const hasCompetitor = isPremium && competitorInsights;

  return (
    <Document>
      {/* Single flowing page - @react-pdf/renderer will auto-paginate */}
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header} fixed>
          <Text style={styles.logo}>Synoptas</Text>
          <Text style={styles.subtitle}>Multi-AI Validation Report</Text>
          <View style={styles.metaRow}>
            <Text>Generated: {generatedDate}</Text>
            <Text>Confidence: {overallConfidence}%</Text>
            <Text>Processing: {(processingTimeMs / 1000).toFixed(1)}s</Text>
          </View>
        </View>

        {/* Query Section */}
        <View style={styles.queryBox} wrap={false}>
          <Text style={styles.queryLabel}>Your Question</Text>
          <Text style={styles.modelInfo}>Models: {modelNames}</Text>
          <Text style={styles.queryText}>{truncateText(prompt, 800)}</Text>
        </View>

        {/* Main Recommendation */}
        <View style={styles.mainRecommendation} wrap={false}>
          <Text style={styles.recommendationTitle}>
            {truncateText(finalRecommendation?.title, 150) || 'AI Recommendation'}
          </Text>
          <Text style={styles.recommendationDesc}>
            {truncateText(finalRecommendation?.description, 800)}
          </Text>
          <Text style={styles.confidenceBadge}>Overall Confidence: {overallConfidence}%</Text>
        </View>

        {/* Priority Actions - ALL */}
        {allActions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority Actions ({allActions.length})</Text>
            {allActions.map((action, i) => (
              <View key={i} style={styles.actionItem} wrap={false}>
                <Text style={styles.actionNumber}>{i + 1}.</Text>
                <Text style={styles.actionText}>{truncateText(action, 300)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Divider before Analysis */}
        {hasAnalysisPoints && <View style={styles.divider} />}

        {/* Consensus Points - ALL */}
        {allConsensus.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.categoryLabel}>✓ Consensus Points ({allConsensus.length}) - All Models Agree</Text>
            {allConsensus.map((point, i) => (
              <View key={i} style={[styles.pointCard, styles.consensusCard]} wrap={false}>
                <Text style={styles.pointTopic}>{truncateText(point.topic, 120)}</Text>
                <Text style={styles.pointDesc}>{truncateText(point.description, 500)}</Text>
                {point.actionItems && point.actionItems.length > 0 && (
                  <Text style={styles.pointModels}>
                    Actions: {point.actionItems.slice(0, 2).join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Majority Points - ALL */}
        {allMajority.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.categoryLabel}>◐ Majority View ({allMajority.length})</Text>
            {allMajority.map((point, i) => (
              <View key={i} style={[styles.pointCard, styles.majorityCard]} wrap={false}>
                <Text style={styles.pointTopic}>{truncateText(point.topic, 120)}</Text>
                <Text style={styles.pointDesc}>{truncateText(point.description, 500)}</Text>
                {point.supportingModels && point.supportingModels.length > 0 && (
                  <Text style={styles.pointModels}>
                    Supported by: {point.supportingModels.map(m => AVAILABLE_MODELS[m]?.name || m).join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Dissent Points - ALL */}
        {allDissent.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.categoryLabel}>⚡ Different Perspectives ({allDissent.length})</Text>
            {allDissent.map((point, i) => (
              <View key={i} style={[styles.pointCard, styles.dissentCard]} wrap={false}>
                <Text style={styles.pointTopic}>{truncateText(point.topic, 120)}</Text>
                {point.positions?.map((pos, j) => (
                  <Text key={j} style={styles.pointDesc}>
                    • {pos.modelName}: {truncateText(pos.position, 300)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Premium Section: Strategic Alternatives - ALL */}
        {hasStrategicAlternatives && (
          <View style={styles.premiumSection}>
            <Text style={styles.premiumBadge}>★ Premium Insight</Text>
            <Text style={styles.sectionTitlePremium}>Strategic Alternatives ({allAlternatives.length})</Text>
            {allAlternatives.map((alt, i) => (
              <View key={i} style={styles.alternativeCard} wrap={false}>
                <Text style={styles.alternativeTitle}>{truncateText(alt.scenario, 150)}</Text>
                <View style={styles.prosConsRow}>
                  <View style={styles.prosBox}>
                    <Text style={[styles.prosConsTitle, styles.prosTitle]}>Pros</Text>
                    {alt.pros?.map((pro, j) => (
                      <Text key={j} style={styles.prosConsItem}>+ {truncateText(pro, 120)}</Text>
                    ))}
                  </View>
                  <View style={styles.consBox}>
                    <Text style={[styles.prosConsTitle, styles.consTitle]}>Cons</Text>
                    {alt.cons?.map((con, j) => (
                      <Text key={j} style={styles.prosConsItem}>− {truncateText(con, 120)}</Text>
                    ))}
                  </View>
                </View>
                {alt.bestFor && (
                  <Text style={styles.bestFor}>Best for: {truncateText(alt.bestFor, 200)}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Premium Section: Long-term Outlook */}
        {hasOutlook && (
          <View style={styles.premiumSection}>
            <Text style={styles.premiumBadge}>★ Premium Insight</Text>
            <Text style={styles.sectionTitlePremium}>Long-term Outlook</Text>
            <View style={styles.outlookCard} wrap={false}>
              <Text style={styles.outlookTitle}>6 Month Outlook</Text>
              <Text style={styles.outlookText}>
                {truncateText(longTermOutlook?.sixMonths, 400)}
              </Text>
              <Text style={styles.outlookTitle}>12 Month Outlook</Text>
              <Text style={styles.outlookText}>
                {truncateText(longTermOutlook?.twelveMonths, 400)}
              </Text>
            </View>
            
            {allMilestones.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.categoryLabel}>Key Milestones ({allMilestones.length})</Text>
                {allMilestones.map((milestone, i) => (
                  <View key={i} style={styles.milestoneItem} wrap={false}>
                    <Text style={styles.milestoneNumber}>{i + 1}.</Text>
                    <Text style={styles.milestoneText}>{truncateText(milestone, 300)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Premium Section: Competitor Insights */}
        {hasCompetitor && (
          <View style={styles.premiumSection}>
            <Text style={styles.premiumBadge}>★ Premium Insight</Text>
            <Text style={styles.sectionTitlePremium}>Competitor Insights</Text>
            <View style={styles.competitorBox} wrap={false}>
              <Text style={styles.competitorTitle}>Market Analysis</Text>
              <Text style={styles.competitorText}>
                {truncateText(competitorInsights, 1000)}
              </Text>
            </View>
          </View>
        )}

        {/* Footer - fixed on every page */}
        <View style={styles.footer} fixed>
          <Text>Generated by Synoptas | Multi-AI Validation Platform</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
