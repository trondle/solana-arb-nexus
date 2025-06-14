
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface DashboardHeaderProps {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

const DashboardHeader = ({ connectionStatus }: DashboardHeaderProps) => {
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
  );
};

export default DashboardHeader;
