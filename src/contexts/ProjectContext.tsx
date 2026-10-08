import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/visible7/client";

export interface Project {
  id: string;
  name: string;
  business_type: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjectContextValue {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  switchProject: (id: string) => void;
  createProject: (name: string) => Promise<Project | null>;
  renameProject: (id: string, name: string) => Promise<boolean>;
  setBusinessType: (id: string, businessType: string | null) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextValue>({
  projects: [],
  currentProject: null,
  loading: true,
  switchProject: () => {},
  createProject: async () => null,
  renameProject: async () => false,
  setBusinessType: async () => false,
  deleteProject: async () => false,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useProject = () => useContext(ProjectContext);

const storageKey = (userId: string) => `v7_current_project_${userId}`;

const readStored = (userId: string): string | null => {
  try {
    return localStorage.getItem(storageKey(userId));
  } catch {
    return null;
  }
};

const writeStored = (userId: string, projectId: string) => {
  try {
    localStorage.setItem(storageKey(userId), projectId);
  } catch {
    // Prohlížeč bez úložiště – projekt se jen nezapamatuje mezi návštěvami.
  }
};

/**
 * Drží seznam projektů přihlášeného uživatele a aktuálně otevřený projekt.
 * Uživatel bez projektu dostane automaticky první projekt, aby mohl hned začít.
 */
export const ProjectProvider = ({ userId, children }: { userId: string; children: React.ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, business_type, created_at, updated_at")
        .is("archived_at", null)
        .order("created_at", { ascending: true });

      if (!active) return;

      let list = (error ? [] : (data as Project[])) ?? [];

      if (!error && list.length === 0) {
        const { data: created } = await supabase
          .from("projects")
          .insert({ user_id: userId, name: "Můj první projekt" })
          .select("id, name, business_type, created_at, updated_at")
          .single();
        if (!active) return;
        if (created) list = [created as Project];
      }

      const stored = readStored(userId);
      const pick = list.find((p) => p.id === stored) ?? list[0] ?? null;

      setProjects(list);
      setCurrentId(pick?.id ?? null);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  const switchProject = useCallback(
    (id: string) => {
      setCurrentId(id);
      writeStored(userId, id);
    },
    [userId]
  );

  const createProject = useCallback(
    async (name: string) => {
      const { data, error } = await supabase
        .from("projects")
        .insert({ user_id: userId, name: name.trim() || "Nový projekt" })
        .select("id, name, business_type, created_at, updated_at")
        .single();
      if (error || !data) return null;
      const project = data as Project;
      setProjects((prev) => [...prev, project]);
      switchProject(project.id);
      return project;
    },
    [userId, switchProject]
  );

  const renameProject = useCallback(async (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const { error } = await supabase.from("projects").update({ name: trimmed }).eq("id", id);
    if (error) return false;
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: trimmed } : p)));
    return true;
  }, []);

  const setBusinessType = useCallback(async (id: string, businessType: string | null) => {
    const { error } = await supabase.from("projects").update({ business_type: businessType }).eq("id", id);
    if (error) return false;
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, business_type: businessType } : p)));
    return true;
  }, []);

  /**
   * Smazání projektu z pohledu uživatele: projekt se archivuje a zmizí z přehledu.
   * Data zůstávají v databázi, aby vystavená osvědčení šla dál ověřit.
   */
  const deleteProject = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("projects").update({ archived_at: new Date().toISOString() }).eq("id", id);
      if (error) return false;
      const rest = projects.filter((p) => p.id !== id);
      if (rest.length === 0) {
        const { data } = await supabase
          .from("projects")
          .insert({ user_id: userId, name: "Můj první projekt" })
          .select("id, name, business_type, created_at, updated_at")
          .single();
        if (data) rest.push(data as Project);
      }
      setProjects(rest);
      if (currentId === id && rest[0]) switchProject(rest[0].id);
      return true;
    },
    [projects, currentId, userId, switchProject]
  );

  const value = useMemo<ProjectContextValue>(
    () => ({
      projects,
      currentProject: projects.find((p) => p.id === currentId) ?? null,
      loading,
      switchProject,
      createProject,
      renameProject,
      setBusinessType,
      deleteProject,
    }),
    [projects, currentId, loading, switchProject, createProject, renameProject, setBusinessType, deleteProject]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};
