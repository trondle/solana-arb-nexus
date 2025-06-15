
import React from 'react';
import { WalletProvider } from '@/hooks/useWallet';
import WalletManager from '@/components/wallet/WalletManager';
import TransactionHistory from '@/components/wallet/TransactionHistory';
import { Separator } from '@/components/ui/separator';

const Wallet = () => {
  return (
    <WalletProvider>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Wallet Management</h1>
          <p className="text-muted-foreground mt-2">
            Connect your MetaMask wallet to deposit and withdraw crypto for arbitrage trading
          </p>
        </div>
        
        <Separator />
        
        <WalletManager />
        
        <TransactionHistory />
      </div>
    </WalletProvider>
  );
};

export default Wallet;
