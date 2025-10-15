import { SandboxProvider, SandboxProviderConfig, SandboxRunResult } from '../types';

export class GenesisProvider implements SandboxProvider {
  config: SandboxProviderConfig;
  sandbox: any;
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

  // ---- Add these no-op stubs so TypeScript chills ----

  async runCommand(command: string): Promise<string> {
    console.log("[Genesis] runCommand:", command);
    return "Command execution not supported in Genesis sandbox.";
  }

  async writeFile(path: string, content: string): Promise<void> {
    console.log(`[Genesis] writeFile: ${path}`);
  }

  async readFile(path: string): Promise<string> {
    console.log(`[Genesis] readFile: ${path}`);
    return "";
  }

  async listFiles(): Promise<string[]> {
    console.log("[Genesis] listFiles");
    return [];
  }

  async destroy(): Promise<void> {
    console.log("[Genesis] destroy");
    this.sandboxInfo = null;
  }

  getSandboxInfo() {
    return this.sandboxInfo;
  }
}
