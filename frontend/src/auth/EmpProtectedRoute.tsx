import { Navigate, Outlet } from 'react-router-dom'
import { decryptText } from '../helper_functions/encrypt_decrypt';
import { Navbar } from '../components/Navbar';

export const EmpProtectedRoute = () => {
    const auth_token = sessionStorage.getItem('authToken');
    const role = decryptText(sessionStorage.getItem('role'));
    return (
        auth_token ? (role === 'EMPLOYEE' ? 
            <div className='border-0 p-0 flex flex-row w-full max-h-full'>
                <Navbar/>
                <div className='p-0 m-0 flex-1'>
                    <Outlet/>
                </div>
            </div>
            : <Navigate to="/admin" />) : <Navigate to="/login" />
    )
}