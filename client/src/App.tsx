import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { TakingsList } from '@/pages/takings/TakingsList';
import { EventsList } from '@/pages/events/EventsList';
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
        <Route path="/takings" element={<TakingsList />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/deployment" element={<Deployment />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
