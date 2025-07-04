
import { PhantomWalletService, WalletBalance, TransactionResult } from './phantomWalletService';
import { FlashLoanContractService, FlashLoanParams } from './flashLoanContractService';
import { useTradingStore, TradeOpportunity, TradingPosition } from '../store/tradingStore';
import { RpcLatencyManager } from './rpcLatencyManager';
import { JitoMevClient } from './jitoMevClient';
import { TransactionAccelerator } from './transactionAccelerator';
import { ComputeUnitOptimizer } from './computeUnitOptimizer';
import { FlashLoanAggregator } from './flashLoanAggregator';

export interface ExecutionResult {
  success: boolean;
  position?: TradingPosition;
  error?: string;
  txSignature?: string;
}

export class UnifiedTradingEngine {
  private static instance: UnifiedTradingEngine;
  private rpcManager: RpcLatencyManager;
  private jitoClient: JitoMevClient;
  private transactionAccelerator: TransactionAccelerator;
  private computeOptimizer: ComputeUnitOptimizer;
  private flashLoanAggregator: FlashLoanAggregator;
  private isInitialized = false;
  private scanningInterval?: NodeJS.Timeout;

  private constructor() {
    this.rpcManager = new RpcLatencyManager();
    this.jitoClient = new JitoMevClient();
    this.transactionAccelerator = new TransactionAccelerator(this.rpcManager);
    this.computeOptimizer = new ComputeUnitOptimizer('https://api.mainnet-beta.solana.com');
    this.flashLoanAggregator = new FlashLoanAggregator();
  }

  static getInstance(): UnifiedTradingEngine {
    if (!UnifiedTradingEngine.instance) {
      UnifiedTradingEngine.instance = new UnifiedTradingEngine();
    }
    return UnifiedTradingEngine.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing Unified Trading Engine...');
      
      // Check wallet connection
      if (!PhantomWalletService.isWalletConnected()) {
        throw new Error('Wallet must be connected to initialize trading engine');
      }

      // Initialize wallet balance
      const balance = await PhantomWalletService.getBalance();
      const walletAddress = PhantomWalletService.getPublicKey() || '';
      
      // Update store
      useTradingStore.getState().setWalletConnection(true, walletAddress, balance);
      
      // Initialize RPC manager
      await this.rpcManager.initialize();
      
      // Initialize Jito client
      await this.jitoClient.initialize();
      
      // Initialize flash loan aggregator
      await this.flashLoanAggregator.checkProviderHealth();
      
      // Set engine as active
      useTradingStore.getState().setEngineStatus(true);
      
      this.isInitialized = true;
      console.log('✅ Unified Trading Engine initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Unified Trading Engine:', error);
      useTradingStore.getState().setEngineStatus(false);
      return false;
    }
  }

  async startScanning(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Engine must be initialized before scanning');
    }

    useTradingStore.getState().setScanning(true);
    console.log('🔍 Starting opportunity scanning...');

    // Clear existing interval
    if (this.scanningInterval) {
      clearInterval(this.scanningInterval);
    }

    // Start continuous scanning
    this.scanningInterval = setInterval(async () => {
      await this.scanForOpportunities();
    }, 2000); // Scan every 2 seconds

    // Initial scan
    await this.scanForOpportunities();
  }

  async stopScanning(): Promise<void> {
    if (this.scanningInterval) {
      clearInterval(this.scanningInterval);
      this.scanningInterval = undefined;
    }
    
    useTradingStore.getState().setScanning(false);
    console.log('⏹️ Stopped opportunity scanning');
  }

  private async scanForOpportunities(): Promise<void> {
    try {
      const opportunities: TradeOpportunity[] = [];
      
      // Scan for regular arbitrage opportunities
      const arbitrageOpps = await this.scanArbitrageOpportunities();
      opportunities.push(...arbitrageOpps);
      
      // Scan for flash loan opportunities
      const flashLoanOpps = await this.scanFlashLoanOpportunities();
      opportunities.push(...flashLoanOpps);
      
      // Scan for micro-MEV opportunities
      const microMevOpps = await this.scanMicroMevOpportunities();
      opportunities.push(...microMevOpps);
      
      // Get Jito bundle opportunities
      const jitoOpps = await this.jitoClient.getBundleOpportunities();
      opportunities.push(...jitoOpps);
      
      // Update store with new opportunities
      useTradingStore.getState().updateOpportunities(opportunities);
      
      console.log(`🔍 Scanned and found ${opportunities.length} opportunities`);
    } catch (error) {
      console.error('❌ Error scanning for opportunities:', error);
    }
  }

  async executeOpportunity(opportunity: TradeOpportunity): Promise<ExecutionResult> {
    try {
      console.log(`⚡ Executing ${opportunity.type} opportunity: ${opportunity.id}`);
      
      // Get best RPC endpoint
      const bestRpc = await this.rpcManager.getBestEndpoint();
      useTradingStore.getState().setRpcEndpoint(bestRpc.url, bestRpc.latency);
      
      // Update compute optimizer with best RPC
      this.computeOptimizer.updateConnection(bestRpc.url);
      
      // Execute based on opportunity type
      switch (opportunity.type) {
        case 'arbitrage':
          return await this.executeArbitrage(opportunity);
        case 'flash-loan':
          return await this.executeFlashLoan(opportunity);
        case 'micro-mev':
          return await this.executeMicroMev(opportunity);
        case 'jito-bundle':
          return await this.executeJitoBundle(opportunity);
        default:
          throw new Error(`Unknown opportunity type: ${opportunity.type}`);
      }
    } catch (error) {
      console.error(`❌ Failed to execute opportunity ${opportunity.id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed'
      };
    }
  }

  private async executeArbitrage(opportunity: TradeOpportunity): Promise<ExecutionResult> {
    const position: TradingPosition = {
      id: `arb-${Date.now()}`,
      type: 'arbitrage',
      status: 'open',
      realizedPnL: 0,
      timestamp: Date.now()
    };

    try {
      // Simulate arbitrage execution
      await new Promise(resolve => setTimeout(resolve, opportunity.executionTimeMs));
      
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        position.status = 'closed';
        position.realizedPnL = opportunity.estimatedProfit * 0.8; // 80% of estimated profit
        position.txSignature = `arb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      } else {
        position.status = 'failed';
        position.realizedPnL = -opportunity.requiredCapital * 0.01; // 1% loss
      }

      useTradingStore.getState().addPosition(position);
      this.updateStats();

      return { success, position, txSignature: position.txSignature };
    } catch (error) {
      position.status = 'failed';
      position.realizedPnL = -opportunity.requiredCapital * 0.01;
      useTradingStore.getState().addPosition(position);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Arbitrage execution failed'
      };
    }
  }

  private async executeFlashLoan(opportunity: TradeOpportunity): Promise<ExecutionResult> {
    console.log(`⚡ Executing flash loan with aggregator: ${opportunity.id}`);

    const position: TradingPosition = {
      id: `flash-${Date.now()}`,
      type: 'flash-loan',
      status: 'open',
      realizedPnL: 0,
      timestamp: Date.now()
    };

    try {
      // Use flash loan aggregator to find best rate
      const bestQuote = await this.flashLoanAggregator.getBestFlashLoanQuote(
        opportunity.token,
        opportunity.requiredCapital
      );

      if (!bestQuote) {
        throw new Error('No flash loan providers available');
      }

      console.log(`💰 Best flash loan quote: ${bestQuote.provider.name} - ${bestQuote.feeRate * 100}% fee`);

      // Check if multi-loan chaining would be more profitable
      const multiLoanChain = await this.flashLoanAggregator.constructMultiLoanChain(
        opportunity.token,
        opportunity.requiredCapital,
        2 // Max 2 loans in chain
      );

      const useMultiLoan = multiLoanChain && multiLoanChain.netProfit > (opportunity.estimatedProfit - bestQuote.fee);

      if (useMultiLoan) {
        console.log(`🔗 Using multi-loan chain for better profit: ${multiLoanChain.netProfit.toFixed(4)}`);
        
        // Execute multi-loan chain (simplified for demo)
        position.status = 'closed';
        position.realizedPnL = multiLoanChain.netProfit;
        position.txSignature = `multi_loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      } else {
        // Execute single flash loan
        const flashLoanParams: FlashLoanParams = {
          amount: opportunity.requiredCapital,
          token: opportunity.token as "SOL" | "USDC" | "USDT",
          provider: bestQuote.provider.name as any,
          collateralAmount: opportunity.requiredCapital * 0.1,
          maxSlippage: 0.01
        };

        const result = await FlashLoanContractService.executeFlashLoan(flashLoanParams);
        
        if (result.success) {
          position.status = 'closed';
          position.realizedPnL = (result.profit || 0) - bestQuote.fee;
          position.txSignature = result.txSignature;
        } else {
          position.status = 'failed';
          position.realizedPnL = -bestQuote.fee;
        }
      }

      useTradingStore.getState().addPosition(position);
      this.updateStats();

      return { 
        success: position.status === 'closed', 
        position, 
        txSignature: position.txSignature
      };
    } catch (error) {
      position.status = 'failed';
      position.realizedPnL = -opportunity.requiredCapital * 0.005;
      useTradingStore.getState().addPosition(position);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Flash loan execution failed'
      };
    }
  }

  private async executeMicroMev(opportunity: TradeOpportunity): Promise<ExecutionResult> {
    // Implementation for micro-MEV execution
    return await this.executeArbitrage(opportunity); // Simplified for now
  }

  private async executeJitoBundle(opportunity: TradeOpportunity): Promise<ExecutionResult> {
    try {
      console.log(`🎯 Executing Jito MEV bundle: ${opportunity.id}`);

      // Create MEV bundle for sandwich/front-running
      const frontRunTx = `front_run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const targetTx = `target_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const backRunTx = `back_run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const mevBundle = await this.jitoClient.createMevBundle(
        targetTx,
        frontRunTx,
        backRunTx,
        15000 // 15k lamports tip
      );

      const result = await this.jitoClient.submitMevBundle(mevBundle, 15000);
      
      const position: TradingPosition = {
        id: `jito-${Date.now()}`,
        type: 'jito-bundle',
        status: result.success ? 'closed' : 'failed',
        realizedPnL: result.success ? opportunity.estimatedProfit * 0.9 : 0, // 90% of estimated (tips reduce profit)
        timestamp: Date.now(),
        txSignature: result.bundleId
      };

      useTradingStore.getState().addPosition(position);
      this.updateStats();

      return { 
        success: result.success, 
        position, 
        txSignature: result.bundleId,
        error: result.error 
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Jito bundle execution failed'
      };
    }
  }

  private async scanArbitrageOpportunities(): Promise<TradeOpportunity[]> {
    // Generate realistic arbitrage opportunities
    const opportunities: TradeOpportunity[] = [];
    const tokens = ['SOL', 'USDC', 'USDT', 'RAY'];
    
    for (let i = 0; i < 3; i++) {
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const profit = 0.5 + Math.random() * 2; // $0.5 to $2.5
      const capital = 50 + Math.random() * 200; // $50 to $250
      
      opportunities.push({
        id: `arb-${Date.now()}-${i}`,
        type: 'arbitrage',
        token,
        estimatedProfit: profit,
        requiredCapital: capital,
        riskLevel: 'low',
        successProbability: 0.85 + Math.random() * 0.1,
        executionTimeMs: 2000 + Math.random() * 1000,
        expiresAt: Date.now() + 30000,
        metadata: { dex1: 'Orca', dex2: 'Raydium' }
      });
    }
    
    return opportunities;
  }

  private async scanFlashLoanOpportunities(): Promise<TradeOpportunity[]> {
    const opportunities: TradeOpportunity[] = [];
    
    // Generate flash loan opportunities
    for (let i = 0; i < 2; i++) {
      const profit = 2 + Math.random() * 5; // $2 to $7
      const capital = 500 + Math.random() * 1000; // $500 to $1500
      
      opportunities.push({
        id: `flash-${Date.now()}-${i}`,
        type: 'flash-loan',
        token: 'SOL',
        estimatedProfit: profit,
        requiredCapital: capital,
        riskLevel: 'ultra-low',
        successProbability: 0.75 + Math.random() * 0.15,
        executionTimeMs: 3000 + Math.random() * 2000,
        expiresAt: Date.now() + 45000,
        metadata: { provider: 'Solend', collateralRatio: 0.1 }
      });
    }
    
    return opportunities;
  }

  private async scanMicroMevOpportunities(): Promise<TradeOpportunity[]> {
    const opportunities: TradeOpportunity[] = [];
    
    // Generate micro-MEV opportunities
    for (let i = 0; i < 5; i++) {
      const profit = 0.1 + Math.random() * 0.5; // $0.1 to $0.6
      const capital = 10 + Math.random() * 40; // $10 to $50
      
      opportunities.push({
        id: `mev-${Date.now()}-${i}`,
        type: 'micro-mev',
        token: 'SOL',
        estimatedProfit: profit,
        requiredCapital: capital,
        riskLevel: 'ultra-low',
        successProbability: 0.9 + Math.random() * 0.08,
        executionTimeMs: 500 + Math.random() * 500,
        expiresAt: Date.now() + 15000,
        metadata: { mevType: 'sandwich', blockSpace: 'priority' }
      });
    }
    
    return opportunities;
  }

  private updateStats(): void {
    const state = useTradingStore.getState();
    const trades = state.tradeHistory;
    const successfulTrades = trades.filter(t => t.status === 'closed' && t.realizedPnL > 0);
    
    const totalProfit = trades.reduce((sum, t) => sum + t.realizedPnL, 0);
    const successRate = trades.length > 0 ? (successfulTrades.length / trades.length) * 100 : 0;
    const avgProfitPerTrade = trades.length > 0 ? totalProfit / trades.length : 0;
    
    // Calculate today's profit
    const today = new Date().toDateString();
    const todayTrades = trades.filter(t => new Date(t.timestamp).toDateString() === today);
    const profitToday = todayTrades.reduce((sum, t) => sum + t.realizedPnL, 0);

    state.updateStats({
      totalTrades: trades.length,
      successfulTrades: successfulTrades.length,
      totalProfit,
      successRate,
      profitToday,
      avgProfitPerTrade
    });
  }

  async shutdown(): Promise<void> {
    await this.stopScanning();
    await this.rpcManager.shutdown();
    await this.jitoClient.shutdown();
    useTradingStore.getState().setEngineStatus(false);
    this.isInitialized = false;
    console.log('🔴 Unified Trading Engine shutdown');
  }

  isActive(): boolean {
    return this.isInitialized && useTradingStore.getState().isEngineActive;
  }
}
