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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1a1a1a',
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitlePremium: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#7c3aed',
  },
  categoryLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
    marginTop: 4,
  },
  queryBox: {
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  queryLabel: {
    fontSize: 7,
    color: '#6b7280',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  queryText: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.4,
  },
  modelInfo: {
    fontSize: 7,
    color: '#666',
    marginBottom: 4,
  },
  mainRecommendation: {
    backgroundColor: '#ecfdf5',
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#065f46',
  },
  recommendationDesc: {
    fontSize: 8,
    color: '#047857',
    lineHeight: 1.4,
  },
  confidenceBadge: {
    fontSize: 8,
    color: '#10b981',
    fontWeight: 'bold',
    marginTop: 5,
  },
  actionItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 3,
  },
  actionNumber: {
    width: 14,
    fontWeight: 'bold',
    color: '#10b981',
    fontSize: 8,
  },
  actionText: {
    flex: 1,
    color: '#374151',
    fontSize: 8,
    lineHeight: 1.3,
  },
  // Point cards with colored borders
  pointCard: {
    padding: 7,
    marginBottom: 5,
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
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#1f2937',
  },
  pointDesc: {
    fontSize: 7,
    color: '#4b5563',
    lineHeight: 1.3,
  },
  pointModels: {
    fontSize: 6,
    color: '#9ca3af',
    marginTop: 2,
    fontStyle: 'italic',
  },
  // Premium section styles
  premiumSection: {
    marginBottom: 12,
  },
  premiumBadge: {
    fontSize: 7,
    color: '#7c3aed',
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alternativeCard: {
    backgroundColor: '#f5f3ff',
    padding: 8,
    marginBottom: 6,
    borderRadius: 4,
  },
  alternativeTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#5b21b6',
  },
  prosConsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  prosConsCol: {
    flex: 1,
  },
  prosBox: {
    backgroundColor: '#dcfce7',
    padding: 5,
    borderRadius: 3,
  },
  consBox: {
    backgroundColor: '#fee2e2',
    padding: 5,
    borderRadius: 3,
  },
  prosConsTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  prosTitle: {
    color: '#166534',
  },
  consTitle: {
    color: '#991b1b',
  },
  prosConsItem: {
    fontSize: 7,
    color: '#4b5563',
    marginBottom: 1,
  },
  bestFor: {
    fontSize: 7,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  outlookCard: {
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  outlookTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#92400e',
  },
  outlookText: {
    fontSize: 7,
    color: '#b45309',
    lineHeight: 1.3,
  },
  milestoneItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  milestoneNumber: {
    width: 12,
    fontSize: 7,
    fontWeight: 'bold',
    color: '#10b981',
  },
  milestoneText: {
    flex: 1,
    fontSize: 7,
    color: '#4b5563',
  },
  competitorBox: {
    backgroundColor: '#fdf2f8',
    padding: 8,
    borderRadius: 4,
  },
  competitorText: {
    fontSize: 7,
    color: '#be185d',
    lineHeight: 1.3,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 35,
    right: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
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
  });

  // STRICT limits to fit properly on pages - reduced from previous
  const limitedActions = (finalRecommendation?.topActions || []).slice(0, 5);
  const limitedConsensus = (consensusPoints || []).slice(0, 2);
  const limitedMajority = (majorityPoints || []).slice(0, 2);
  const limitedDissent = (dissentPoints || []).slice(0, 2);
  const limitedAlternatives = (strategicAlternatives || []).slice(0, 2);
  const limitedMilestones = (longTermOutlook?.keyMilestones || []).slice(0, 3);

  const hasAnalysisPoints = limitedConsensus.length > 0 || limitedMajority.length > 0 || limitedDissent.length > 0;
  const hasStrategicAlternatives = isPremium && limitedAlternatives.length > 0;
  const hasOutlookOrCompetitor = isPremium && (longTermOutlook || competitorInsights);

  // Calculate page numbers dynamically
  let currentPageCount = 1; // Page 1 always exists
  if (hasAnalysisPoints) currentPageCount++;
  if (hasStrategicAlternatives) currentPageCount++;
  if (hasOutlookOrCompetitor) currentPageCount++;

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
        <View style={styles.queryBox} wrap={false}>
          <Text style={styles.queryLabel}>Your Question</Text>
          <Text style={styles.modelInfo}>Models: {modelNames}</Text>
          <Text style={styles.queryText}>{truncateText(prompt, 300)}</Text>
        </View>

        {/* Main Recommendation */}
        <View style={styles.mainRecommendation} wrap={false}>
          <Text style={styles.recommendationTitle}>
            {truncateText(finalRecommendation?.title, 80) || 'AI Recommendation'}
          </Text>
          <Text style={styles.recommendationDesc}>
            {truncateText(finalRecommendation?.description, 400)}
          </Text>
          <Text style={styles.confidenceBadge}>Confidence: {overallConfidence}%</Text>
        </View>

        {/* Priority Actions - strictly limited to 5 */}
        {limitedActions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority Actions</Text>
            {limitedActions.map((action, i) => (
              <View key={i} style={styles.actionItem} wrap={false}>
                <Text style={styles.actionNumber}>{i + 1}.</Text>
                <Text style={styles.actionText}>{truncateText(action, 100)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated by Synoptas | Multi-AI Validation Platform</Text>
          <Text>Page 1 of {currentPageCount}</Text>
        </View>
      </Page>

      {/* Page 2: Detailed Analysis */}
      {hasAnalysisPoints && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.logo}>Synoptas</Text>
            <Text style={styles.subtitle}>Detailed Model Analysis</Text>
          </View>

          {/* Consensus Points - ALWAYS render if available */}
          {limitedConsensus.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.categoryLabel}>✓ Consensus (All Models Agree)</Text>
              {limitedConsensus.map((point, i) => (
                <View key={i} style={[styles.pointCard, styles.consensusCard]} wrap={false}>
                  <Text style={styles.pointTopic}>{truncateText(point.topic, 60)}</Text>
                  <Text style={styles.pointDesc}>{truncateText(point.description, 200)}</Text>
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
                  <Text style={styles.pointTopic}>{truncateText(point.topic, 60)}</Text>
                  <Text style={styles.pointDesc}>{truncateText(point.description, 200)}</Text>
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
                  <Text style={styles.pointTopic}>{truncateText(point.topic, 60)}</Text>
                  {point.positions?.slice(0, 2).map((pos, j) => (
                    <Text key={j} style={styles.pointDesc}>
                      {pos.modelName}: {truncateText(pos.position, 120)}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>Generated by Synoptas | Multi-AI Validation Platform</Text>
            <Text>Page 2 of {currentPageCount}</Text>
          </View>
        </Page>
      )}

      {/* Page 3: Premium - Strategic Alternatives (separate page) */}
      {hasStrategicAlternatives && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.logo}>Synoptas</Text>
            <Text style={styles.subtitle}>Premium Insights</Text>
          </View>

          <View style={styles.premiumSection}>
            <Text style={styles.premiumBadge}>★ Premium</Text>
            <Text style={styles.sectionTitlePremium}>Strategic Alternatives</Text>
            {limitedAlternatives.map((alt, i) => (
              <View key={i} style={styles.alternativeCard} wrap={false}>
                <Text style={styles.alternativeTitle}>{truncateText(alt.scenario, 70)}</Text>
                <View style={styles.prosConsRow}>
                  <View style={[styles.prosConsCol, styles.prosBox]}>
                    <Text style={[styles.prosConsTitle, styles.prosTitle]}>Pros</Text>
                    {alt.pros?.slice(0, 2).map((pro, j) => (
                      <Text key={j} style={styles.prosConsItem}>+ {truncateText(pro, 45)}</Text>
                    ))}
                  </View>
                  <View style={[styles.prosConsCol, styles.consBox]}>
                    <Text style={[styles.prosConsTitle, styles.consTitle]}>Cons</Text>
                    {alt.cons?.slice(0, 2).map((con, j) => (
                      <Text key={j} style={styles.prosConsItem}>− {truncateText(con, 45)}</Text>
                    ))}
                  </View>
                </View>
                {alt.bestFor && (
                  <Text style={styles.bestFor}>Best for: {truncateText(alt.bestFor, 60)}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>Generated by Synoptas | Multi-AI Validation Platform</Text>
            <Text>Page {hasAnalysisPoints ? 3 : 2} of {currentPageCount}</Text>
          </View>
        </Page>
      )}

      {/* Page 4: Premium - Long-term Outlook & Competitor Insights (separate page) */}
      {hasOutlookOrCompetitor && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.logo}>Synoptas</Text>
            <Text style={styles.subtitle}>Premium Insights</Text>
          </View>

          {/* Long-term Outlook */}
          {longTermOutlook && (
            <View style={styles.premiumSection}>
              <Text style={styles.premiumBadge}>★ Premium</Text>
              <Text style={styles.sectionTitlePremium}>Long-term Outlook</Text>
              
              <View style={styles.outlookCard} wrap={false}>
                <Text style={styles.outlookTitle}>6-Month Outlook</Text>
                <Text style={styles.outlookText}>{truncateText(longTermOutlook.sixMonths, 150)}</Text>
              </View>

              <View style={styles.outlookCard} wrap={false}>
                <Text style={styles.outlookTitle}>12-Month Outlook</Text>
                <Text style={styles.outlookText}>{truncateText(longTermOutlook.twelveMonths, 150)}</Text>
              </View>

              {limitedMilestones.length > 0 && (
                <View wrap={false}>
                  <Text style={styles.outlookTitle}>Key Milestones</Text>
                  {limitedMilestones.map((milestone, i) => (
                    <View key={i} style={styles.milestoneItem}>
                      <Text style={styles.milestoneNumber}>{i + 1}.</Text>
                      <Text style={styles.milestoneText}>{truncateText(milestone, 70)}</Text>
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
              <View style={styles.competitorBox} wrap={false}>
                <Text style={styles.competitorText}>{truncateText(competitorInsights, 300)}</Text>
              </View>
            </View>
          )}

          {/* Footer with dynamic page number */}
          <View style={styles.footer} fixed>
            <Text>Generated by Synoptas | Multi-AI Validation Platform</Text>
            <Text>Page {currentPageCount} of {currentPageCount}</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
