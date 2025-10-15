import { SandboxProvider, SandboxProviderConfig, SandboxRunResult } from '../types';

export class GenesisProvider implements SandboxProvider {
  config: SandboxProviderConfig;
  sandbox: any;
  sandboxInfo: any;

  constructor(config?: SandboxProviderConfig) {
    this.config = config || {};
  }

  async createSandbox() {
    // No actual persistent sandbox — just mock info
    this.sandboxInfo = {
      id: "genesis-sandbox",
      status: "ready",
      provider: "genesis",
    };
    return this.sandboxInfo;
  }

  async run(code: string, language: string): Promise<SandboxRunResult> {
    const GENESIS_URL =
      process.env.GENESIS_SANDBOX_URL ||
      "https://your-genesis-sandbox.onrender.com/v1/run";

    const GENESIS_KEY = process.env.GENESIS_KEY || "Genesis21345";

    const res = await fetch(GENESIS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GENESIS_KEY}`,
      },
      body: JSON.stringify({ code, language }),
    });

    const data = await res.json();

    return {
      output: data.output || "",
      error: data.error || null,
      status: data.status || "completed",
      id: data.id || "genesis-job",
    };
  }

  async destroy() {
    this.sandboxInfo = null;
  }
}

