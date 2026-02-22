import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/external-client";
import { toast } from "sonner";
import {
    loadProfiles,
    loadTasks,
    deleteProfilesForConversation,
    updateConversationTitle,
    analyzeWebsite,
} from "@/lib/api/chat-api";
import type { WebsiteProfile, ImprovementTask, Conversation } from "@/types/chat";
import { useGamificationTrigger } from "@/hooks/useGamificationTrigger";

export function useChatAnalysis({
    activeId,
    userId,
    getAccessToken,
    setConversations,
    onSummaryRequired,
    onCompetitorSearchRequired,
}: {
    activeId: string | null;
    userId: string | undefined;
    getAccessToken: () => Promise<string>;
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
    onSummaryRequired: (completed: WebsiteProfile[], token: string, model?: string) => void;
    onCompetitorSearchRequired?: () => void;
}) {
    const [profiles, setProfiles] = useState<WebsiteProfile[]>([]);
    const [tasks, setTasks] = useState<ImprovementTask[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showInlineUrlPrompt, setShowInlineUrlPrompt] = useState(false);

    const { triggerAfterAnalysis } = useGamificationTrigger(userId ?? null);

    const realtimePausedRef = useRef(false);
    const expectedProfileCountRef = useRef<number>(0);
    const summaryModelRef = useRef<string | undefined>(undefined);
    const summaryTokenRef = useRef<string>("");
    const autoFindRef = useRef(false);

    const deduplicateProfiles = useCallback((ps: WebsiteProfile[]): WebsiteProfile[] => {
        const byUrl = new Map<string, WebsiteProfile>();
        for (const p of ps) {
            const existing = byUrl.get(p.url);
            if (!existing || new Date(p.created_at) > new Date(existing.created_at)) {
                byUrl.set(p.url, p);
            }
        }
        return Array.from(byUrl.values());
    }, []);

    useEffect(() => {
        if (!activeId) {
            setProfiles([]);
            setTasks([]);
            setShowInlineUrlPrompt(false);
            return;
        }
        loadProfiles(activeId)
            .then((ps) => {
                setProfiles(ps);
                if (ps.length > 0) setShowInlineUrlPrompt(false);
                const completedIds = ps.filter((p) => p.status === "completed").map((p) => p.id);
                if (completedIds.length > 0) {
                    loadTasks(completedIds).then(setTasks).catch(console.error);
                } else {
                    setTasks([]);
                }
            })
            .catch((e) => console.error("Failed to load profiles:", e));
    }, [activeId]);

    useEffect(() => {
        if (!activeId || !userId) return;

        const channel = supabase
            .channel(`profiles_${activeId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "website_profiles",
                    filter: `conversation_id=eq.${activeId}`,
                },
                () => {
                    if (realtimePausedRef.current) return;
                    loadProfiles(activeId).then(async (ps) => {
                        const deduped = deduplicateProfiles(ps);
                        setProfiles(deduped);
                        const completedIds = deduped.filter((p) => p.status === "completed").map((p) => p.id);
                        if (completedIds.length > 0) {
                            loadTasks(completedIds).then(setTasks).catch(console.error);
                        }

                        const expected = expectedProfileCountRef.current;
                        if (expected > 0) {
                            const doneCount = deduped.filter((p) => p.status === "completed" || p.status === "error").length;
                            if (doneCount >= expected) {
                                expectedProfileCountRef.current = 0;
                                const completed = deduped.filter((p) => p.status === "completed");
                                if (completed.length > 0) {
                                    if (autoFindRef.current) {
                                        autoFindRef.current = false;
                                        onCompetitorSearchRequired?.();
                                    } else {
                                        onSummaryRequired(completed, summaryTokenRef.current, summaryModelRef.current);
                                    }
                                    triggerAfterAnalysis(completed);
                                }
                            }
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeId, userId, deduplicateProfiles, onSummaryRequired, triggerAfterAnalysis]);

    const handleScan = async (
        ownUrl: string,
        competitorUrls: string[],
        model?: string,
        githubRepoUrl?: string,
        saveUserMessage?: (content: string) => Promise<void>,
        onComplete?: () => void,
        autoFindCompetitors?: boolean
    ) => {
        if (!activeId || !userId) return;

        setIsAnalyzing(true);
        autoFindRef.current = !!autoFindCompetitors;
        const token = await getAccessToken();

        if (saveUserMessage) {
            const content = autoFindCompetitors
                ? `Analyze my site ${ownUrl} (auto-finding competitors)`
                : `Analyze my site ${ownUrl} vs competitors: ${competitorUrls.join(", ")}`;
            try {
                await saveUserMessage(content);
            } catch (e) {
                console.error("Failed to save scan message:", e);
            }
        }

        realtimePausedRef.current = true;

        const existingOwnProfile = profiles.find((p) => p.is_own_website && p.code_analysis);
        const preservedCodeAnalysis = existingOwnProfile?.code_analysis ?? null;
        const preservedGithubUrl = existingOwnProfile?.github_repo_url ?? null;

        try {
            const result = await deleteProfilesForConversation(activeId, token);
            console.log(`Cleanup complete: ${result.deletedProfiles} profiles, ${result.deletedTasks} task groups removed`);
        } catch (e) {
            console.error("Failed to delete old profiles:", e);
            toast.error("Failed to delete old analysis data. Please try again.");
            realtimePausedRef.current = false;
            setIsAnalyzing(false);
            return;
        }
        setProfiles([]);
        setTasks([]);

        setTimeout(() => {
            realtimePausedRef.current = false;
            loadProfiles(activeId)
                .then((ps) => {
                    const deduped = deduplicateProfiles(ps);
                    setProfiles(deduped);
                    const completedIds = deduped.filter((p) => p.status === "completed").map((p) => p.id);
                    if (completedIds.length > 0) {
                        loadTasks(completedIds).then(setTasks).catch(console.error);
                    }

                    const expected = expectedProfileCountRef.current;
                    if (expected > 0) {
                        const doneCount = deduped.filter((p) => p.status === "completed" || p.status === "error").length;
                        if (doneCount >= expected) {
                            expectedProfileCountRef.current = 0;
                            const completed = deduped.filter((p) => p.status === "completed");
                            if (completed.length > 0) {
                                onSummaryRequired(completed, summaryTokenRef.current, summaryModelRef.current);
                                triggerAfterAnalysis(completed);
                            }
                        }
                    }
                })
                .catch(console.error);
        }, 2000);

        const allUrls = [{ url: ownUrl, isOwn: true }, ...competitorUrls.map((u) => ({ url: u, isOwn: false }))];

        try {
            const domain = new URL(ownUrl.startsWith("http") ? ownUrl : `https://${ownUrl}`).hostname.replace(/^www\./, "");
            await updateConversationTitle(activeId, domain);
            setConversations((prev) => prev.map((c) => (c.id === activeId ? { ...c, title: domain } : c)));
        } catch (e) {
            console.error("Failed to update conversation title:", e);
        }

        try {
            let ownProfileId: string | null = null;
            await Promise.all(
                allUrls.map(async ({ url, isOwn }) => {
                    try {
                        const result = await analyzeWebsite(url, activeId, isOwn, token, model, isOwn ? githubRepoUrl : undefined);
                        if (isOwn && result?.profileId) {
                            ownProfileId = result.profileId;
                        }
                    } catch (e: any) {
                        const msg = e.message || "Analysis failed";
                        if (msg === "premium_model_required") {
                            toast.error("This model is only available for Premium users.");
                        } else if (msg.startsWith("insufficient_credits:")) {
                            const hours = msg.split(":")[1];
                            toast.error("Not enough credits", {
                                description: `Analysis for ${url} requires more credits than you have left. Resets in ${hours}h. Upgrade to Premium for 100 daily credits.`,
                                duration: 8000,
                                style: { borderColor: 'hsl(var(--destructive))', background: 'hsl(var(--destructive) / 0.1)' },
                            });
                        } else {
                            toast.error(`Analysis failed for ${url}: ${msg}`);
                        }
                    }
                })
            );

            if (preservedCodeAnalysis && ownProfileId) {
                try {
                    await supabase
                        .from("website_profiles")
                        .update({
                            code_analysis: preservedCodeAnalysis as any,
                            github_repo_url: preservedGithubUrl,
                        })
                        .eq("id", ownProfileId);
                    console.log("Restored preserved code_analysis to new profile");
                } catch (e) {
                    console.error("Failed to restore code_analysis:", e);
                }
            }
            toast.success("Analysis started! Results will appear in the dashboard.");

            expectedProfileCountRef.current = allUrls.length;
            summaryTokenRef.current = token;
            summaryModelRef.current = model;
        } catch (e) {
            toast.error("Analysis request failed");
            console.error(e);
        } finally {
            setIsAnalyzing(false);
            onComplete?.();
        }
    };

    return {
        profiles,
        setProfiles,
        tasks,
        isAnalyzing,
        showInlineUrlPrompt,
        setShowInlineUrlPrompt,
        deduplicateProfiles,
        handleScan,
        loadProfiles,
    };
}
