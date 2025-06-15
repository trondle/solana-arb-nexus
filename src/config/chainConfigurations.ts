
import { ChainConfig } from './types';
import { L1_CHAINS } from './chains/l1Chains';
import { L2_CHAINS } from './chains/l2Chains';
import { ALTERNATIVE_CHAINS } from './chains/alternativeChains';

// Re-export types for backward compatibility
export type { ChainConfig, FlashLoanProvider, DEXConfig } from './types';

// Combine all chains
export const SUPPORTED_CHAINS: ChainConfig[] = [
  ...L1_CHAINS,
  ...L2_CHAINS,
  ...ALTERNATIVE_CHAINS
];

// Export individual chain categories for advanced use cases
export { L1_CHAINS, L2_CHAINS, ALTERNATIVE_CHAINS };
