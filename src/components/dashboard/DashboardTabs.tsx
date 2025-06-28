
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardContent from "./DashboardContent";
import PriceTracker from "./PriceTracker";
import ArbitrageOpportunities from "./ArbitrageOpportunities";
import MultiChainAIDashboard from "./MultiChainAIDashboard";
import AnalyticsDashboard from "./AnalyticsDashboard";
import LiveModeControl from "./LiveModeControl";
import LiveFeedApiPanel from "./LiveFeedApiPanel";
import WalletDashboard from "../wallet/WalletDashboard";

const DashboardTabs = () => {
  return (
    <div className="space-y-6">
      {/* Live Mode Control */}
      <LiveModeControl />
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="prices">Live Prices</TabsTrigger>
          <TabsTrigger value="arbitrage">Opportunities</TabsTrigger>
          <TabsTrigger value="multichain">Multi-Chain AI</TabsTrigger>
          <TabsTrigger value="api">Live Feed API</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <DashboardContent />
        </TabsContent>
        
        <TabsContent value="wallet">
          <WalletDashboard />
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
        
        <TabsContent value="api">
          <LiveFeedApiPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;
