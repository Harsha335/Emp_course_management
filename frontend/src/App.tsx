import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import PageNotFound from "./components/PageNotFound";
import EmployeeDashboard from "./components/Employee/Dashboard";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route element={<ProtectedRoute/>}>
          <Route path="/" element={<EmployeeDashboard/>}/>
        </Route>
        <Route path="*" element={<PageNotFound/>}/>
      </Routes>
    </Router>
  )
}

export default App;
