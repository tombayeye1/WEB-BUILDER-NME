// lib/sandbox/providers/genesis-provider.ts
import {
  SandboxProvider,
  SandboxProviderConfig,
  SandboxRunResult,
} from '../types';

/**
 * GenesisProvider
 * - Implements the full provider surface expected by the app.
 * - Proxies code execution to an external Genesis HTTP endpoint for run().
 * - Provides safe, clear stubs for features not yet implemented (filesystem, Vite control, etc).
 */

export class GenesisProvider implements SandboxProvider {
  config: SandboxProviderConfig;
  sandbox: any | null;
  sandboxInfo: any | null;

  constructor(config?: SandboxProviderConfig) {
    this.config = config || {};
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

  /* ---- Simple health-check ---- */
  async isAlive(): Promise<boolean> {
    const base =
      (process.env.GENESIS_SANDBOX_URL || '').replace(/\/v1\/run\/?$/i, '') ||
      process.env.GENESIS_SANDBOX_HOST ||
      null;

    if (!base) return false;

    const tryUrls = [base, `${base}/ping`, `${base}/health`];

    for (const url of tryUrls) {
      try {
        const res = await fetch(url, {
          method: 'HEAD',
          headers: {
            Authorization: `Bearer ${process.env.GENESIS_KEY || 'Genesis21345'}`,
          },
          // small timeout isn't available natively in fetch in Node < 20;
          // hope platform respects quick response. This is a best-effort probe.
        });
        if (res.ok) return true;
      } catch {
        /* ignore and try next */
      }
    }
    return false;
  }

  /* ---- Filesystem & command stubs (TypeScript compatibility) ---- */
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
    // stub
    return;
  }

  async readFile(path: string): Promise<string> {
    // stub
    return '';
  }

  async listFiles(path = '/'): Promise<string[]> {
    // stub
    return [];
  }

  async uploadFile(path: string, content: string | Buffer): Promise<void> {
    // stub
    return;
  }

  async downloadFile(path: string): Promise<Uint8Array> {
    // stub
    return new Uint8Array();
  }

  async getLogs(): Promise<string> {
    return '[Genesis] getLogs not implemented.';
  }

  /* ---- Vite / dev-server related stubs ---- */
  /**
   * setupViteApp
   * If your Genesis HTTP API exposes Vite bootstrapping, implement it here.
   * For now we return an informative stub object.
   */
  async setupViteApp(options?: any): Promise<any> {
    return {
      success: false,
      message:
        'setupViteApp not implemented on Genesis provider. Implement this method if your backend supports remote Vite setup.',
    };
  }

  /**
   * restartViteServer
   * For providers that manage a live dev server, implement restart logic.
   * This stub is a safe no-op.
   */
  async restartViteServer(): Promise<void> {
    // no-op for now
    return;
  }

  /* ---- misc ---- */
  getSandboxUrl(): string | null {
    return process.env.GENESIS_SANDBOX_URL ?? null;
  }

  /* allow extra dynamic members so TS won't complain about unknown props */
  [key: string]: any;
}

export default GenesisProvider;

