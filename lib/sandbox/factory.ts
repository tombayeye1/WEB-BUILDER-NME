import { SandboxProvider, SandboxProviderConfig } from './types';
import { E2BProvider } from './providers/e2b-provider';
import { VercelProvider } from './providers/vercel-provider';
import { GenesisProvider } from './providers/genesis-provider'; // <-- new import

export class SandboxFactory {
  static create(provider?: string, config?: SandboxProviderConfig): SandboxProvider {
    const selectedProvider = provider || process.env.SANDBOX_PROVIDER || 'e2b';

    switch (selectedProvider.toLowerCase()) {
      case 'e2b':
        return new E2BProvider(config || {});
      case 'vercel':
        return new VercelProvider(config || {});
      case 'genesis':
        return new GenesisProvider(config || {});
      default:
        throw new Error(
          `Unknown sandbox provider: ${selectedProvider}. Supported providers: e2b, vercel, genesis`
        );
    }
  }

  static getAvailableProviders(): string[] {
    return ['e2b', 'vercel', 'genesis'];
  }

  static isProviderAvailable(provider: string): boolean {
    switch (provider.toLowerCase()) {
      case 'e2b':
        return !!process.env.E2B_API_KEY;
      case 'vercel':
        return (
          !!process.env.VERCEL_OIDC_TOKEN ||
          (!!process.env.VERCEL_TOKEN &&
            !!process.env.VERCEL_TEAM_ID &&
            !!process.env.VERCEL_PROJECT_ID)
        );
      case 'genesis':
        return !!process.env.GENESIS_SANDBOX_URL && !!process.env.GENESIS_KEY;
      default:
        return false;
    }
  }
}
