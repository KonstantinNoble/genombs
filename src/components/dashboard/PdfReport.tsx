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
  subTitle: { fontSize: 10, fontWeight: "bold", color: c.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 14 },
  card: { backgroundColor: c.card, borderRadius: 6, padding: 12, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  label: { fontSize: 9, color: c.muted },
  value: { fontSize: 9, color: c.fg, fontWeight: "bold" },
  url: { fontSize: 11, color: c.primary, fontWeight: "bold", marginBottom: 2 },
  badge: { fontSize: 8, color: c.muted, marginBottom: 6 },
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
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tag: { fontSize: 8, color: c.primary, backgroundColor: "#818cf820", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tagOutline: { fontSize: 8, color: c.primary, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, border: `0.5px solid ${c.primary}` },
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

/* ── Website Overview Card (score + categories) ── */
const OverviewCard = ({ profile }: { profile: WebsiteProfile }) => {
  const cs = profile.category_scores;
  if (profile.overall_score == null && !cs) return null;
  return (
    <View style={s.card}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={s.url}>{shorten(profile.url)}</Text>
        <Text style={s.badge}>{profile.is_own_website ? "Your Site" : "Competitor"}</Text>
      </View>
      {profile.overall_score != null && (
        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <Text style={[s.overallScore, { color: scoreColor(profile.overall_score) }]}>{profile.overall_score}</Text>
          <Text style={s.overallLabel}>Overall Score</Text>
        </View>
      )}
      {cs && <CategoryScoreRows scores={cs} />}
    </View>
  );
};

/* ── Positioning Card ── */
const PositioningCard = ({ profile }: { profile: WebsiteProfile }) => {
  const pd = profile.profile_data;
  if (!pd) return null;
  return (
    <View style={s.card}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ fontSize: 10, fontWeight: "bold", color: c.fg }}>{pd.name}</Text>
        <Text style={{ fontSize: 8, color: c.muted }}>{profile.is_own_website ? "Your Site" : "Competitor"}</Text>
      </View>
      {pd.targetAudience ? (
        <View style={{ marginBottom: 4 }}>
          <Text style={s.label}>Target Audience</Text>
          <Text style={[s.value, { marginTop: 1 }]}>{pd.targetAudience}</Text>
        </View>
      ) : null}
      {pd.usp ? (
        <View style={{ marginBottom: 4 }}>
          <Text style={s.label}>Unique Selling Proposition</Text>
          <Text style={[s.value, { marginTop: 1 }]}>{pd.usp}</Text>
        </View>
      ) : null}
      {(pd.siteStructure ?? []).length > 0 && (
        <View style={{ marginTop: 4 }}>
          <Text style={s.label}>Site Structure</Text>
          <View style={[s.tagWrap, { marginTop: 3 }]}>
            {pd.siteStructure.map((t) => (
              <Text key={t} style={s.tag}>{t}</Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

/* ── Offer & CTAs Card ── */
const OfferCard = ({ profile }: { profile: WebsiteProfile }) => {
  const pd = profile.profile_data;
  if (!pd) return null;
  const ctas = pd.ctas ?? [];
  if (ctas.length === 0 && !pd.usp) return null;
  return (
    <View style={s.card}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ fontSize: 10, fontWeight: "bold", color: c.fg }}>{pd.name}</Text>
        <Text style={{ fontSize: 8, color: c.muted }}>{profile.is_own_website ? "Your Site" : "Competitor"}</Text>
      </View>
      {ctas.length > 0 && (
        <View style={{ marginBottom: 4 }}>
          <Text style={s.label}>Call-to-Actions</Text>
          <View style={[s.tagWrap, { marginTop: 3 }]}>
            {ctas.map((cta) => (
              <Text key={cta} style={s.tagOutline}>{cta}</Text>
            ))}
          </View>
        </View>
      )}
      {pd.usp ? (
        <View style={{ marginTop: 4 }}>
          <Text style={s.label}>Value Proposition</Text>
          <Text style={[s.value, { marginTop: 1 }]}>{pd.usp}</Text>
        </View>
      ) : null}
    </View>
  );
};

/* ── Trust & Proof Card ── */
const TrustCard = ({ profile }: { profile: WebsiteProfile }) => {
  const pd = profile.profile_data;
  if (!pd) return null;
  const strengths = pd.strengths ?? [];
  const weaknesses = pd.weaknesses ?? [];
  if (strengths.length === 0 && weaknesses.length === 0) return null;
  const trustScore = profile.category_scores?.trustProof ?? null;
  return (
    <View style={s.card}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {trustScore != null && (
            <Text style={{ fontSize: 16, fontWeight: "bold", color: scoreColor(trustScore) }}>{trustScore}</Text>
          )}
          <View>
            <Text style={{ fontSize: 10, fontWeight: "bold", color: c.fg }}>{pd.name}</Text>
            <Text style={{ fontSize: 8, color: c.muted }}>Trust & Proof Score</Text>
          </View>
        </View>
        <Text style={{ fontSize: 8, color: c.muted }}>{profile.is_own_website ? "Your Site" : "Competitor"}</Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        {strengths.length > 0 && (
          <View style={{ width: "50%", paddingRight: 6 }}>
            <Text style={{ fontSize: 9, fontWeight: "bold", color: c.green, marginBottom: 3 }}>Strengths</Text>
            {strengths.slice(0, 5).map((item, i) => (
              <Text key={i} style={s.listItem}>• {item}</Text>
            ))}
          </View>
        )}
        {weaknesses.length > 0 && (
          <View style={{ width: "50%", paddingLeft: 6 }}>
            <Text style={{ fontSize: 9, fontWeight: "bold", color: c.red, marginBottom: 3 }}>Weaknesses</Text>
            {weaknesses.slice(0, 5).map((item, i) => (
              <Text key={i} style={s.listItem}>• {item}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

/* ── Code Analysis Card ── */
const CodeAnalysisSection = ({ profile }: { profile: WebsiteProfile }) => {
  const ca = profile.code_analysis;
  if (!ca) return null;
  const scores = [
    ["Code Quality", extractScore(ca.codeQuality)],
    ["Security", extractScore(ca.security)],
    ["Performance", extractScore(ca.performance)],
    ["Accessibility", extractScore(ca.accessibility)],
    ["Maintainability", extractScore(ca.maintainability)],
  ] as const;
  const hasAnyScore = scores.some(([, v]) => v != null);
  if (!hasAnyScore) return null;

  return (
    <View>
      <Text style={s.subTitle}>Code Analysis</Text>
      <View style={s.card}>
        {scores.map(([name, val]) => (
          <View style={s.scoreRow} key={name}>
            <Text style={s.scoreName}>{name}</Text>
            <Text style={[s.scoreVal, { color: scoreColor(val) }]}>{val ?? "–"}</Text>
          </View>
        ))}
        {(ca.techStack ?? []).length > 0 && (
          <View style={{ marginTop: 6 }}>
            <Text style={s.label}>Tech Stack</Text>
            <View style={[s.tagWrap, { marginTop: 3 }]}>
              {ca.techStack.map((t) => (
                <Text key={t} style={s.tag}>{t}</Text>
              ))}
            </View>
          </View>
        )}
      </View>
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
  const allProfiles = ownSite ? [ownSite, ...competitors] : competitors;
  const hasMultiple = profiles.length >= 2;
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <Text style={s.title}>Synvertas Analysis Report</Text>
        <Text style={s.subtitle}>{date} · {ownSite ? shorten(ownSite.url) : "Website Analysis"}</Text>

        {/* ── WEBSITE ANALYSIS ── */}
        <Text style={s.sectionTitle}>Website Analysis</Text>

        {/* Overview */}
        <Text style={s.subTitle}>Overview</Text>
        {allProfiles.map((p) => (
          <OverviewCard key={p.id} profile={p} />
        ))}

        {/* Comparison Table */}
        {hasMultiple && ownSite?.category_scores && (
          <View style={[s.card, { marginTop: 8 }]}>
            <View style={s.compHeader}>
              <Text style={[s.compCell, { width: "25%", textAlign: "left" }]}>Category</Text>
              <Text style={[s.compCell, { width: `${75 / (competitors.length + 1)}%` }]}>{shorten(ownSite.url).substring(0, 20)}</Text>
              {competitors.map((cp) => (
                <Text key={cp.id} style={[s.compCell, { width: `${75 / (competitors.length + 1)}%` }]}>{shorten(cp.url).substring(0, 20)}</Text>
              ))}
            </View>
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
        )}

        {/* Improvement Tasks */}
        {tasks.length > 0 && (
          <View style={[s.card, { marginTop: 8 }]}>
            <Text style={{ fontSize: 10, fontWeight: "bold", color: c.fg, marginBottom: 6 }}>Improvement Tasks</Text>
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
        )}

        {/* Positioning */}
        <Text style={s.subTitle}>Positioning</Text>
        {allProfiles.map((p) => (
          <PositioningCard key={p.id} profile={p} />
        ))}

        {/* Offer & CTAs */}
        <Text style={s.subTitle}>Offer & CTAs</Text>
        {allProfiles.map((p) => (
          <OfferCard key={p.id} profile={p} />
        ))}

        {/* Trust & Proof */}
        <Text style={s.subTitle}>Trust & Proof</Text>
        {allProfiles.map((p) => (
          <TrustCard key={p.id} profile={p} />
        ))}

        {/* ── CODE ANALYSIS (only if data exists) ── */}
        {ownSite && <CodeAnalysisSection profile={ownSite} />}
      </Page>
    </Document>
  );
};

export default PdfReport;
