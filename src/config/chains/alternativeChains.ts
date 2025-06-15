
import { ChainConfig } from '../types';

export const ALTERNATIVE_CHAINS: ChainConfig[] = [
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    gasCost: 0.000005,
    blockTime: 400,
    enabled: true,
    networkFee: 0.01,
    flashLoanProviders: [
      { name: 'Solend', fee: 0.09, maxAmount: 1000000, minAmount: 1000, available: true, reliability: 96 },
      { name: 'Mango', fee: 0.05, maxAmount: 500000, minAmount: 500, available: true, reliability: 98 },
      { name: 'Francium', fee: 0.06, maxAmount: 300000, minAmount: 1000, available: true, reliability: 97 }
    ],
    dexes: [
      { name: 'Raydium', fee: 0.25, liquidity: 50000000, slippage: 0.1 },
      { name: 'Orca', fee: 0.30, liquidity: 40000000, slippage: 0.15 },
      { name: 'Jupiter', fee: 0.20, liquidity: 60000000, slippage: 0.08 }
    ]
  },
  {
    id: 'deso',
    name: 'DeSo',
    symbol: 'DESO',
    rpcUrl: 'https://node.deso.org/api/v0',
    explorerUrl: 'https://explorer.deso.org',
    gasCost: 0.0001,
    blockTime: 1000,
    enabled: true,
    networkFee: 0.005,
    flashLoanProviders: [
      { name: 'DeSo Flash', fee: 0.12, maxAmount: 2000000, minAmount: 500, available: true, reliability: 89 },
      { name: 'Social Finance', fee: 0.15, maxAmount: 1500000, minAmount: 1000, available: true, reliability: 85 }
    ],
    dexes: [
      { name: 'DeSo DEX', fee: 0.40, liquidity: 25000000, slippage: 0.15 },
      { name: 'Creator Exchange', fee: 0.50, liquidity: 15000000, slippage: 0.20 }
    ]
  },
  {
    id: 'sui',
    name: 'Sui',
    symbol: 'SUI',
    rpcUrl: 'https://fullnode.mainnet.sui.io',
    explorerUrl: 'https://explorer.sui.io',
    gasCost: 0.0002,
    blockTime: 300,
    enabled: true,
    networkFee: 0.003,
    flashLoanProviders: [
      { name: 'Sui Finance', fee: 0.08, maxAmount: 6000000, minAmount: 500, available: true, reliability: 94 },
      { name: 'DeepBook Flash', fee: 0.06, maxAmount: 4000000, minAmount: 1000, available: true, reliability: 92 },
      { name: 'Cetus Flash', fee: 0.07, maxAmount: 3500000, minAmount: 500, available: true, reliability: 90 }
    ],
    dexes: [
      { name: 'DeepBook', fee: 0.15, liquidity: 80000000, slippage: 0.05 },
      { name: 'Cetus', fee: 0.20, liquidity: 60000000, slippage: 0.06 },
      { name: 'Turbos', fee: 0.25, liquidity: 45000000, slippage: 0.08 }
    ]
  },
  {
    id: 'terra-classic',
    name: 'Terra Classic',
    symbol: 'LUNC',
    rpcUrl: 'https://terra-classic-fcd.publicnode.com',
    explorerUrl: 'https://finder.terra.money/classic',
    gasCost: 0.50,
    blockTime: 6000,
    enabled: true,
    networkFee: 0.02,
    flashLoanProviders: [
      { name: 'Astroport Flash', fee: 0.20, maxAmount: 8000000, minAmount: 1000, available: true, reliability: 82 },
      { name: 'Terra Station', fee: 0.25, maxAmount: 5000000, minAmount: 2000, available: true, reliability: 78 },
      { name: 'Prism Flash', fee: 0.18, maxAmount: 6000000, minAmount: 1500, available: true, reliability: 80 }
    ],
    dexes: [
      { name: 'Astroport', fee: 0.35, liquidity: 120000000, slippage: 0.25 },
      { name: 'TerraSwap', fee: 0.30, liquidity: 90000000, slippage: 0.20 },
      { name: 'Loop Finance', fee: 0.40, liquidity: 70000000, slippage: 0.30 }
    ]
  },
  {
    id: 'aptos',
    name: 'Aptos',
    symbol: 'APT',
    rpcUrl: 'https://fullnode.mainnet.aptoslabs.com/v1',
    explorerUrl: 'https://explorer.aptoslabs.com',
    gasCost: 0.0002,
    blockTime: 800,
    enabled: true,
    networkFee: 0.003,
    flashLoanProviders: [
      { name: 'Aries Markets', fee: 0.08, maxAmount: 7000000, minAmount: 500, available: true, reliability: 94 },
      { name: 'Aptos Finance', fee: 0.09, maxAmount: 5000000, minAmount: 1000, available: true, reliability: 92 },
      { name: 'Thala Flash', fee: 0.06, maxAmount: 6000000, minAmount: 500, available: true, reliability: 90 },
      { name: 'Abel Finance', fee: 0.07, maxAmount: 4500000, minAmount: 1000, available: true, reliability: 88 }
    ],
    dexes: [
      { name: 'PancakeSwap Aptos', fee: 0.25, liquidity: 200000000, slippage: 0.05 },
      { name: 'LiquidSwap', fee: 0.30, liquidity: 150000000, slippage: 0.06 },
      { name: 'AUX Exchange', fee: 0.20, liquidity: 100000000, slippage: 0.07 },
      { name: 'Thala Swap', fee: 0.15, liquidity: 80000000, slippage: 0.05 }
    ]
  }
];
