import { Navigate, Outlet } from 'react-router-dom'

export const ProtectedRoute = () => {
    const auth_token = sessionStorage.getItem('authToken');
    return (
        auth_token ? <Outlet/> : <Navigate to="/login" />
    )
}