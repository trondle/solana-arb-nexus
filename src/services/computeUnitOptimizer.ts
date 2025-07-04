import { Connection, Transaction, ComputeBudgetProgram } from '@solana/web3.js';

export interface ComputeUnitEstimate {
  estimatedUnits: number;
  recommendedBudget: number;
  feeEstimate: number;
  success: boolean;
  error?: string;
}

export class ComputeUnitOptimizer {
  private connection: Connection;
  private readonly DEFAULT_CU_BUFFER = 0.1; // 10% buffer
  private readonly MAX_CU_LIMIT = 1_400_000; // Solana max CU limit
  private readonly MIN_CU_LIMIT = 200; // Minimum reasonable limit

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  updateConnection(rpcUrl: string): void {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  async estimateComputeUnits(
    transaction: Transaction,
    bufferPercentage: number = this.DEFAULT_CU_BUFFER
  ): Promise<ComputeUnitEstimate> {
    try {
      console.log('🔄 Estimating compute units for transaction...');

      // Remove any existing compute budget instructions to get clean estimate
      const cleanTransaction = this.removeComputeBudgetInstructions(transaction);

      // Simulate the transaction to get compute unit usage
      const simulationResult = await this.connection.simulateTransaction(cleanTransaction);

      if (simulationResult.value.err) {
        console.error('❌ Transaction simulation failed:', simulationResult.value.err);
        return {
          estimatedUnits: 0,
          recommendedBudget: 200000, // Conservative fallback
          feeEstimate: 0,
          success: false,
          error: `Simulation failed: ${JSON.stringify(simulationResult.value.err)}`
        };
      }

      const consumedUnits = simulationResult.value.unitsConsumed || 0;
      console.log(`📊 Simulated compute units consumed: ${consumedUnits}`);

      // Calculate recommended budget with buffer
      const bufferedUnits = Math.ceil(consumedUnits * (1 + bufferPercentage));
      const recommendedBudget = Math.min(
        Math.max(bufferedUnits, this.MIN_CU_LIMIT),
        this.MAX_CU_LIMIT
      );

      // Estimate fee (approximate - actual fee depends on priority fee settings)
      const baseFeePerCU = 0.000001; // Base compute unit price in SOL
      const feeEstimate = recommendedBudget * baseFeePerCU;

      console.log(`✅ Compute unit optimization complete: ${recommendedBudget} CU (${bufferPercentage * 100}% buffer)`);

      return {
        estimatedUnits: consumedUnits,
        recommendedBudget,
        feeEstimate,
        success: true
      };

    } catch (error) {
      console.error('❌ Compute unit estimation failed:', error);
      
      return {
        estimatedUnits: 0,
        recommendedBudget: 200000, // Conservative fallback
        feeEstimate: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async optimizeTransaction(
    transaction: Transaction,
    priorityFeeSOL: number = 0.001,
    bufferPercentage: number = this.DEFAULT_CU_BUFFER
  ): Promise<{ transaction: Transaction; estimate: ComputeUnitEstimate }> {
    
    // Get compute unit estimate
    const estimate = await this.estimateComputeUnits(transaction, bufferPercentage);
    
    // Remove existing compute budget instructions
    const optimizedTransaction = this.removeComputeBudgetInstructions(transaction);
    
    if (estimate.success) {
      // Add optimized compute budget instructions
      const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: estimate.recommendedBudget
      });

      // Set priority fee (micro-lamports per compute unit)
      const priorityFeeMicroLamports = Math.floor((priorityFeeSOL * 1_000_000_000) / estimate.recommendedBudget);
      const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: priorityFeeMicroLamports
      });

      // Add compute budget instructions at the beginning
      optimizedTransaction.instructions.unshift(computeLimitIx, priorityFeeIx);
      
      console.log(`🎯 Transaction optimized: ${estimate.recommendedBudget} CU, ${priorityFeeMicroLamports} micro-lamports/CU`);
    } else {
      console.warn('⚠️ Using fallback compute budget due to estimation failure');
      
      // Add conservative fallback compute budget
      const fallbackComputeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: estimate.recommendedBudget // This will be the fallback value
      });
      
      optimizedTransaction.instructions.unshift(fallbackComputeLimitIx);
    }

    return { transaction: optimizedTransaction, estimate };
  }

  private removeComputeBudgetInstructions(transaction: Transaction): Transaction {
    const cleanTransaction = new Transaction();
    cleanTransaction.recentBlockhash = transaction.recentBlockhash;
    cleanTransaction.feePayer = transaction.feePayer;

    // Filter out existing compute budget instructions
    cleanTransaction.instructions = transaction.instructions.filter(ix => 
      !ix.programId.equals(ComputeBudgetProgram.programId)
    );

    return cleanTransaction;
  }

  async getRecentPriorityFees(samples: number = 20): Promise<number[]> {
    try {
      // This would typically query recent priority fees from the network
      // For now, we'll return simulated priority fee data
      const fees: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        // Simulate priority fees between 1-10 micro-lamports per CU
        fees.push(Math.floor(Math.random() * 10) + 1);
      }
      
      return fees.sort((a, b) => a - b);
    } catch (error) {
      console.warn('⚠️ Failed to fetch recent priority fees:', error);
      return [1, 2, 3, 5, 8]; // Fallback priority fees
    }
  }

  calculateOptimalPriorityFee(recentFees: number[], percentile: number = 75): number {
    if (recentFees.length === 0) return 5; // Default fallback
    
    const index = Math.floor((percentile / 100) * recentFees.length);
    return recentFees[Math.min(index, recentFees.length - 1)];
  }
}