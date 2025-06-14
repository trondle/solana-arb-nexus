
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { BarChart3, Activity, Wifi, AlertCircle } from 'lucide-react';

interface DEXStatus {
  name: string;
  connected: boolean;
  latency: number;
  opportunities: number;
  liquidity: number;
  successRate: number;
  fees: number;
}

interface MultiDEXMonitorProps {
  onDEXCountChange: (count: number) => void;
}

const MultiDEXMonitor = ({ onDEXCountChange }: MultiDEXMonitorProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dexes, setDexes] = useState<DEXStatus[]>([
    { name: 'Raydium', connected: true, latency: 120, opportunities: 8, liquidity: 850000, successRate: 96, fees: 0.25 },
    { name: 'Orca', connected: true, latency: 95, opportunities: 12, liquidity: 720000, successRate: 94, fees: 0.30 },
    { name: 'Jupiter', connected: true, latency: 110, opportunities: 6, liquidity: 950000, successRate: 92, fees: 0.20 },
    { name: 'Serum', connected: true, latency: 140, opportunities: 4, liquidity: 420000, successRate: 88, fees: 0.35 },
    { name: 'Aldrin', connected: false, latency: 180, opportunities: 3, liquidity: 280000, successRate: 85, fees: 0.40 },
    { name: 'Saber', connected: true, latency: 130, opportunities: 7, liquidity: 340000, successRate: 90, fees: 0.28 },
    { name: 'Mercurial', connected: true, latency: 150, opportunities: 5, liquidity: 180000, successRate: 87, fees: 0.32 },
    { name: 'Crema', connected: false, latency: 200, opportunities: 2, liquidity: 150000, successRate: 82, fees: 0.45 }
  ]);

  const connectedDEXes = dexes.filter(dex => dex.connected);
  const totalOpportunities = connectedDEXes.reduce((sum, dex) => sum + dex.opportunities, 0);
  const averageLatency = connectedDEXes.reduce((sum, dex) => sum + dex.latency, 0) / connectedDEXes.length;

  useEffect(() => {
    onDEXCountChange(connectedDEXes.length);
    
    const interval = setInterval(() => {
      setDexes(prev => prev.map(dex => ({
        ...dex,
        latency: dex.connected ? dex.latency + (Math.random() - 0.5) * 20 : dex.latency,
        opportunities: dex.connected ? Math.max(0, dex.opportunities + Math.floor((Math.random() - 0.5) * 4)) : dex.opportunities,
        liquidity: dex.connected ? dex.liquidity * (0.95 + Math.random() * 0.1) : dex.liquidity
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [connectedDEXes.length, onDEXCountChange]);

  const toggleDEX = (dexName: string) => {
    setDexes(prev => prev.map(dex => 
      dex.name === dexName ? { ...dex, connected: !dex.connected } : dex
    ));
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-green-500';
    if (latency < 150) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Multi-DEX Monitor
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {connectedDEXes.length}/8 Connected
            </Badge>
            <Switch
              checked={isExpanded}
              onCheckedChange={setIsExpanded}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-500">{totalOpportunities}</div>
            <div className="text-sm text-muted-foreground">Total Opportunities</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">{averageLatency.toFixed(0)}ms</div>
            <div className="text-sm text-muted-foreground">Avg Latency</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-500">
              ${(connectedDEXes.reduce((sum, dex) => sum + dex.liquidity, 0) / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-muted-foreground">Total Liquidity</div>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3">
            {dexes.map((dex) => (
              <div key={dex.name} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={dex.connected}
                      onCheckedChange={() => toggleDEX(dex.name)}
                    />
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${dex.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-semibold">{dex.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dex.connected ? (
                      <Activity className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>

                {dex.connected && (
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Latency</div>
                      <div className={`font-semibold ${getLatencyColor(dex.latency)}`}>
                        {dex.latency.toFixed(0)}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Opportunities</div>
                      <div className="font-semibold text-blue-500">{dex.opportunities}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Liquidity</div>
                      <div className="font-semibold">${(dex.liquidity / 1000).toFixed(0)}K</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Success Rate</div>
                      <div className="font-semibold text-green-500">{dex.successRate}%</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1">MONITORING FEATURES</div>
          <div className="grid grid-cols-2 gap-1">
            <div>• Cross-DEX price comparison</div>
            <div>• Liquidity depth analysis</div>
            <div>• Real-time opportunity scoring</div>
            <div>• Multi-hop arbitrage detection</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiDEXMonitor;
