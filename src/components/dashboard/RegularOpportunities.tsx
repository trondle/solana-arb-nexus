
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Target } from 'lucide-react';

interface RegularOpportunitiesProps {
  regularOpportunities: any[];
  totalRegularProfit: number;
}

const RegularOpportunities = ({ regularOpportunities, totalRegularProfit }: RegularOpportunitiesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-500" />
          Regular Cross-Chain (Requires Capital)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {regularOpportunities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <div>No regular opportunities available</div>
            <div className="text-sm">Scanning for profitable cross-chain arbitrage...</div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 p-3 bg-green-50 rounded-lg">
              <div>
                <div className="text-2xl font-bold text-green-600">{regularOpportunities.length}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">${totalRegularProfit.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Profit</div>
              </div>
            </div>
            
            {regularOpportunities.slice(0, 3).map((opportunity) => (
              <div key={opportunity.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{opportunity.pair}</div>
                  <Badge variant="outline" className="text-green-600">
                    <Wallet className="w-3 h-3 mr-1" />
                    Regular
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {opportunity.fromChain} → {opportunity.toChain}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Capital: </span>
                    <span className="font-semibold">${opportunity.requiresCapital.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Spread: </span>
                    <span className="font-semibold text-green-600">{opportunity.spread.toFixed(2)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Net Profit: </span>
                    <span className="font-semibold text-green-600">${opportunity.netProfit.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegularOpportunities;
