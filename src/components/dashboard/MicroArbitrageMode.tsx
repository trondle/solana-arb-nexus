
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DollarSign, 
  TrendingDown, 
  Shield, 
  GraduationCap,
  Info,
  Zap,
  Target,
  Clock
} from 'lucide-react';

interface MicroArbitrageModeProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  onModeChange: (mode: string) => void;
  opportunities: any[];
  onExecute: (opportunity: any) => void;
}

const MicroArbitrageMode = ({ 
  isActive, 
  onToggle, 
  onModeChange,
  opportunities,
  onExecute 
}: MicroArbitrageModeProps) => {
  const [selectedMode, setSelectedMode] = useState('beginner');

  const microOpportunities = opportunities.filter(opp => 
    opp.requiresCapital <= 1000 && 
    opp.totalFees <= 10
  );

  const modes = {
    beginner: {
      name: 'Beginner Mode',
      icon: <GraduationCap className="w-4 h-4" />,
      description: 'Capital < $1,000, fees < $10, high confidence only',
      color: 'bg-green-50 border-green-200',
      maxCapital: 1000,
      maxFees: 10,
      minConfidence: 80
    },
    riskAverse: {
      name: 'Risk-Averse Mode',
      icon: <Shield className="w-4 h-4" />,
      description: 'Low risk only, proven chains, conservative returns',
      color: 'bg-blue-50 border-blue-200',
      maxCapital: 2000,
      maxFees: 20,
      minConfidence: 85
    },
    gasEfficient: {
      name: 'Gas-Efficient Mode',
      icon: <Zap className="w-4 h-4" />,
      description: 'L2 chains only, minimal gas fees, fast execution',
      color: 'bg-purple-50 border-purple-200',
      maxCapital: 1500,
      maxFees: 15,
      minConfidence: 75
    }
  };

  const currentMode = modes[selectedMode as keyof typeof modes];

  const filteredOpportunities = microOpportunities.filter(opp => {
    return opp.requiresCapital <= currentMode.maxCapital &&
           opp.totalFees <= currentMode.maxFees &&
           opp.confidence >= currentMode.minConfidence;
  });

  return (
    <Card className={`${isActive ? 'border-2 border-green-500' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Micro-Arbitrage Mode
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Perfect for beginners with low budgets.<br/>
                  Focus on small, safe trades to build experience.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Label>Enable Micro Mode</Label>
            <Switch 
              checked={isActive}
              onCheckedChange={onToggle}
            />
          </div>
        </CardTitle>
      </CardHeader>
      
      {isActive && (
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <GraduationCap className="h-4 w-4" />
            <AlertDescription>
              <strong>Micro-Arbitrage Active:</strong> Only showing opportunities perfect for beginners.
              Low capital requirements, minimal fees, and educational guidance included.
            </AlertDescription>
          </Alert>

          {/* Mode Selection */}
          <div className="space-y-2">
            <Label>Trading Mode</Label>
            <Select value={selectedMode} onValueChange={(value) => {
              setSelectedMode(value);
              onModeChange(value);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(modes).map(([key, mode]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {mode.icon}
                      {mode.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{currentMode.description}</p>
          </div>

          {/* Mode Info Card */}
          <Card className={currentMode.color}>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    ${currentMode.maxCapital}
                  </div>
                  <div className="text-xs text-muted-foreground">Max Capital</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${currentMode.maxFees}
                  </div>
                  <div className="text-xs text-muted-foreground">Max Fees</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {currentMode.minConfidence}%
                  </div>
                  <div className="text-xs text-muted-foreground">Min Confidence</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Perfect Micro-Opportunities</h4>
              <Badge variant="outline">{filteredOpportunities.length} Available</Badge>
            </div>

            {filteredOpportunities.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <div>No micro-opportunities match your current mode</div>
                <div className="text-sm">Try switching to a different mode or wait for new opportunities</div>
              </div>
            ) : (
              filteredOpportunities.slice(0, 5).map((opportunity) => (
                <Card key={opportunity.id} className="border border-green-200 bg-green-50/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {opportunity.pair}
                          <Badge variant="outline" className="text-green-600">
                            MICRO
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {opportunity.fromChain} → {opportunity.toChain}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          ${opportunity.netProfit.toFixed(2)} profit
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {((opportunity.netProfit / opportunity.requiresCapital) * 100).toFixed(1)}% ROI
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div className="flex justify-between">
                        <span>Capital:</span>
                        <span className="font-semibold">${opportunity.requiresCapital}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Fees:</span>
                        <span className="font-semibold text-red-500">${opportunity.totalFees.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="font-semibold text-blue-500">{opportunity.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span className="font-semibold">{(opportunity.executionTime / 1000).toFixed(1)}s</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {opportunity.riskLevel.toUpperCase()} RISK
                        </Badge>
                        {opportunity.flashLoanEnabled && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            FLASH LOAN
                          </Badge>
                        )}
                      </div>
                      <Button 
                        onClick={() => onExecute(opportunity)}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Execute Micro Trade
                      </Button>
                    </div>

                    {/* Educational Tip */}
                    <Alert className="mt-3 border-blue-200 bg-blue-50">
                      <Info className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        <strong>💡 Tip:</strong> This trade uses {opportunity.fromChain} and {opportunity.toChain} - 
                        both excellent for beginners due to low fees and high reliability.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Educational Section */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Beginner Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex items-start gap-2">
                <TrendingDown className="w-3 h-3 text-green-500 mt-0.5" />
                <span><strong>Start Small:</strong> Begin with $100-$500 trades to learn the process risk-free</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-3 h-3 text-blue-500 mt-0.5" />
                <span><strong>Use L2 Chains:</strong> Base and Fantom offer the lowest fees for small trades</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3 h-3 text-purple-500 mt-0.5" />
                <span><strong>Time Your Trades:</strong> Execute during low network congestion for better fees</span>
              </div>
              <div className="flex items-start gap-2">
                <Target className="w-3 h-3 text-orange-500 mt-0.5" />
                <span><strong>Focus on ROI:</strong> 2-5% returns are excellent for micro-arbitrage</span>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      )}
    </Card>
  );
};

export default MicroArbitrageMode;
