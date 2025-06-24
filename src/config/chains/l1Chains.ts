
import { ChainConfig } from '../types';

export const L1_CHAINS: ChainConfig[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
    explorerUrl: 'https://etherscan.io',
    gasCost: 0.003,
    blockTime: 12000,
    enabled: false, // Disabled by default
    networkFee: 0.15,
    flashLoanProviders: [
      { name: 'Aave', fee: 0.09, maxAmount: 10000000, minAmount: 1000, available: true, reliability: 99 },
      { name: 'dYdX', fee: 0.00, maxAmount: 5000000, minAmount: 1000, available: true, reliability: 95 },
      { name: 'Balancer', fee: 0.05, maxAmount: 8000000, minAmount: 500, available: true, reliability: 97 }
    ],
    dexes: [
      { name: 'Uniswap V3', fee: 0.30, liquidity: 500000000, slippage: 0.05 },
      { name: 'SushiSwap', fee: 0.30, liquidity: 200000000, slippage: 0.08 },
      { name: '1inch', fee: 0.25, liquidity: 300000000, slippage: 0.06 }
    ]
  },
  {
    id: 'bsc',
    name: 'BSC',
    symbol: 'BNB',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    gasCost: 0.20,
    blockTime: 3000,
    enabled: false,
    networkFee: 0.01,
    flashLoanProviders: [
      { name: 'Venus', fee: 0.05, maxAmount: 15000000, minAmount: 100, available: true, reliability: 97 },
      { name: 'PancakeSwap', fee: 0.08, maxAmount: 10000000, minAmount: 500, available: true, reliability: 95 },
      { name: 'Radiant', fee: 0.07, maxAmount: 8000000, minAmount: 1000, available: true, reliability: 93 }
    ],
    dexes: [
      { name: 'PancakeSwap V3', fee: 0.25, liquidity: 800000000, slippage: 0.04 },
      { name: 'Biswap', fee: 0.10, liquidity: 150000000, slippage: 0.06 },
      { name: 'MDEX', fee: 0.30, liquidity: 100000000, slippage: 0.08 }
    ]
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowscan.xyz',
    gasCost: 0.05,
    blockTime: 1500,
    enabled: false,
    networkFee: 0.012,
    flashLoanProviders: [
      { name: 'Aave', fee: 0.09, maxAmount: 12000000, minAmount: 500, available: true, reliability: 98 },
      { name: 'Benqi', fee: 0.03, maxAmount: 8000000, minAmount: 1000, available: true, reliability: 96 },
      { name: 'Trader Joe', fee: 0.06, maxAmount: 6000000, minAmount: 500, available: true, reliability: 94 }
    ],
    dexes: [
      { name: 'Trader Joe V2', fee: 0.20, liquidity: 300000000, slippage: 0.06 },
      { name: 'Pangolin', fee: 0.30, liquidity: 120000000, slippage: 0.08 },
      { name: 'SushiSwap', fee: 0.30, liquidity: 100000000, slippage: 0.09 }
    ]
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    gasCost: 0.001,
    blockTime: 2000,
    enabled: false,
    networkFee: 0.005,
    flashLoanProviders: [
      { name: 'Aave', fee: 0.09, maxAmount: 3000000, minAmount: 100, available: true, reliability: 97 },
      { name: 'QuickSwap', fee: 0.08, maxAmount: 2000000, minAmount: 500, available: true, reliability: 94 }
    ],
    dexes: [
      { name: 'QuickSwap', fee: 0.30, liquidity: 80000000, slippage: 0.12 },
      { name: 'SushiSwap', fee: 0.30, liquidity: 60000000, slippage: 0.10 }
    ]
  },
  {
    id: 'fantom',
    name: 'Fantom',
    symbol: 'FTM',
    chainId: 250,
    rpcUrl: 'https://rpc.ftm.tools',
    explorerUrl: 'https://ftmscan.com',
    gasCost: 0.0001,
    blockTime: 1200,
    enabled: true, // Enabled by default
    networkFee: 0.001,
    flashLoanProviders: [
      { name: 'Geist Finance', fee: 0.09, maxAmount: 12000000, minAmount: 100, available: true, reliability: 96 },
      { name: 'Scream Flash', fee: 0.05, maxAmount: 8000000, minAmount: 500, available: true, reliability: 93 },
      { name: 'Tarot Flash', fee: 0.07, maxAmount: 6000000, minAmount: 1000, available: true, reliability: 91 },
      { name: 'Hundred Finance', fee: 0.08, maxAmount: 5000000, minAmount: 500, available: true, reliability: 89 }
    ],
    dexes: [
      { name: 'SpookySwap', fee: 0.20, liquidity: 300000000, slippage: 0.04 },
      { name: 'SpiritSwap', fee: 0.25, liquidity: 250000000, slippage: 0.05 },
      { name: 'Beethoven X', fee: 0.15, liquidity: 180000000, slippage: 0.06 },
      { name: 'SushiSwap', fee: 0.30, liquidity: 150000000, slippage: 0.07 },
      { name: 'Curve Finance', fee: 0.04, liquidity: 200000000, slippage: 0.02 }
    ]
  }
];
