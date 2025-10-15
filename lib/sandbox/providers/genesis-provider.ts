import {
  SandboxProvider,
  SandboxProviderConfig,
  SandboxRunResult,
} from '../types';

/**
 * GenesisProvider
 * - Lightweight provider that proxies execution to your external Genesis sandbox HTTP API.
 * - Implements broad set of methods expected by the app's SandboxProvider interface as safe stubs.
 * - Customize specific methods later if you need filesystem, package install, or streaming support.
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

  /* ---- Core: create / run / destroy ---- */

  async createSandbox(): Promise<any> {
    // No persistent sandbox is created locally; just stash info
    this.sandboxInfo = {
      id: `genesis-sandbox-${Date.now()}`,
      provider: 'genesis',
      status: 'ready',
    };
    return this.sandboxInfo;
  }

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

  async destroy(): Promise<void> {
    // No-op for remote stateless provider
    this.sandboxInfo = null;
  }

  /* ---- Filesystem & command stubs (TypeScript compatibility) ---- */

  async runCommand(command: string): Promise<string> {
    // Not supported by HTTP proxy; return informative message
    return `[Genesis] runCommand not supported via HTTP proxy: ${command}`;
  }

  async installPackages(packages: string[] = []): Promise<string> {
    // If your Genesis API supports package install, implement an API call here.
    return `[Genesis] installPackages not supported: ${packages.join(', ')}`;
  }

  async installPackage(pkg: string): Promise<string> {
    return `[Genesis] installPackage not supported: ${pkg}`;
  }

  async writeFile(path: string, content: string): Promise<void> {
    // Not implemented for HTTP proxy; stub for typing
    return;
  }

  async readFile(path: string): Promise<string> {
    // Not implemented
    return '';
  }

  async listFiles(path = '/'): Promise<string[]> {
    // Not implemented
    return [];
  }

  async uploadFile(path: string, content: string | Buffer): Promise<void> {
    // Not implemented
    return;
  }

  async downloadFile(path: string): Promise<Uint8Array> {
    // Not implemented
    return new Uint8Array();
  }

  /* ---- Lifecycle / meta ---- */

  async terminate(): Promise<void> {
    // alias for destroy
    await this.destroy();
  }

  getSandboxUrl(): string | null {
    // Useful for UIs that want to link to sandbox web UI (if any)
    return process.env.GENESIS_SANDBOX_URL ?? null;
  }

  getSandboxInfo(): any {
    return this.sandboxInfo;
  }

  async getLogs(): Promise<string> {
    // If your Genesis API supports log retrieval, implement it here.
    return '[Genesis] getLogs not implemented.';
  }

  /* ---- Fallback indexer so TS treats unknown members permissively ---- */
  [key: string]: any;
}

export default GenesisProvider;
