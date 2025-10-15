import { SandboxProvider, SandboxProviderConfig, SandboxRunResult } from '../types';

export class GenesisProvider implements SandboxProvider {
  config: SandboxProviderConfig;
  sandboxInfo: any;

  constructor(config?: SandboxProviderConfig) {
    this.config = config || {};
  }

  async createSandbox() {
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
      "https://your-genesis-sandbox.onrender.com";
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

  // --- Basic stubbed methods ---
  async runCommand(cmd: string): Promise<string> { return `[Genesis] Command '${cmd}' not supported.`; }
  async writeFile(path: string, content: string): Promise<void> {}
  async readFile(path: string): Promise<string> { return ""; }
  async listFiles(): Promise<string[]> { return []; }
  async destroy(): Promise<void> {}
  getSandboxInfo() { return this.sandboxInfo; }

  // --- TypeScript appeasement spell ---
  [key: string]: any;
}
