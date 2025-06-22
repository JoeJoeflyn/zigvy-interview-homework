import { PrivateRoute } from "@/components/private-route";
import { Route, Routes } from "react-router";
import Login from "./pages/login";
import Register from "./pages/register";
import Tasks from "./pages/tasks";

export default function App() {
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
