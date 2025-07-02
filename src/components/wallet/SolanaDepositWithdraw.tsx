import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PhantomWalletService, TransactionResult } from '../../services/phantomWalletService';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Send
} from 'lucide-react';

interface SolanaDepositWithdrawProps {
  balance: {
    sol: number;
    usdc: number;
    usdt: number;
    totalUSD: number;
  };
  onBalanceUpdate: () => void;
}

const SolanaDepositWithdraw: React.FC<SolanaDepositWithdrawProps> = ({ 
  balance, 
  onBalanceUpdate 
}) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // For deposits, we show a deposit address - in a real implementation
      // this would be your platform's hot wallet address
      const platformAddress = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"; // Example address
      
      setSuccess(`To deposit ${depositAmount} SOL, send it to: ${platformAddress}`);
      setDepositAmount('');
      
      // In a real implementation, you'd monitor the blockchain for incoming transactions
      // and update the user's internal balance
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawAddress || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter valid withdrawal amount and address');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    
    if (amount > balance.sol) {
      setError(`Insufficient balance. You have ${balance.sol.toFixed(4)} SOL`);
      return;
    }

    if (amount < 0.001) {
      setError('Minimum withdrawal amount is 0.001 SOL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result: TransactionResult = await PhantomWalletService.sendTransaction(
        withdrawAddress,
        amount,
        'SOL'
      );

      if (result.success) {
        setSuccess(`Withdrawal successful! Transaction: ${result.signature}`);
        setWithdrawAmount('');
        setWithdrawAddress('');
        await onBalanceUpdate(); // Refresh balance
      } else {
        setError(result.error || 'Withdrawal failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxWithdraw = () => {
    // Leave 0.001 SOL for transaction fees
    const maxAmount = Math.max(0, balance.sol - 0.001);
    setWithdrawAmount(maxAmount.toString());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Solana Deposits & Withdrawals
          <Badge variant="default" className="bg-purple-500">Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
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

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4" />
              Deposit SOL
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4" />
              Withdraw SOL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit" className="space-y-4 mt-6">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Deposit SOL to fund your arbitrage and flash loan operations. Funds are available immediately for trading.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount (SOL)</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  step="0.001"
                  min="0.001"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum deposit: 0.001 SOL
                </p>
              </div>
              
              <Button 
                onClick={handleDeposit}
                disabled={isLoading || !depositAmount || parseFloat(depositAmount) <= 0}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isLoading ? 'Processing...' : `Get Deposit Address for ${depositAmount || '0'} SOL`}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="withdraw" className="space-y-4 mt-6">
            <Alert className="border-blue-200 bg-blue-50">
              <Send className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Withdraw SOL directly from your connected Phantom wallet to any address. Transaction fees apply.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (SOL)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      step="0.001"
                      min="0.001"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleMaxWithdraw}
                      disabled={balance.sol <= 0.001}
                    >
                      Max
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available: {balance.sol.toFixed(4)} SOL
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Destination Address</Label>
                  <Input
                    placeholder="Solana wallet address..."
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a valid Solana wallet address
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleWithdraw}
                disabled={
                  isLoading || 
                  !withdrawAmount || 
                  !withdrawAddress || 
                  parseFloat(withdrawAmount) <= 0 ||
                  parseFloat(withdrawAmount) > balance.sol
                }
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                {isLoading ? 'Processing Transaction...' : `Withdraw ${withdrawAmount || '0'} SOL`}
              </Button>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Network fees: ~0.000005 SOL</div>
                <div>• Minimum withdrawal: 0.001 SOL</div>
                <div>• Transactions are processed immediately on-chain</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SolanaDepositWithdraw;