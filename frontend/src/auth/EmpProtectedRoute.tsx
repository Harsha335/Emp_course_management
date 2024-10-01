import { Navigate, Outlet } from 'react-router-dom'
import { decryptText } from '../helper_functions/encrypt_decrypt';

export const EmpProtectedRoute = () => {
    const auth_token = sessionStorage.getItem('authToken');
    const role = decryptText(sessionStorage.getItem('role'));
    return (
        auth_token ? (role === 'EMPLOYEE' ? <Outlet/> : <Navigate to="/admin" />) : <Navigate to="/login" />
    )
}