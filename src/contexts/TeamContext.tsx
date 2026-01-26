import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import type { Session } from "@supabase/supabase-js";

export type TeamRole = "owner" | "admin" | "member" | "viewer";

export interface Team {
  id: string;
  name: string;
  slug: string;
  role: TeamRole;
  joinedAt: string;
  created_at: string;
}

interface TeamContextType {
  currentTeam: Team | null;
  teams: Team[];
  teamRole: TeamRole | null;
  isInTeamMode: boolean;
  isLoading: boolean;
  switchTeam: (teamId: string | null) => void;
  refreshTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<Team>;
  deleteTeam: (teamId: string) => Promise<void>;
  leaveTeam: (teamId: string) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
};

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const fetchTeams = useCallback(async () => {
    if (!user || !session) {
      setTeams([]);
      setCurrentTeam(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("team-management/list", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        console.error("Failed to fetch teams:", response.error);
        return;
      }

      const fetchedTeams = response.data?.teams || [];
      setTeams(fetchedTeams);

      // Restore last selected team from localStorage
      const savedTeamId = localStorage.getItem("synoptas_current_team");
      if (savedTeamId) {
        const savedTeam = fetchedTeams.find((t: Team) => t.id === savedTeamId);
        if (savedTeam) {
          setCurrentTeam(savedTeam);
        } else {
          localStorage.removeItem("synoptas_current_team");
        }
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const switchTeam = useCallback((teamId: string | null) => {
    if (teamId === null) {
      setCurrentTeam(null);
      localStorage.removeItem("synoptas_current_team");
    } else {
      const team = teams.find((t) => t.id === teamId);
      if (team) {
        setCurrentTeam(team);
        localStorage.setItem("synoptas_current_team", teamId);
      }
    }
  }, [teams]);

  const createTeam = useCallback(async (name: string): Promise<Team> => {
    if (!session) {
      throw new Error("Not authenticated");
    }

    const response = await supabase.functions.invoke("team-management/create", {
      body: { name },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error) {
      throw new Error(response.error.message || "Failed to create team");
    }

    if (response.data?.error) {
      throw new Error(response.data.error);
    }

    const newTeam: Team = {
      ...response.data.team,
      role: "owner",
      joinedAt: new Date().toISOString(),
    };

    setTeams((prev) => [...prev, newTeam]);
    return newTeam;
  }, [session]);

  const deleteTeam = useCallback(async (teamId: string) => {
    if (!session) {
      throw new Error("Not authenticated");
    }

    const response = await supabase.functions.invoke("team-management/delete", {
      body: { teamId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error || response.data?.error) {
      throw new Error(response.data?.error || "Failed to delete team");
    }

    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    if (currentTeam?.id === teamId) {
      setCurrentTeam(null);
      localStorage.removeItem("synoptas_current_team");
    }
  }, [session, currentTeam]);

  const leaveTeam = useCallback(async (teamId: string) => {
    if (!session || !user) {
      throw new Error("Not authenticated");
    }

    const response = await supabase.functions.invoke("team-management/remove-member", {
      body: { teamId, userId: user.id },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error || response.data?.error) {
      throw new Error(response.data?.error || "Failed to leave team");
    }

    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    if (currentTeam?.id === teamId) {
      setCurrentTeam(null);
      localStorage.removeItem("synoptas_current_team");
    }
  }, [session, user, currentTeam]);

  const value: TeamContextType = {
    currentTeam,
    teams,
    teamRole: currentTeam?.role || null,
    isInTeamMode: currentTeam !== null,
    isLoading,
    switchTeam,
    refreshTeams: fetchTeams,
    createTeam,
    deleteTeam,
    leaveTeam,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};
