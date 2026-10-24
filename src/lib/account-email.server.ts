/** Fixed provider endpoints; credentials and confirmation links remain server-only. */
export function accountEmailConfigured() {
  if (!process.env["AUTH_EMAIL_FROM"]) return false;
  const provider = process.env["AUTH_EMAIL_PROVIDER"] ?? "resend";
  if (provider === "agentcourier") return Boolean(process.env["AGENTCOURIER_API_KEY"]);
  if (provider === "resend") return Boolean(process.env["RESEND_API_KEY"] && process.env["LOVABLE_API_KEY"]);
  return false;
}

export async function sendAccountEmail(to: string, url: string, reset: boolean) {
  if (!accountEmailConfigured()) throw new Error("Account emails are not configured.");
  const provider = process.env["AUTH_EMAIL_PROVIDER"] ?? "resend";
  const from = process.env["AUTH_EMAIL_FROM"];
  const subject = reset ? "Reset your Bright Path Tutors password" : "Confirm your Bright Path Tutors email";
  const text = `${reset ? "Reset your password" : "Confirm your email"}: ${url}\n\nIf you did not request this, ignore this email.`;
  const agentKey = process.env["AGENTCOURIER_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  const gatewayKey = process.env["LOVABLE_API_KEY"];
  let response: Response;
  if (provider === "agentcourier" && agentKey) {
    response = await fetch("https://api.apimail.cc/v1/messages/send", {
      method: "POST",
      headers: { "X-API-Key": agentKey, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, body_text: text }),
    });
  } else if (provider === "resend" && resendKey && gatewayKey) {
    response = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${gatewayKey}`, "X-Connection-Api-Key": resendKey, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
  } else throw new Error("Account emails are not configured.");
  if (!response.ok) {
    // Provider bodies may echo reset URLs, addresses or credentials. Never log them.
    throw new Error(`Account email provider rejected the request (${response.status}). Check the sender domain and sending permissions.`);
  }
  const result: unknown = await response.json();
  if (provider === "agentcourier") {
    const status = result && typeof result === "object" && "status" in result ? result.status : undefined;
    if (status !== "queued" && status !== "sent") throw new Error("Account email was not accepted for delivery.");
  }
}