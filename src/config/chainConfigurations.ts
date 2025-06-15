export interface ChainConfig {
  id: string;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  flashLoanProviders: FlashLoanProvider[];
  dexes: DEXConfig[];
  gasCost: number;
  blockTime: number;
  enabled: boolean;
  networkFee: number;
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

export const SUPPORTED_CHAINS: ChainConfig[] = [
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
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
    explorerUrl: 'https://etherscan.io',
    gasCost: 0.003,
    blockTime: 12000,
    enabled: true,
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
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    gasCost: 0.0003,
    blockTime: 1000,
    enabled: true,
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
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
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
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    gasCost: 0.0001,
    blockTime: 2000,
    enabled: true,
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
    id: 'bsc',
    name: 'BSC',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    gasCost: 0.20,
    blockTime: 3000,
    enabled: true,
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
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowscan.xyz',
    gasCost: 0.05,
    blockTime: 1500,
    enabled: true,
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
    id: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
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
  },
  {
    id: 'fantom',
    name: 'Fantom',
    symbol: 'FTM',
    rpcUrl: 'https://rpc.ftm.tools',
    explorerUrl: 'https://ftmscan.com',
    gasCost: 0.0001,
    blockTime: 1200,
    enabled: true,
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
  },
  // NEW CHAINS - zkSync Era, Linea, Scroll, Mantle, Starknet
  {
    id: 'zksync-era',
    name: 'zkSync Era',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.era.zksync.io',
    explorerUrl: 'https://explorer.zksync.io',
    gasCost: 0.0008,
    blockTime: 1500,
    enabled: true,
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
    rpcUrl: 'https://rpc.linea.build',
    explorerUrl: 'https://lineascan.build',
    gasCost: 0.0006,
    blockTime: 2000,
    enabled: true,
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
    rpcUrl: 'https://rpc.scroll.io',
    explorerUrl: 'https://scrollscan.com',
    gasCost: 0.0007,
    blockTime: 1800,
    enabled: true,
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
    rpcUrl: 'https://rpc.mantle.xyz',
    explorerUrl: 'https://explorer.mantle.xyz',
    gasCost: 0.0003,
    blockTime: 1200,
    enabled: true,
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
    rpcUrl: 'https://starknet-mainnet.public.blastapi.io',
    explorerUrl: 'https://starkscan.co',
    gasCost: 0.0009,
    blockTime: 2500,
    enabled: true,
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
