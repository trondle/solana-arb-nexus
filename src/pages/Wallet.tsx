
import React from 'react';
import WalletDashboard from '../components/wallet/WalletDashboard';
import Header from '../components/layout/Header';

const Wallet = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        <WalletDashboard />
      </main>
    </div>
  );
};

export default Wallet;
