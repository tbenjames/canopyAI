import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { isIdentity } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    // Identity-lock defence in depth: if a claimed identity is in the URL,
    // confirm it matches the DB role. Mismatch = sign out and bounce back.
    const params = new URLSearchParams(location.searchStr);
    const claimed = params.get("identity");
    if (claimed && isIdentity(claimed)) {
      const { data: role } = await db.rpc("get_my_role");
      if (role && isIdentity(role as string) && role !== claimed) {
        await supabase.auth.signOut();
        throw redirect({ to: "/auth" });
      }
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
