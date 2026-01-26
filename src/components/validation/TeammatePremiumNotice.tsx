import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TeammatePremiumNotice() {
  return (
    <Alert className="bg-muted/50 border-muted-foreground/20">
      <Info className="h-5 w-5 text-muted-foreground" />
      <AlertTitle className="text-foreground font-semibold">
        Created by Free User
      </AlertTitle>
      <AlertDescription className="text-muted-foreground">
        This analysis was created by a team member without Premium. 
        Premium features like PDF export and strategic insights are not available for this analysis.
      </AlertDescription>
    </Alert>
  );
}
