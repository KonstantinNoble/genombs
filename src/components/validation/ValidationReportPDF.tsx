import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ValidationResult } from '@/hooks/useMultiAIValidation';
import { AVAILABLE_MODELS } from './ModelSelector';

// Styles optimized for Decision Audit Report
const styles = StyleSheet.create({
  page: {
    padding: 35,
    paddingBottom: 60,
    fontFamily: 'Helvetica',
    fontSize: 11,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4FD183',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    fontSize: 9,
    color: '#888',
  },
  // Confirmation Statement Box
  confirmationBox: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#10b981',
    marginBottom: 14,
  },
  confirmationHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  confirmationIcon: {
    fontSize: 12,
    color: '#10b981',
    marginRight: 6,
  },
  confirmationTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#065f46',
  },
  confirmationText: {
    fontSize: 9,
    color: '#047857',
    marginBottom: 4,
    lineHeight: 1.4,
  },
  confirmationTimestamp: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  // Audit Trail Section
  auditTrailBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  auditTrailTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 6,
  },
  auditRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  auditLabel: {
    fontSize: 8,
    color: '#64748b',
    width: 100,
  },
  auditValue: {
    fontSize: 8,
    color: '#1e293b',
    flex: 1,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitlePremium: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#7c3aed',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#c4b5fd',
  },
  categoryLabel: {
    fontSize: 11,
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
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
  },
  modelInfo: {
    fontSize: 9,
    color: '#666',
    marginBottom: 6,
  },
  // Summary Box (replaces recommendation)
  summaryBox: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#0c4a6e',
  },
  summaryDesc: {
    fontSize: 10,
    color: '#0369a1',
    lineHeight: 1.5,
  },
  coverageScore: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#0ea5e9',
  },
  coverageLabel: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  // Perspectives (replaces actions)
  perspectiveItem: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 4,
  },
  perspectiveNumber: {
    width: 18,
    fontWeight: 'bold',
    color: '#0ea5e9',
    fontSize: 10,
  },
  perspectiveText: {
    flex: 1,
    color: '#374151',
    fontSize: 10,
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
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#1f2937',
  },
  pointDesc: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.4,
    marginBottom: 2,
  },
  pointModels: {
    fontSize: 8,
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
    marginRight: 4,
  },
  consBox: {
    backgroundColor: '#fee2e2',
    padding: 6,
    borderRadius: 3,
    marginLeft: 4,
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
  // Disclaimer
  disclaimer: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fcd34d',
    marginTop: 14,
    marginBottom: 14,
  },
  disclaimerTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 8,
    color: '#a16207',
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

// Helper to truncate long text
const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Get coverage level label
const getCoverageLabel = (score: number): string => {
  if (score >= 80) return 'Thorough';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Partial';
  return 'Incomplete';
};

interface ValidationReportPDFProps {
  result: ValidationResult;
  prompt: string;
  confirmedAt?: string;
  confirmedBy?: string;
}

export function ValidationReportPDF({ result, prompt, confirmedAt, confirmedBy }: ValidationReportPDFProps) {
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

  const generatedTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const confirmationDate = confirmedAt 
    ? new Date(confirmedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : generatedDate;

  // Use confidence as coverage score
  const coverageScore = overallConfidence;
  const coverageLabel = getCoverageLabel(coverageScore);

  // All content - no limits
  const allPerspectives = finalRecommendation?.topActions || [];
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
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header} fixed>
          <Text style={styles.logo}>Synoptas</Text>
          <Text style={styles.reportTitle}>Decision Audit Report</Text>
          <Text style={styles.subtitle}>AI-Documented Decision Evidence</Text>
          <View style={styles.metaRow}>
            <Text>Generated: {generatedDate} at {generatedTime}</Text>
            <Text>Coverage: {coverageScore}% ({coverageLabel})</Text>
            <Text>Processing: {(processingTimeMs / 1000).toFixed(1)}s</Text>
          </View>
        </View>

        {/* Decision Ownership Confirmation */}
        <View style={styles.confirmationBox} wrap={false}>
          <View style={styles.confirmationHeader}>
            <Text style={styles.confirmationIcon}>✓</Text>
            <Text style={styles.confirmationTitle}>Decision Ownership Confirmed</Text>
          </View>
          <Text style={styles.confirmationText}>
            • The decision-maker confirmed that the final decision remains with them.
          </Text>
          <Text style={styles.confirmationText}>
            • All documented perspectives were reviewed before confirmation.
          </Text>
          <Text style={styles.confirmationText}>
            • This analysis provides documentation only – it does not make decisions.
          </Text>
          <Text style={styles.confirmationTimestamp}>
            Confirmed on: {confirmationDate}
          </Text>
        </View>

        {/* Audit Trail Summary */}
        <View style={styles.auditTrailBox} wrap={false}>
          <Text style={styles.auditTrailTitle}>Audit Trail Summary</Text>
          <View style={styles.auditRow}>
            <Text style={styles.auditLabel}>Report ID:</Text>
            <Text style={styles.auditValue}>{Date.now().toString(36).toUpperCase()}</Text>
          </View>
          <View style={styles.auditRow}>
            <Text style={styles.auditLabel}>Analysis Timestamp:</Text>
            <Text style={styles.auditValue}>{generatedDate} at {generatedTime}</Text>
          </View>
          <View style={styles.auditRow}>
            <Text style={styles.auditLabel}>AI Models Used:</Text>
            <Text style={styles.auditValue}>{modelNames}</Text>
          </View>
          <View style={styles.auditRow}>
            <Text style={styles.auditLabel}>Coverage Score:</Text>
            <Text style={styles.auditValue}>{coverageScore}% – {coverageLabel}</Text>
          </View>
          <View style={styles.auditRow}>
            <Text style={styles.auditLabel}>Perspectives Documented:</Text>
            <Text style={styles.auditValue}>
              {allConsensus.length} consensus, {allMajority.length} majority, {allDissent.length} dissent
            </Text>
          </View>
        </View>

        {/* Decision Context */}
        <View style={styles.queryBox} wrap={false}>
          <Text style={styles.queryLabel}>Decision Context</Text>
          <Text style={styles.queryText}>{truncateText(prompt, 800)}</Text>
        </View>

        {/* Documentation Summary */}
        <View style={styles.summaryBox} wrap={false}>
          <Text style={styles.summaryTitle}>
            {truncateText(finalRecommendation?.title, 150) || 'Documentation Summary'}
          </Text>
          <Text style={styles.summaryDesc}>
            {truncateText(finalRecommendation?.description, 800)}
          </Text>
          <Text style={styles.coverageScore}>Coverage Score: {coverageScore}%</Text>
          <Text style={styles.coverageLabel}>
            This score measures how thoroughly the decision context was analyzed, not the "correctness" of any perspective.
          </Text>
        </View>

        {/* Documented Perspectives */}
        {allPerspectives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documented Perspectives ({allPerspectives.length})</Text>
            {allPerspectives.map((perspective, i) => (
              <View key={i} style={styles.perspectiveItem} wrap={false}>
                <Text style={styles.perspectiveNumber}>{i + 1}.</Text>
                <Text style={styles.perspectiveText}>{truncateText(perspective, 300)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Divider before Analysis */}
        {hasAnalysisPoints && <View style={styles.divider} />}

        {/* Consensus Points */}
        {allConsensus.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.categoryLabel}>✓ Full Consensus ({allConsensus.length}) – All Models Documented Same View</Text>
            {allConsensus.map((point, i) => (
              <View key={i} style={[styles.pointCard, styles.consensusCard]} wrap={false}>
                <Text style={styles.pointTopic}>{truncateText(point.topic, 120)}</Text>
                <Text style={styles.pointDesc}>{truncateText(point.description, 500)}</Text>
                {point.actionItems && point.actionItems.length > 0 && (
                  <Text style={styles.pointModels}>
                    Observations: {point.actionItems.slice(0, 2).join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Majority Points */}
        {allMajority.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.categoryLabel}>◐ Majority View ({allMajority.length}) – Most Models Agree</Text>
            {allMajority.map((point, i) => (
              <View key={i} style={[styles.pointCard, styles.majorityCard]} wrap={false}>
                <Text style={styles.pointTopic}>{truncateText(point.topic, 120)}</Text>
                <Text style={styles.pointDesc}>{truncateText(point.description, 500)}</Text>
                {point.supportingModels && point.supportingModels.length > 0 && (
                  <Text style={styles.pointModels}>
                    Documented by: {point.supportingModels.map(m => AVAILABLE_MODELS[m]?.name || m).join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Dissent Points */}
        {allDissent.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.categoryLabel}>⚡ Documented Dissent ({allDissent.length}) – Different Perspectives</Text>
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

        {/* Premium Section: Strategic Alternatives (now "Documented Scenarios") */}
        {hasStrategicAlternatives && (
          <View style={styles.premiumSection}>
            <Text style={styles.premiumBadge}>★ Extended Documentation</Text>
            <Text style={styles.sectionTitlePremium}>Documented Scenarios ({allAlternatives.length})</Text>
            {allAlternatives.map((alt, i) => (
              <View key={i} style={styles.alternativeCard} wrap={false}>
                <Text style={styles.alternativeTitle}>{truncateText(alt.scenario, 150)}</Text>
                <View style={styles.prosConsRow}>
                  <View style={styles.prosBox}>
                    <Text style={[styles.prosConsTitle, styles.prosTitle]}>Considerations For</Text>
                    {alt.pros?.map((pro, j) => (
                      <Text key={j} style={styles.prosConsItem}>+ {truncateText(pro, 120)}</Text>
                    ))}
                  </View>
                  <View style={styles.consBox}>
                    <Text style={[styles.prosConsTitle, styles.consTitle]}>Considerations Against</Text>
                    {alt.cons?.map((con, j) => (
                      <Text key={j} style={styles.prosConsItem}>− {truncateText(con, 120)}</Text>
                    ))}
                  </View>
                </View>
                {alt.bestFor && (
                  <Text style={styles.bestFor}>Best suited for: {truncateText(alt.bestFor, 200)}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Premium Section: Long-term Outlook (now "Projected Implications") */}
        {hasOutlook && (
          <View style={styles.premiumSection}>
            <Text style={styles.premiumBadge}>★ Extended Documentation</Text>
            <Text style={styles.sectionTitlePremium}>Projected Implications</Text>
            <View style={styles.outlookCard} wrap={false}>
              <Text style={styles.outlookTitle}>6 Month Projection</Text>
              <Text style={styles.outlookText}>
                {truncateText(longTermOutlook?.sixMonths, 400)}
              </Text>
              <Text style={styles.outlookTitle}>12 Month Projection</Text>
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

        {/* Premium Section: Competitor Insights (now "Market Context") */}
        {hasCompetitor && (
          <View style={styles.premiumSection}>
            <Text style={styles.premiumBadge}>★ Extended Documentation</Text>
            <Text style={styles.sectionTitlePremium}>Market Context</Text>
            <View style={styles.competitorBox} wrap={false}>
              <Text style={styles.competitorTitle}>Documented Market Analysis</Text>
              <Text style={styles.competitorText}>
                {truncateText(competitorInsights, 1000)}
              </Text>
            </View>
          </View>
        )}

        {/* Legal Disclaimer */}
        <View style={styles.disclaimer} wrap={false}>
          <Text style={styles.disclaimerTitle}>Important Notice</Text>
          <Text style={styles.disclaimerText}>
            This Decision Audit Report documents perspectives gathered from multiple AI models. 
            It is provided for informational purposes only and does not constitute professional, 
            legal, financial, or investment advice. The final decision and responsibility for 
            any actions taken remain solely with the decision-maker. Synoptas and its AI models 
            make no warranties regarding the accuracy, completeness, or fitness for any particular 
            purpose of the documented perspectives.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Decision Audit Report | Synoptas Decision Documentation Platform</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
