
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calculator, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface CalculationResult {
  grossProfit: number;
  netProfit: number;
  gasFees: number;
  dexFees: number;
  slippage: number;
  roi: number;
  breakeven: number;
}

const ProfitCalculator = () => {
  const [tradeAmount, setTradeAmount] = useState<string>('1000');
  const [buyPrice, setBuyPrice] = useState<string>('23.45');
  const [sellPrice, setSellPrice] = useState<string>('23.78');
  const [buyDex, setBuyDex] = useState<string>('raydium');
  const [sellDex, setSellDex] = useState<string>('orca');
  const [gasPrice, setGasPrice] = useState<string>('0.000005');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const dexFees = {
    raydium: 0.0025, // 0.25%
    orca: 0.003,     // 0.30%
    jupiter: 0.002   // 0.20%
  };

  const calculateProfit = () => {
    const amount = parseFloat(tradeAmount);
    const buy = parseFloat(buyPrice);
    const sell = parseFloat(sellPrice);
    const gas = parseFloat(gasPrice);

    if (isNaN(amount) || isNaN(buy) || isNaN(sell) || isNaN(gas)) {
      return;
    }

    // Calculate fees
    const buyFee = amount * dexFees[buyDex as keyof typeof dexFees];
    const sellFee = amount * dexFees[sellDex as keyof typeof dexFees];
    const totalDexFees = buyFee + sellFee;
    
    // Gas fees (estimate for flash loan + 2 swaps)
    const estimatedGasFees = gas * 3 * 200000; // 3 transactions, 200k compute units each
    
    // Slippage estimation (0.1% for large trades)
    const slippageAmount = amount * 0.001;
    
    // Calculate profits
    const grossProfit = (sell - buy) * (amount / buy);
    const netProfit = grossProfit - totalDexFees - estimatedGasFees - slippageAmount;
    const roi = (netProfit / amount) * 100;
    const breakeven = buy + (totalDexFees + estimatedGasFees + slippageAmount) / (amount / buy);

    setResult({
      grossProfit,
      netProfit,
      gasFees: estimatedGasFees,
      dexFees: totalDexFees,
      slippage: slippageAmount,
      roi,
      breakeven
    });
  };

  const isProfitable = result && result.netProfit > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Arbitrage Profit Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Parameters */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Trade Parameters</h3>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Trade Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="1000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buyPrice">Buy Price</Label>
                  <Input
                    id="buyPrice"
                    type="number"
                    step="0.0001"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    placeholder="23.45"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellPrice">Sell Price</Label>
                  <Input
                    id="sellPrice"
                    type="number"
                    step="0.0001"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    placeholder="23.78"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Buy DEX</Label>
                  <Select value={buyDex} onValueChange={setBuyDex}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raydium">Raydium (0.25%)</SelectItem>
                      <SelectItem value="orca">Orca (0.30%)</SelectItem>
                      <SelectItem value="jupiter">Jupiter (0.20%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sell DEX</Label>
                  <Select value={sellDex} onValueChange={setSellDex}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raydium">Raydium (0.25%)</SelectItem>
                      <SelectItem value="orca">Orca (0.30%)</SelectItem>
                      <SelectItem value="jupiter">Jupiter (0.20%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gasPrice">Gas Price (SOL)</Label>
                <Input
                  id="gasPrice"
                  type="number"
                  step="0.000001"
                  value={gasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                  placeholder="0.000005"
                />
              </div>

              <Button onClick={calculateProfit} className="w-full">
                Calculate Profit
              </Button>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Calculation Results</h3>
              
              {result ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 ${isProfitable ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isProfitable ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-semibold">
                        {isProfitable ? 'Profitable Trade' : 'Unprofitable Trade'}
                      </span>
                    </div>
                    <div className={`text-2xl font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                      ${result.netProfit.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Net Profit ({result.roi.toFixed(2)}% ROI)
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Gross Profit:</span>
                      <span className="font-semibold">${result.grossProfit.toFixed(2)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-sm">
                      <span>DEX Fees:</span>
                      <span className="text-red-500">-${result.dexFees.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Gas Fees:</span>
                      <span className="text-red-500">-${result.gasFees.toFixed(6)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Slippage:</span>
                      <span className="text-red-500">-${result.slippage.toFixed(2)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <span>Breakeven Price:</span>
                      <span className="font-semibold">${result.breakeven.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Enter trade parameters and click calculate to see results
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Price Impact Risk</div>
              <div className="text-lg font-semibold text-yellow-500">Medium</div>
              <div className="text-xs text-muted-foreground mt-1">
                Large trades may face slippage
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Execution Risk</div>
              <div className="text-lg font-semibold text-green-500">Low</div>
              <div className="text-xs text-muted-foreground mt-1">
                Flash loans ensure atomic execution
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Network Risk</div>
              <div className="text-lg font-semibold text-green-500">Low</div>
              <div className="text-xs text-muted-foreground mt-1">
                Solana network is stable
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitCalculator;
