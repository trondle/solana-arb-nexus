
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

interface ExecutionProgressProps {
  isExecuting: boolean;
  isTestMode: boolean;
  currentStep: string;
  executionProgress: number;
}

const ExecutionProgress = ({ isExecuting, isTestMode, currentStep, executionProgress }: ExecutionProgressProps) => {
  if (!isExecuting) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 animate-pulse" />
          {isTestMode ? 'Testing Optimized Cross-Chain Flash Loan' : 'Executing Optimized Cross-Chain Flash Loan'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{currentStep}</span>
            <span>{executionProgress}%</span>
          </div>
          <Progress value={executionProgress} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutionProgress;
