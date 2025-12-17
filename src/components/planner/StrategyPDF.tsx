import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { PlannerResult, StrategyPhase, ActionItem } from './StrategyOutput';

const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff'
  },
  header: { 
    marginBottom: 25, 
    borderBottom: 3, 
    paddingBottom: 15, 
    borderColor: '#4fd183' 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#1a1a1a' 
  },
  subtitle: { 
    fontSize: 11, 
    color: '#666', 
    marginTop: 6 
  },
  premiumBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: 9,
    padding: '4 8',
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  phaseCard: { 
    marginBottom: 20, 
    padding: 16, 
    backgroundColor: '#f8fafc', 
    borderRadius: 8,
    borderLeft: 4,
    borderLeftColor: '#4fd183'
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  phaseNumber: { 
    fontSize: 10, 
    color: '#6b7280',
    fontWeight: 'bold'
  },
  timeframe: { 
    fontSize: 10, 
    color: '#4fd183',
    backgroundColor: '#ecfdf5',
    padding: '3 8',
    borderRadius: 4
  },
  phaseTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1f2937',
    marginBottom: 12
  },
  sectionTitle: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10
  },
  objectiveItem: { 
    fontSize: 11, 
    color: '#374151',
    marginBottom: 4,
    paddingLeft: 12
  },
  actionItem: { 
    fontSize: 11, 
    color: '#374151',
    marginBottom: 6,
    paddingLeft: 12,
    lineHeight: 1.4
  },
  actionNumber: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    fontSize: 9,
    padding: '2 6',
    borderRadius: 10,
    marginRight: 6
  },
  link: {
    fontSize: 9,
    color: '#4fd183',
    textDecoration: 'underline'
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  budgetLabel: {
    fontSize: 10,
    color: '#6b7280'
  },
  budgetValue: {
    fontSize: 11,
    color: '#d97706',
    fontWeight: 'bold',
    marginLeft: 4
  },
  channelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8
  },
  channelBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: 9,
    padding: '3 8',
    borderRadius: 4
  },
  milestoneItem: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 3,
    paddingLeft: 12
  },
  deepSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#fcd34d',
    backgroundColor: '#fffbeb',
    marginHorizontal: -16,
    marginBottom: -16,
    padding: 12
  },
  deepSectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#d97706',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  competitorCard: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 4,
    marginBottom: 6
  },
  competitorName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4
  },
  strengthItem: {
    fontSize: 9,
    color: '#059669',
    marginLeft: 8
  },
  weaknessItem: {
    fontSize: 9,
    color: '#dc2626',
    marginLeft: 8
  },
  riskItem: {
    fontSize: 10,
    color: '#ea580c',
    marginBottom: 3,
    paddingLeft: 12
  },
  roiContainer: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 4,
    marginTop: 8
  },
  roiRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  roiLabel: {
    fontSize: 10,
    color: '#6b7280',
    width: 100
  },
  roiValue: {
    fontSize: 10,
    color: '#1f2937',
    fontWeight: 'bold'
  },
  footer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 40, 
    right: 40, 
    textAlign: 'center', 
    fontSize: 9, 
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10
  }
});

function isStructuredAction(action: ActionItem | string): action is ActionItem {
  return typeof action === 'object' && action !== null && 'text' in action && 'searchTerm' in action;
}

interface StrategyPDFProps {
  result: PlannerResult;
  isDeepMode?: boolean;
  businessGoals?: string;
}

export const StrategyPDF = ({ result, isDeepMode = false, businessGoals }: StrategyPDFProps) => {
  const { strategies } = result;
  const phaseColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Business Strategy Report</Text>
          <Text style={styles.subtitle}>
            {strategies.length} Phases • Generated on {new Date().toLocaleDateString('de-DE')}
          </Text>
          {businessGoals && (
            <Text style={styles.subtitle}>Goal: {businessGoals.substring(0, 100)}{businessGoals.length > 100 ? '...' : ''}</Text>
          )}
          {isDeepMode && (
            <Text style={styles.premiumBadge}>★ Premium Deep Analysis</Text>
          )}
        </View>

        {strategies.map((phase: StrategyPhase, index: number) => (
          <View 
            key={index} 
            style={[styles.phaseCard, { borderLeftColor: phaseColors[index % phaseColors.length] }]}
            wrap={false}
          >
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseNumber}>Phase {phase.phase}</Text>
              <Text style={styles.timeframe}>{phase.timeframe}</Text>
            </View>
            
            <Text style={styles.phaseTitle}>{phase.title}</Text>

            {/* Objectives */}
            <Text style={styles.sectionTitle}>🎯 Objectives</Text>
            {phase.objectives.map((objective, i) => (
              <Text key={i} style={styles.objectiveItem}>✓ {objective}</Text>
            ))}

            {/* Actions */}
            <Text style={styles.sectionTitle}>⚡ Actions</Text>
            {phase.actions.map((action, i) => {
              const isStructured = isStructuredAction(action);
              const actionText = isStructured ? action.text : action;
              const resourceUrl = isStructured ? action.resourceUrl : null;
              const resourceTitle = isStructured ? action.resourceTitle : null;
              
              return (
                <View key={i} style={{ marginBottom: 4 }}>
                  <Text style={styles.actionItem}>
                    {i + 1}. {actionText}
                  </Text>
                  {resourceUrl && (
                    <Link src={resourceUrl} style={styles.link}>
                      → {resourceTitle || 'Resource'}
                    </Link>
                  )}
                </View>
              );
            })}

            {/* Budget - Deep Mode */}
            {isDeepMode && phase.budget && (
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>💰 Budget:</Text>
                <Text style={styles.budgetValue}>{phase.budget}</Text>
              </View>
            )}

            {/* Channels - Deep Mode */}
            {isDeepMode && phase.channels && phase.channels.length > 0 && (
              <View style={styles.channelsContainer}>
                {phase.channels.map((channel, i) => (
                  <Text key={i} style={styles.channelBadge}>{channel}</Text>
                ))}
              </View>
            )}

            {/* Milestones - Deep Mode */}
            {isDeepMode && phase.milestones && phase.milestones.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.sectionTitle}>🚩 KPI Milestones</Text>
                {phase.milestones.map((milestone, i) => (
                  <Text key={i} style={styles.milestoneItem}>• {milestone}</Text>
                ))}
              </View>
            )}

            {/* Deep Mode Exclusive Sections */}
            {isDeepMode && (phase.competitorAnalysis || phase.riskMitigation || phase.roiProjection) && (
              <View style={styles.deepSection}>
                {/* Competitor Analysis */}
                {phase.competitorAnalysis && phase.competitorAnalysis.length > 0 && (
                  <View style={{ marginBottom: 10 }}>
                    <Text style={styles.deepSectionTitle}>👥 Competitor Analysis</Text>
                    {phase.competitorAnalysis.map((competitor, i) => (
                      <View key={i} style={styles.competitorCard}>
                        <Text style={styles.competitorName}>{competitor.name}</Text>
                        <Text style={{ fontSize: 9, color: '#059669', marginBottom: 2 }}>Strengths:</Text>
                        {competitor.strengths.map((s, j) => (
                          <Text key={j} style={styles.strengthItem}>+ {s}</Text>
                        ))}
                        <Text style={{ fontSize: 9, color: '#dc2626', marginTop: 4, marginBottom: 2 }}>Weaknesses:</Text>
                        {competitor.weaknesses.map((w, j) => (
                          <Text key={j} style={styles.weaknessItem}>- {w}</Text>
                        ))}
                      </View>
                    ))}
                  </View>
                )}

                {/* Risk Mitigation */}
                {phase.riskMitigation && phase.riskMitigation.length > 0 && (
                  <View style={{ marginBottom: 10 }}>
                    <Text style={styles.deepSectionTitle}>🛡️ Risk Mitigation</Text>
                    {phase.riskMitigation.map((risk, i) => (
                      <Text key={i} style={styles.riskItem}>⚠️ {risk}</Text>
                    ))}
                  </View>
                )}

                {/* ROI Projection */}
                {phase.roiProjection && (
                  <View>
                    <Text style={styles.deepSectionTitle}>📈 ROI Projection</Text>
                    <View style={styles.roiContainer}>
                      <View style={styles.roiRow}>
                        <Text style={styles.roiLabel}>Investment:</Text>
                        <Text style={styles.roiValue}>{phase.roiProjection.investment}</Text>
                      </View>
                      <View style={styles.roiRow}>
                        <Text style={styles.roiLabel}>Expected Return:</Text>
                        <Text style={styles.roiValue}>{phase.roiProjection.expectedReturn}</Text>
                      </View>
                      <View style={styles.roiRow}>
                        <Text style={styles.roiLabel}>Timeframe:</Text>
                        <Text style={styles.roiValue}>{phase.roiProjection.timeframe}</Text>
                      </View>
                      {phase.roiProjection.assumptions && phase.roiProjection.assumptions.length > 0 && (
                        <View style={{ marginTop: 6 }}>
                          <Text style={{ fontSize: 9, color: '#6b7280' }}>Assumptions:</Text>
                          {phase.roiProjection.assumptions.map((assumption, i) => (
                            <Text key={i} style={{ fontSize: 9, color: '#6b7280', marginLeft: 8 }}>• {assumption}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}

        <View style={styles.footer}>
          <Text>Report generated by Wealthconomy AI Business Planner • {new Date().toLocaleDateString('de-DE')}</Text>
        </View>
      </Page>
    </Document>
  );
};
