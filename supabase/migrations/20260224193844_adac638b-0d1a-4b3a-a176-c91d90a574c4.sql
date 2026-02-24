-- Allow users to update metadata on their own messages
CREATE POLICY "Users can update messages in own conversations"
ON public.messages
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM conversations c
  WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
));