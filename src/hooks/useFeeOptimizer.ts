
import { useMemo } from 'react';

const FLASH_LOAN_PROVIDERS = [
  { name: 'Larix', fee: 0.04, available: true, maxAmount: 200000, minAmount: 500, reliability: 95 },
  { name: 'Mango', fee: 0.05, available: true, maxAmount: 500000, minAmount: 500, reliability: 98 },
  { name: 'Apricot', fee: 0.05, available: true, maxAmount: 300000, minAmount: 1000, reliability: 92 },
  { name: 'Francium', fee: 0.06, available: true, maxAmount: 300000, minAmount: 1000, reliability: 90 },
  { name: 'Jet Protocol', fee: 0.06, available: true, maxAmount: 400000, minAmount: 800, reliability: 88 },
  { name: 'Port Finance', fee: 0.07, available: true, maxAmount: 250000, minAmount: 600, reliability: 85 },
  { name: 'Tulip', fee: 0.08, available: false, maxAmount: 150000, minAmount: 1000, reliability: 80 },
  { name: 'Solend', fee: 0.09, available: true, maxAmount: 1000000, minAmount: 1000, reliability: 96 }
];

const DEX_FEE_TIERS = [
  { 
    name: 'Saber', 
    baseFee: 0.04, 
    makerRebate: 0.01, 
    volumeDiscounts: [
      { minVolume: 0, fee: 0.04 },
      { minVolume: 100000, fee: 0.035 },
      { minVolume: 500000, fee: 0.03 }
    ]
  },
  { 
    name: 'Mercurial', 
    baseFee: 0.04, 
    makerRebate: 0.005, 
    volumeDiscounts: [
      { minVolume: 0, fee: 0.04 },
      { minVolume: 50000, fee: 0.035 }
    ]
  },
  { 
    name: 'Crema', 
    baseFee: 0.05, 
    makerRebate: 0.01, 
    volumeDiscounts: [
      { minVolume: 0, fee: 0.05 },
      { minVolume: 200000, fee: 0.04 }
    ]
  },
  { 
    name: 'Aldrin', 
    baseFee: 0.20, 
    makerRebate: 0.05, 
    volumeDiscounts: [
      { minVolume: 0, fee: 0.20 },
      { minVolume: 100000, fee: 0.18 },
      { minVolume: 500000, fee: 0.15 }
    ]
  },
  { 
    name: 'Serum', 
    baseFee: 0.22, 
    makerRebate: 0.03, 
    volumeDiscounts: [
      { minVolume: 0, fee: 0.22 },
      { minVolume: 200000, fee: 0.20 }
    ]
  },
  { 
    name: 'Raydium', 
    baseFee: 0.25, 
    makerRebate: 0.02, 
    volumeDiscounts: [
      { minVolume: 0, fee: 0.25 },
      { minVolume: 300000, fee: 0.22 }
    ]
  },
  { 
    name: 'Jupiter', 
    baseFee: 0.29, 
    makerRebate: 0.01, 
    volumeDiscounts: [
      { minVolume: 0, fee: 0.29 }
    ]
  },
  { 
    name: 'Orca', 
    baseFee: 0.30, 
    makerRebate: 0.02, 
    volumeDiscounts: [
      { minVolume: 0, fee: 0.30 },
      { minVolume: 150000, fee: 0.28 }
    ]
  }
];

export interface OpportunityParams {
  requiredCapital: number;
  pair: string;
  buyDex: string;
  sellDex: string;
  userVolume?: number;
}

export interface OptimizedOpportunity extends OpportunityParams {
  optimalProvider: {
    name: string;
    fee: number;
    available: boolean;
    reliability: number;
    estimatedTime: number;
  };
  optimalBuyDex: {
    name: string;
    baseFee: number;
    effectiveFee: number;
    makerRebate: number;
  };
  optimalSellDex: {
    name: string;
    baseFee: number;
    effectiveFee: number;
    makerRebate: number;
  };
  computedFees: {
    trading: number;
    flashLoan: number;
    total: number;
    savings: number;
  };
  batchCompatible: boolean;
  estimatedGasSavings: number;
}

function getBestFlashLoanProvider(requiredCapital: number, userVolume: number = 0) {
  const filtered = FLASH_LOAN_PROVIDERS.filter((p) => 
    p.available && 
    requiredCapital >= p.minAmount && 
    requiredCapital <= p.maxAmount
  );
  
  // Apply volume-based discounts (simplified)
  const withDiscounts = filtered.map(provider => ({
    ...provider,
    effectiveFee: userVolume > 1000000 ? provider.fee * 0.8 : 
                  userVolume > 500000 ? provider.fee * 0.9 : 
                  provider.fee,
    estimatedTime: 2000 + Math.random() * 1000 // 2-3 seconds
  }));
  
  // Sort by effective fee first, then reliability
  return withDiscounts.sort((a, b) => {
    const feeScore = a.effectiveFee - b.effectiveFee;
    if (Math.abs(feeScore) < 0.001) {
      return b.reliability - a.reliability;
    }
    return feeScore;
  })[0];
}

function getOptimalDex(dexName: string, requiredCapital: number, userVolume: number = 0) {
  const dex = DEX_FEE_TIERS.find((d) => d.name === dexName);
  if (!dex) {
    return { name: dexName, baseFee: 0.29, effectiveFee: 0.29, makerRebate: 0 };
  }
  
  // Find applicable volume discount
  const applicableDiscount = dex.volumeDiscounts
    .filter(discount => userVolume >= discount.minVolume)
    .sort((a, b) => b.minVolume - a.minVolume)[0];
  
  const effectiveFee = applicableDiscount ? applicableDiscount.fee : dex.baseFee;
  
  return {
    name: dex.name,
    baseFee: dex.baseFee,
    effectiveFee: effectiveFee,
    makerRebate: dex.makerRebate || 0
  };
}

function calculateBatchCompatibility(ops: OptimizedOpportunity[]): OptimizedOpportunity[] {
  return ops.map((op, index) => {
    // Simple batching logic: same provider and similar DEX fees
    const compatibleOps = ops.filter((other, otherIndex) => 
      otherIndex !== index &&
      other.optimalProvider.name === op.optimalProvider.name &&
      Math.abs(other.optimalBuyDex.effectiveFee - op.optimalBuyDex.effectiveFee) < 0.05
    );
    
    const batchCompatible = compatibleOps.length > 0;
    const estimatedGasSavings = batchCompatible ? op.requiredCapital * 0.002 : 0; // 0.2% gas savings
    
    return {
      ...op,
      batchCompatible,
      estimatedGasSavings
    };
  });
}

export function useFeeOptimizer(opps: OpportunityParams[], userVolume: number = 0) {
  return useMemo(() => {
    const optimized = opps.map((op) => {
      // 1. Find best flash loan provider
      const bestProvider = getBestFlashLoanProvider(op.requiredCapital, userVolume);
      
      // 2. Optimize DEX selection
      const bestBuyDex = getOptimalDex(op.buyDex, op.requiredCapital, userVolume);
      const bestSellDex = getOptimalDex(op.sellDex, op.requiredCapital, userVolume);
      
      // 3. Calculate optimized fees
      const tradingFee = ((bestBuyDex.effectiveFee + bestSellDex.effectiveFee) / 100) * op.requiredCapital;
      const makerRebates = ((bestBuyDex.makerRebate + bestSellDex.makerRebate) / 100) * op.requiredCapital;
      const netTradingFee = tradingFee - makerRebates;
      
      const flashLoanFee = (bestProvider.effectiveFee / 100) * op.requiredCapital;
      const totalFees = netTradingFee + flashLoanFee;
      
      // Calculate savings compared to worst-case scenario
      const worstProvider = FLASH_LOAN_PROVIDERS.reduce((worst, curr) => 
        curr.fee > worst.fee ? curr : worst, FLASH_LOAN_PROVIDERS[0]);
      const worstDexFee = Math.max(...DEX_FEE_TIERS.map(d => d.baseFee));
      const worstCaseFees = (worstProvider.fee / 100 + (worstDexFee * 2) / 100) * op.requiredCapital;
      const savings = worstCaseFees - totalFees;
      
      return {
        ...op,
        optimalProvider: {
          name: bestProvider.name,
          fee: bestProvider.effectiveFee,
          available: bestProvider.available,
          reliability: bestProvider.reliability,
          estimatedTime: bestProvider.estimatedTime
        },
        optimalBuyDex: bestBuyDex,
        optimalSellDex: bestSellDex,
        computedFees: {
          trading: netTradingFee,
          flashLoan: flashLoanFee,
          total: totalFees,
          savings: savings
        },
        batchCompatible: false,
        estimatedGasSavings: 0
      };
    });
    
    // Calculate batch compatibility
    return calculateBatchCompatibility(optimized);
  }, [JSON.stringify(opps), userVolume]);
}

export function useFeeReductionStats(optimizedOps: OptimizedOpportunity[]) {
  return useMemo(() => {
    const totalSavings = optimizedOps.reduce((sum, op) => sum + op.computedFees.savings, 0);
    const totalGasSavings = optimizedOps.reduce((sum, op) => sum + op.estimatedGasSavings, 0);
    const batchableCount = optimizedOps.filter(op => op.batchCompatible).length;
    const averageFeeReduction = optimizedOps.length > 0 
      ? (totalSavings / optimizedOps.length) / optimizedOps.reduce((sum, op) => sum + op.requiredCapital, 0) * 100
      : 0;
    
    return {
      totalSavings,
      totalGasSavings,
      batchableCount,
      averageFeeReduction,
      bestProvider: optimizedOps.length > 0 
        ? optimizedOps.reduce((best, op) => 
            op.optimalProvider.fee < best.optimalProvider.fee ? op : best
          ).optimalProvider
        : null
    };
  }, [optimizedOps]);
}
