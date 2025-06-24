
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlayCircle, StopCircle, Target, TrendingUp, Shield, Activity } from 'lucide-react';

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

const TestModePanel = ({ 
  isTestMode, 
  setIsTestMode, 
  testStats,
  flashLoanOpportunities 
}: TestModePanelProps) => {
  const successRate = testStats.totalTests > 0 ? 
    (testStats.successfulTests / testStats.totalTests) * 100 : 0;

  const liveOpportunityCount = flashLoanOpportunities.filter(opp => opp.isLive).length;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Live Trading Mode Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live Mode Toggle */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <Label htmlFor="test-mode" className="font-semibold">
              {isTestMode ? 'Test Mode (Safe)' : 'Live Trading Mode'}
            </Label>
            <div className="text-sm text-muted-foreground">
              {isTestMode ? 
                'Execute trades with simulated capital only' : 
                'Execute trades with real capital - LIVE TRADING'
              }
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              id="test-mode"
              checked={!isTestMode}
              onCheckedChange={(checked) => setIsTestMode(!checked)}
            />
            <Badge variant={isTestMode ? 'secondary' : 'destructive'}>
              {isTestMode ? 'TEST' : 'LIVE'}
            </Badge>
          </div>
        </div>

        {/* Live Data Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Live Data Status</span>
            <Badge variant="default" className="bg-green-500">
              <Activity className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {liveOpportunityCount} live flash loan opportunities detected
          </div>
        </div>

        {/* Test Statistics (only show in test mode) */}
        {isTestMode && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Test Session Statistics</div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Total Tests</div>
                <div className="font-semibold">{testStats.totalTests}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Successful</div>
                <div className="font-semibold text-green-600">{testStats.successfulTests}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Success Rate</div>
                <div className="font-semibold">{successRate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Test Profit</div>
                <div className="font-semibold text-green-600">${testStats.totalProfit.toFixed(2)}</div>
              </div>
            </div>

            {testStats.totalTests > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Success Rate Progress</span>
                  <span>{successRate.toFixed(1)}%</span>
                </div>
                <Progress value={successRate} className="h-2" />
              </div>
            )}
          </div>
        )}

        {/* Live Mode Warning */}
        {!isTestMode && (
          <Alert className="border-red-200 bg-red-50">
            <Shield className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>LIVE TRADING MODE ACTIVE</strong><br />
              All executions will use real capital and incur actual costs. 
              Monitor positions carefully and ensure adequate risk management.
            </AlertDescription>
          </Alert>
        )}

        {/* Live Opportunity Actions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className={`flex-1 ${isTestMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'}`}
              disabled={liveOpportunityCount === 0}
            >
              {isTestMode ? (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Test Live Data
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Execute Live
                </>
              )}
            </Button>
          </div>
          
          <div className="text-xs text-center text-muted-foreground">
            {liveOpportunityCount > 0 ? 
              `${liveOpportunityCount} live opportunities ready for ${isTestMode ? 'testing' : 'execution'}` :
              'Waiting for profitable live opportunities...'
            }
          </div>
        </div>

        {/* Live Mode Unlock Progress (only in test mode) */}
        {isTestMode && !testStats.liveModeUnlocked && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-semibold text-blue-800 mb-2">
              Live Mode Requirements
            </div>
            <div className="space-y-1 text-xs text-blue-700">
              <div className="flex justify-between">
                <span>Minimum successful tests (10)</span>
                <span>{Math.min(testStats.successfulTests, 10)}/10</span>
              </div>
              <div className="flex justify-between">
                <span>Success rate requirement (80%)</span>
                <span>{successRate >= 80 ? '✓' : `${successRate.toFixed(1)}%`}</span>
              </div>
              <div className="flex justify-between">
                <span>Live data connection</span>
                <span>✓</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestModePanel;
