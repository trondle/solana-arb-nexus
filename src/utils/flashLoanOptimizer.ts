
import { ChainConfig, FlashLoanProvider, DEXConfig } from '../config/types';
import { FlashLoanAggregator, AggregatorOptions } from './flashLoanAggregator';
import { BridgeOptimizer } from './bridgeOptimizer';
import { GasOptimizer } from './gasOptimizer';
import { DexAggregator } from './dexAggregator';

export interface OptimizationResult {
  flashLoanQuote: any;
  bridgeQuote: any;
  gasOptimization: any;
  dexRoute: any;
  totalFees: number;
  estimatedProfit: number;
  feeSavings: number;
  confidence: number;
}

export const getBestFlashLoanProvider = (
  chain: ChainConfig, 
  amount: number,
  userVolume: number = 0
): FlashLoanProvider | undefined => {
  const options: AggregatorOptions = {
    userVolume,
    maxSlippage: 0.5,
    prioritizeSpeed: false
  };
  
  const quote = FlashLoanAggregator.getBestFlashLoanQuote(chain, amount, options);
  return quote?.provider;
};

export const getBestDexRoute = (
  chain: ChainConfig, 
  amount: number,
  userVolume: number = 0
): DEXConfig => {
  const quote = DexAggregator.getOptimalDexRoute(chain.dexes, amount, userVolume);
  return quote.dex;
};

export const getOptimizedCrossChainArbitrage = (
  fromChain: ChainConfig,
  toChain: ChainConfig,
  amount: number,
  spread: number,
  userVolume: number = 0,
  prioritizeSpeed: boolean = false
): OptimizationResult | null => {
  // 1. Get optimal flash loan provider
  const options: AggregatorOptions = {
    userVolume,
    maxSlippage: 0.5,
    prioritizeSpeed
  };
  
  const flashLoanQuote = FlashLoanAggregator.getBestFlashLoanQuote(fromChain, amount, options);
  if (!flashLoanQuote) return null;

  // 2. Get optimal bridge route
  const bridgeQuote = BridgeOptimizer.getOptimalBridgeRoute(
    fromChain.id, 
    toChain.id, 
    amount, 
    prioritizeSpeed
  );
  if (!bridgeQuote) return null;

  // 3. Get optimal gas settings
  const gasOptimization = GasOptimizer.getOptimalGasPrice(
    fromChain.id,
    prioritizeSpeed ? 'high' : 'medium'
  );

  // 4. Get optimal DEX routes
  const buyRoute = DexAggregator.getOptimalDexRoute(fromChain.dexes, amount, userVolume);
  const sellRoute = DexAggregator.getOptimalDexRoute(toChain.dexes, amount, userVolume);

  // 5. Calculate optimized fees
  const flashLoanFee = amount * flashLoanQuote.effectiveFee / 100;
  const bridgeFee = bridgeQuote.totalFee;
  const tradingFees = amount * (buyRoute.effectiveFee + sellRoute.effectiveFee) / 100;
  const gasFees = GasOptimizer.estimateTransactionCost(fromChain.id, 300000, prioritizeSpeed ? 'high' : 'medium') +
                  GasOptimizer.estimateTransactionCost(toChain.id, 200000, prioritizeSpeed ? 'high' : 'medium');

  const totalFees = flashLoanFee + bridgeFee + tradingFees + gasFees;
  const grossProfit = amount * spread / 100;
  const estimatedProfit = grossProfit - totalFees;

  // 6. Calculate fee savings compared to non-optimized approach
  const baselineFlashLoanFee = amount * 0.09 / 100; // 0.09% baseline
  const baselineBridgeFee = amount * 0.1 / 100; // 0.1% baseline
  const baselineTradingFees = amount * 0.6 / 100; // 0.6% baseline
  const baselineGasFees = gasFees * 1.5; // 50% higher gas
  const baselineTotalFees = baselineFlashLoanFee + baselineBridgeFee + baselineTradingFees + baselineGasFees;
  const feeSavings = baselineTotalFees - totalFees;

  // 7. Calculate confidence score
  const liquidityScore = Math.min(buyRoute.liquidity, sellRoute.liquidity) / 10000000; // Normalize
  const reliabilityScore = flashLoanQuote.reliability / 100;
  const networkScore = gasOptimization.networkCongestion === 'low' ? 1 : 
                      gasOptimization.networkCongestion === 'medium' ? 0.8 : 0.6;
  const confidence = Math.min(95, (liquidityScore * 30) + (reliabilityScore * 40) + (networkScore * 30));

  return {
    flashLoanQuote,
    bridgeQuote,
    gasOptimization,
    dexRoute: { buy: buyRoute, sell: sellRoute },
    totalFees,
    estimatedProfit,
    feeSavings,
    confidence
  };
};

export const calculateOptimizedFees = (
  opportunity: any,
  actualAmount?: number
): {
  flashLoan: number;
  trading: number;
  bridge: number;
  gas: number;
  total: number;
  savings: number;
  breakdown: Record<string, number>;
} => {
  // Use the actual amount from the opportunity, or the passed amount, or fallback
  const amount = actualAmount || opportunity.requiresCapital || opportunity.requiredCapital || 50000;
  
  // Use optimized calculations with realistic volume-based discounts
  const userVolume = 250000; // Demo volume for calculations
  const flashLoanDiscount = userVolume > 100000 ? 0.2 : userVolume > 50000 ? 0.1 : 0;
  const tradingDiscount = userVolume > 500000 ? 0.15 : userVolume > 100000 ? 0.08 : 0;
  
  const flashLoan = (amount * 0.05 / 100) * (1 - flashLoanDiscount); // Optimized from 0.09% to 0.05%
  const trading = (amount * 0.4 / 100) * (1 - tradingDiscount); // Optimized from 0.6% to 0.4%
  const bridge = amount * 0.03 / 100; // Optimized from 0.1% to 0.03%
  const gas = 5; // Optimized flat gas fee
  
  const total = flashLoan + trading + bridge + gas;
  
  // Calculate savings compared to non-optimized fees
  const baselineFlashLoan = amount * 0.09 / 100;
  const baselineTrading = amount * 0.6 / 100;
  const baselineBridge = amount * 0.1 / 100;
  const baselineGas = 15;
  const baselineTotal = baselineFlashLoan + baselineTrading + baselineBridge + baselineGas;
  const savings = baselineTotal - total;

  return {
    flashLoan,
    trading,
    bridge,
    gas,
    total,
    savings,
    breakdown: {
      flashLoanSavings: baselineFlashLoan - flashLoan,
      tradingSavings: baselineTrading - trading,
      bridgeSavings: baselineBridge - bridge,
      gasSavings: baselineGas - gas
    }
  };
};
