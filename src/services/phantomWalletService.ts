
import { PublicKey, Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

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
  private static connection = new Connection('https://solana-api.projectserum.com', 'confirmed');
  private static provider: PhantomProvider | null = null;
  private static isConnected = false;

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
      // Get SOL balance
      const solBalance = await this.connection.getBalance(this.provider.publicKey);
      const sol = solBalance / LAMPORTS_PER_SOL;

      // Get USDC balance (placeholder - would need actual token account checking)
      const usdc = 0; // TODO: Implement SPL token balance fetching
      const usdt = 0; // TODO: Implement SPL token balance fetching

      // Calculate total USD value (SOL price ~$100)
      const totalUSD = sol * 100 + usdc + usdt;

      return { sol, usdc, usdt, totalUSD };
    } catch (error) {
      console.error('❌ Failed to fetch wallet balance:', error);
      throw new Error('Failed to fetch wallet balance');
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

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.provider.publicKey;

      const signedTransaction = await this.provider.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      await this.connection.confirmTransaction(signature);
      
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
