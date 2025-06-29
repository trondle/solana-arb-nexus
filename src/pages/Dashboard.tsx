
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardTabs from '../components/dashboard/DashboardTabs';

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">MEV Arbitrage Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardTabs />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
