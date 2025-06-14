
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Settings,
  Shield,
  Zap,
  GitBranch,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemUpdate {
  id: string;
  version: string;
  type: 'security' | 'feature' | 'bugfix' | 'performance';
  status: 'available' | 'downloading' | 'installing' | 'installed' | 'failed';
  size: string;
  releaseDate: string;
  description: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  downloadProgress?: number;
}

interface AutoUpgradeConfig {
  enabled: boolean;
  autoInstallSecurity: boolean;
  autoInstallFeatures: boolean;
  maintenanceWindow: string;
  backupBeforeUpgrade: boolean;
  rollbackOnFailure: boolean;
  testMode: boolean;
}

const AutoUpgradeSystem = () => {
  const { toast } = useToast();
  const [currentVersion] = useState('2.1.4');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeProgress, setUpgradeProgress] = useState(0);

  const [config, setConfig] = useState<AutoUpgradeConfig>({
    enabled: true,
    autoInstallSecurity: true,
    autoInstallFeatures: false,
    maintenanceWindow: '02:00',
    backupBeforeUpgrade: true,
    rollbackOnFailure: true,
    testMode: false
  });

  const [updates, setUpdates] = useState<SystemUpdate[]>([
    {
      id: '1',
      version: '2.1.5',
      type: 'security',
      status: 'available',
      size: '45 MB',
      releaseDate: '2024-06-14',
      description: 'Critical security patch for transaction validation vulnerability',
      criticality: 'critical'
    },
    {
      id: '2',
      version: '2.2.0',
      type: 'feature',
      status: 'available',
      size: '128 MB',
      releaseDate: '2024-06-12',
      description: 'New MEV protection algorithms and enhanced profit optimization',
      criticality: 'medium'
    },
    {
      id: '3',
      version: '2.1.4-patch1',
      type: 'bugfix',
      status: 'installed',
      size: '12 MB',
      releaseDate: '2024-06-10',
      description: 'Fixed memory leak in price monitoring service',
      criticality: 'low'
    }
  ]);

  const [systemStatus] = useState({
    uptime: '7d 14h 32m',
    nextMaintenance: '2024-06-15 02:00',
    backupStatus: 'completed',
    lastBackup: '2024-06-14 01:30'
  });

  const checkForUpdates = async () => {
    setIsChecking(true);
    // Simulate API call
    setTimeout(() => {
      setLastCheck(new Date());
      setIsChecking(false);
      toast({
        title: "Update Check Complete",
        description: "System is up to date with latest security patches.",
      });
    }, 2000);
  };

  const installUpdate = async (updateId: string) => {
    const update = updates.find(u => u.id === updateId);
    if (!update) return;

    setIsUpgrading(true);
    setUpgradeProgress(0);

    // Update status to downloading
    setUpdates(prev => prev.map(u => 
      u.id === updateId ? { ...u, status: 'downloading' as const } : u
    ));

    // Simulate download progress
    const downloadInterval = setInterval(() => {
      setUpgradeProgress(prev => {
        if (prev >= 100) {
          clearInterval(downloadInterval);
          // Update status to installing
          setUpdates(prevUpdates => prevUpdates.map(u => 
            u.id === updateId ? { ...u, status: 'installing' as const } : u
          ));
          
          // Simulate installation
          setTimeout(() => {
            setUpdates(prevUpdates => prevUpdates.map(u => 
              u.id === updateId ? { ...u, status: 'installed' as const } : u
            ));
            setIsUpgrading(false);
            setUpgradeProgress(0);
            
            toast({
              title: "Update Installed",
              description: `Successfully installed ${update.version}`,
            });
          }, 2000);
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'bg-red-500';
      case 'feature': return 'bg-blue-500';
      case 'bugfix': return 'bg-yellow-500';
      case 'performance': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <Download className="w-4 h-4" />;
      case 'downloading':
      case 'installing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'installed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Current Version</Label>
              <div className="font-mono text-lg font-semibold">{currentVersion}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">System Uptime</Label>
              <div className="font-mono text-lg">{systemStatus.uptime}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Next Maintenance</Label>
              <div className="font-mono text-sm">{systemStatus.nextMaintenance}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Last Backup</Label>
              <div className="font-mono text-sm">{systemStatus.lastBackup}</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={checkForUpdates} disabled={isChecking}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              Check for Updates
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Last checked: {lastCheck.toLocaleTimeString()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Upgrade Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Auto-Upgrade Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoUpgrade">Enable Auto-Upgrade</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically install updates during maintenance window
                  </div>
                </div>
                <Switch
                  id="autoUpgrade"
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoSecurity">Auto-Install Security Updates</Label>
                  <div className="text-sm text-muted-foreground">
                    Install critical security patches immediately
                  </div>
                </div>
                <Switch
                  id="autoSecurity"
                  checked={config.autoInstallSecurity}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoInstallSecurity: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoFeatures">Auto-Install Feature Updates</Label>
                  <div className="text-sm text-muted-foreground">
                    Install new features and improvements
                  </div>
                </div>
                <Switch
                  id="autoFeatures"
                  checked={config.autoInstallFeatures}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoInstallFeatures: checked }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="backup">Backup Before Upgrade</Label>
                  <div className="text-sm text-muted-foreground">
                    Create system backup before installing updates
                  </div>
                </div>
                <Switch
                  id="backup"
                  checked={config.backupBeforeUpgrade}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, backupBeforeUpgrade: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="rollback">Auto-Rollback on Failure</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically rollback if update fails
                  </div>
                </div>
                <Switch
                  id="rollback"
                  checked={config.rollbackOnFailure}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, rollbackOnFailure: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="testMode">Test Mode</Label>
                  <div className="text-sm text-muted-foreground">
                    Test updates in sandbox environment first
                  </div>
                </div>
                <Switch
                  id="testMode"
                  checked={config.testMode}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, testMode: checked }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Available Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isUpgrading && (
            <div className="mb-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Installing Update...</span>
                <span className="text-sm text-muted-foreground">{upgradeProgress}%</span>
              </div>
              <Progress value={upgradeProgress} className="w-full" />
            </div>
          )}

          <ScrollArea className="h-64">
            <div className="space-y-3">
              {updates.map((update) => (
                <div key={update.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(update.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{update.version}</span>
                        <Badge className={`${getUpdateTypeColor(update.type)} text-white`}>
                          {update.type}
                        </Badge>
                        <span className={`text-sm font-medium ${getCriticalityColor(update.criticality)}`}>
                          {update.criticality}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">{update.description}</div>
                      <div className="text-xs text-muted-foreground">
                        Size: {update.size} • Released: {update.releaseDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {update.status === 'available' && (
                      <Button
                        onClick={() => installUpdate(update.id)}
                        disabled={isUpgrading}
                        size="sm"
                      >
                        Install
                      </Button>
                    )}
                    {update.status === 'installed' && (
                      <Badge variant="secondary">Installed</Badge>
                    )}
                    {update.status === 'downloading' && (
                      <Badge variant="secondary">
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Downloading
                      </Badge>
                    )}
                    {update.status === 'installing' && (
                      <Badge variant="secondary">
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Installing
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Maintenance Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Maintenance Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Maintenance Window</Label>
                <div className="text-sm text-muted-foreground">
                  Updates will be installed during this time window
                </div>
                <input
                  type="time"
                  value={config.maintenanceWindow}
                  onChange={(e) => setConfig(prev => ({ ...prev, maintenanceWindow: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Next Scheduled Maintenance</Label>
                <div className="text-sm text-muted-foreground">
                  Planned system maintenance window
                </div>
                <div className="p-3 bg-muted rounded-md font-mono text-sm">
                  {systemStatus.nextMaintenance}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoUpgradeSystem;
