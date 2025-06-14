
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface LiveModeWarningProps {
  showLiveModeWarning: boolean;
  setShowLiveModeWarning: (value: boolean) => void;
  selectedOpportunity: any;
  confirmLiveMode: () => void;
}

const LiveModeWarning = ({ showLiveModeWarning, setShowLiveModeWarning, selectedOpportunity, confirmLiveMode }: LiveModeWarningProps) => {
  if (!showLiveModeWarning) return null;

  return (
    <Card className="border-red-500 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          Live Cross-Chain Confirmation Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ WARNING:</strong> You are about to execute a live cross-chain flash loan arbitrage. This involves:
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Flash loan fees (~{selectedOpportunity?.flashLoanFee?.toFixed(2)} USD)</li>
              <li>Cross-chain bridge fees and timing risks</li>
              <li>Potential slippage and MEV competition</li>
              <li>Bridge failure or congestion risks</li>
            </ul>
          </AlertDescription>
        </Alert>
        <div className="flex gap-3">
          <Button 
            onClick={confirmLiveMode}
            variant="destructive"
            className="flex-1"
          >
            I Understand the Risks - Execute Live
          </Button>
          <Button 
            onClick={() => setShowLiveModeWarning(false)}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveModeWarning;
