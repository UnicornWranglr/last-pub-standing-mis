import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Insights } from '@/pages/Insights';
import { TakingsList } from '@/pages/takings/TakingsList';
import { EventsList } from '@/pages/events/EventsList';
import { ExpensesList } from '@/pages/expenses/ExpensesList';
import { PayrollList } from '@/pages/payroll/PayrollList';
import { Admin } from '@/pages/Admin';
import { Roadmap } from '@/pages/Roadmap';
import { Deployment } from '@/pages/Deployment';

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
        <Route path="/takings" element={<TakingsList />} />
        <Route path="/events" element={<EventsList />} />

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

        <Route path="/deployment" element={<Deployment />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
