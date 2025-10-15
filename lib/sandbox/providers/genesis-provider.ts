// lib/sandbox/providers/genesis-provider.ts
import {
  SandboxProvider,
  SandboxProviderConfig,
  SandboxRunResult,
} from '../types';

/**
 * GenesisProvider
 * - Extends the base SandboxProvider class so TypeScript recognizes protected members.
 * - Proxies run() to an external Genesis HTTP endpoint.
 * - Provides safe stubs for other methods required by the app.
 */
export class GenesisProvider extends SandboxProvider {
  sandbox: any | null;
  sandboxInfo: any | null;

  constructor(config?: SandboxProviderConfig) {
    // important: call super so protected fields (like `config`) are set correctly
    super(config || {});
    this.sandbox = null;
    this.sandboxInfo = null;
  }

  /* ---- Core lifecycle ---- */
  async createSandbox(): Promise<any> {
    this.sandboxInfo = {
      id: `genesis-sandbox-${Date.now()}`,
      provider: 'genesis',
      status: 'ready',
    };
    return this.sandboxInfo;
  }

  async destroy(): Promise<void> {
    this.sandboxInfo = null;
  }

  async terminate(): Promise<void> {
    return this.destroy();
  }

  getSandboxInfo(): any {
    return this.sandboxInfo;
  }

  /* ---- Execution ---- */
  async run(code: string, language = 'nodejs'): Promise<SandboxRunResult> {
    const GENESIS_URL =
      process.env.GENESIS_SANDBOX_URL || 'https://your-genesis-sandbox.onrender.com/v1/run';
    const GENESIS_KEY = process.env.GENESIS_KEY || 'Genesis21345';

    try {
      const res = await fetch(GENESIS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GENESIS_KEY}`,
        },
        body: JSON.stringify({ code, language }),
      });

      if (!res.ok) {
        const text = await res.text();
        return {
          id: `genesis-error-${Date.now()}`,
          status: 'error',
          output: '',
          error: `Genesis HTTP ${res.status}: ${text}`,
        };
      }

      const data = await res.json();
      return {
        id: data.id || `genesis-job-${Date.now()}`,
        status: data.status || 'completed',
        output: data.output ?? '',
        error: data.error ?? null,
      };
    } catch (err: any) {
      return {
        id: `genesis-exception-${Date.now()}`,
        status: 'error',
        output: '',
        error: err?.message ?? String(err),
      };
    }
  }

  /* ---- Health check ---- */
  async isAlive(): Promise<boolean> {
    const base =
      (process.env.GENESIS_SANDBOX_URL || '').replace(/\/v1\/run\/?$/i, '') || null;
    if (!base) return false;
    const tryUrls = [base, `${base}/ping`, `${base}/health`];
    for (const url of tryUrls) {
      try {
        const res = await fetch(url, {
          method: 'HEAD',
          headers: {
            Authorization: `Bearer ${process.env.GENESIS_KEY || 'Genesis21345'}`,
          },
        });
        if (res.ok) return true;
      } catch {
        /* try next */
      }
    }
    return false;
  }

  /* ---- Filesystem & command stubs ---- */
  async runCommand(command: string): Promise<string> {
    return `[Genesis] runCommand not supported via HTTP proxy: ${command}`;
  }

  async installPackages(packages: string[] = []): Promise<string> {
    return `[Genesis] installPackages not supported: ${packages.join(', ')}`;
  }

  async installPackage(pkg: string): Promise<string> {
    return `[Genesis] installPackage not supported: ${pkg}`;
  }

  async writeFile(path: string, content: string): Promise<void> {
    return;
  }

  async readFile(path: string): Promise<string> {
    return '';
  }

  async listFiles(path = '/'): Promise<string[]> {
    return [];
  }

  async uploadFile(path: string, content: string | Buffer): Promise<void> {
    return;
  }

  async downloadFile(path: string): Promise<Uint8Array> {
    return new Uint8Array();
  }

  async getLogs(): Promise<string> {
    return '[Genesis] getLogs not implemented.';
  }

  /* ---- Vite / dev-server related stubs ---- */
  async setupViteApp(options?: any): Promise<any> {
    return {
      success: false,
      message:
        'setupViteApp not implemented on Genesis provider. Implement if your backend supports remote Vite setup.',
    };
  }

  async restartViteServer(): Promise<void> {
    return;
  }

  /* ---- Misc ---- */
  getSandboxUrl(): string | null {
    return process.env.GENESIS_SANDBOX_URL ?? null;
  }

  /* allow extra dynamic members */
  [key: string]: any;
}

export default GenesisProvider;
