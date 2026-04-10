import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Insights } from '@/pages/Insights';
import { TakingsList } from '@/pages/takings/TakingsList';
import { StaffTakings } from '@/pages/takings/StaffTakings';
import { EventsList } from '@/pages/events/EventsList';
import { Rotas } from '@/pages/Rotas';
import { ExpensesList } from '@/pages/expenses/ExpensesList';
import { PayrollList } from '@/pages/payroll/PayrollList';
import { Admin } from '@/pages/Admin';
import { Roadmap } from '@/pages/Roadmap';
import { Deployment } from '@/pages/Deployment';

/**
 * Staff get a stripped-down single-form view; managers and owners get the
 * full TakingsList with summary tiles, table and dialog form.
 */
function TakingsRoute() {
  const { user } = useAuth();
  if (user?.role === 'staff') return <StaffTakings />;
  return <TakingsList />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/insights"
          element={
            <ProtectedRoute requireRole={['owner', 'manager']}>
              <Insights />
            </ProtectedRoute>
          }
        />
        <Route path="/takings" element={<TakingsRoute />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/rotas" element={<Rotas />} />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute requireRole={['owner', 'manager']}>
              <ExpensesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <ProtectedRoute requireRole={['owner']}>
              <PayrollList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireRole={['owner']}>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/deployment"
          element={
            <ProtectedRoute requireRole={['owner']}>
              <Deployment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmap"
          element={
            <ProtectedRoute requireRole={['owner']}>
              <Roadmap />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
