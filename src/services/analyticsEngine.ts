interface TradeExecution {
  id: string;
  pair: string;
  type: 'flash_loan' | 'regular';
  profit: number;
  fees: number;
  executionTime: number;
  timestamp: number;
  success: boolean;
  slippage: number;
}

interface PerformanceMetrics {
  totalTrades: number;
  successfulTrades: number;
  totalProfit: number;
  totalFees: number;
  averageProfit: number;
  successRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  profitFactor: number;
  averageExecutionTime: number;
}

interface RiskMetrics {
  valueAtRisk: number;
  expectedShortfall: number;
  volatility: number;
  beta: number;
  maxConsecutiveLosses: number;
  currentDrawdown: number;
}

export class AnalyticsEngine {
  private static trades: TradeExecution[] = [];
  private static listeners = new Set<(metrics: PerformanceMetrics) => void>();
  
  static addTrade(trade: Omit<TradeExecution, 'id' | 'timestamp'>): void {
    const fullTrade: TradeExecution = {
      ...trade,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    this.trades.push(fullTrade);
    this.notifyListeners();
    
    // Keep only last 1000 trades for performance
    if (this.trades.length > 1000) {
      this.trades = this.trades.slice(-1000);
    }
  }

  static getPerformanceMetrics(timeframe?: number): PerformanceMetrics {
    const cutoffTime = timeframe ? Date.now() - timeframe : 0;
    const relevantTrades = this.trades.filter(trade => trade.timestamp >= cutoffTime);
    
    if (relevantTrades.length === 0) {
      return {
        totalTrades: 0,
        successfulTrades: 0,
        totalProfit: 0,
        totalFees: 0,
        averageProfit: 0,
        successRate: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        profitFactor: 0,
        averageExecutionTime: 0
      };
    }

    const successfulTrades = relevantTrades.filter(trade => trade.success);
    const totalProfit = relevantTrades.reduce((sum, trade) => sum + (trade.success ? trade.profit : -trade.fees), 0);
    const totalFees = relevantTrades.reduce((sum, trade) => sum + trade.fees, 0);
    
    // Calculate Sharpe ratio
    const returns = relevantTrades.map(trade => trade.success ? trade.profit : -trade.fees);
    const averageReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - averageReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);
    const sharpeRatio = volatility > 0 ? averageReturn / volatility : 0;

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let runningProfit = 0;
    
    relevantTrades.forEach(trade => {
      runningProfit += trade.success ? trade.profit : -trade.fees;
      if (runningProfit > peak) {
        peak = runningProfit;
      }
      const drawdown = (peak - runningProfit) / Math.max(peak, 1);
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    });

    // Calculate profit factor
    const grossProfit = successfulTrades.reduce((sum, trade) => sum + trade.profit, 0);
    const grossLoss = relevantTrades
      .filter(trade => !trade.success)
      .reduce((sum, trade) => sum + trade.fees, 0);
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0;

    return {
      totalTrades: relevantTrades.length,
      successfulTrades: successfulTrades.length,
      totalProfit,
      totalFees,
      averageProfit: relevantTrades.length > 0 ? totalProfit / relevantTrades.length : 0,
      successRate: relevantTrades.length > 0 ? successfulTrades.length / relevantTrades.length : 0,
      sharpeRatio,
      maxDrawdown,
      profitFactor,
      averageExecutionTime: relevantTrades.length > 0 
        ? relevantTrades.reduce((sum, trade) => sum + trade.executionTime, 0) / relevantTrades.length 
        : 0
    };
  }

  static getRiskMetrics(): RiskMetrics {
    const returns = this.trades.map(trade => trade.success ? trade.profit : -trade.fees);
    
    if (returns.length === 0) {
      return {
        valueAtRisk: 0,
        expectedShortfall: 0,
        volatility: 0,
        beta: 0,
        maxConsecutiveLosses: 0,
        currentDrawdown: 0
      };
    }

    // Calculate Value at Risk (95% confidence)
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const varIndex = Math.floor(returns.length * 0.05);
    const valueAtRisk = sortedReturns[varIndex] || 0;

    // Calculate Expected Shortfall (Conditional VaR)
    const tailReturns = sortedReturns.slice(0, varIndex + 1);
    const expectedShortfall = tailReturns.length > 0 
      ? tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length 
      : 0;

    // Calculate volatility
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);

    // Calculate max consecutive losses
    let maxConsecutiveLosses = 0;
    let currentConsecutiveLosses = 0;
    
    this.trades.forEach(trade => {
      if (!trade.success) {
        currentConsecutiveLosses++;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentConsecutiveLosses);
      } else {
        currentConsecutiveLosses = 0;
      }
    });

    // Calculate current drawdown
    let peak = 0;
    let runningProfit = 0;
    let currentDrawdown = 0;
    
    this.trades.forEach(trade => {
      runningProfit += trade.success ? trade.profit : -trade.fees;
      if (runningProfit > peak) {
        peak = runningProfit;
      }
    });
    
    if (peak > 0) {
      currentDrawdown = (peak - runningProfit) / peak;
    }

    return {
      valueAtRisk,
      expectedShortfall,
      volatility,
      beta: 0.8 + Math.random() * 0.4, // Mock beta - in production, calculate vs market
      maxConsecutiveLosses,
      currentDrawdown
    };
  }

  static getProfitTrend(days: number = 7): { date: string; profit: number; cumulative: number }[] {
    const msPerDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const trend: { date: string; profit: number; cumulative: number }[] = [];
    let cumulativeProfit = 0;

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = now - (i + 1) * msPerDay;
      const dayEnd = now - i * msPerDay;
      
      const dayTrades = this.trades.filter(trade => 
        trade.timestamp >= dayStart && trade.timestamp < dayEnd
      );
      
      const dayProfit = dayTrades.reduce((sum, trade) => 
        sum + (trade.success ? trade.profit : -trade.fees), 0
      );
      
      cumulativeProfit += dayProfit;
      
      trend.push({
        date: new Date(dayStart).toLocaleDateString(),
        profit: dayProfit,
        cumulative: cumulativeProfit
      });
    }

    return trend;
  }

  static subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private static notifyListeners(): void {
    const metrics = this.getPerformanceMetrics();
    this.listeners.forEach(callback => callback(metrics));
  }

  // Generate mock historical data for demonstration
  static generateMockData(): void {
    const pairs = ['SOL/USDC', 'ETH/USDC', 'BTC/USDC'];
    const now = Date.now();
    const daysBack = 30;
    
    for (let i = 0; i < daysBack * 3; i++) {
      const trade: Omit<TradeExecution, 'id' | 'timestamp'> = {
        pair: pairs[Math.floor(Math.random() * pairs.length)],
        type: Math.random() > 0.6 ? 'flash_loan' : 'regular',
        profit: 5 + Math.random() * 45,
        fees: 0.5 + Math.random() * 2,
        executionTime: 1000 + Math.random() * 4000,
        success: Math.random() > 0.15, // 85% success rate
        slippage: Math.random() * 0.5
      };
      
      this.addTrade(trade);
      // Backdate the timestamp
      this.trades[this.trades.length - 1].timestamp = now - (daysBack - Math.floor(i / 3)) * 24 * 60 * 60 * 1000 + Math.random() * 24 * 60 * 60 * 1000;
    }
  }
}
