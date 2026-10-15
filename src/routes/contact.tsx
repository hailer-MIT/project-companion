import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageIntro, PublicPage } from "@/components/site-chrome";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Bright Path Tutors" },
      { name: "description", content: "Get in touch with Bright Path Tutors by phone, email or Telegram." },
      { property: "og:title", content: "Contact — Bright Path Tutors" },
      { property: "og:description", content: "Get in touch with Bright Path Tutors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <PublicPage>
      <PageIntro eyebrow="Contact" title="Talk to us" text="Questions about tutors, pricing or partnerships — we reply within a day." />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2">
        <div className="space-y-4 text-sm">
          <p className="flex gap-3"><MapPin className="h-5 w-5 text-primary" /> Bole, Addis Ababa (placeholder)</p>
          <p className="flex gap-3"><Phone className="h-5 w-5 text-primary" /> +251 9XX XXX XXX (placeholder)</p>
          <p className="flex gap-3"><Mail className="h-5 w-5 text-primary" /> hello@brightpath.example</p>
          <p className="flex gap-3"><Send className="h-5 w-5 text-primary" /> @BrightPathTutorsBot (placeholder)</p>
        </div>
        <form className="space-y-3 rounded-2xl border bg-card p-6" onSubmit={(e) => { e.preventDefault(); toast.success("Demo: message sent"); (e.target as HTMLFormElement).reset(); }}>
          <Input placeholder="Your name" required />
          <Input placeholder="Phone or email" required />
          <Textarea placeholder="How can we help?" rows={5} required />
          <Button type="submit" className="w-full">Send message</Button>
        </form>
      </section>
    </PublicPage>
  );
}
