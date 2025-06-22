import { PrivateRoute } from '@/components/private-route';
import { Route, Routes } from 'react-router';
import Login from './pages/login';
import Register from './pages/register';
import Tasks from './pages/tasks';
import { useInitUser } from '@/hooks/use-init-user';

export default function App() {
  // init user if login
  useInitUser();
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
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
