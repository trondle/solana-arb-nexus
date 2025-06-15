
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Activity, 
  AlertTriangle,
  Award,
  Clock,
  Zap
} from 'lucide-react';
import { AnalyticsEngine } from '@/services/analyticsEngine';

const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState(AnalyticsEngine.getPerformanceMetrics());
  const [riskMetrics, setRiskMetrics] = useState(AnalyticsEngine.getRiskMetrics());
  const [profitTrend, setProfitTrend] = useState(AnalyticsEngine.getProfitTrend(7));
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    // Generate mock data for demonstration
    AnalyticsEngine.generateMockData();
    
    const updateMetrics = () => {
      const timeframeMs = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        'all': undefined
      };
      
      setMetrics(AnalyticsEngine.getPerformanceMetrics(timeframeMs[timeframe]));
      setRiskMetrics(AnalyticsEngine.getRiskMetrics());
      setProfitTrend(AnalyticsEngine.getProfitTrend(timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30));
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    
    const unsubscribe = AnalyticsEngine.subscribe(updateMetrics);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [timeframe]);

  const chartConfig = {
    profit: {
      label: "Daily Profit",
      color: "hsl(var(--chart-1))",
    },
    cumulative: {
      label: "Cumulative Profit",
      color: "hsl(var(--chart-2))",
    },
  };

  const MetricCard = ({ title, value, icon: Icon, trend, suffix = '' }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}{suffix}</p>
            {trend !== undefined && (
              <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(trend).toFixed(1)}%
              </div>
            )}
          </div>
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Performance Analytics</h2>
          <p className="text-muted-foreground">Real-time trading performance and risk metrics</p>
        </div>
        <div className="flex gap-2">
          {(['24h', '7d', '30d', 'all'] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Profit"
          value={`$${metrics.totalProfit.toFixed(2)}`}
          icon={DollarSign}
          trend={12.5}
        />
        <MetricCard
          title="Success Rate"
          value={`${(metrics.successRate * 100).toFixed(1)}`}
          suffix="%"
          icon={Target}
          trend={2.3}
        />
        <MetricCard
          title="Sharpe Ratio"
          value={metrics.sharpeRatio.toFixed(2)}
          icon={Award}
          trend={8.1}
        />
        <MetricCard
          title="Avg Execution Time"
          value={`${(metrics.averageExecutionTime / 1000).toFixed(1)}`}
          suffix="s"
          icon={Clock}
          trend={-5.2}
        />
      </div>

      {/* Profit Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Profit Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitTrend}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="var(--color-cumulative)" 
                  fill="var(--color-cumulative)"
                  fillOpacity={0.3}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="var(--color-profit)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Trades</div>
                <div className="font-semibold">{metrics.totalTrades}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Successful</div>
                <div className="font-semibold text-green-500">{metrics.successfulTrades}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Fees</div>
                <div className="font-semibold">${metrics.totalFees.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Profit</div>
                <div className="font-semibold">${metrics.averageProfit.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Profit Factor</div>
                <div className="font-semibold">{metrics.profitFactor.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Max Drawdown</div>
                <div className="font-semibold text-red-500">{(metrics.maxDrawdown * 100).toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Value at Risk</div>
                <div className="font-semibold text-red-500">${riskMetrics.valueAtRisk.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Expected Shortfall</div>
                <div className="font-semibold text-red-500">${riskMetrics.expectedShortfall.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Volatility</div>
                <div className="font-semibold">{riskMetrics.volatility.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Beta</div>
                <div className="font-semibold">{riskMetrics.beta.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Max Consecutive Losses</div>
                <div className="font-semibold text-orange-500">{riskMetrics.maxConsecutiveLosses}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Current Drawdown</div>
                <div className="font-semibold text-red-500">{(riskMetrics.currentDrawdown * 100).toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Live data streaming active</span>
            </div>
            <Badge variant="outline">Last update: {new Date().toLocaleTimeString()}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
