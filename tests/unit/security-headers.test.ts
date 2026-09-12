import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config.mjs";

describe("Next.js Security Headers & CSP Configuration", () => {
  it("defines headers function returning security configuration", async () => {
    expect(nextConfig.headers).toBeDefined();
    const headerConfigs = await nextConfig.headers();
    expect(headerConfigs.length).toBeGreaterThan(0);

    const config = headerConfigs[0];
    expect(config.source).toBe("/((?!api|_next/static|_next/image|favicon.ico).*)");

    const headerMap = Object.fromEntries(config.headers.map((h: any) => [h.key, h.value]));
    expect(headerMap["X-Frame-Options"]).toBe("DENY");
    expect(headerMap["X-Content-Type-Options"]).toBe("nosniff");
    expect(headerMap["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headerMap["Permissions-Policy"]).toContain("camera=()");

    const csp = headerMap["Content-Security-Policy"];
    expect(csp).toBeDefined();
    // Verify WebSockets are enabled so Fast Refresh HMR does not get blocked
    expect(csp).toContain("connect-src 'self' ws: wss:");
    // Verify inline styles are permitted for Tailwind CSS
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    // Verify images and blob previews are permitted
    expect(csp).toContain("img-src 'self' data: https: blob:");
    // Verify fonts are permitted
    expect(csp).toContain("font-src 'self' data:");
  });
});
