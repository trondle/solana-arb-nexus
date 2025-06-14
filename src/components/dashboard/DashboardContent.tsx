
import { TabsContent } from '@/components/ui/tabs';
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

const DashboardContent = () => {
  return (
    <>
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
    </>
  );
};

export default DashboardContent;
