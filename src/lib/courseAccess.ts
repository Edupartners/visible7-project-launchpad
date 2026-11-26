import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/visible7/client";
import { useAuth } from "@/components/AuthGate";

/** Kurzy koupené samostatně (bez členství), jen platné. Klíč = id kurzu, hodnota = do kdy. */
export function useCourseAccess() {
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["course_access", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("course_access")
        .select("course_id, access_until")
        .gt("access_until", new Date().toISOString());
      const out: Record<string, string> = {};
      for (const r of (data ?? []) as { course_id: string; access_until: string }[]) out[r.course_id] = r.access_until;
      return out;
    },
  });
  return { loading: !!user && q.isLoading, courses: q.data ?? {}, refresh: q.refetch };
}
