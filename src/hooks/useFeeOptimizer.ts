
import { useMemo } from 'react';

const FLASH_LOAN_PROVIDERS = [
  { name: 'Solend', fee: 0.09, available: true },
  { name: 'Mango', fee: 0.05, available: true },
  { name: 'Francium', fee: 0.06, available: true },
  { name: 'Port Finance', fee: 0.07, available: true },
  { name: 'Larix', fee: 0.04, available: true },
  { name: 'Tulip', fee: 0.08, available: false },
  { name: 'Apricot', fee: 0.05, available: true },
  { name: 'Jet Protocol', fee: 0.06, available: true }
];

// DEXes with fee tiers; "maker"/"taker" and volume-insensitive for demo
const DEX_FEE_TIERS = [
  { name: 'Raydium', baseFee: 0.25 },
  { name: 'Orca', baseFee: 0.30 },
  { name: 'Jupiter', baseFee: 0.29 },
  { name: 'Serum', baseFee: 0.22 },
  { name: 'Aldrin', baseFee: 0.20 },
  { name: 'Saber', baseFee: 0.04 },
  { name: 'Mercurial', baseFee: 0.04 },
  { name: 'Crema', baseFee: 0.05 }
];

// ----- TYPES -----
export interface OpportunityParams {
  requiredCapital: number;
  pair: string;
  buyDex: string;
  sellDex: string;
}

// Suggests the lowest-fee provider for the required amount (if available)
function getBestFlashLoanProvider(requiredCapital: number) {
  const filtered = FLASH_LOAN_PROVIDERS.filter((p) => p.available);
  return filtered.reduce((best, curr) => (curr.fee < best.fee ? curr : best), filtered[0]);
}

// Suggests the lowest-fee DEX for an asset based on static matrix
function getBestDex(currentDex: string): { name: string; baseFee: number } {
  // Fallback to original if not found
  return DEX_FEE_TIERS.find((d) => d.name === currentDex) || { name: currentDex, baseFee: 0.29 };
}

// Computes the best route and estimated net profit reduction due to lower fees
export function useFeeOptimizer(opps: OpportunityParams[]) {
  // Memoize optimization (demo: static, but could be fetched dynamically)
  return useMemo(() => {
    return opps.map((op) => {
      // 1. Flash Loan Provider
      const bestProvider = getBestFlashLoanProvider(op.requiredCapital);

      // 2. DEX route selection (could expand to multi-hop)
      const bestBuyDex = getBestDex(op.buyDex);
      const bestSellDex = getBestDex(op.sellDex);

      const combinedTradingFee = ((bestBuyDex.baseFee + bestSellDex.baseFee) / 100) * op.requiredCapital;
      const flashLoanFee = (bestProvider.fee / 100) * op.requiredCapital;
      const totalFees = combinedTradingFee + flashLoanFee;

      return {
        ...op,
        optimalProvider: bestProvider,
        optimalBuyDex: bestBuyDex,
        optimalSellDex: bestSellDex,
        computedFees: {
          trading: combinedTradingFee,
          flashLoan: flashLoanFee,
          total: totalFees
        }
      };
    });
  }, [JSON.stringify(opps)]);
}
