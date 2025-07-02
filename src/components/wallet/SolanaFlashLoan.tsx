import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FlashLoanContractService, FlashLoanParams } from '../../services/flashLoanContractService';
import { LiveTradingEngine } from '../../services/liveTradingEngine';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

interface SolanaFlashLoanProps {
  balance: {
    sol: number;
    usdc: number;
    usdt: number;
    totalUSD: number;
  };
  onBalanceUpdate: () => void;
  isEngineActive: boolean;
}

const SolanaFlashLoan: React.FC<SolanaFlashLoanProps> = ({ 
  balance, 
  onBalanceUpdate,
  isEngineActive 
}) => {
  const [loanAmount, setLoanAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('SOL');
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [executionProgress, setExecutionProgress] = useState(0);

  const calculateFee = (amount: number, provider: string = 'solend') => {
    return FlashLoanContractService.calculateFlashLoanFee(amount, provider);
  };

  const handleExecuteFlashLoan = async () => {
    if (!loanAmount || parseFloat(loanAmount) <= 0) {
      setError('Please enter a valid loan amount');
      return;
    }

    const amount = parseFloat(loanAmount);
    
    if (amount < 0.1) {
      setError('Minimum flash loan amount is 0.1 SOL');
      return;
    }

    if (amount > 1000) {
      setError('Maximum flash loan amount is 1000 SOL');
      return;
    }

    setIsExecuting(true);
    setError(null);
    setSuccess(null);
    setExecutionProgress(0);

    try {
      // Simulate execution progress
      const progressInterval = setInterval(() => {
        setExecutionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const flashLoanParams: FlashLoanParams = {
        amount,
        token: selectedToken as 'SOL' | 'USDC' | 'USDT',
        provider: 'SOLEND',
        collateralAmount: amount * 1.5, // 150% collateral ratio
        maxSlippage: 0.005
      };

      const result = await LiveTradingEngine.executeFlashLoanTrade(flashLoanParams);
      
      clearInterval(progressInterval);
      setExecutionProgress(100);

      if (result.status === 'closed' && result.realizedPnL > 0) {
        setSuccess(
          `Flash loan executed successfully! ` +
          `Profit: $${result.realizedPnL.toFixed(4)} | ` +
          `Fee: $${result.fees.toFixed(4)} | ` +
          `TX: ${result.txSignature?.slice(0, 8)}...`
        );
        await onBalanceUpdate();
      } else {
        setError(`Flash loan failed: ${result.realizedPnL < 0 ? 'No profitable arbitrage found' : 'Execution error'}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Flash loan execution failed');
      setExecutionProgress(0);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setExecutionProgress(0), 3000);
    }
  };

  const estimatedFee = loanAmount ? calculateFee(parseFloat(loanAmount), 'SOLEND') : 0;
  const estimatedProfit = loanAmount ? parseFloat(loanAmount) * 0.002 : 0; // ~0.2% profit estimate

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Solana Flash Loans
          <Badge variant="default" className="bg-yellow-500">Live</Badge>
          {isEngineActive && (
            <Badge variant="outline" className="border-green-500 text-green-600">
              Engine Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isEngineActive && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Trading engine is not active. Flash loans require active trading engine.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {executionProgress > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Executing Flash Loan...</span>
              <span>{executionProgress}%</span>
            </div>
            <Progress value={executionProgress} className="w-full" />
          </div>
        )}

        <div className="space-y-6">
          {/* Flash Loan Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loan Amount</Label>
              <Input
                type="number"
                placeholder="0.0"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                step="0.1"
                min="0.1"
                max="1000"
              />
              <p className="text-xs text-muted-foreground">
                Range: 0.1 - 1000 SOL
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Token</Label>
              <select 
                className="w-full px-3 py-2 border rounded-md"
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
              >
                <option value="SOL">SOL - Solana</option>
                <option value="USDC">USDC - USD Coin</option>
                <option value="USDT">USDT - Tether</option>
              </select>
            </div>
          </div>

          {/* Flash Loan Details */}
          {loanAmount && parseFloat(loanAmount) > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Loan Amount</span>
                </div>
                <div className="text-lg font-bold">{parseFloat(loanAmount).toFixed(2)} {selectedToken}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Flash Fee</span>
                </div>
                <div className="text-lg font-bold text-red-600">{estimatedFee.toFixed(4)} {selectedToken}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Est. Profit</span>
                </div>
                <div className="text-lg font-bold text-green-600">{estimatedProfit.toFixed(4)} {selectedToken}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <div className="text-lg font-bold">~3-5s</div>
              </div>
            </div>
          )}

          {/* Execution Button */}
          <Button 
            onClick={handleExecuteFlashLoan}
            disabled={
              !isEngineActive ||
              isExecuting || 
              !loanAmount || 
              parseFloat(loanAmount) < 0.1 ||
              parseFloat(loanAmount) > 1000
            }
            className="w-full bg-yellow-600 hover:bg-yellow-700"
            size="lg"
          >
            {isExecuting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Executing Flash Loan...
              </div>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Execute Flash Loan
              </>
            )}
          </Button>

          {/* Flash Loan Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Flash loans are executed instantly within a single transaction</div>
            <div>• No collateral required - loan must be repaid in same transaction</div>
            <div>• Used for arbitrage opportunities across Solana DEXs</div>
            <div>• Powered by Solend protocol with 0.09% flash loan fee</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolanaFlashLoan;