import { RpcLatencyManager } from './rpcLatencyManager';
import { Connection, Transaction, SendOptions } from '@solana/web3.js';

export interface AcceleratedTransactionResult {
  success: boolean;
  signatures: string[];
  firstConfirmedSignature?: string;
  errors: string[];
  executionTimeMs: number;
}

export class TransactionAccelerator {
  private rpcManager: RpcLatencyManager;

  constructor(rpcManager: RpcLatencyManager) {
    this.rpcManager = rpcManager;
  }

  async broadcastToMultipleRPCs(
    transaction: Transaction,
    maxRpcs: number = 5
  ): Promise<AcceleratedTransactionResult> {
    const startTime = Date.now();
    console.log('🚀 Broadcasting transaction to multiple RPCs...');

    try {
      // Get the fastest available RPC endpoints
      const endpoints = this.rpcManager.getEndpointStats()
        .filter(ep => ep.isHealthy)
        .slice(0, maxRpcs);

      if (endpoints.length === 0) {
        throw new Error('No healthy RPC endpoints available');
      }

      console.log(`📡 Broadcasting to ${endpoints.length} RPC endpoints`);

      // Create connections and broadcast simultaneously
      const broadcastPromises = endpoints.map(async (endpoint) => {
        try {
          const connection = new Connection(endpoint.url, 'confirmed');
          const signature = await connection.sendRawTransaction(
            transaction.serialize(),
            {
              skipPreflight: false,
              maxRetries: 2,
              preflightCommitment: 'processed'
            } as SendOptions
          );
          
          console.log(`✅ Broadcast to ${endpoint.name}: ${signature}`);
          return { success: true, signature, endpoint: endpoint.name };
        } catch (error) {
          console.log(`❌ Failed to broadcast to ${endpoint.name}:`, error);
          return { 
            success: false, 
            signature: null, 
            endpoint: endpoint.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      // Wait for all broadcasts to complete
      const results = await Promise.allSettled(broadcastPromises);
      
      const signatures: string[] = [];
      const errors: string[] = [];
      let firstConfirmedSignature: string | undefined;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const broadcastResult = result.value;
          if (broadcastResult.success && broadcastResult.signature) {
            signatures.push(broadcastResult.signature);
            if (!firstConfirmedSignature) {
              firstConfirmedSignature = broadcastResult.signature;
            }
          } else if (broadcastResult.error) {
            errors.push(`${broadcastResult.endpoint}: ${broadcastResult.error}`);
          }
        } else {
          errors.push(`${endpoints[index].name}: ${result.reason}`);
        }
      });

      const executionTimeMs = Date.now() - startTime;
      const success = signatures.length > 0;

      console.log(`🎯 Transaction broadcast complete: ${signatures.length}/${endpoints.length} successful`);

      return {
        success,
        signatures,
        firstConfirmedSignature,
        errors,
        executionTimeMs
      };

    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      console.error('❌ Transaction acceleration failed:', error);
      
      return {
        success: false,
        signatures: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        executionTimeMs
      };
    }
  }

  async waitForConfirmation(
    signature: string,
    rpcUrl: string,
    timeoutMs: number = 30000
  ): Promise<boolean> {
    const connection = new Connection(rpcUrl, 'confirmed');
    const startTime = Date.now();

    try {
      while (Date.now() - startTime < timeoutMs) {
        const status = await connection.getSignatureStatus(signature);
        
        if (status.value?.confirmationStatus === 'confirmed' || 
            status.value?.confirmationStatus === 'finalized') {
          console.log(`✅ Transaction confirmed: ${signature}`);
          return true;
        }

        if (status.value?.err) {
          console.log(`❌ Transaction failed: ${signature}`, status.value.err);
          return false;
        }

        // Wait 1 second before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`⏰ Confirmation timeout for: ${signature}`);
      return false;
    } catch (error) {
      console.error(`❌ Error checking confirmation for ${signature}:`, error);
      return false;
    }
  }
}