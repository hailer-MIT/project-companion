import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send } from "lucide-react";
import { DashHeader, Panel } from "@/components/dash";

export const Route = createFileRoute("/demo/telegram")({
  head: () => ({ meta: [
    { title: "Telegram Demo | Bright Path Tutors" },
    { name: "description", content: "Explore sample tutoring conversations and the Bright Path Tutors bot." },
    { property: "og:title", content: "Telegram Demo | Bright Path Tutors" },
    { property: "og:description", content: "Explore sample tutoring conversations and the Bright Path Tutors bot." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: TelegramDemo,
});

type Msg = { from: "bot" | "me"; text: string; buttons?: string[] };

const replies: Record<string, Msg> = {
  "📅 My sessions": { from: "bot", text: "Upcoming for Ruth:\n• Today 16:00 — Maths with Dawit\n• Thu 16:00 — Physics with Dawit (⚠️ awaiting payment)", buttons: ["💳 Pay Thu session", "🔁 Reschedule"] },
  "📊 Weekly report": { from: "bot", text: "Ruth · week of Oct 7\nAttendance: 2/2 ✅\nAvg score: 81 (+3)\nTutor note: “Quadratic equations mastered.”", buttons: ["📅 My sessions"] },
  "💳 Pay Thu session": { from: "bot", text: "Pay 450 ETB to Bright Path Tutors via Telebirr.\nReference: BPT-3021", buttons: ["✅ I've paid"] },
  "✅ I've paid": { from: "bot", text: "Thanks! Admin will confirm shortly. You'll get a receipt here. 🧾", buttons: ["📅 My sessions", "📊 Weekly report"] },
  "🔁 Reschedule": { from: "bot", text: "Pick a new time:", buttons: ["Fri 16:00", "Sat 10:00"] },
  "Fri 16:00": { from: "bot", text: "Request sent to Dawit. We'll confirm here. ✅", buttons: ["📅 My sessions"] },
  "Sat 10:00": { from: "bot", text: "Request sent to Dawit. We'll confirm here. ✅", buttons: ["📅 My sessions"] },
  "🆘 Support": { from: "bot", text: "Write your question and an admin will reply here within a few hours." },
};

const start: Msg[] = [
  { from: "bot", text: "⏰ Reminder: Ruth has Maths with Dawit today at 16:00.\nJoin: meet.google.com/abc-defg-hij" },
  { from: "bot", text: "Hi Almaz 👋 What would you like to do?", buttons: ["📅 My sessions", "📊 Weekly report", "🆘 Support"] },
];

function LiveBot() {
  return (
    <Panel title="Live bot">
      <p className="text-sm text-muted-foreground">
        <a className="font-medium text-primary underline" href="https://t.me/BrightPathTutors_Bot" target="_blank" rel="noreferrer">@BrightPathTutors_Bot</a>
      </p>
      <p className="mt-3 text-sm text-muted-foreground">Linked chats and outgoing notifications are locked until secure administrator accounts are available.</p>
    </Panel>
  );
}

function TelegramDemo() {
  const [msgs, setMsgs] = useState<Msg[]>(start);
  const tap = (b: string) => setMsgs((m) => [...m, { from: "me", text: b }, replies[b] ?? { from: "bot", text: "Got it ✅" }]);
  return (
    <div className="space-y-6">
      <DashHeader title="Telegram bot" text="A real bot is live. Below it, the tap-through simulation for the meeting." />
      <LiveBot />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="flex h-[600px] flex-col overflow-hidden rounded-3xl border bg-secondary shadow-lg">
          <div className="flex items-center gap-2 bg-primary p-3 text-primary-foreground">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground"><Send className="h-4 w-4" /></div>
            <div><p className="text-sm font-medium">Bright Path Tutors</p><p className="text-xs opacity-75">bot</p></div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === "me" ? "flex justify-end" : ""}>
                <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-card"}`}>{m.text}</div>
                {m.buttons && i === msgs.length - 1 && (
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {m.buttons.map((b) => <button key={b} onClick={() => tap(b)} className="rounded-lg bg-card/70 px-2 py-2 text-xs font-medium text-primary hover:bg-card">{b}</button>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <Panel title="What lives where (proposed split)">
          <div className="grid gap-6 text-sm sm:grid-cols-2">
            <div>
              <p className="mb-2 font-semibold text-primary">Telegram bot</p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Session reminders & join links</li><li>Payment receipts & “I've paid” confirmation</li><li>Weekly progress summary</li><li>Missed-class / low-score alerts</li><li>Quick reschedule requests</li><li>Support messages to admin</li><li>Tutor application status updates</li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-semibold text-primary">Website</p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Public site, tutor catalogue, SEO & ads landing pages</li><li>Teacher application & document upload</li><li>Admin: recruitment, payments, disputes, reports</li><li>Dashboards & progress charts</li><li>Booking & payment checkout</li><li>Testimonials moderation</li>
              </ul>
            </div>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">Live classes: Google Meet / Zoom links generated per session. No in-house video in v1.</p>
        </Panel>
      </div>
    </div>
  );
}
