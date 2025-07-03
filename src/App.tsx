
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Wallet from '@/pages/Wallet';
import PersonalApiManager from '@/pages/PersonalApiManager';
import Security from '@/pages/Security';
import Header from '@/components/layout/Header';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/wallet" 
          element={user ? <Wallet /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/personal-api" 
          element={user ? <PersonalApiManager /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/security" 
          element={user ? <Security /> : <Navigate to="/auth" replace />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Router>
              <AppContent />
            </Router>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
