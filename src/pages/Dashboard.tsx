import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
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
import RegulatoryCompliance from '@/components/dashboard/RegulatoryCompliance';
import EmergencyExit from '@/components/dashboard/EmergencyExit';
import ColdStorageIntegration from '@/components/dashboard/ColdStorageIntegration';
import ZeroCapitalArbitrage from '@/components/dashboard/ZeroCapitalArbitrage';
import { Activity, TrendingUp, Calculator, Settings, Brain, Cpu, Shield, Zap, Hammer, Network, Target, RefreshCw, Fuel, Sparkles, AlertTriangle, ZapOff, Scan, Bot, FileText, TrendingDown, HardDrive, CircleDollarSign } from 'lucide-react';

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
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Trading Dashboard</h2>
            <p className="text-muted-foreground mt-1">Real-time monitoring and execution of arbitrage opportunities</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse`}></div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {connectionStatus === 'connected' ? 'Connected to DEXs' : connectionStatus === 'disconnected' ? 'Disconnected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="zero-capital" className="space-y-6">
          <TabsList className="grid w-full grid-cols-12 lg:grid-cols-22">
            <TabsTrigger value="zero-capital" className="flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4" />
              Zero Capital
            </TabsTrigger>
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
            <TabsTrigger value="regulatory" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Regulatory
            </TabsTrigger>
            <TabsTrigger value="emergency-exit" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Emergency Exit
            </TabsTrigger>
            <TabsTrigger value="cold-storage" className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Cold Storage
            </TabsList>

          <TabsContent value="zero-capital" className="space-y-6">
            <ZeroCapitalArbitrage />
          </TabsContent>

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

          <TabsContent value="regulatory" className="space-y-6">
            <RegulatoryCompliance />
          </TabsContent>

          <TabsContent value="emergency-exit" className="space-y-6">
            <EmergencyExit />
          </TabsContent>

          <TabsContent value="cold-storage" className="space-y-6">
            <ColdStorageIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
