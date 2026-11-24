import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth';
import AuthScreen from '@/components/AuthScreen';
import Dashboard from '@/components/Dashboard';
import AdminDashboard from '@/components/AdminDashboard';

function Gate() {
  const { user, isAdmin, loading } = useAuth();
  const [view, setView] = useState<'admin' | 'analyst'>('admin');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  if (isAdmin && view === 'admin') {
    return <AdminDashboard onSwitchToAnalyst={() => setView('analyst')} />;
  }

  return <Dashboard onSwitchToAdmin={isAdmin ? () => setView('admin') : undefined} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
