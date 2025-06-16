
import { WalletManager } from "@/components/wallet/WalletManager";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";
import TargetChainWalletManager from "@/components/wallet/TargetChainWalletManager";

const Wallet = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Wallet Management</h1>
        <p className="text-muted-foreground">
          Manage your multi-chain wallet for Base, Fantom, and Solana arbitrage trading
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <TargetChainWalletManager />
          <WalletManager />
        </div>
        <div>
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
};

export default Wallet;
