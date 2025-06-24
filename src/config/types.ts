
export interface ChainConfig {
  id: string;
  name: string;
  symbol: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl?: string;
  flashLoanProviders: FlashLoanProvider[];
  dexes: DEXConfig[];
  gasCost?: number;
  blockTime?: number;
  enabled: boolean;
  networkFee?: number;
  color?: string;
}

export interface FlashLoanProvider {
  name: string;
  fee: number;
  maxAmount: number;
  minAmount: number;
  available: boolean;
  reliability: number;
}

export interface DEXConfig {
  name: string;
  fee: number;
  liquidity: number;
  slippage: number;
}
