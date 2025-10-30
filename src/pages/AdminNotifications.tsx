import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Send, Loader2 } from "lucide-react";

const AdminNotifications = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendNotification = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Fehlende Eingaben",
        description: "Bitte Betreff und Nachricht ausfüllen.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Nicht authentifiziert",
          description: "Bitte melden Sie sich an.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-bulk-notification', {
        body: { subject, message },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "✅ Erfolgreich versendet!",
        description: `Benachrichtigung wurde an ${data.sentCount} Nutzer gesendet.`,
      });

      // Reset form
      setSubject("");
      setMessage("");
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({
        title: "Fehler beim Versenden",
        description: error.message || "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              📧 Massen-Benachrichtigung versenden
            </CardTitle>
            <CardDescription>
              Sende eine E-Mail-Benachrichtigung an alle registrierten Nutzer (z.B. für AGB-Updates)
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Betreff</Label>
              <Input
                id="subject"
                placeholder="z.B. Wichtige AGB-Änderungen"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Nachricht</Label>
              <Textarea
                id="message"
                placeholder="Ihre Nachricht an alle Nutzer..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                disabled={isLoading}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Die Nachricht wird automatisch in einem schönen E-Mail-Template formatiert.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">📋 Vorschau:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Betreff:</strong> {subject || "(leer)"}</p>
                <p><strong>Von:</strong> Wealthconomy &lt;info@wealthconomy.com&gt;</p>
                <p className="text-muted-foreground whitespace-pre-wrap mt-2">
                  {message || "(leer)"}
                </p>
              </div>
            </div>

            <Button
              onClick={handleSendNotification}
              disabled={isLoading || !subject.trim() || !message.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird versendet...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  An alle Nutzer versenden
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Diese Aktion versendet eine E-Mail an alle registrierten Nutzer. Bitte sorgfältig prüfen.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminNotifications;
