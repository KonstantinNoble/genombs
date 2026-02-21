import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/external-client";
import { toast } from "sonner";
import {
    loadConversations,
    createConversation,
    deleteConversation,
} from "@/lib/api/chat-api";
import type { Conversation } from "@/types/chat";

const MAX_CONVERSATIONS = 20;

export function useChatConversations(userId: string | undefined) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [deleteDialogState, setDeleteDialogState] = useState<{ isOpen: boolean; conversationId: string | null }>({
        isOpen: false,
        conversationId: null,
    });

    const getAccessToken = useCallback(async () => {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token ?? "";
    }, []);

    useEffect(() => {
        if (!userId) return;
        loadConversations(userId)
            .then(async (convs) => {
                if (convs.length > 0) {
                    setConversations(convs);
                    setActiveId(convs[0].id);
                } else {
                    try {
                        const conv = await createConversation(userId);
                        setConversations([conv]);
                        setActiveId(conv.id);
                    } catch (e) {
                        console.error("Failed to auto-create conversation:", e);
                    }
                }
            })
            .catch((e) => console.error("Failed to load conversations:", e));
    }, [userId]);

    const handleNewConversation = async (onSuccess?: () => void) => {
        if (!userId) return;
        try {
            const conv = await createConversation(userId);
            const updated = [conv, ...conversations];
            setConversations(updated);
            setActiveId(conv.id);
            onSuccess?.();

            if (updated.length > MAX_CONVERSATIONS) {
                const oldest = updated[updated.length - 1];
                try {
                    const token = await getAccessToken();
                    await deleteConversation(oldest.id, token);
                    setConversations((prev) => prev.filter((c) => c.id !== oldest.id));
                    console.log(`Auto-deleted oldest conversation: ${oldest.id}`);
                } catch (delErr) {
                    console.error("Failed to auto-delete oldest conversation:", delErr);
                }
            }
        } catch (e) {
            toast.error("Failed to create conversation");
            console.error(e);
        }
    };

    const handleOpenDeleteDialog = (id: string) => {
        setDeleteDialogState({ isOpen: true, conversationId: id });
    };

    const handleConfirmDelete = async () => {
        const id = deleteDialogState.conversationId;
        setDeleteDialogState({ isOpen: false, conversationId: null });
        if (!id) return;
        try {
            const token = await getAccessToken();
            await deleteConversation(id, token);
            setConversations((prev) => prev.filter((c) => c.id !== id));
            if (activeId === id) {
                setConversations((prev) => {
                    const remaining = prev.filter((c) => c.id !== id);
                    setActiveId(remaining.length > 0 ? remaining[0].id : null);
                    return remaining;
                });
            }
            toast.success("Conversation deleted");
        } catch (e) {
            toast.error("Failed to delete conversation");
            console.error(e);
        }
    };

    return {
        conversations,
        setConversations,
        activeId,
        setActiveId,
        deleteDialogState,
        setDeleteDialogState,
        handleNewConversation,
        handleOpenDeleteDialog,
        handleConfirmDelete,
        getAccessToken,
    };
}
