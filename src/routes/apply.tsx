import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageIntro, PublicPage } from "@/components/site-chrome";
import { disciplines } from "@/lib/demo-data";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { submitApplication } from "@/lib/applications.functions";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Become a tutor — Bright Path Tutors" },
      { name: "description", content: "Apply to teach with Bright Path Tutors. Get students and guaranteed payment." },
      { property: "og:title", content: "Become a tutor — Bright Path Tutors" },
      { property: "og:description", content: "Apply to teach with Bright Path Tutors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Apply,
});

function Apply() {
  const [step, setStep] = useState(1);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const submit = useServerFn(submitApplication);
  const done = step > 3;
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < 3) return setStep(step + 1);
    const f = new FormData(e.currentTarget.closest("section")!.querySelector("form")!);
    setBusy(true);
    try {
      await submit({ data: {
        full_name: String(saved["full_name"] ?? ""), phone: String(saved["phone"] ?? ""), telegram: String(saved["telegram"] ?? ""),
        subjects: picked, years_experience: Number(saved["years_experience"] ?? 0), bio: String(saved["bio"] ?? ""),
        references_text: String(f.get("references_text") ?? ""),
      } });
      setStep(4);
    } catch {
      toast.error("Couldn't send your application. Please check the fields and try again.");
    } finally { setBusy(false); }
  };
  const [saved, setSaved] = useState<Record<string, string>>({});
  const keep = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSaved({ ...saved, [e.target.name]: e.target.value });
  return (
    <PublicPage>
      <PageIntro eyebrow="Teach with us" title="Apply to become a tutor" text="Three short steps. Our team reviews every application against a checklist: degree, experience, references and a background check." />
      <section className="mx-auto max-w-2xl px-4">
        {done ? (
          <div className="rounded-2xl border bg-card p-10 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h2 className="mt-4 text-2xl font-semibold">Application received</h2>
            <p className="mt-2 text-muted-foreground">Thank you! Your application is now in our review queue. We'll contact you soon.</p>
          </div>
        ) : (
          <form className="space-y-5 rounded-2xl border bg-card p-6" onSubmit={onSubmit}>
            <div className="flex gap-2">{[1, 2, 3].map((s) => <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />)}</div>
            {step === 1 && (<>
              <h2 className="text-xl font-semibold">About you</h2>
              <div className="space-y-2"><Label>Full name</Label><Input name="full_name" value={saved["full_name"] ?? ""} onChange={keep} required /></div>
              <div className="space-y-2"><Label>Phone</Label><Input name="phone" value={saved["phone"] ?? ""} onChange={keep} required placeholder="+251…" /></div>
              <div className="space-y-2"><Label>Telegram username</Label><Input name="telegram" value={saved["telegram"] ?? ""} onChange={keep} placeholder="@username" /></div>
            </>)}
            {step === 2 && (<>
              <h2 className="text-xl font-semibold">What you teach</h2>
              <div className="flex flex-wrap gap-2">{disciplines.map((d) => (
                <button type="button" key={d} onClick={() => setPicked(picked.includes(d) ? picked.filter((x) => x !== d) : [...picked, d])} className={`rounded-full border px-3 py-1.5 text-sm ${picked.includes(d) ? "border-primary bg-primary text-primary-foreground" : ""}`}>{d}</button>
              ))}</div>
              <div className="space-y-2"><Label>Years of experience</Label><Input name="years_experience" value={saved["years_experience"] ?? ""} onChange={keep} type="number" min={0} required /></div>
              <div className="space-y-2"><Label>Short bio</Label><Textarea name="bio" value={saved["bio"] ?? ""} onChange={keep} rows={4} /></div>
            </>)}
            {step === 3 && (<>
              <h2 className="text-xl font-semibold">Documents & references</h2>
              <div className="space-y-2"><Label>Degree / certificate</Label><Input type="file" /></div>
              <div className="space-y-2"><Label>CV</Label><Input type="file" /></div>
              <div className="space-y-2"><Label>Two references (name & phone)</Label><Textarea name="references_text" rows={3} /></div>
              <p className="text-xs text-muted-foreground">By submitting you agree to a background check before approval.</p>
            </>)}
            <div className="flex justify-between">
              <Button type="button" variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>Back</Button>
              <Button type="submit" disabled={busy}>{step === 3 ? "Submit application" : "Continue"}</Button>
            </div>
          </form>
        )}
      </section>
    </PublicPage>
  );
}
