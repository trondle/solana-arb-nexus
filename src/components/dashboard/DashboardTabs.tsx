import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardContent from './DashboardContent';
import UltraLowCapitalDashboard from './UltraLowCapitalDashboard';
import MicroMevDashboard from './MicroMevDashboard';

const DashboardTabs = () => {
  return (
    <Tabs defaultValue="main" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="main">Main Dashboard</TabsTrigger>
        <TabsTrigger value="ultra-low">Ultra-Low Capital ($20)</TabsTrigger>
        <TabsTrigger value="micro-mev">Micro-MEV Engine</TabsTrigger>
      </TabsList>
      
      <TabsContent value="main" className="space-y-6">
        <DashboardContent />
      </TabsContent>
      
      <TabsContent value="ultra-low" className="space-y-6">
        <UltraLowCapitalDashboard />
      </TabsContent>
      
      <TabsContent value="micro-mev" className="space-y-6">
        <MicroMevDashboard />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
