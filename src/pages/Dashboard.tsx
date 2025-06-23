
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import { PersonalApiService } from '@/services/personalApiService';
import { SecureConfigManager } from '@/services/secureConfigManager';

const Dashboard = () => {
  const { user, userRole } = useAuth();

  useEffect(() => {
    // Initialize services on dashboard load
    const initializeServices = async () => {
      try {
        // Load saved API configuration
        const savedConfig = SecureConfigManager.loadApiKeys();
        if (Object.keys(savedConfig).length > 0) {
          PersonalApiService.setConfig(savedConfig);
          console.log('✓ API services initialized with saved configuration');
        }

        // Check API health
        const health = await PersonalApiService.healthCheck();
        console.log('API Health Status:', health);
      } catch (error) {
        console.error('Error initializing dashboard services:', error);
      }
    };

    if (user) {
      initializeServices();
    }
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Solana MEV Arbitrage Nexus
          </h1>
          <p className="text-slate-600 mb-4">
            Live cross-chain arbitrage with Jupiter, Base & Fantom integration
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600">Live Trading Active</span>
            </div>
            <div className="text-sm text-slate-500">
              User: {user.email} | Role: {userRole}
            </div>
          </div>
        </div>

        <DashboardTabs />
      </div>
    </div>
  );
};

export default Dashboard;
