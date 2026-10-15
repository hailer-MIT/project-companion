import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const appSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(30),
  telegram: z.string().trim().max(60).optional().default(""),
  subjects: z.array(z.string().max(60)).max(20),
  years_experience: z.number().int().min(0).max(60),
  bio: z.string().max(2000).optional().default(""),
  references_text: z.string().max(2000).optional().default(""),
});

// Public: anyone can apply. Inserts only; validated above.
export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((d) => appSchema.parse(d))
  .handler(async ({ data }) => {
    const { hasDb } = await import("./telegram.server");
    if (!hasDb()) return { ok: true, demo: true }; // static demo mode: nothing stored
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("tutor_applications").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Demo-only (no admin login yet): lists the newest applications.
export const listApplications = createServerFn({ method: "GET" }).handler(async () => {
  const { hasDb } = await import("./telegram.server");
  if (!hasDb()) return [];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("tutor_applications")
    .select("id, full_name, subjects, years_experience, telegram, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data;
});

export const setApplicationStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.enum(["approved", "rejected"]) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("tutor_applications").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
