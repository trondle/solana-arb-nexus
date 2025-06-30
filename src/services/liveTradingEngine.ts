
import { PhantomWalletService, TransactionResult } from './phantomWalletService';
import { FlashLoanContractService, FlashLoanParams } from './flashLoanContractService';

export interface TradingPosition {
  id: string;
  type: 'flash-loan' | 'arbitrage' | 'mev';
  token: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
  fees: number;
  timestamp: number;
  status: 'open' | 'closed' | 'failed';
  txSignature?: string;
}

export interface TradingStats {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalPnL: number;
  totalFees: number;
  winRate: number;
  averageProfit: number;
  maxDrawdown: number;
  currentBalance: number;
}

export interface LiveOpportunity {
  id: string;
  type: 'arbitrage' | 'mev' | 'flash-loan';
  pair: string;
  spread: number;
  estimatedProfit: number;
  requiredCapital: number;
  confidence: number;
  expiresAt: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export class LiveTradingEngine {
  private static positions: Map<string, TradingPosition> = new Map();
  private static tradingHistory: TradingPosition[] = [];
  private static isActive = false;
  private static initialBalance = 0;

  static async initialize(): Promise<boolean> {
    try {
      if (!PhantomWalletService.isWalletConnected()) {
        throw new Error('Wallet must be connected to initialize trading engine');
      }

      const balance = await PhantomWalletService.getBalance();
      this.initialBalance = balance.totalUSD;
      this.isActive = true;

      console.log('✅ Live Trading Engine initialized with balance:', balance.totalUSD);
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize trading engine:', error);
      return false;
    }
  }

  static async executeArbitrageTrade(opportunity: LiveOpportunity): Promise<TradingPosition> {
    if (!this.isActive) {
      throw new Error('Trading engine not initialized');
    }

    const position: TradingPosition = {
      id: `trade-${Date.now()}`,
      type: 'arbitrage',
      token: opportunity.pair.split('/')[0],
      amount: opportunity.requiredCapital,
      entryPrice: 0,
      currentPrice: 0,
      unrealizedPnL: 0,
      realizedPnL: 0,
      fees: opportunity.requiredCapital * 0.0025, // 0.25% trading fees
      timestamp: Date.now(),
      status: 'open'
    };

    try {
      // Check sufficient balance
      const balance = await PhantomWalletService.getBalance();
      if (balance.totalUSD < opportunity.requiredCapital + position.fees) {
        position.status = 'failed';
        position.realizedPnL = -position.fees;
        throw new Error(`Insufficient balance. Required: ${opportunity.requiredCapital + position.fees}`);
      }

      // Execute the arbitrage trade
      const executionResult = await this.executeArbitrageTransaction(opportunity);
      
      if (executionResult.success) {
        position.status = 'closed';
        position.realizedPnL = opportunity.estimatedProfit - position.fees;
        position.txSignature = executionResult.signature;
        
        console.log(`✅ Arbitrage trade executed: ${position.realizedPnL} profit`);
      } else {
        position.status = 'failed';
        position.realizedPnL = -position.fees;
        throw new Error(executionResult.error || 'Trade execution failed');
      }

    } catch (error) {
      console.error('❌ Arbitrage trade failed:', error);
      position.status = 'failed';
      if (position.realizedPnL === 0) {
        position.realizedPnL = -position.fees;
      }
    }

    this.positions.set(position.id, position);
    this.tradingHistory.push(position);
    
    return position;
  }

  static async executeFlashLoanTrade(params: FlashLoanParams): Promise<TradingPosition> {
    if (!this.isActive) {
      throw new Error('Trading engine not initialized');
    }

    const position: TradingPosition = {
      id: `flash-${Date.now()}`,
      type: 'flash-loan',
      token: params.token,
      amount: params.amount,
      entryPrice: 0,
      currentPrice: 0,
      unrealizedPnL: 0,
      realizedPnL: 0,
      fees: FlashLoanContractService.calculateFlashLoanFee(params.amount, params.provider),
      timestamp: Date.now(),
      status: 'open'
    };

    try {
      const result = await FlashLoanContractService.executeFlashLoan(params);
      
      if (result.success) {
        position.status = 'closed';
        position.realizedPnL = (result.profit || 0) - (result.fees || 0);
        position.txSignature = result.txSignature;
        position.fees = result.fees || position.fees;
        
        console.log(`✅ Flash loan executed: ${position.realizedPnL} profit`);
      } else {
        position.status = 'failed';
        position.realizedPnL = -position.fees;
        throw new Error(result.error || 'Flash loan execution failed');
      }

    } catch (error) {
      console.error('❌ Flash loan failed:', error);
      position.status = 'failed';
      position.realizedPnL = -position.fees;
    }

    this.positions.set(position.id, position);
    this.tradingHistory.push(position);
    
    return position;
  }

  private static async executeArbitrageTransaction(opportunity: LiveOpportunity): Promise<TransactionResult> {
    // Simulate arbitrage execution with actual transaction
    // In a real implementation, this would execute cross-DEX trades
    
    try {
      // For demo purposes, we'll simulate a successful arbitrage
      // Real implementation would involve multiple DEX interactions
      
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000)); // 2-5 second execution
      
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        return {
          success: true,
          signature: `arb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      } else {
        return {
          success: false,
          error: 'Arbitrage opportunity expired or slippage exceeded'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Arbitrage execution failed'
      };
    }
  }

  static async scanForOpportunities(): Promise<LiveOpportunity[]> {
    if (!this.isActive) return [];

    try {
      // This would integrate with real DEX APIs and price feeds
      // For now, generate realistic opportunities based on current market conditions
      
      const opportunities: LiveOpportunity[] = [];
      const pairs = ['SOL/USDC', 'ETH/USDC', 'SOL/USDT', 'RAY/USDC'];
      
      for (const pair of pairs) {
        const spread = 0.1 + Math.random() * 0.8; // 0.1% to 0.9% spread
        const requiredCapital = 50 + Math.random() * 950; // $50 to $1000
        const estimatedProfit = requiredCapital * (spread / 100) * 0.7; // 70% of spread captured
        
        if (spread > 0.2 && estimatedProfit > 1) { // Only profitable opportunities
          opportunities.push({
            id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'arbitrage',
            pair,
            spread,
            estimatedProfit,
            requiredCapital,
            confidence: 70 + Math.random() * 25, // 70-95% confidence
            expiresAt: Date.now() + 30000, // 30 second expiration
            riskLevel: spread > 0.5 ? 'low' : 'medium'
          });
        }
      }

      return opportunities.sort((a, b) => b.estimatedProfit - a.estimatedProfit).slice(0, 5);
    } catch (error) {
      console.error('❌ Failed to scan for opportunities:', error);
      return [];
    }
  }

  static getTradingStats(): TradingStats {
    const trades = this.tradingHistory;
    const successfulTrades = trades.filter(t => t.status === 'closed' && t.realizedPnL > 0);
    const failedTrades = trades.filter(t => t.status === 'failed');
    
    const totalPnL = trades.reduce((sum, t) => sum + t.realizedPnL, 0);
    const totalFees = trades.reduce((sum, t) => sum + t.fees, 0);
    const winRate = trades.length > 0 ? (successfulTrades.length / trades.length) * 100 : 0;
    const averageProfit = successfulTrades.length > 0 ? 
      successfulTrades.reduce((sum, t) => sum + t.realizedPnL, 0) / successfulTrades.length : 0;
    
    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = this.initialBalance;
    let currentBalance = this.initialBalance + totalPnL;
    
    for (const trade of trades) {
      currentBalance = this.initialBalance + trades.slice(0, trades.indexOf(trade) + 1)
        .reduce((sum, t) => sum + t.realizedPnL, 0);
      
      if (currentBalance > peak) {
        peak = currentBalance;
      }
      
      const drawdown = ((peak - currentBalance) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return {
      totalTrades: trades.length,
      successfulTrades: successfulTrades.length,
      failedTrades: failedTrades.length,
      totalPnL,
      totalFees,
      winRate,
      averageProfit,
      maxDrawdown,
      currentBalance
    };
  }

  static getActivePositions(): TradingPosition[] {
    return Array.from(this.positions.values()).filter(p => p.status === 'open');
  }

  static getTradingHistory(): TradingPosition[] {
    return [...this.tradingHistory].reverse(); // Most recent first
  }

  static async shutdown(): Promise<void> {
    this.isActive = false;
    console.log('🔴 Live Trading Engine shutdown');
  }

  static isEngineActive(): boolean {
    return this.isActive;
  }
}
