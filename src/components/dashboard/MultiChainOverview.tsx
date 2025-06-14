
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Zap } from 'lucide-react';
import { ChainConfig } from '@/hooks/useMultiChainManager';

interface MultiChainOverviewProps {
  enabledChains: ChainConfig[];
  crossChainOpportunities: any[];
  flashLoanOpportunities: any[];
  totalFlashLoanProfit: number;
  totalRegularProfit: number;
  chains: ChainConfig[];
  flashLoanMode: boolean;
  setFlashLoanMode: (value: boolean) => void;
  toggleChain: (chainId: string) => void;
}

const MultiChainOverview = ({ 
  enabledChains, 
  crossChainOpportunities, 
  flashLoanOpportunities, 
  totalFlashLoanProfit, 
  totalRegularProfit,
  chains,
  flashLoanMode,
  setFlashLoanMode,
  toggleChain
}: MultiChainOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Multi-Chain Arbitrage Hub
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{enabledChains.length}</div>
            <div className="text-sm text-muted-foreground">Active Chains</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{crossChainOpportunities.length}</div>
            <div className="text-sm text-muted-foreground">Cross-Chain Opportunities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">{flashLoanOpportunities.length}</div>
            <div className="text-sm text-muted-foreground">Flash Loan Opportunities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              ${(totalFlashLoanProfit + totalRegularProfit).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Total Potential Profit</div>
          </div>
        </div>

        {/* Flash Loan Mode Toggle */}
        <Alert className="mb-4">
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Flash Loan Cross-Chain Arbitrage:</strong> Execute cross-chain arbitrage with zero capital requirement.
                Flash loans enable massive capital efficiency for cross-chain opportunities.
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Label htmlFor="flash-mode">Enable Flash Loans</Label>
                <Switch 
                  id="flash-mode"
                  checked={flashLoanMode}
                  onCheckedChange={setFlashLoanMode}
                />
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Chain Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chains.map((chain) => (
            <div 
              key={chain.id} 
              className={`border rounded-lg p-4 ${chain.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{chain.name}</div>
                  <Badge variant={chain.enabled ? 'default' : 'secondary'}>
                    {chain.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <Switch 
                  checked={chain.enabled}
                  onCheckedChange={() => toggleChain(chain.id)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Gas Cost: </span>
                  <span className="font-semibold">${chain.gasCost.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Block Time: </span>
                  <span className="font-semibold">{chain.blockTime}ms</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Flash Providers: </span>
                  <span className="font-semibold">{chain.flashLoanProviders.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">DEXes: </span>
                  <span className="font-semibold">{chain.dexes.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiChainOverview;
