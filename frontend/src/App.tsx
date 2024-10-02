import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import { AdminProtectedRoute } from "./authProtectedRoutes/AdminProtectedRoute";
import { EmpProtectedRoute } from "./authProtectedRoutes/EmpProtectedRoute";
import PageNotFound from "./components/PageNotFound";
import EmployeeDashboard from "./components/Employee/Dashboard";
import AdminDashboard from "./components/Admin/Dashboard";
import AddCourse from "./components/Admin/AddCourse";
import AllCourses from "./components/Admin/AllCourses";
import EmployeeReport from "./components/Admin/EmployeeReport";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route element={<EmpProtectedRoute/>}>
          <Route path="/dashboard" element={<EmployeeDashboard/>}/>
        </Route>
        <Route element={<AdminProtectedRoute/>}>
          <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
          <Route path="/admin/allCourses" element={<AllCourses/>}/>
          <Route path="/admin/addCourse" element={<AddCourse/>}/>
          <Route path="/admin/employeeReport" element={<EmployeeReport/>}/>
        </Route>
        <Route path="*" element={<PageNotFound/>}/>
      </Routes>
    </Router>
  )
}

export default App;
