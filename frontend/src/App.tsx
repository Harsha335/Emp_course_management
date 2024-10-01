import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import { AdminProtectedRoute } from "./auth/AdminProtectedRoute";
import PageNotFound from "./components/PageNotFound";
import EmployeeDashboard from "./components/Employee/Dashboard";
import AdminDashboard from "./components/Admin/Dashboard";
import { EmpProtectedRoute } from "./auth/EmpProtectedRoute";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route element={<EmpProtectedRoute/>}>
          <Route path="/" element={<EmployeeDashboard/>}/>
        </Route>
        <Route element={<AdminProtectedRoute/>}>
          <Route path="/admin" element={<AdminDashboard/>}/>
        </Route>
        <Route path="*" element={<PageNotFound/>}/>
      </Routes>
    </Router>
  )
}

export default App;
