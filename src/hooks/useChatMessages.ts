import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
    loadMessages,
    saveMessage,
    streamChat,
    addGithubAnalysis,
} from "@/lib/api/chat-api";
import type { Message, WebsiteProfile } from "@/types/chat";

export function useChatMessages({
    activeId,
    getAccessToken,
    profiles,
    setProfiles,
    refreshCredits,
    deduplicateProfiles,
    loadProfiles,
}: {
    activeId: string | null;
    getAccessToken: () => Promise<string>;
    profiles: WebsiteProfile[];
    setProfiles: React.Dispatch<React.SetStateAction<WebsiteProfile[]>>;
    refreshCredits: () => void;
    deduplicateProfiles: (ps: WebsiteProfile[]) => WebsiteProfile[];
    loadProfiles: (id: string) => Promise<WebsiteProfile[]>;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Load messages on activeId change
    useEffect(() => {
        if (!activeId) {
            setMessages([]);
            return;
        }
        loadMessages(activeId)
            .then(setMessages)
            .catch((e) => console.error("Failed to load messages:", e));
    }, [activeId]);

    // Scroll to bottom on initial message load
    useEffect(() => {
        if (messages.length === 0) return;
        const timer = setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: "auto" });
        }, 0);
        return () => clearTimeout(timer);
    }, [activeId]);

    // Scroll to bottom while streaming
    useEffect(() => {
        if (isStreaming) {
            scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [isStreaming]);

    // Handle GitHub Deep Analysis
    const handleGithubDeepAnalysis = async (
        githubUrl: string,
        userId: string | undefined,
        model?: string,
    ) => {
        if (!activeId || !userId) return;

        const ghMatch = githubUrl.match(/^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)/);
        if (!ghMatch) {
            const errorMsg = await saveMessage(
                activeId,
                "assistant",
                "❌ Invalid GitHub URL. Please use the format: `https://github.com/owner/repo`"
            );
            setMessages((prev) => [...prev, errorMsg]);
            return;
        }

        const token = await getAccessToken();
        let ownProfile = profiles.find((p) => p.is_own_website && p.status === "completed");

        if (!ownProfile) {
            try {
                const { supabase } = await import("@/lib/supabase/external-client");
                const { data: newProfile, error } = await supabase
                    .from("website_profiles")
                    .insert({
                        url: githubUrl,
                        user_id: userId,
                        conversation_id: activeId,
                        is_own_website: true,
                        status: "completed",
                        github_repo_url: githubUrl,
                    })
                    .select()
                    .single();

                if (error || !newProfile) {
                    const errorMsg = await saveMessage(
                        activeId,
                        "assistant",
                        "❌ Failed to create profile for GitHub analysis."
                    );
                    setMessages((prev) => [...prev, errorMsg]);
                    return;
                }
                ownProfile = { ...newProfile, pagespeed_data: null } as unknown as WebsiteProfile;
                setProfiles((prev) => [...prev, ownProfile!]);
            } catch (e) {
                console.error("Failed to create GitHub-only profile:", e);
                const errorMsg = await saveMessage(
                    activeId,
                    "assistant",
                    "❌ Failed to create profile for GitHub analysis."
                );
                setMessages((prev) => [...prev, errorMsg]);
                return;
            }
        }

        try {
            const checkRes = await fetch(`https://api.github.com/repos/${ghMatch[1]}/${ghMatch[2]}`, { method: "HEAD" });
            if (!checkRes.ok) {
                const errorMsg = await saveMessage(
                    activeId,
                    "assistant",
                    `❌ Repository not found: \`${githubUrl}\`. Make sure the repository is public and the URL is correct.`
                );
                setMessages((prev) => [...prev, errorMsg]);
                return;
            }
        } catch {
            // Ignore network errors here
        }

        const confirmMsg = await saveMessage(
            activeId,
            "assistant",
            `🔍 Starting Deep Analysis with GitHub repo: ${githubUrl}...`
        );
        setMessages((prev) => [...prev, confirmMsg]);

        try {
            const result = await addGithubAnalysis(ownProfile.id, githubUrl, token, model);
            const updatedProfiles = await loadProfiles(activeId);
            setProfiles(deduplicateProfiles(updatedProfiles));

            if (result.codeAnalysis) {
                const summaryPrompt = `A Deep Code Analysis was just completed for the GitHub repository linked to ${ownProfile.url}. Here are the results:\n\n${JSON.stringify(
                    result.codeAnalysis,
                    null,
                    2
                )}\n\nGive a brief, actionable summary of the code quality findings. Focus on the top 3 most important issues and recommendations. Be conversational and direct.`;

                let assistantContent = "";
                const tempId = `temp-github-${Date.now()}`;
                setMessages((prev) => [
                    ...prev,
                    { id: tempId, conversation_id: activeId, role: "assistant", content: "", created_at: new Date().toISOString() },
                ]);
                setIsStreaming(true);

                await streamChat({
                    messages: [{ role: "user", content: summaryPrompt }],
                    conversationId: activeId,
                    accessToken: token,
                    onDelta: (delta) => {
                        assistantContent += delta;
                        setMessages((prev) =>
                            prev.map((m) => (m.id === tempId ? { ...m, content: assistantContent } : m))
                        );
                    },
                    onDone: () => { },
                });

                const savedAssistant = await saveMessage(activeId, "assistant", assistantContent);
                setMessages((prev) => prev.map((m) => (m.id === tempId ? savedAssistant : m)));
                setIsStreaming(false);
            }
            toast.success("Deep Analysis complete!");
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Deep Analysis failed";
            const errorMsg = await saveMessage(activeId, "assistant", `❌ Deep Analysis failed: ${msg}`);
            setMessages((prev) => [...prev, errorMsg]);
            console.error("GitHub deep analysis failed:", e);
        } finally {
            refreshCredits();
        }
    };

    const generateSummary = useCallback(
        async (completed: WebsiteProfile[], accessToken: string, model?: string) => {
            if (!activeId) return;
            try {
                const summaryLines = completed.map((p) => {
                    const pd = p.profile_data;
                    const scores = p.category_scores;
                    return `- ${p.url} (Score: ${p.overall_score}/100)${p.is_own_website ? " [OWN WEBSITE]" : ""
                        }\n  Strengths: ${pd?.strengths?.join(", ") || "N/A"}\n  Weaknesses: ${pd?.weaknesses?.join(", ") || "N/A"
                        }\n  Categories: Findability ${scores?.findability ?? "?"}, Mobile ${scores?.mobileUsability ?? "?"
                        }, Offer ${scores?.offerClarity ?? "?"}, Trust ${scores?.trustProof ?? "?"}, Conversion ${scores?.conversionReadiness ?? "?"
                        }`;
                });

                const summaryPrompt = `Analysis data:\n\n${summaryLines.join("\n\n")}\n\nBased on these results, give a brief actionable overview. Focus on the most important finding and the top 3 action items. Do NOT repeat all scores or list all data — be conversational and direct. Do NOT introduce yourself or say "I've reviewed the data".`;

                const chatHistory = [{ role: "user", content: summaryPrompt }];
                let assistantContent = "";
                const tempId = `temp-summary-${Date.now()}`;
                setMessages((prev) => [
                    ...prev,
                    {
                        id: tempId,
                        conversation_id: activeId,
                        role: "assistant" as const,
                        content: "",
                        created_at: new Date().toISOString(),
                    },
                ]);
                setIsStreaming(true);

                await streamChat({
                    messages: chatHistory,
                    conversationId: activeId,
                    accessToken,
                    model,
                    onDelta: (delta) => {
                        assistantContent += delta;
                        setMessages((prev) =>
                            prev.map((m) => (m.id === tempId ? { ...m, content: assistantContent } : m))
                        );
                    },
                    onDone: () => { },
                });

                const savedAssistant = await saveMessage(activeId, "assistant", assistantContent);
                setMessages((prev) => prev.map((m) => (m.id === tempId ? savedAssistant : m)));
                setIsStreaming(false);
        } catch (e) {
                setIsStreaming(false);
                const errMsg = e instanceof Error ? e.message : "";

                // Remove the temporary streaming message if it exists
                setMessages((prev) => prev.filter((m) => !m.id.startsWith("temp-summary-")));

                if (errMsg.startsWith("insufficient_credits:")) {
                    const hours = errMsg.split(":")[1];
                    const creditNotice = await saveMessage(
                        activeId,
                        "assistant",
                        "⚠️ **Auto-Summary Skipped — Not Enough Credits**\n\n"
                        + "Your website analysis completed successfully and the results are available in the dashboard on the right.\n\n"
                        + "However, generating the AI-powered summary in this chat requires additional credits, "
                        + `and your daily limit has been reached. Your credits will reset in **${hours} hour(s)**.\n\n`
                        + "**What you can do:**\n"
                        + "- Review your full analysis results in the dashboard panels\n"
                        + "- Come back after your credits reset to ask follow-up questions\n"
                        + "- Upgrade to Premium for a higher daily credit limit"
                    );
                    setMessages((prev) => [...prev, creditNotice]);
                } else {
                    console.error("Summary generation failed:", e);
                }
            }
        },
        [activeId]
    );

    const handleSend = async (content: string, userId: string | undefined, model?: string) => {
        if (!activeId || !userId || isStreaming) return;

        const githubMatch = content.match(/https?:\/\/github\.com\/[\w.-]+\/[\w.-]+/i);
        if (githubMatch) {
            const userMsg = await saveMessage(activeId, "user", content);
            setMessages((prev) => [...prev, userMsg]);
            await handleGithubDeepAnalysis(githubMatch[0], userId, model);
            return;
        }

        try {
            const userMsg = await saveMessage(activeId, "user", content);
            setMessages((prev) => [...prev, userMsg]);
            setIsStreaming(true);
            const token = await getAccessToken();

            const chatHistory = [...messages, userMsg].map((m) => ({
                role: m.role,
                content: m.content,
            }));

            let assistantContent = "";
            const tempId = `temp-${Date.now()}`;
            setMessages((prev) => [
                ...prev,
                { id: tempId, conversation_id: activeId, role: "assistant", content: "", created_at: new Date().toISOString() },
            ]);

            await streamChat({
                messages: chatHistory,
                conversationId: activeId,
                accessToken: token,
                model,
                onDelta: (delta) => {
                    assistantContent += delta;
                    setMessages((prev) =>
                        prev.map((m) => (m.id === tempId ? { ...m, content: assistantContent } : m))
                    );
                },
                onDone: () => { },
            });

            const savedAssistant = await saveMessage(activeId, "assistant", assistantContent);
            setMessages((prev) => prev.map((m) => (m.id === tempId ? savedAssistant : m)));
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Chat failed";
            if (msg === "premium_model_required") {
                toast.error("This model is only available for Premium users.");
            } else if (msg.startsWith("insufficient_credits:")) {
                const hours = msg.split(":")[1];
                toast.error(`No credits left — resets in ${hours}h.`);
            } else {
                toast.error(msg);
            }
            console.error(e);
        } finally {
            setIsStreaming(false);
            refreshCredits();
        }
    };

    return {
        messages,
        setMessages,
        isStreaming,
        scrollRef,
        handleSend,
        handleGithubDeepAnalysis,
        generateSummary,
    };
}
