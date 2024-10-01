import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api_calls/api_instance';
import { encryptText } from '../../helper_functions/encrypt_decrypt';

const SigninForm : React.FC = () => {
    const [userId, setUserId] = useState<string>('');
    const [userPassword, setUserPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        if(error){
            setError('');
        }
    },[userId, userPassword]);

    type validateDetailsProps = {
        userId : string;
        password: string;
    }
    const validateDetails = ({userId, password} : validateDetailsProps) : boolean => {
        return userId.trim().length !== 0 && password.trim().length !== 0;
    }
    // logining
    const handleSubmit = async (event : React.MouseEvent<HTMLInputElement, MouseEvent>) : Promise<void> => {
        event.preventDefault();
        if(!validateDetails({userId: userId, password: userPassword})){
            setError('All values required !!');
            return;
        }
        try{
            const response = await axiosInstance.post('/api/signin', {user_id : userId, user_password: userPassword});
            console.log("signin response: ",response);
            const token: string = response.data.token;
            const role: string = response.data.role;
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('role', encryptText(role));
            if(role === 'ADMIN'){   // NAVIGATING TO ADMIN DASHBOARD
                navigate('/admin');
            }else{                  // NAVIGATING TO EMPLOYEE DASHBOARD
                navigate('/');
            }
        }catch(err : unknown){
            if (axios.isAxiosError(err)) {
                // This is an Axios error, so it has a response property
                console.log("Error at signin handleSubmit: ", err);
                setError(err.response?.data?.error)
            } else {
                // Handle other types of errors (non-Axios errors)
                console.log("Error at signin handleSubmit: ", err);
            }
        }
    }

    return (
        <div className='p-7 flex flex-col gap-10'>
            <span className='font-semibold text-2xl'>"An investment in knowledge pays the best interest" — Benjamin Franklin</span> 
            <div>
                {error && <span className='text-error-light'>{error}</span>}
                <form className="flex flex-col justify-between gap-12">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="userId" className="font-medium">Employee ID</label>
                            <input type="text" placeholder="Enter Employee ID (JMDXXX)" id="userId" className="p-1 border-2 border-zinc-300" required value={userId} onChange={(e) => setUserId(e.target.value)}/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="userPassword" className="font-medium">Password</label>
                            <input type="password" placeholder="Enter Password" id="userPassword" className="p-1 border-2 border-zinc-300" required value={userPassword} onChange={(e) => setUserPassword(e.target.value)}/>
                        </div>
                    </div>
                    <input type='submit' className="bg-primary-light rounded-md text-white p-1 cursor-pointer"  value='Login' onClick={(e) => handleSubmit(e)}/>
                </form>
            </div>
        </div>
    )
}

export default SigninForm;
