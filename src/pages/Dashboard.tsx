
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PriceTracker from '@/components/dashboard/PriceTracker';
import ArbitrageOpportunities from '@/components/dashboard/ArbitrageOpportunities';
import ProfitCalculator from '@/components/dashboard/ProfitCalculator';
import ConfigurationPanel from '@/components/dashboard/ConfigurationPanel';
import OpportunityDetectionEngine from '@/components/dashboard/OpportunityDetectionEngine';
import DetectionAlgorithms from '@/components/dashboard/DetectionAlgorithms';
import { Activity, TrendingUp, Calculator, Settings, Brain, Cpu } from 'lucide-react';

const Dashboard = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  useEffect(() => {
    // Simulate connection status
    const timer = setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-500';
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Solana MEV Arbitrage Dashboard</h1>
            <p className="text-muted-foreground mt-2">Real-time monitoring and execution of arbitrage opportunities</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse`}></div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'disconnected' ? 'Disconnected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="monitoring" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Price Monitoring
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="detection" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Detection Engine
            </TabsTrigger>
            <TabsTrigger value="algorithms" className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Algorithms
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-6">
            <PriceTracker />
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <ArbitrageOpportunities />
          </TabsContent>

          <TabsContent value="detection" className="space-y-6">
            <OpportunityDetectionEngine />
          </TabsContent>

          <TabsContent value="algorithms" className="space-y-6">
            <DetectionAlgorithms />
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <ProfitCalculator />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <ConfigurationPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
