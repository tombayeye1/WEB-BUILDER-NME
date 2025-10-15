// lib/sandbox/providers/genesis-provider.ts
import type { SandboxRunResult } from "../types";

const GENESIS_URL =
  process.env.GENESIS_SANDBOX_URL ||
  "https://your-genesis-sandbox.onrender.com/v1/run";

const GENESIS_KEY = process.env.GENESIS_KEY || "Genesis21345";

export async function runGenesisSandbox(
  code: string,
  language = "nodejs"
): Promise<SandboxRunResult> {
  try {
    const res = await fetch(GENESIS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GENESIS_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, language }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Genesis Sandbox failed: ${res.status} ${text}`);
    }

    return res.json();
  } catch (err: any) {
    console.error("Genesis Sandbox Error:", err);
    return {
      id: "genesis-error-" + Date.now(),
      status: "error",
      output: "",
      error: err.message || "Unknown error",
    };
  }
}
