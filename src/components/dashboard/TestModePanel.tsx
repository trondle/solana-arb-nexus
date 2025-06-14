
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube, Zap, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestModePanelProps {
  isTestMode: boolean;
  setIsTestMode: (value: boolean) => void;
  testStats: {
    totalTests: number;
    successfulTests: number;
    totalProfit: number;
    liveModeUnlocked: boolean;
  };
  flashLoanOpportunities: any[];
}

const TestModePanel = ({ isTestMode, setIsTestMode, testStats, flashLoanOpportunities }: TestModePanelProps) => {
  const { toast } = useToast();

  return (
    <Card className={`border-2 ${isTestMode ? 'border-blue-500' : 'border-orange-500'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isTestMode ? <TestTube className="w-5 h-5 text-blue-500" /> : <Zap className="w-5 h-5 text-orange-500" />}
            Cross-Chain Flash Loan {isTestMode ? 'Testing' : 'Live Trading'}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Test Mode</Label>
              <Switch 
                checked={isTestMode}
                onCheckedChange={(checked) => {
                  if (!checked && !testStats.liveModeUnlocked) {
                    toast({
                      title: "Live Mode Locked",
                      description: "Complete 5+ test runs with 80%+ success rate to unlock live trading.",
                      variant: "destructive"
                    });
                    return;
                  }
                  setIsTestMode(checked);
                }}
                disabled={!testStats.liveModeUnlocked && !isTestMode}
              />
              <Label>Live Mode</Label>
              {!testStats.liveModeUnlocked && <Lock className="w-4 h-4 text-gray-500" />}
              {testStats.liveModeUnlocked && <Unlock className="w-4 h-4 text-green-500" />}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className={isTestMode ? "border-blue-200 bg-blue-50" : "border-orange-200 bg-orange-50"}>
          {isTestMode ? <TestTube className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <AlertDescription>
            {isTestMode ? (
              <div>
                <strong>Safe Cross-Chain Testing:</strong> All flash loan and bridge operations are simulated. 
                Perfect for learning cross-chain arbitrage without any risk.
              </div>
            ) : (
              <div>
                <strong>⚠️ LIVE CROSS-CHAIN MODE:</strong> Real cross-chain flash loans with actual bridge fees and timing risks.
              </div>
            )}
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{testStats.totalTests}</div>
            <div className="text-sm text-muted-foreground">Test Runs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {testStats.totalTests > 0 ? 
                ((testStats.successfulTests / testStats.totalTests) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              ${testStats.totalTests > 0 ? (testStats.totalProfit / testStats.totalTests).toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-muted-foreground">Avg Profit</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {flashLoanOpportunities.length}
            </div>
            <div className="text-sm text-muted-foreground">Available</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestModePanel;
