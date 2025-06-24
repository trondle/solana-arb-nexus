
import { ChainConfig } from '../types';

export const L2_CHAINS: ChainConfig[] = [
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    gasCost: 0.0003,
    blockTime: 1000,
    enabled: false, // Disabled by default
    networkFee: 0.02,
    flashLoanProviders: [
      { name: 'Aave', fee: 0.09, maxAmount: 5000000, minAmount: 500, available: true, reliability: 98 },
      { name: 'Radiant', fee: 0.07, maxAmount: 3000000, minAmount: 1000, available: true, reliability: 95 }
    ],
    dexes: [
      { name: 'Camelot', fee: 0.25, liquidity: 100000000, slippage: 0.1 },
      { name: 'Uniswap V3', fee: 0.30, liquidity: 150000000, slippage: 0.07 }
    ]
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    gasCost: 0.0001,
    blockTime: 2000,
    enabled: true, // Enabled by default
    networkFee: 0.008,
    flashLoanProviders: [
      { name: 'Aave V3', fee: 0.09, maxAmount: 8000000, minAmount: 500, available: true, reliability: 98 },
      { name: 'Compound V3', fee: 0.02, maxAmount: 5000000, minAmount: 1000, available: true, reliability: 96 },
      { name: 'Moonwell', fee: 0.05, maxAmount: 3000000, minAmount: 500, available: true, reliability: 94 }
    ],
    dexes: [
      { name: 'Aerodrome', fee: 0.05, liquidity: 120000000, slippage: 0.06 },
      { name: 'Uniswap V3', fee: 0.30, liquidity: 200000000, slippage: 0.05 },
      { name: 'BaseSwap', fee: 0.25, liquidity: 80000000, slippage: 0.08 }
    ]
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    gasCost: 0.0005,
    blockTime: 2000,
    enabled: false,
    networkFee: 0.01,
    flashLoanProviders: [
      { name: 'Aave V3', fee: 0.09, maxAmount: 7000000, minAmount: 500, available: true, reliability: 98 },
      { name: 'Exactly', fee: 0.04, maxAmount: 4000000, minAmount: 1000, available: true, reliability: 95 },
      { name: 'Sonne Finance', fee: 0.06, maxAmount: 3000000, minAmount: 500, available: true, reliability: 92 }
    ],
    dexes: [
      { name: 'Velodrome V2', fee: 0.05, liquidity: 180000000, slippage: 0.05 },
      { name: 'Uniswap V3', fee: 0.30, liquidity: 250000000, slippage: 0.04 },
      { name: 'KyberSwap', fee: 0.20, liquidity: 90000000, slippage: 0.07 }
    ]
  },
  {
    id: 'zksync-era',
    name: 'zkSync Era',
    symbol: 'ETH',
    chainId: 324,
    rpcUrl: 'https://mainnet.era.zksync.io',
    explorerUrl: 'https://explorer.zksync.io',
    gasCost: 0.0008,
    blockTime: 1500,
    enabled: false,
    networkFee: 0.008,
    flashLoanProviders: [
      { name: 'SyncSwap Flash', fee: 0.10, maxAmount: 4000000, minAmount: 500, available: true, reliability: 93 },
      { name: 'zkSync Lend', fee: 0.08, maxAmount: 3000000, minAmount: 1000, available: true, reliability: 91 },
      { name: 'Velocore Flash', fee: 0.12, maxAmount: 2500000, minAmount: 500, available: true, reliability: 89 }
    ],
    dexes: [
      { name: 'SyncSwap', fee: 0.20, liquidity: 80000000, slippage: 0.08 },
      { name: 'Velocore', fee: 0.25, liquidity: 60000000, slippage: 0.10 },
      { name: 'zkSwap Finance', fee: 0.30, liquidity: 45000000, slippage: 0.12 }
    ]
  },
  {
    id: 'linea',
    name: 'Linea',
    symbol: 'ETH',
    chainId: 59144,
    rpcUrl: 'https://rpc.linea.build',
    explorerUrl: 'https://lineascan.build',
    gasCost: 0.0006,
    blockTime: 2000,
    enabled: false,
    networkFee: 0.006,
    flashLoanProviders: [
      { name: 'LineaBank', fee: 0.09, maxAmount: 5000000, minAmount: 500, available: true, reliability: 94 },
      { name: 'Horizon Protocol', fee: 0.07, maxAmount: 3500000, minAmount: 1000, available: true, reliability: 92 },
      { name: 'Linea Flash', fee: 0.11, maxAmount: 2800000, minAmount: 500, available: true, reliability: 90 }
    ],
    dexes: [
      { name: 'LineaSwap', fee: 0.25, liquidity: 90000000, slippage: 0.07 },
      { name: 'Nile Exchange', fee: 0.20, liquidity: 70000000, slippage: 0.06 },
      { name: 'EchoDEX', fee: 0.30, liquidity: 50000000, slippage: 0.09 }
    ]
  },
  {
    id: 'scroll',
    name: 'Scroll',
    symbol: 'ETH',
    chainId: 534352,
    rpcUrl: 'https://rpc.scroll.io',
    explorerUrl: 'https://scrollscan.com',
    gasCost: 0.0007,
    blockTime: 1800,
    enabled: false,
    networkFee: 0.007,
    flashLoanProviders: [
      { name: 'Scroll Finance', fee: 0.08, maxAmount: 6000000, minAmount: 500, available: true, reliability: 95 },
      { name: 'Rho Markets', fee: 0.06, maxAmount: 4000000, minAmount: 1000, available: true, reliability: 93 },
      { name: 'ScrollLend', fee: 0.10, maxAmount: 3000000, minAmount: 500, available: true, reliability: 91 }
    ],
    dexes: [
      { name: 'ScrollSwap', fee: 0.20, liquidity: 100000000, slippage: 0.06 },
      { name: 'Ambient Finance', fee: 0.15, liquidity: 80000000, slippage: 0.05 },
      { name: 'Zebra DEX', fee: 0.25, liquidity: 60000000, slippage: 0.08 }
    ]
  },
  {
    id: 'mantle',
    name: 'Mantle',
    symbol: 'MNT',
    chainId: 5000,
    rpcUrl: 'https://rpc.mantle.xyz',
    explorerUrl: 'https://explorer.mantle.xyz',
    gasCost: 0.0003,
    blockTime: 1200,
    enabled: false,
    networkFee: 0.004,
    flashLoanProviders: [
      { name: 'Lendle', fee: 0.05, maxAmount: 8000000, minAmount: 500, available: true, reliability: 96 },
      { name: 'Mantle Finance', fee: 0.07, maxAmount: 6000000, minAmount: 1000, available: true, reliability: 94 },
      { name: 'Agni Flash', fee: 0.09, maxAmount: 4500000, minAmount: 500, available: true, reliability: 92 }
    ],
    dexes: [
      { name: 'Agni Finance', fee: 0.25, liquidity: 120000000, slippage: 0.06 },
      { name: 'FusionX', fee: 0.20, liquidity: 95000000, slippage: 0.05 },
      { name: 'Mantle Swap', fee: 0.30, liquidity: 70000000, slippage: 0.08 }
    ]
  },
  {
    id: 'starknet',
    name: 'Starknet',
    symbol: 'ETH',
    chainId: 1536727068981429685321, // Starknet chain ID is very large
    rpcUrl: 'https://starknet-mainnet.public.blastapi.io',
    explorerUrl: 'https://starkscan.co',
    gasCost: 0.0009,
    blockTime: 2500,
    enabled: false,
    networkFee: 0.009,
    flashLoanProviders: [
      { name: 'zkLend', fee: 0.08, maxAmount: 7000000, minAmount: 500, available: true, reliability: 94 },
      { name: 'Nostra Finance', fee: 0.06, maxAmount: 5000000, minAmount: 1000, available: true, reliability: 92 },
      { name: 'Starknet Flash', fee: 0.10, maxAmount: 3500000, minAmount: 500, available: true, reliability: 90 }
    ],
    dexes: [
      { name: 'JediSwap', fee: 0.30, liquidity: 85000000, slippage: 0.08 },
      { name: '10KSwap', fee: 0.25, liquidity: 65000000, slippage: 0.07 },
      { name: 'SithSwap', fee: 0.20, liquidity: 50000000, slippage: 0.06 },
      { name: 'mySwap', fee: 0.35, liquidity: 40000000, slippage: 0.10 }
    ]
  }
];
