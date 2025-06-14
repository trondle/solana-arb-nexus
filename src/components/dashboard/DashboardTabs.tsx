
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Target, 
  BarChart3,
  Brain,
  TestTube,
  Layers,
  Activity,
  Lock
} from 'lucide-react';

const DashboardTabs = () => {
  return (
    <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
      <TabsTrigger value="zero-capital" className="flex items-center gap-2">
        <Zap className="w-4 h-4" />
        <span className="hidden md:inline">Zero Capital</span>
      </TabsTrigger>
      <TabsTrigger value="risk-management" className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4" />
        <span className="hidden md:inline">Risk Mgmt</span>
      </TabsTrigger>
      <TabsTrigger value="safety-validator" className="flex items-center gap-2">
        <Target className="w-4 h-4" />
        <span className="hidden md:inline">Safety</span>
      </TabsTrigger>
      <TabsTrigger value="circuit-breaker" className="flex items-center gap-2">
        <Activity className="w-4 h-4" />
        <span className="hidden md:inline">Circuit</span>
      </TabsTrigger>
      <TabsTrigger value="profit-optimizer" className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        <span className="hidden md:inline">Optimizer</span>
      </TabsTrigger>
      <TabsTrigger value="dynamic-risk" className="flex items-center gap-2">
        <Brain className="w-4 h-4" />
        <span className="hidden md:inline">Dynamic Risk</span>
      </TabsTrigger>
      <TabsTrigger value="pre-execution" className="flex items-center gap-2">
        <Lock className="w-4 h-4" />
        <span className="hidden md:inline">Pre-Exec</span>
      </TabsTrigger>
      <TabsTrigger value="graduated-limits" className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4" />
        <span className="hidden md:inline">Limits</span>
      </TabsTrigger>
      <TabsTrigger value="simulation" className="flex items-center gap-2">
        <TestTube className="w-4 h-4" />
        <span className="hidden md:inline">Simulation</span>
      </TabsTrigger>
      <TabsTrigger value="safety-layers" className="flex items-center gap-2">
        <Layers className="w-4 h-4" />
        <span className="hidden md:inline">Safety Layers</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default DashboardTabs;
