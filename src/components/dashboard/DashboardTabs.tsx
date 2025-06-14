
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, Calculator, Settings, Brain, Cpu, Shield, Zap, Hammer, Network, Target, RefreshCw, Fuel, Sparkles, AlertTriangle, ZapOff, Scan, Bot, FileText, TrendingDown, HardDrive, CircleDollarSign } from 'lucide-react';

const DashboardTabs = () => {
  return (
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
      </TabsTrigger>
    </TabsList>
  );
};

export default DashboardTabs;
