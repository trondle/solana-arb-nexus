
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardContent from "./DashboardContent";
import PriceTracker from "./PriceTracker";
import ArbitrageOpportunities from "./ArbitrageOpportunities";
import MultiChainAIDashboard from "./MultiChainAIDashboard";
import AnalyticsDashboard from "./AnalyticsDashboard";

const DashboardTabs = () => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="prices">Live Prices</TabsTrigger>
        <TabsTrigger value="arbitrage">Opportunities</TabsTrigger>
        <TabsTrigger value="multichain">Multi-Chain AI</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <DashboardContent />
      </TabsContent>
      
      <TabsContent value="analytics">
        <AnalyticsDashboard />
      </TabsContent>
      
      <TabsContent value="prices">
        <PriceTracker />
      </TabsContent>
      
      <TabsContent value="arbitrage">
        <ArbitrageOpportunities />
      </TabsContent>
      
      <TabsContent value="multichain">
        <MultiChainAIDashboard />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
