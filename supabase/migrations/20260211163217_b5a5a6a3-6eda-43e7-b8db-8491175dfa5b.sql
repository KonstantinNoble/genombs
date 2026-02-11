CREATE POLICY "Users can delete messages in own conversations"
ON public.messages
FOR DELETE
USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()));