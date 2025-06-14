
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { HardDrive, Shield, Zap, TrendingUp, Lock, Wifi, WifiOff } from 'lucide-react';

interface ColdWallet {
  id: string;
  name: string;
  type: 'ledger' | 'trezor' | 'multisig';
  address: string;
  balance: number;
  status: 'connected' | 'disconnected' | 'syncing';
  autoWithdraw: boolean;
}

interface WithdrawalRule {
  trigger: string;
  threshold: number;
  percentage: number;
  enabled: boolean;
}

const ColdStorageIntegration = () => {
  const [coldWallets, setColdWallets] = useState<ColdWallet[]>([
    {
      id: 'ledger-1',
      name: 'Ledger Nano X #1',
      type: 'ledger',
      address: '7xKX...9mPq',
      balance: 28500,
      status: 'connected',
      autoWithdraw: true
    },
    {
      id: 'trezor-1',
      name: 'Trezor Model T',
      type: 'trezor',
      address: '9kL2...7nR4',
      balance: 15200,
      status: 'connected',
      autoWithdraw: false
    },
    {
      id: 'multisig-1',
      name: 'Team MultiSig',
      type: 'multisig',
      address: '5mN8...3xW9',
      balance: 42800,
      status: 'disconnected',
      autoWithdraw: true
    }
  ]);

  const [withdrawalRules, setWithdrawalRules] = useState<WithdrawalRule[]>([
    {
      trigger: 'Profit Threshold',
      threshold: 1000, // $1000 profit
      percentage: 50, // withdraw 50%
      enabled: true
    },
    {
      trigger: 'Daily Limit',
      threshold: 5000, // $5000 daily earnings
      percentage: 80, // withdraw 80%
      enabled: true
    },
    {
      trigger: 'Risk Level',
      threshold: 75, // risk score above 75
      percentage: 90, // withdraw 90%
      enabled: false
    }
  ]);

  const [autoWithdrawSettings, setAutoWithdrawSettings] = useState({
    enabled: true,
    minAmount: [100], // minimum $100 to trigger
    maxFrequency: [4], // max 4 times per day
    emergencyThreshold: [10000] // emergency withdraw at $10k profit
  });

  const [recentTransactions] = useState([
    {
      id: '1',
      type: 'withdrawal',
      amount: 2500,
      wallet: 'Ledger Nano X #1',
      status: 'completed',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'withdrawal',
      amount: 1800,
      wallet: 'Team MultiSig',
      status: 'pending',
      timestamp: '4 hours ago'
    },
    {
      id: '3',
      type: 'withdrawal',
      amount: 950,
      wallet: 'Trezor Model T',
      status: 'completed',
      timestamp: '1 day ago'
    }
  ]);

  const totalColdStorage = coldWallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const connectedWallets = coldWallets.filter(w => w.status === 'connected').length;

  const executeWithdrawal = (walletId: string, amount: number) => {
    console.log(`Executing withdrawal of $${amount} to wallet ${walletId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      case 'syncing': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Wifi className="w-4 h-4 text-green-500" />;
      case 'disconnected': return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'syncing': return <Zap className="w-4 h-4 text-yellow-500 animate-spin" />;
      default: return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'ledger': return '🔷';
      case 'trezor': return '🔸';
      case 'multisig': return '🔐';
      default: return '💼';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cold Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cold Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ${totalColdStorage.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Secured in cold wallets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Wallets</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {connectedWallets}/{coldWallets.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Hardware wallets online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Withdrawals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">24</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Connected Wallets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Cold Storage Wallets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coldWallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getWalletIcon(wallet.type)}</span>
                  <div>
                    <div className="font-semibold">{wallet.name}</div>
                    <div className="text-sm text-muted-foreground">{wallet.address}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">${wallet.balance.toLocaleString()}</div>
                    <div className="flex items-center gap-1 text-sm">
                      {getStatusIcon(wallet.status)}
                      <span className={getStatusColor(wallet.status)}>
                        {wallet.status}
                      </span>
                    </div>
                  </div>
                  <Switch 
                    checked={wallet.autoWithdraw}
                    onCheckedChange={(checked) => {
                      setColdWallets(prev => prev.map(w => 
                        w.id === wallet.id ? { ...w, autoWithdraw: checked } : w
                      ));
                    }}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => executeWithdrawal(wallet.id, 1000)}
                    disabled={wallet.status !== 'connected'}
                  >
                    Withdraw
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Auto-Withdrawal Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Withdrawal Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable Auto-Withdrawal</h4>
              <p className="text-sm text-muted-foreground">
                Automatically transfer profits to cold storage
              </p>
            </div>
            <Switch 
              checked={autoWithdrawSettings.enabled}
              onCheckedChange={(checked) => 
                setAutoWithdrawSettings(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Minimum Amount</span>
                <span className="text-sm text-muted-foreground">${autoWithdrawSettings.minAmount[0]}</span>
              </div>
              <Slider
                value={autoWithdrawSettings.minAmount}
                onValueChange={(value) => 
                  setAutoWithdrawSettings(prev => ({ ...prev, minAmount: value }))
                }
                max={1000}
                min={10}
                step={10}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Max Frequency (per day)</span>
                <span className="text-sm text-muted-foreground">{autoWithdrawSettings.maxFrequency[0]}x</span>
              </div>
              <Slider
                value={autoWithdrawSettings.maxFrequency}
                onValueChange={(value) => 
                  setAutoWithdrawSettings(prev => ({ ...prev, maxFrequency: value }))
                }
                max={24}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Emergency Threshold</span>
                <span className="text-sm text-muted-foreground">${autoWithdrawSettings.emergencyThreshold[0].toLocaleString()}</span>
              </div>
              <Slider
                value={autoWithdrawSettings.emergencyThreshold}
                onValueChange={(value) => 
                  setAutoWithdrawSettings(prev => ({ ...prev, emergencyThreshold: value }))
                }
                max={50000}
                min={1000}
                step={1000}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {withdrawalRules.map((rule, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{rule.trigger}</div>
                    <div className="text-sm text-muted-foreground">
                      Threshold: {rule.trigger.includes('$') ? '$' : ''}{rule.threshold}
                      {rule.trigger.includes('Risk') ? '' : rule.trigger.includes('Profit') ? ' profit' : ' daily'}
                    </div>
                  </div>
                  <Switch 
                    checked={rule.enabled}
                    onCheckedChange={(checked) => {
                      setWithdrawalRules(prev => prev.map((r, i) => 
                        i === index ? { ...r, enabled: checked } : r
                      ));
                    }}
                  />
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Withdraw:</span>
                  <span className="font-semibold ml-1">{rule.percentage}% of profits</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Cold Storage Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="font-semibold">${tx.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{tx.wallet}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={
                    tx.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {tx.status.toUpperCase()}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">{tx.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Security Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Check:</strong> All connected wallets verified and secure
              </AlertDescription>
            </Alert>
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <strong>Backup Reminder:</strong> Ensure hardware wallet recovery phrases are safely stored
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColdStorageIntegration;
