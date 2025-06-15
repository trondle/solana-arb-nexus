
import { ChainConfig, FlashLoanProvider, DEXConfig } from '../config/chainConfigurations';

export const getBestFlashLoanProvider = (chain: ChainConfig, amount: number): FlashLoanProvider | undefined => {
  const availableProviders = chain.flashLoanProviders.filter(
    provider => provider.available && 
               amount >= provider.minAmount && 
               amount <= provider.maxAmount
  );
  
  return availableProviders.sort((a, b) => {
    // Weighted scoring: fee (60%) + reliability (40%)
    const aScore = (a.fee * 0.6) + ((100 - a.reliability) * 0.4);
    const bScore = (b.fee * 0.6) + ((100 - b.reliability) * 0.4);
    return aScore - bScore;
  })[0];
};

export const getBestDexRoute = (chain: ChainConfig, amount: number): DEXConfig => {
  return chain.dexes.sort((a, b) => {
    // Score based on fee, liquidity, and slippage
    const aScore = a.fee + (a.slippage * 100) - (Math.log(a.liquidity) * 10);
    const bScore = b.fee + (b.slippage * 100) - (Math.log(b.liquidity) * 10);
    return aScore - bScore;
  })[0];
};
