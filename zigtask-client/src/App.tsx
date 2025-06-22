import { Route, Routes } from "react-router";
import Login from "./pages/login";
import Register from "./pages/register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
