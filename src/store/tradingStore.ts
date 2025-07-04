
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { WalletBalance } from '../services/phantomWalletService';

export interface TradeOpportunity {
  id: string;
  type: 'arbitrage' | 'flash-loan' | 'micro-mev' | 'jito-bundle';
  token: string;
  estimatedProfit: number;
  requiredCapital: number;
  riskLevel: 'ultra-low' | 'low' | 'medium' | 'high';
  successProbability: number;
  executionTimeMs: number;
  expiresAt: number;
  metadata: Record<string, any>;
}

export interface TradingPosition {
  id: string;
  type: string;
  status: 'open' | 'closed' | 'failed';
  realizedPnL: number;
  timestamp: number;
  txSignature?: string;
}

export interface TradingStats {
  totalTrades: number;
  successfulTrades: number;
  totalProfit: number;
  successRate: number;
  profitToday: number;
  avgProfitPerTrade: number;
}

export interface TradingState {
  // Wallet state
  isWalletConnected: boolean;
  walletAddress: string;
  walletBalance: WalletBalance;
  
  // Trading engine state
  isEngineActive: boolean;
  isScanning: boolean;
  emergencyMode: boolean;
  
  // Opportunities and positions
  opportunities: TradeOpportunity[];
  activePositions: TradingPosition[];
  tradeHistory: TradingPosition[];
  
  // Statistics
  stats: TradingStats;
  
  // RPC and performance
  currentRpcEndpoint: string;
  rpcLatency: number;
  
  // Actions
  setWalletConnection: (connected: boolean, address: string, balance: WalletBalance) => void;
  setEngineStatus: (active: boolean) => void;
  setScanning: (scanning: boolean) => void;
  updateOpportunities: (opportunities: TradeOpportunity[]) => void;
  addPosition: (position: TradingPosition) => void;
  updateStats: (stats: Partial<TradingStats>) => void;
  setEmergencyMode: (emergency: boolean) => void;
  setRpcEndpoint: (endpoint: string, latency: number) => void;
  reset: () => void;
}

const initialState = {
  isWalletConnected: false,
  walletAddress: '',
  walletBalance: { sol: 0, usdc: 0, usdt: 0, totalUSD: 0 },
  isEngineActive: false,
  isScanning: false,
  emergencyMode: false,
  opportunities: [],
  activePositions: [],
  tradeHistory: [],
  stats: {
    totalTrades: 0,
    successfulTrades: 0,
    totalProfit: 0,
    successRate: 0,
    profitToday: 0,
    avgProfitPerTrade: 0
  },
  currentRpcEndpoint: 'https://api.mainnet-beta.solana.com',
  rpcLatency: 0
};

export const useTradingStore = create<TradingState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    setWalletConnection: (connected, address, balance) => 
      set({ isWalletConnected: connected, walletAddress: address, walletBalance: balance }),
    
    setEngineStatus: (active) => 
      set({ isEngineActive: active }),
    
    setScanning: (scanning) => 
      set({ isScanning: scanning }),
    
    updateOpportunities: (opportunities) => 
      set({ opportunities }),
    
    addPosition: (position) => 
      set((state) => ({
        activePositions: position.status === 'open' 
          ? [...state.activePositions, position]
          : state.activePositions,
        tradeHistory: [...state.tradeHistory, position]
      })),
    
    updateStats: (newStats) => 
      set((state) => ({ stats: { ...state.stats, ...newStats } })),
    
    setEmergencyMode: (emergency) => 
      set({ emergencyMode: emergency }),
    
    setRpcEndpoint: (endpoint, latency) => 
      set({ currentRpcEndpoint: endpoint, rpcLatency: latency }),
    
    reset: () => set(initialState)
  }))
);
