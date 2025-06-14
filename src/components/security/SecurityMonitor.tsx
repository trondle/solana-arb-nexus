
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Lock, Eye, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SecurityEvent {
  id: string;
  type: 'login' | 'trade' | 'config_change' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  ipAddress?: string;
}

const SecurityMonitor = () => {
  const { user, userRole, logAction } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [activeThreats, setActiveThreats] = useState(0);
  const [lastLoginAttempt, setLastLoginAttempt] = useState<Date | null>(null);

  useEffect(() => {
    // Monitor for suspicious activities
    const monitorSession = () => {
      const sessionStartTime = Date.now();
      const maxSessionDuration = 8 * 60 * 60 * 1000; // 8 hours
      
      const checkSessionSecurity = () => {
        const currentTime = Date.now();
        if (currentTime - sessionStartTime > maxSessionDuration) {
          addSecurityEvent({
            id: `session-${Date.now()}`,
            type: 'suspicious_activity',
            severity: 'medium',
            message: 'Long session detected - consider re-authentication',
            timestamp: new Date()
          });
        }
      };

      const interval = setInterval(checkSessionSecurity, 30 * 60 * 1000); // Check every 30 min
      return () => clearInterval(interval);
    };

    if (user) {
      const cleanup = monitorSession();
      logAction('security_monitor_activated');
      return cleanup;
    }
  }, [user, logAction]);

  const addSecurityEvent = (event: SecurityEvent) => {
    setSecurityEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
    if (event.severity === 'high' || event.severity === 'critical') {
      setActiveThreats(prev => prev + 1);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <Lock className="w-4 h-4" />;
      case 'trade': return <Activity className="w-4 h-4" />;
      case 'config_change': return <Shield className="w-4 h-4" />;
      case 'suspicious_activity': return <AlertTriangle className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  // Only show to admin users for security
  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">SECURE</div>
            <p className="text-xs text-muted-foreground">All systems protected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${activeThreats > 0 ? 'text-red-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${activeThreats > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {activeThreats}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeThreats > 0 ? 'Requires attention' : 'No threats detected'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Status</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">ACTIVE</div>
            <p className="text-xs text-muted-foreground">
              {lastLoginAttempt ? `Last: ${lastLoginAttempt.toLocaleTimeString()}` : 'Current session'}
            </p>
          </CardContent>
        </Card>
      </div>

      {activeThreats > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <strong>Security Alert:</strong> {activeThreats} active threat{activeThreats > 1 ? 's' : ''} detected. 
            Review security events below and take appropriate action.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No security events recorded</p>
            ) : (
              securityEvents.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getEventIcon(event.type)}
                    <div>
                      <div className="font-medium text-sm">{event.message}</div>
                      <div className="text-xs text-muted-foreground">
                        {event.timestamp.toLocaleString()}
                        {event.ipAddress && ` • IP: ${event.ipAddress}`}
                      </div>
                    </div>
                  </div>
                  <Badge className={getSeverityColor(event.severity)}>
                    {event.severity.toUpperCase()}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;
