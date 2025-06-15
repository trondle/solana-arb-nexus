
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Lock, 
  Unlock,
  DollarSign,
  Trophy,
  BookOpen
} from 'lucide-react';

interface ProgressiveLevel {
  level: number;
  name: string;
  minTrades: number;
  minSuccessRate: number;
  minTotalProfit: number;
  maxCapital: number;
  features: string[];
  description: string;
  color: string;
}

interface TraderStats {
  totalTrades: number;
  successfulTrades: number;
  totalProfit: number;
  currentLevel: number;
  unlockedFeatures: string[];
}

interface ProgressiveCapitalModeProps {
  traderStats: TraderStats;
  onLevelUp: (newLevel: number) => void;
}

const ProgressiveCapitalMode = ({ traderStats, onLevelUp }: ProgressiveCapitalModeProps) => {
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);

  const levels: ProgressiveLevel[] = [
    {
      level: 1,
      name: 'Beginner Trader',
      minTrades: 0,
      minSuccessRate: 0,
      minTotalProfit: 0,
      maxCapital: 500,
      features: ['Micro-arbitrage only', 'Educational tooltips', 'Risk warnings'],
      description: 'Start small and learn the basics',
      color: 'bg-green-50 border-green-200'
    },
    {
      level: 2,
      name: 'Novice Trader',
      minTrades: 5,
      minSuccessRate: 70,
      minTotalProfit: 10,
      maxCapital: 1000,
      features: ['Flash loan access', 'Basic chain selection', 'Simple strategies'],
      description: 'Proven competency with small trades',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      level: 3,
      name: 'Intermediate Trader',
      minTrades: 15,
      minSuccessRate: 75,
      minTotalProfit: 50,
      maxCapital: 2500,
      features: ['Multi-chain arbitrage', 'Batch execution', 'Advanced filters'],
      description: 'Ready for more complex strategies',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      level: 4,
      name: 'Advanced Trader',
      minTrades: 30,
      minSuccessRate: 80,
      minTotalProfit: 200,
      maxCapital: 5000,
      features: ['MEV protection', 'Custom strategies', 'Priority execution'],
      description: 'Sophisticated trading capabilities',
      color: 'bg-orange-50 border-orange-200'
    },
    {
      level: 5,
      name: 'Expert Trader',
      minTrades: 50,
      minSuccessRate: 85,
      minTotalProfit: 500,
      maxCapital: 10000,
      features: ['Unlimited capital', 'All optimizations', 'Premium support'],
      description: 'Full platform access and capabilities',
      color: 'bg-yellow-50 border-yellow-200'
    }
  ];

  const currentLevel = levels.find(l => l.level === traderStats.currentLevel) || levels[0];
  const nextLevel = levels.find(l => l.level === traderStats.currentLevel + 1);

  const successRate = traderStats.totalTrades > 0 
    ? (traderStats.successfulTrades / traderStats.totalTrades) * 100 
    : 0;

  const canLevelUp = nextLevel && 
    traderStats.totalTrades >= nextLevel.minTrades &&
    successRate >= nextLevel.minSuccessRate &&
    traderStats.totalProfit >= nextLevel.minTotalProfit;

  useEffect(() => {
    if (canLevelUp) {
      setShowLevelUpAnimation(true);
      const timer = setTimeout(() => setShowLevelUpAnimation(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [canLevelUp]);

  const handleLevelUp = () => {
    if (canLevelUp && nextLevel) {
      onLevelUp(nextLevel.level);
      setShowLevelUpAnimation(false);
    }
  };

  const getProgressTowardsNext = () => {
    if (!nextLevel) return 100;

    const tradeProgress = Math.min((traderStats.totalTrades / nextLevel.minTrades) * 100, 100);
    const successProgress = Math.min((successRate / nextLevel.minSuccessRate) * 100, 100);
    const profitProgress = Math.min((traderStats.totalProfit / nextLevel.minTotalProfit) * 100, 100);

    return Math.min((tradeProgress + successProgress + profitProgress) / 3, 100);
  };

  return (
    <div className="space-y-4">
      {/* Current Level Card */}
      <Card className={`${currentLevel.color} ${showLevelUpAnimation ? 'animate-pulse' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Level {currentLevel.level}: {currentLevel.name}
            </div>
            <Badge variant="outline" className="font-semibold">
              Max Capital: ${currentLevel.maxCapital.toLocaleString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{currentLevel.description}</p>
          
          {/* Current Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{traderStats.totalTrades}</div>
              <div className="text-xs text-muted-foreground">Total Trades</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{successRate.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">${traderStats.totalProfit.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Total Profit</div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h5 className="font-semibold text-sm">Unlocked Features:</h5>
            <div className="flex flex-wrap gap-2">
              {currentLevel.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Unlock className="w-3 h-3 mr-1" />
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Up Notification */}
      {canLevelUp && (
        <Alert className="border-yellow-400 bg-yellow-50">
          <Trophy className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>🎉 Level Up Available!</strong>
              <br />
              You're ready to advance to {nextLevel?.name}
            </div>
            <Button onClick={handleLevelUp} className="bg-yellow-500 hover:bg-yellow-600">
              Level Up!
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Progress to Next Level */}
      {nextLevel && !canLevelUp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Progress to {nextLevel.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{getProgressTowardsNext().toFixed(0)}%</span>
              </div>
              <Progress value={getProgressTowardsNext()} />
            </div>

            {/* Individual Requirements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Trades Required:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {traderStats.totalTrades}/{nextLevel.minTrades}
                  </span>
                  {traderStats.totalTrades >= nextLevel.minTrades ? 
                    <Award className="w-4 h-4 text-green-500" /> : 
                    <Lock className="w-4 h-4 text-gray-400" />
                  }
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Success Rate Required:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {successRate.toFixed(0)}%/{nextLevel.minSuccessRate}%
                  </span>
                  {successRate >= nextLevel.minSuccessRate ? 
                    <Award className="w-4 h-4 text-green-500" /> : 
                    <Lock className="w-4 h-4 text-gray-400" />
                  }
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Profit Required:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    ${traderStats.totalProfit.toFixed(2)}/${nextLevel.minTotalProfit}
                  </span>
                  {traderStats.totalProfit >= nextLevel.minTotalProfit ? 
                    <Award className="w-4 h-4 text-green-500" /> : 
                    <Lock className="w-4 h-4 text-gray-400" />
                  }
                </div>
              </div>
            </div>

            {/* Next Level Preview */}
            <div className="border rounded-lg p-3 bg-gray-50">
              <h6 className="font-semibold text-sm mb-2">What you'll unlock:</h6>
              <div className="space-y-1">
                {nextLevel.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Lock className="w-3 h-3 text-gray-400" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Max Capital: ${nextLevel.maxCapital.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Levels Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Trading Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {levels.map((level) => (
              <div 
                key={level.level} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  level.level === traderStats.currentLevel 
                    ? 'bg-blue-50 border-blue-200' 
                    : level.level < traderStats.currentLevel 
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center">
                    {level.level < traderStats.currentLevel ? (
                      <Award className="w-4 h-4 text-green-500" />
                    ) : level.level === traderStats.currentLevel ? (
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{level.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Max: ${level.maxCapital.toLocaleString()}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={level.level <= traderStats.currentLevel ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  Level {level.level}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressiveCapitalMode;
