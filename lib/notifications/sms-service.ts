/**
 * lib/notifications/sms-service.ts
 *
 * Zero-dependency Twilio SMS sender using native Node.js https module.
 * Gracefully returns { sent: false } if credentials are not configured —
 * the app never crashes due to missing SMS config.
 */

import https from "https";
import querystring from "querystring";

export interface SMSResult {
  sent: boolean;
  messageSid?: string;
  error?: string;
}

/**
 * Send a plain-text SMS message via Twilio REST API.
 * Returns { sent: false } silently if TWILIO_* env vars are not set.
 */
export async function sendSMS(to: string, body: string): Promise<SMSResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  // Graceful no-op when credentials are not configured
  if (!accountSid || !authToken || !fromNumber) {
    const missing = [
      !accountSid && "TWILIO_ACCOUNT_SID",
      !authToken && "TWILIO_AUTH_TOKEN",
      !fromNumber && "TWILIO_FROM_NUMBER",
    ].filter(Boolean).join(", ");
    const error = `Twilio not configured. Missing: ${missing}`;
    console.error(`[SMS] ${error}`);
    return { sent: false, error };
  }

  if (!to || !to.startsWith("+")) {
    console.warn(`[SMS] Invalid recipient phone number: "${to}". Must be in E.164 format (+91XXXXXXXXXX).`);
    return { sent: false, error: `Invalid phone number: ${to}` };
  }

  const postData = querystring.stringify({ To: to, From: fromNumber, Body: body });
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  return new Promise<SMSResult>((resolve) => {
    const req = https.request(
      {
        hostname: "api.twilio.com",
        port: 443,
        path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
          Authorization: `Basic ${auth}`,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`[SMS] Sent to ${to} — SID: ${json.sid}`);
              resolve({ sent: true, messageSid: json.sid });
            } else {
              console.error(`[SMS] Twilio error ${res.statusCode}: ${json.message}`);
              resolve({ sent: false, error: json.message || `HTTP ${res.statusCode}` });
            }
          } catch {
            resolve({ sent: false, error: "Failed to parse Twilio response" });
          }
        });
      }
    );

    req.on("error", (err) => {
      console.error("[SMS] Network error:", err.message);
      resolve({ sent: false, error: err.message });
    });

    req.write(postData);
    req.end();
  });
}
