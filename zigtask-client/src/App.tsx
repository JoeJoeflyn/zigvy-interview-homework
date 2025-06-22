import { PrivateRoute } from '@/components/private-route';
import { Route, Routes } from 'react-router';
import Login from './pages/login';
import Register from './pages/register';
import Tasks from './pages/tasks';
import { useInitUser } from '@/hooks/use-init-user';
import { PublicRoute } from '@/components/public-route';

export default function App() {
  // init user if login
  useInitUser();
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <Tasks />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
