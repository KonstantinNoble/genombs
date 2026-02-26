import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { WebsiteProfile, ImprovementTask } from "@/types/chat";

const c = {
  bg: "#0f1117",
  card: "#1a1d27",
  border: "#2a2d3a",
  fg: "#e4e4e7",
  muted: "#9ca3af",
  primary: "#818cf8",
  green: "#4ade80",
  red: "#f87171",
  yellow: "#facc15",
};

const s = StyleSheet.create({
  page: { backgroundColor: c.bg, padding: 40, fontFamily: "Helvetica", color: c.fg },
  title: { fontSize: 22, fontWeight: "bold", color: c.primary, marginBottom: 4 },
  subtitle: { fontSize: 10, color: c.muted, marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: c.fg, marginBottom: 8, marginTop: 18, borderBottom: `1px solid ${c.border}`, paddingBottom: 4 },
  card: { backgroundColor: c.card, borderRadius: 6, padding: 12, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  label: { fontSize: 9, color: c.muted },
  value: { fontSize: 9, color: c.fg, fontWeight: "bold" },
  url: { fontSize: 11, color: c.primary, fontWeight: "bold", marginBottom: 6 },
  badge: { fontSize: 8, color: c.muted, marginBottom: 2 },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottom: `0.5px solid ${c.border}` },
  scoreName: { fontSize: 9, color: c.fg, width: "60%" },
  scoreVal: { fontSize: 9, fontWeight: "bold", textAlign: "right", width: "40%" },
  listItem: { fontSize: 9, color: c.fg, marginBottom: 2, paddingLeft: 8 },
  taskRow: { flexDirection: "row", paddingVertical: 4, borderBottom: `0.5px solid ${c.border}` },
  taskTitle: { fontSize: 9, color: c.fg, width: "50%" },
  taskMeta: { fontSize: 8, color: c.muted, width: "25%", textAlign: "center" },
  compHeader: { flexDirection: "row", paddingVertical: 4, borderBottom: `1px solid ${c.border}`, marginBottom: 2 },
  compCell: { fontSize: 8, color: c.muted, textAlign: "center" },
  compValCell: { fontSize: 9, color: c.fg, textAlign: "center" },
  overallScore: { fontSize: 28, fontWeight: "bold", color: c.primary },
  overallLabel: { fontSize: 9, color: c.muted, marginTop: 2 },
});

const scoreColor = (v: number | null | undefined) => {
  if (v == null) return c.muted;
  if (v >= 80) return c.green;
  if (v >= 50) return c.yellow;
  return c.red;
};

const extractScore = (v: number | { score: number } | undefined | null): number | null => {
  if (v == null) return null;
  if (typeof v === "number") return v;
  return v.score ?? null;
};

const shorten = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const CategoryScoreRows = ({ scores }: { scores: NonNullable<WebsiteProfile["category_scores"]> }) => {
  const items = [
    ["Findability", scores.findability],
    ["Mobile Usability", scores.mobileUsability],
    ["Offer Clarity", scores.offerClarity],
    ["Trust & Proof", scores.trustProof],
    ["Conversion Readiness", scores.conversionReadiness],
  ] as const;
  return (
    <View>
      {items.map(([name, val]) => (
        <View style={s.scoreRow} key={name}>
          <Text style={s.scoreName}>{name}</Text>
          <Text style={[s.scoreVal, { color: scoreColor(val) }]}>{val ?? "–"}</Text>
        </View>
      ))}
    </View>
  );
};

const ProfileSection = ({ profile }: { profile: WebsiteProfile }) => {
  const pd = profile.profile_data;
  const cs = profile.category_scores;
  const ps = profile.pagespeed_data as WebsiteProfile["pagespeed_data"] & { [k: string]: unknown } | null;
  const ca = profile.code_analysis;

  return (
    <View break={!profile.is_own_website}>
      <Text style={s.url}>{shorten(profile.url)}</Text>
      <Text style={s.badge}>{profile.is_own_website ? "Your Website" : "Competitor"}</Text>

      {/* Overall + Categories */}
      {(profile.overall_score != null || cs) && (
        <View style={s.card}>
          {profile.overall_score != null && (
            <View style={{ alignItems: "center", marginBottom: 8 }}>
              <Text style={[s.overallScore, { color: scoreColor(profile.overall_score) }]}>{profile.overall_score}</Text>
              <Text style={s.overallLabel}>Overall Score</Text>
            </View>
          )}
          {cs && <CategoryScoreRows scores={cs} />}
        </View>
      )}

      {/* Positioning */}
      {pd && (
        <View style={s.card}>
          <Text style={{ fontSize: 10, fontWeight: "bold", color: c.fg, marginBottom: 6 }}>Positioning</Text>
          {pd.targetAudience && (
            <View style={s.row}>
              <Text style={s.label}>Target Audience</Text>
              <Text style={[s.value, { width: "60%", textAlign: "right" }]}>{pd.targetAudience}</Text>
            </View>
          )}
          {pd.usp && (
            <View style={s.row}>
              <Text style={s.label}>USP</Text>
              <Text style={[s.value, { width: "60%", textAlign: "right" }]}>{pd.usp}</Text>
            </View>
          )}
        </View>
      )}

      {/* Strengths & Weaknesses */}
      {pd && (pd.strengths?.length > 0 || pd.weaknesses?.length > 0) && (
        <View style={s.card}>
          {pd.strengths?.length > 0 && (
            <View style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: 10, fontWeight: "bold", color: c.green, marginBottom: 3 }}>Strengths</Text>
              {pd.strengths.map((item, i) => <Text key={i} style={s.listItem}>• {item}</Text>)}
            </View>
          )}
          {pd.weaknesses?.length > 0 && (
            <View>
              <Text style={{ fontSize: 10, fontWeight: "bold", color: c.red, marginBottom: 3 }}>Weaknesses</Text>
              {pd.weaknesses.map((item, i) => <Text key={i} style={s.listItem}>• {item}</Text>)}
            </View>
          )}
        </View>
      )}

      {/* PageSpeed */}
      {ps && (
        <View style={s.card}>
          <Text style={{ fontSize: 10, fontWeight: "bold", color: c.fg, marginBottom: 6 }}>PageSpeed</Text>
          {([["Performance", ps.performance], ["Accessibility", ps.accessibility], ["Best Practices", ps.bestPractices], ["SEO", ps.seo]] as const).map(([name, val]) => (
            <View style={s.scoreRow} key={name}>
              <Text style={s.scoreName}>{name}</Text>
              <Text style={[s.scoreVal, { color: scoreColor(val as number) }]}>{val ?? "–"}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Code Analysis */}
      {ca && (
        <View style={s.card}>
          <Text style={{ fontSize: 10, fontWeight: "bold", color: c.fg, marginBottom: 6 }}>Code Analysis</Text>
          {([["Code Quality", extractScore(ca.codeQuality)], ["Security", extractScore(ca.security)], ["Performance", extractScore(ca.performance)], ["Accessibility", extractScore(ca.accessibility)], ["Maintainability", extractScore(ca.maintainability)]] as const).map(([name, val]) => (
            <View style={s.scoreRow} key={name}>
              <Text style={s.scoreName}>{name}</Text>
              <Text style={[s.scoreVal, { color: scoreColor(val) }]}>{val ?? "–"}</Text>
            </View>
          ))}
          {ca.techStack?.length > 0 && (
            <Text style={[s.label, { marginTop: 6 }]}>Tech Stack: {ca.techStack.join(", ")}</Text>
          )}
        </View>
      )}
    </View>
  );
};

interface PdfReportProps {
  profiles: WebsiteProfile[];
  tasks: ImprovementTask[];
}

const PdfReport = ({ profiles, tasks }: PdfReportProps) => {
  const ownSite = profiles.find((p) => p.is_own_website);
  const competitors = profiles.filter((p) => !p.is_own_website);
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <Text style={s.title}>Synvertas Analysis Report</Text>
        <Text style={s.subtitle}>{date} · {ownSite ? shorten(ownSite.url) : "Website Analysis"}</Text>

        {/* Own Site */}
        {ownSite && (
          <View>
            <Text style={s.sectionTitle}>Your Website</Text>
            <ProfileSection profile={ownSite} />
          </View>
        )}

        {/* Competitors */}
        {competitors.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Competitors</Text>
            {competitors.map((p) => <ProfileSection key={p.id} profile={p} />)}
          </View>
        )}

        {/* Comparison Table */}
        {competitors.length > 0 && ownSite?.category_scores && (
          <View break>
            <Text style={s.sectionTitle}>Score Comparison</Text>
            <View style={s.card}>
              {/* Header */}
              <View style={s.compHeader}>
                <Text style={[s.compCell, { width: "25%", textAlign: "left" }]}>Category</Text>
                <Text style={[s.compCell, { width: `${75 / (competitors.length + 1)}%` }]}>{shorten(ownSite.url).substring(0, 20)}</Text>
                {competitors.map((cp) => (
                  <Text key={cp.id} style={[s.compCell, { width: `${75 / (competitors.length + 1)}%` }]}>{shorten(cp.url).substring(0, 20)}</Text>
                ))}
              </View>
              {/* Rows */}
              {(["findability", "mobileUsability", "offerClarity", "trustProof", "conversionReadiness"] as const).map((cat) => {
                const labels: Record<string, string> = { findability: "Findability", mobileUsability: "Mobile Usability", offerClarity: "Offer Clarity", trustProof: "Trust & Proof", conversionReadiness: "Conversion" };
                return (
                  <View style={s.scoreRow} key={cat}>
                    <Text style={[s.scoreName, { width: "25%" }]}>{labels[cat]}</Text>
                    <Text style={[s.compValCell, { width: `${75 / (competitors.length + 1)}%`, color: scoreColor(ownSite.category_scores![cat]) }]}>
                      {ownSite.category_scores![cat] ?? "–"}
                    </Text>
                    {competitors.map((cp) => (
                      <Text key={cp.id} style={[s.compValCell, { width: `${75 / (competitors.length + 1)}%`, color: scoreColor(cp.category_scores?.[cat] ?? null) }]}>
                        {cp.category_scores?.[cat] ?? "–"}
                      </Text>
                    ))}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Tasks */}
        {tasks.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Improvement Tasks</Text>
            <View style={s.card}>
              <View style={s.compHeader}>
                <Text style={[s.compCell, { width: "50%", textAlign: "left" }]}>Task</Text>
                <Text style={[s.compCell, { width: "25%" }]}>Priority</Text>
                <Text style={[s.compCell, { width: "25%" }]}>Status</Text>
              </View>
              {tasks.map((t) => (
                <View style={s.taskRow} key={t.id}>
                  <Text style={s.taskTitle}>{t.title}</Text>
                  <Text style={s.taskMeta}>{t.priority}</Text>
                  <Text style={s.taskMeta}>{t.status}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default PdfReport;
