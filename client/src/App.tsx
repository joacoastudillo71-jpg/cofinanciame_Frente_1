import React from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { ShowcaseEngine } from './components/engine/ShowcaseEngine';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { LoginView } from './components/views/LoginView';
import { useAuthStore } from './store/useAuthStore';
import { Switch, Route, Redirect } from 'wouter';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Switch>
        <Route path="/login">
          <LoginView />
        </Route>
        <Route path="/admin">
          <ProtectedRoute>
            <MainLayout>
              <AdminDashboard />
            </MainLayout>
          </ProtectedRoute>
        </Route>
        <Route path="/:projectSlug/:section/:subId">
          <MainLayout>
            <ShowcaseEngine />
          </MainLayout>
        </Route>
        <Route path="/:projectSlug/:section?">
          <MainLayout>
            <ShowcaseEngine />
          </MainLayout>
        </Route>
        <Route path="/">
          <MainLayout>
            <ShowcaseEngine />
          </MainLayout>
        </Route>
      </Switch>
    </div>
  );
}

export default App;