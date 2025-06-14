
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap } from 'lucide-react';

interface BatchOpportunity {
  id: string;
  label: string;
  netProfit: number;
  canBatch: boolean;
}

interface Props {
  opportunities: BatchOpportunity[];
  maxBatch: number;
  onExecuteBatch: (opportunityIds: string[]) => void;
  isExecuting: boolean;
}

const BatchExecutionPanel: React.FC<Props> = ({ opportunities, maxBatch = 3, onExecuteBatch, isExecuting }) => {
  const [selectedOps, setSelectedOps] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    setSelectedOps((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < maxBatch
        ? [...prev, id]
        : prev
    );
  };

  const handleBatch = () => {
    if (selectedOps.length > 1) {
      onExecuteBatch(selectedOps);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Batch Transaction Execution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertDescription>
            Select up to {maxBatch} compatible opportunities to execute as a batch and save up to <b>60% on gas fees</b>.
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          {opportunities.slice(0, 6).map((opp) => (
            <div
              key={opp.id}
              className={`border rounded p-2 flex items-center justify-between cursor-pointer ${
                selectedOps.includes(opp.id) ? 'bg-blue-50 border-blue-400' : 'hover:bg-gray-50'
              }`}
              onClick={() => opp.canBatch && handleSelect(opp.id)}
            >
              <span className="font-semibold">{opp.label}</span>
              <div className="flex items-center gap-2">
                <Badge variant={opp.netProfit > 0 ? 'default' : 'destructive'}>
                  ${opp.netProfit.toFixed(2)}
                </Badge>
                {opp.canBatch && (
                  <input type="checkbox" checked={selectedOps.includes(opp.id)} readOnly />
                )}
                {!opp.canBatch && <Badge variant="secondary">Incompatible</Badge>}
              </div>
            </div>
          ))}
        </div>
        <Button
          disabled={selectedOps.length < 2 || isExecuting}
          onClick={handleBatch}
          className="w-full"
        >
          Execute Batch ({selectedOps.length})
        </Button>
        {isExecuting && (
          <div className="w-full mt-2">
            <Progress value={60} />
            <div className="text-xs text-muted-foreground mt-1">Executing batch...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchExecutionPanel;
