
import { useState, useEffect } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import DashboardContent from '@/components/dashboard/DashboardContent';

const Dashboard = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const { logAction } = useAuth();

  useEffect(() => {
    // Log dashboard access
    logAction('dashboard_accessed');
    
    // Simulate connection status
    const timer = setTimeout(() => {
      setConnectionStatus('connected');
      logAction('dex_connection_established');
    }, 2000);

    return () => clearTimeout(timer);
  }, [logAction]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-6 space-y-6">
        <DashboardHeader connectionStatus={connectionStatus} />

        <Tabs defaultValue="zero-capital" className="space-y-6">
          <DashboardTabs />
          <DashboardContent />
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
