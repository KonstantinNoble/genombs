import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/external-client";

type AppRole = "admin" | "moderator" | "user";

export const useUserRole = (userId?: string) => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!userId) {
        setRoles([]);
        setIsAdmin(false);
        setIsModerator(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching user roles:", error);
          setRoles([]);
          setIsAdmin(false);
          setIsModerator(false);
        } else {
          const userRoles = data?.map((r) => r.role as AppRole) || [];
          setRoles(userRoles);
          setIsAdmin(userRoles.includes("admin"));
          setIsModerator(userRoles.includes("moderator"));
        }
      } catch (err) {
        console.error("Failed to fetch user roles:", err);
        setRoles([]);
        setIsAdmin(false);
        setIsModerator(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [userId]);

  return { roles, isAdmin, isModerator, loading };
};
