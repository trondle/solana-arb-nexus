
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, LogOut, Shield, AlertTriangle, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SessionManager = () => {
  const { user, signOut, logAction } = useAuth();
  const [sessionStartTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [warningShown, setWarningShown] = useState(false);

  const MAX_SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
  const WARNING_TIME = 7.5 * 60 * 60 * 1000; // 7.5 hours

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sessionDuration = currentTime - sessionStartTime;
    
    if (sessionDuration > WARNING_TIME && !warningShown) {
      setWarningShown(true);
      logAction('session_timeout_warning');
    }

    if (sessionDuration > MAX_SESSION_DURATION) {
      handleForceLogout();
    }
  }, [currentTime, sessionStartTime, warningShown, logAction]);

  const handleForceLogout = async () => {
    await logAction('session_timeout_forced_logout');
    await signOut();
  };

  const handleManualLogout = async () => {
    await logAction('session_manual_logout');
    await signOut();
  };

  const getSessionDuration = () => {
    const duration = currentTime - sessionStartTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getTimeRemaining = () => {
    const remaining = MAX_SESSION_DURATION - (currentTime - sessionStartTime);
    if (remaining <= 0) return '0m';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getSessionStatus = () => {
    const duration = currentTime - sessionStartTime;
    if (duration > MAX_SESSION_DURATION) return 'expired';
    if (duration > WARNING_TIME) return 'warning';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  const sessionStatus = getSessionStatus();

  return (
    <div className="space-y-4">
      {sessionStatus === 'warning' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            <strong>Session Warning:</strong> Your session will expire in {getTimeRemaining()}. 
            Please save your work and consider logging out and back in.
          </AlertDescription>
        </Alert>
      )}

      {sessionStatus === 'expired' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <strong>Session Expired:</strong> For security reasons, your session has expired. 
            You will be logged out automatically.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Session Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Session Status</p>
              <Badge className={getStatusColor(sessionStatus)}>
                {sessionStatus.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Duration
              </p>
              <p className="text-sm text-muted-foreground">{getSessionDuration()}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium flex items-center gap-1">
                <Activity className="w-4 h-4" />
                Time Remaining
              </p>
              <p className="text-sm text-muted-foreground">{getTimeRemaining()}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Secure Logout</p>
                <p className="text-xs text-muted-foreground">
                  End your session securely and clear all sensitive data
                </p>
              </div>
              <Button 
                onClick={handleManualLogout}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout Now
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">Security Recommendations</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Always logout when finished trading</li>
              <li>• Don't leave the application unattended</li>
              <li>• Use strong passwords and enable 2FA</li>
              <li>• Monitor your session duration regularly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionManager;
