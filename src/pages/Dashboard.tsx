import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PriceTracker from '@/components/dashboard/PriceTracker';
import ArbitrageOpportunities from '@/components/dashboard/ArbitrageOpportunities';
import ProfitCalculator from '@/components/dashboard/ProfitCalculator';
import ConfigurationPanel from '@/components/dashboard/ConfigurationPanel';
import OpportunityDetectionEngine from '@/components/dashboard/OpportunityDetectionEngine';
import DetectionAlgorithms from '@/components/dashboard/DetectionAlgorithms';
import TransactionSafetyValidator from '@/components/dashboard/TransactionSafetyValidator';
import FlashLoanProcessor from '@/components/dashboard/FlashLoanProcessor';
import MEVTransactionBuilder from '@/components/dashboard/MEVTransactionBuilder';
import ExecutionRelayNetwork from '@/components/dashboard/ExecutionRelayNetwork';
import ProfitOptimizer from '@/components/dashboard/ProfitOptimizer';
import AutoUpgradeSystem from '@/components/dashboard/AutoUpgradeSystem';
import GasOptimizer from '@/components/dashboard/GasOptimizer';
import AIPredictionEngine from '@/components/dashboard/AIPredictionEngine';
import RiskManagement from '@/components/dashboard/RiskManagement';
import CircuitBreaker from '@/components/dashboard/CircuitBreaker';
import AdvancedValidation from '@/components/dashboard/AdvancedValidation';
import ThreatDetection from '@/components/dashboard/ThreatDetection';
import { Activity, TrendingUp, Calculator, Settings, Brain, Cpu, Shield, Zap, Hammer, Network, Target, RefreshCw, Fuel, Sparkles, AlertTriangle, ZapOff, Scan, Bot } from 'lucide-react';

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
          <TabsList className="grid w-full grid-cols-12 lg:grid-cols-18">
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
            <TabsTrigger value="ai-prediction" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Prediction
            </TabsTrigger>
            <TabsTrigger value="risk-management" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Management
            </TabsTrigger>
            <TabsTrigger value="gas-optimizer" className="flex items-center gap-2">
              <Fuel className="w-4 h-4" />
              Gas Optimizer
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Safety Validator
            </TabsTrigger>
            <TabsTrigger value="flashloan" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Flash Loans
            </TabsTrigger>
            <TabsTrigger value="mev-builder" className="flex items-center gap-2">
              <Hammer className="w-4 h-4" />
              MEV Builder
            </TabsTrigger>
            <TabsTrigger value="relay-network" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Relay Network
            </TabsTrigger>
            <TabsTrigger value="optimizer" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Profit Optimizer
            </TabsTrigger>
            <TabsTrigger value="auto-upgrade" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Auto-Upgrade
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="circuit-breaker" className="flex items-center gap-2">
              <ZapOff className="w-4 h-4" />
              Circuit Breaker
            </TabsTrigger>
            <TabsTrigger value="advanced-validation" className="flex items-center gap-2">
              <Scan className="w-4 h-4" />
              Advanced Validation
            </TabsTrigger>
            <TabsTrigger value="threat-detection" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Threat Detection
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

          <TabsContent value="ai-prediction" className="space-y-6">
            <AIPredictionEngine />
          </TabsContent>

          <TabsContent value="risk-management" className="space-y-6">
            <RiskManagement />
          </TabsContent>

          <TabsContent value="gas-optimizer" className="space-y-6">
            <GasOptimizer />
          </TabsContent>

          <TabsContent value="safety" className="space-y-6">
            <TransactionSafetyValidator />
          </TabsContent>

          <TabsContent value="flashloan" className="space-y-6">
            <FlashLoanProcessor />
          </TabsContent>

          <TabsContent value="mev-builder" className="space-y-6">
            <MEVTransactionBuilder />
          </TabsContent>

          <TabsContent value="relay-network" className="space-y-6">
            <ExecutionRelayNetwork />
          </TabsContent>

          <TabsContent value="optimizer" className="space-y-6">
            <ProfitOptimizer />
          </TabsContent>

          <TabsContent value="auto-upgrade" className="space-y-6">
            <AutoUpgradeSystem />
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <ProfitCalculator />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <ConfigurationPanel />
          </TabsContent>

          <TabsContent value="circuit-breaker" className="space-y-6">
            <CircuitBreaker />
          </TabsContent>

          <TabsContent value="advanced-validation" className="space-y-6">
            <AdvancedValidation />
          </TabsContent>

          <TabsContent value="threat-detection" className="space-y-6">
            <ThreatDetection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
