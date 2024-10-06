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
import Courses from "./components/Employee/Courses";
import CreateTest from "./components/Admin/CreateTest";
import TestWindow from "./components/Employee/Courses/TestWindow";
import Notifications from "./components/Admin/Notifications";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route element={<EmpProtectedRoute/>}>
          <Route path="/dashboard" element={<EmployeeDashboard/>}/>
          <Route path="/courses" element={<Courses/>}/>
        </Route>
          <Route path="/test" element={<TestWindow/>}/>
        <Route element={<AdminProtectedRoute/>}>
          <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
          <Route path="/admin/allCourses" element={<AllCourses/>}/>
          <Route path="/admin/addCourse" element={<AddCourse/>}/>
          <Route path="/admin/addQuestions" element={<CreateTest/>}/>
          <Route path="/admin/employeeReport" element={<EmployeeReport/>}/>
          <Route path="/admin/notifications" element={<Notifications/>}/>
        </Route>
        <Route path="*" element={<PageNotFound/>}/>
      </Routes>
    </Router>
  )
}

export default App;
