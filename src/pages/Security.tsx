
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import SecurityMonitor from '@/components/security/SecurityMonitor';
import SecureConfigManager from '@/components/security/SecureConfigManager';
import SessionManager from '@/components/security/SessionManager';
import { Shield, Lock, Activity, Settings } from 'lucide-react';

const Security = () => {
  const { user, userRole } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Only admin and trader can access security features
  if (userRole !== 'admin' && userRole !== 'trader') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Security Center</h1>
            <p className="text-muted-foreground">
              Monitor security, manage configurations, and control access
            </p>
          </div>
        </div>

        <Tabs defaultValue="monitor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="configs" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurations
            </TabsTrigger>
            <TabsTrigger value="session" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Session
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitor">
            <SecurityMonitor />
          </TabsContent>

          <TabsContent value="configs">
            <SecureConfigManager />
          </TabsContent>

          <TabsContent value="session">
            <SessionManager />
          </TabsContent>

          <TabsContent value="audit">
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Audit Log</h3>
              <p className="text-muted-foreground">
                Detailed audit logging is available in the Supabase dashboard.
                All user actions are automatically tracked and stored securely.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Security;
