
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target,
  Trophy,
  Shield,
  AlertTriangle,
  Lock,
  Unlock
} from 'lucide-react';

interface TradingLevel {
  level: number;
  name: string;
  maxTradeSize: number;
  maxDailyVolume: number;
  maxConcurrentTrades: number;
  minSuccessRate: number;
  minProfit: number;
  unlocked: boolean;
  requirements: string[];
}

interface TradingStats {
  totalTrades: number;
  successfulTrades: number;
  totalProfit: number;
  dailyVolume: number;
  consecutiveSuccesses: number;
  averageProfit: number;
  maxDrawdown: number;
  tradingDays: number;
}

interface CurrentLimits {
  maxTradeSize: number;
  maxDailyVolume: number;
  maxConcurrentTrades: number;
  dailyVolumeUsed: number;
  activeTrades: number;
}

const GraduatedLimits = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [autoProgressEnabled, setAutoProgressEnabled] = useState(true);
  const [conservativeMode, setConservativeMode] = useState(true);
  
  const [tradingStats, setTradingStats] = useState<TradingStats>({
    totalTrades: 45,
    successfulTrades: 38,
    totalProfit: 2847.50,
    dailyVolume: 12500,
    consecutiveSuccesses: 7,
    averageProfit: 63.28,
    maxDrawdown: 3.2,
    tradingDays: 12
  });

  const [currentLimits, setCurrentLimits] = useState<CurrentLimits>({
    maxTradeSize: 5000,
    maxDailyVolume: 25000,
    maxConcurrentTrades: 2,
    dailyVolumeUsed: 12500,
    activeTrades: 1
  });

  const [tradingLevels] = useState<TradingLevel[]>([
    {
      level: 1,
      name: 'Beginner',
      maxTradeSize: 5000,
      maxDailyVolume: 25000,
      maxConcurrentTrades: 2,
      minSuccessRate: 70,
      minProfit: 500,
      unlocked: true,
      requirements: ['Complete onboarding', 'Pass safety quiz']
    },
    {
      level: 2,
      name: 'Intermediate',
      maxTradeSize: 15000,
      maxDailyVolume: 75000,
      maxConcurrentTrades: 4,
      minSuccessRate: 75,
      minProfit: 2000,
      unlocked: true,
      requirements: ['20+ successful trades', '75%+ success rate', '$2000+ total profit']
    },
    {
      level: 3,
      name: 'Advanced',
      maxTradeSize: 35000,
      maxDailyVolume: 150000,
      maxConcurrentTrades: 6,
      minSuccessRate: 80,
      minProfit: 8000,
      unlocked: false,
      requirements: ['50+ successful trades', '80%+ success rate', '$8000+ total profit', 'Max drawdown <5%']
    },
    {
      level: 4,
      name: 'Expert',
      maxTradeSize: 75000,
      maxDailyVolume: 300000,
      maxConcurrentTrades: 8,
      minSuccessRate: 82,
      minProfit: 25000,
      unlocked: false,
      requirements: ['100+ successful trades', '82%+ success rate', '$25000+ total profit', '15+ consecutive days']
    },
    {
      level: 5,
      name: 'Master',
      maxTradeSize: 150000,
      maxDailyVolume: 500000,
      maxConcurrentTrades: 12,
      minSuccessRate: 85,
      minProfit: 75000,
      unlocked: false,
      requirements: ['250+ successful trades', '85%+ success rate', '$75000+ total profit', '30+ trading days']
    }
  ]);

  // Check level progression
  useEffect(() => {
    const successRate = (tradingStats.successfulTrades / tradingStats.totalTrades) * 100;
    
    // Find the highest level that can be unlocked
    const unlockedLevels = tradingLevels.map(level => {
      const meetsRequirements = 
        tradingStats.successfulTrades >= (level.level === 2 ? 20 : level.level === 3 ? 50 : level.level === 4 ? 100 : level.level === 5 ? 250 : 0) &&
        successRate >= level.minSuccessRate &&
        tradingStats.totalProfit >= level.minProfit &&
        (level.level <= 2 || tradingStats.maxDrawdown < 5) &&
        (level.level <= 3 || tradingStats.tradingDays >= 15) &&
        (level.level <= 4 || tradingStats.tradingDays >= 30);
        
      return { ...level, unlocked: meetsRequirements || level.level === 1 };
    });

    // Auto-progress to highest unlocked level
    if (autoProgressEnabled) {
      const highestUnlocked = unlockedLevels.reverse().find(level => level.unlocked);
      if (highestUnlocked && highestUnlocked.level > currentLevel) {
        setCurrentLevel(highestUnlocked.level);
      }
    }

    // Update current limits based on level
    const activeLevel = tradingLevels.find(l => l.level === currentLevel);
    if (activeLevel) {
      setCurrentLimits(prev => ({
        ...prev,
        maxTradeSize: conservativeMode ? activeLevel.maxTradeSize * 0.75 : activeLevel.maxTradeSize,
        maxDailyVolume: conservativeMode ? activeLevel.maxDailyVolume * 0.8 : activeLevel.maxDailyVolume,
        maxConcurrentTrades: activeLevel.maxConcurrentTrades
      }));
    }
  }, [tradingStats, currentLevel, autoProgressEnabled, conservativeMode, tradingLevels]);

  // Simulate stat updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Occasionally update stats to simulate trading activity
      if (Math.random() > 0.8) {
        setTradingStats(prev => ({
          ...prev,
          dailyVolume: prev.dailyVolume + Math.random() * 1000,
        }));
        
        setCurrentLimits(prev => ({
          ...prev,
          dailyVolumeUsed: prev.dailyVolumeUsed + Math.random() * 500
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const upgradeToLevel = (level: number) => {
    const targetLevel = tradingLevels.find(l => l.level === level);
    if (targetLevel?.unlocked) {
      setCurrentLevel(level);
    }
  };

  const getProgressToNextLevel = () => {
    const nextLevel = tradingLevels.find(l => l.level === currentLevel + 1);
    if (!nextLevel) return { progress: 100, requirements: [] };

    const successRate = (tradingStats.successfulTrades / tradingStats.totalTrades) * 100;
    const requirements = [
      {
        name: 'Successful Trades',
        current: tradingStats.successfulTrades,
        required: nextLevel.level === 2 ? 20 : nextLevel.level === 3 ? 50 : nextLevel.level === 4 ? 100 : 250,
        progress: Math.min((tradingStats.successfulTrades / (nextLevel.level === 2 ? 20 : nextLevel.level === 3 ? 50 : nextLevel.level === 4 ? 100 : 250)) * 100, 100)
      },
      {
        name: 'Success Rate',
        current: successRate,
        required: nextLevel.minSuccessRate,
        progress: Math.min((successRate / nextLevel.minSuccessRate) * 100, 100)
      },
      {
        name: 'Total Profit',
        current: tradingStats.totalProfit,
        required: nextLevel.minProfit,
        progress: Math.min((tradingStats.totalProfit / nextLevel.minProfit) * 100, 100)
      }
    ];

    const averageProgress = requirements.reduce((sum, req) => sum + req.progress, 0) / requirements.length;
    return { progress: averageProgress, requirements };
  };

  const { progress: nextLevelProgress, requirements: nextLevelRequirements } = getProgressToNextLevel();
  const successRate = (tradingStats.successfulTrades / tradingStats.totalTrades) * 100;
  
  const volumeUsagePercent = (currentLimits.dailyVolumeUsed / currentLimits.maxDailyVolume) * 100;
  const tradesUsagePercent = (currentLimits.activeTrades / currentLimits.maxConcurrentTrades) * 100;

  return (
    <div className="space-y-6">
      {/* Current Level Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Trading Level: {tradingLevels.find(l => l.level === currentLevel)?.name}
            <Badge variant="outline">Level {currentLevel}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-500">${tradingStats.totalProfit.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Profit</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">{successRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500">{tradingStats.successfulTrades}</div>
              <div className="text-sm text-muted-foreground">Successful Trades</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">{tradingStats.tradingDays}</div>
              <div className="text-sm text-muted-foreground">Trading Days</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Level Progression</h4>
              <p className="text-sm text-muted-foreground">Automatically upgrade when requirements are met</p>
            </div>
            <Switch 
              checked={autoProgressEnabled}
              onCheckedChange={setAutoProgressEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Conservative Mode</h4>
              <p className="text-sm text-muted-foreground">Reduce limits by 20-25% for extra safety</p>
            </div>
            <Switch 
              checked={conservativeMode}
              onCheckedChange={setConservativeMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Limits Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Current Limits & Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Max Trade Size</span>
                <span className="text-lg font-bold">${currentLimits.maxTradeSize.toLocaleString()}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {conservativeMode && 'Conservative mode: 25% reduction applied'}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Daily Volume</span>
                <span className="text-sm">${currentLimits.dailyVolumeUsed.toLocaleString()} / ${currentLimits.maxDailyVolume.toLocaleString()}</span>
              </div>
              <Progress value={volumeUsagePercent} className="mb-1" />
              <div className="text-xs text-muted-foreground">{volumeUsagePercent.toFixed(1)}% used</div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Concurrent Trades</span>
                <span className="text-sm">{currentLimits.activeTrades} / {currentLimits.maxConcurrentTrades}</span>
              </div>
              <Progress value={tradesUsagePercent} className="mb-1" />
              <div className="text-xs text-muted-foreground">{tradesUsagePercent.toFixed(1)}% used</div>
            </div>
          </div>

          {volumeUsagePercent > 80 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Daily volume limit nearly reached. Consider upgrading your level or waiting for reset.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Progress to Next Level */}
      {currentLevel < 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progress to Level {currentLevel + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Overall Progress</span>
              <span className="text-sm">{nextLevelProgress.toFixed(1)}%</span>
            </div>
            <Progress value={nextLevelProgress} className="mb-4" />
            
            <div className="space-y-3">
              {nextLevelRequirements.map((req, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{req.name}</span>
                    <span>{req.current} / {req.required}</span>
                  </div>
                  <Progress value={req.progress} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Trading Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Level Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tradingLevels.map((level) => (
              <div key={level.level} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {level.unlocked ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-gray-500" />}
                      <span className="font-semibold">Level {level.level}: {level.name}</span>
                    </div>
                    {currentLevel === level.level && (
                      <Badge variant="default">CURRENT</Badge>
                    )}
                  </div>
                  
                  {level.unlocked && level.level !== currentLevel && (
                    <Button 
                      size="sm" 
                      onClick={() => upgradeToLevel(level.level)}
                      variant="outline"
                    >
                      Switch to Level
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Max Trade:</span>
                    <div className="font-semibold">${level.maxTradeSize.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Daily Volume:</span>
                    <div className="font-semibold">${level.maxDailyVolume.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Concurrent:</span>
                    <div className="font-semibold">{level.maxConcurrentTrades} trades</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Min Success:</span>
                    <div className="font-semibold">{level.minSuccessRate}%</div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <strong>Requirements:</strong> {level.requirements.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GraduatedLimits;
