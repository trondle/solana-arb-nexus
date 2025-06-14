import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Target, 
  TrendingDown, 
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface BatchOpportunity {
  id: string;
  label: string;
  pair: string;
  netProfit: number;
  requiredCapital: number;
  provider: string;
  buyDex: string;
  sellDex: string;
  canBatch: boolean;
  estimatedGasSavings: number;
  batchGroup?: string;
}

interface Props {
  opportunities: BatchOpportunity[];
  maxBatch: number;
  onExecuteBatch: (opportunityIds: string[]) => void;
  isExecuting: boolean;
}

const BatchExecutionPanel: React.FC<Props> = ({ 
  opportunities, 
  maxBatch = 3, 
  onExecuteBatch, 
  isExecuting 
}) => {
  const [selectedOps, setSelectedOps] = useState<string[]>([]);

  // Intelligent batch grouping
  const batchGroups = useMemo(() => {
    const groups: { [key: string]: BatchOpportunity[] } = {};
    
    opportunities.forEach(op => {
      if (op.canBatch) {
        // Group by provider and similar DEX combination
        const groupKey = `${op.provider}-${op.buyDex}-${op.sellDex}`;
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push({ ...op, batchGroup: groupKey });
      }
    });
    
    // Only keep groups with 2+ opportunities
    return Object.entries(groups).filter(([_, ops]) => ops.length >= 2);
  }, [opportunities]);

  const selectedOpportunities = opportunities.filter(op => selectedOps.includes(op.id));
  const totalSelectedProfit = selectedOpportunities.reduce((sum, op) => sum + op.netProfit, 0);
  const totalGasSavings = selectedOpportunities.reduce((sum, op) => sum + op.estimatedGasSavings, 0);
  const canExecuteBatch = selectedOps.length >= 2 && selectedOps.length <= maxBatch;

  const handleSelect = (id: string) => {
    const opportunity = opportunities.find(op => op.id === id);
    if (!opportunity?.canBatch) return;

    setSelectedOps((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      
      if (prev.length >= maxBatch) {
        return prev; // Don't add if at max capacity
      }
      
      // Check compatibility with already selected
      const selectedBatchGroups = prev.map(selectedId => {
        const selectedOp = opportunities.find(op => op.id === selectedId);
        return selectedOp?.batchGroup;
      }).filter(Boolean);
      
      if (selectedBatchGroups.length > 0 && !selectedBatchGroups.includes(opportunity.batchGroup)) {
        return prev; // Don't add if not compatible
      }
      
      return [...prev, id];
    });
  };

  const handleBatch = () => {
    if (canExecuteBatch) {
      onExecuteBatch(selectedOps);
      setSelectedOps([]);
    }
  };

  const handleSelectOptimalBatch = (groupKey: string) => {
    const group = batchGroups.find(([key]) => key === groupKey)?.[1] || [];
    const topOps = group
      .sort((a, b) => b.netProfit - a.netProfit)
      .slice(0, maxBatch)
      .map(op => op.id);
    
    setSelectedOps(topOps);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Intelligent Batch Execution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Batch Overview */}
        <Alert className="border-blue-200 bg-blue-50">
          <BarChart3 className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div>
                <strong>Smart Batching:</strong> Execute up to {maxBatch} compatible opportunities 
                together to save <strong>60-70% on gas fees</strong>.
              </div>
              {batchGroups.length > 0 && (
                <div className="text-sm">
                  <strong>{batchGroups.length} batch groups</strong> available with 
                  <strong> {batchGroups.reduce((sum, [_, ops]) => sum + ops.length, 0)} total opportunities</strong>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>

        {/* Selected Batch Summary */}
        {selectedOps.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{selectedOps.length}</div>
                  <div className="text-sm text-muted-foreground">Selected Ops</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    ${totalSelectedProfit.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Profit</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    ${totalGasSavings.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Gas Savings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Batch Groups */}
        {batchGroups.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Available Batch Groups</h4>
              <Badge variant="outline">{batchGroups.length} Groups</Badge>
            </div>
            
            {batchGroups.map(([groupKey, groupOps]) => (
              <Card key={groupKey} className="border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-sm">
                        {groupOps[0].provider} • {groupOps[0].buyDex} → {groupOps[0].sellDex}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {groupOps.length} compatible opportunities
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectOptimalBatch(groupKey)}
                      disabled={isExecuting}
                    >
                      Select Best {Math.min(maxBatch, groupOps.length)}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {groupOps.slice(0, 4).map((opp) => (
                      <div
                        key={opp.id}
                        className={`border rounded p-2 flex items-center justify-between cursor-pointer transition-colors ${
                          selectedOps.includes(opp.id) 
                            ? 'bg-blue-50 border-blue-400' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleSelect(opp.id)}
                      >
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={selectedOps.includes(opp.id)} 
                            readOnly 
                          />
                          <div>
                            <div className="font-semibold text-sm">{opp.pair}</div>
                            <div className="text-xs text-muted-foreground">
                              Capital: ${opp.requiredCapital.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-xs">
                            ${opp.netProfit.toFixed(2)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Gas: ${opp.estimatedGasSavings.toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <div>No batchable opportunities available</div>
            <div className="text-sm">Opportunities need compatible providers and DEX routes</div>
          </div>
        )}

        {/* Individual Opportunities */}
        {opportunities.filter(op => !batchGroups.some(([_, groupOps]) => 
          groupOps.some(groupOp => groupOp.id === op.id)
        )).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Individual Opportunities</h4>
            <div className="grid grid-cols-1 gap-2">
              {opportunities
                .filter(op => !batchGroups.some(([_, groupOps]) => 
                  groupOps.some(groupOp => groupOp.id === op.id)
                ))
                .slice(0, 3)
                .map((opp) => (
                <div
                  key={opp.id}
                  className={`border rounded p-2 flex items-center justify-between ${
                    opp.canBatch ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50'
                  }`}
                  onClick={() => opp.canBatch && handleSelect(opp.id)}
                >
                  <div className="flex items-center gap-2">
                    {opp.canBatch && (
                      <input 
                        type="checkbox" 
                        checked={selectedOps.includes(opp.id)} 
                        readOnly 
                      />
                    )}
                    <span className="font-semibold text-sm">{opp.pair}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={opp.netProfit > 0 ? 'default' : 'destructive'} className="text-xs">
                      ${opp.netProfit.toFixed(2)}
                    </Badge>
                    {!opp.canBatch && <Badge variant="secondary" className="text-xs">Incompatible</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execution Button */}
        <div className="space-y-3">
          <Button
            disabled={!canExecuteBatch || isExecuting}
            onClick={handleBatch}
            className="w-full"
            size="lg"
          >
            {isExecuting ? (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                Executing Batch...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Execute Batch ({selectedOps.length}) - Save ${totalGasSavings.toFixed(2)}
              </div>
            )}
          </Button>
          
          {selectedOps.length > 0 && selectedOps.length < 2 && (
            <div className="text-sm text-muted-foreground text-center">
              Select at least 2 compatible opportunities to enable batch execution
            </div>
          )}
        </div>

        {/* Execution Progress */}
        {isExecuting && (
          <div className="space-y-2">
            <Progress value={60} />
            <div className="text-xs text-muted-foreground text-center">
              Optimizing gas fees and executing batch transaction...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchExecutionPanel;
