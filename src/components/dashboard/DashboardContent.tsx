
import { TabsContent } from '@/components/ui/tabs';
import ZeroCapitalArbitrage from './ZeroCapitalArbitrage';
import RiskManagement from './RiskManagement';
import TransactionSafetyValidator from './TransactionSafetyValidator';
import CircuitBreaker from './CircuitBreaker';
import ProfitOptimizer from './ProfitOptimizer';
import DynamicRiskAssessment from './risk/DynamicRiskAssessment';
import PreExecutionValidator from './risk/PreExecutionValidator';
import GraduatedLimits from './risk/GraduatedLimits';
import SimulationBacktesting from './risk/SimulationBacktesting';
import SafetyMechanisms from './risk/SafetyMechanisms';
import LiveMEVDashboard from './LiveMEVDashboard';
import FreeApiManager from './FreeApiManager';

const DashboardContent = () => {
  return (
    <div className="space-y-8">
      {/* Live MEV Dashboard - The main feature */}
      <LiveMEVDashboard />
      
      {/* Free API Manager - Your own price service */}
      <FreeApiManager />
      
      {/* Other existing components */}
      <TabsContent value="zero-capital">
        <ZeroCapitalArbitrage />
      </TabsContent>

      <TabsContent value="risk-management">
        <RiskManagement />
      </TabsContent>

      <TabsContent value="safety-validator">
        <TransactionSafetyValidator />
      </TabsContent>

      <TabsContent value="circuit-breaker">
        <CircuitBreaker />
      </TabsContent>

      <TabsContent value="profit-optimizer">
        <ProfitOptimizer />
      </TabsContent>

      <TabsContent value="dynamic-risk">
        <DynamicRiskAssessment />
      </TabsContent>

      <TabsContent value="pre-execution">
        <PreExecutionValidator />
      </TabsContent>

      <TabsContent value="graduated-limits">
        <GraduatedLimits />
      </TabsContent>

      <TabsContent value="simulation">
        <SimulationBacktesting />
      </TabsContent>

      <TabsContent value="safety-layers">
        <SafetyMechanisms />
      </TabsContent>
    </div>
  );
};

export default DashboardContent;
