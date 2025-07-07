
import { PublicKey, Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { RpcLatencyManager } from './rpcLatencyManager';

interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: PublicKey;
  isConnected: boolean;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
  signMessage(message: Uint8Array, display?: string): Promise<{ signature: Uint8Array; publicKey: PublicKey }>;
  connect(opts?: { onlyIfTrusted: boolean }): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  on(event: string, handler: (args: any) => void): void;
  request(method: string, params: any): Promise<unknown>;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

export interface WalletBalance {
  sol: number;
  usdc: number;
  usdt: number;
  totalUSD: number;
}

export interface TransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export class PhantomWalletService {
  private static rpcManager = new RpcLatencyManager();
  private static connection: Connection;
  private static provider: PhantomProvider | null = null;
  private static isConnected = false;

  private static async getWorkingConnection(): Promise<Connection> {
    if (!this.connection) {
      // Get the fastest working RPC endpoint
      const endpoints = this.rpcManager.getEndpointStats()
        .filter(ep => ep.isHealthy)
        .slice(0, 1);
      
      const rpcUrl = endpoints.length > 0 
        ? endpoints[0].url 
        : 'https://api.devnet.solana.com'; // Fallback to devnet which is usually more permissive
      
      this.connection = new Connection(rpcUrl, 'confirmed');
      console.log(`🔗 Using RPC endpoint: ${rpcUrl}`);
    }
    return this.connection;
  }

  static async initialize(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const provider = window.solana;
    if (!provider?.isPhantom) {
      throw new Error('Phantom wallet not found. Please install Phantom wallet extension.');
    }

    this.provider = provider;
    
    // Check if already connected
    try {
      const response = await provider.connect({ onlyIfTrusted: true });
      if (response.publicKey) {
        this.isConnected = true;
        console.log('✅ Phantom wallet auto-connected:', response.publicKey.toString());
        return true;
      }
    } catch (error) {
      console.log('Phantom wallet not auto-connected');
    }

    return false;
  }

  static async connect(): Promise<{ publicKey: string; success: boolean; error?: string }> {
    if (!this.provider) {
      return { publicKey: '', success: false, error: 'Phantom wallet not initialized' };
    }

    try {
      const response = await this.provider.connect();
      this.isConnected = true;
      
      const publicKey = response.publicKey.toString();
      console.log('✅ Phantom wallet connected:', publicKey);
      
      return { publicKey, success: true };
    } catch (error) {
      console.error('❌ Phantom wallet connection failed:', error);
      return { 
        publicKey: '', 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }

  static async disconnect(): Promise<void> {
    if (!this.provider) return;

    try {
      await this.provider.disconnect();
      this.isConnected = false;
      console.log('🔌 Phantom wallet disconnected');
    } catch (error) {
      console.error('❌ Phantom wallet disconnect failed:', error);
    }
  }

  static async getBalance(): Promise<WalletBalance> {
    if (!this.provider?.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // Initialize RPC manager if needed
      await this.rpcManager.initialize();
      
      // Get working connection
      const connection = await this.getWorkingConnection();
      
      // Get SOL balance with retry logic
      let sol = 0;
      try {
        const solBalance = await connection.getBalance(this.provider.publicKey);
        sol = solBalance / LAMPORTS_PER_SOL;
        console.log(`💰 SOL balance: ${sol}`);
      } catch (balanceError) {
        console.warn('⚠️ Could not fetch SOL balance, using 0:', balanceError);
        // Don't throw - we'll return a balance with 0 SOL rather than failing completely
      }

      // Get USDC balance (placeholder - would need actual token account checking)
      const usdc = 0; // TODO: Implement SPL token balance fetching
      const usdt = 0; // TODO: Implement SPL token balance fetching

      // Calculate total USD value using real SOL price
      let solPrice = 100; // Default fallback
      try {
        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const priceData = await priceResponse.json();
        if (priceData.solana?.usd) {
          solPrice = priceData.solana.usd;
        }
      } catch (priceError) {
        console.warn('⚠️ Could not fetch SOL price, using fallback $100');
      }
      
      const totalUSD = sol * solPrice + usdc + usdt;

      return { sol, usdc, usdt, totalUSD };
    } catch (error) {
      console.error('❌ Failed to fetch wallet balance:', error);
      // Return default balance instead of throwing to allow wallet connection to succeed
      console.warn('⚠️ Returning default balance due to RPC issues');
      return { sol: 0, usdc: 0, usdt: 0, totalUSD: 0 };
    }
  }

  static async sendTransaction(
    toAddress: string, 
    amount: number, 
    tokenType: 'SOL' | 'USDC' | 'USDT' = 'SOL'
  ): Promise<TransactionResult> {
    if (!this.provider?.publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const connection = await this.getWorkingConnection();
      const transaction = new Transaction();
      
      if (tokenType === 'SOL') {
        const instruction = SystemProgram.transfer({
          fromPubkey: this.provider.publicKey,
          toPubkey: new PublicKey(toAddress),
          lamports: amount * LAMPORTS_PER_SOL
        });
        transaction.add(instruction);
      } else {
        // TODO: Implement SPL token transfers
        throw new Error(`${tokenType} transfers not yet implemented`);
      }

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.provider.publicKey;

      const signedTransaction = await this.provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      await connection.confirmTransaction(signature);
      
      console.log('✅ Transaction successful:', signature);
      return { success: true, signature };
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Transaction failed' 
      };
    }
  }

  static getPublicKey(): string | null {
    return this.provider?.publicKey?.toString() || null;
  }

  static isWalletConnected(): boolean {
    return this.isConnected && !!this.provider?.publicKey;
  }

  static onAccountChange(callback: (publicKey: PublicKey | null) => void): void {
    if (!this.provider) return;
    
    this.provider.on('accountChanged', (publicKey) => {
      callback(publicKey);
    });
  }

  static onDisconnect(callback: () => void): void {
    if (!this.provider) return;
    
    this.provider.on('disconnect', callback);
  }
}
