import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api_calls/api_instance';
import axios from 'axios';

const SignupForm : React.FC = () => {

    type UserFormType = {
        userName: string;
        userEmail: string;
        userPassword: string;
        userConfirmPassword: string;
    }
    const [userForm, setUserForm] = useState<UserFormType>({
        userName: '',
        userEmail: '',
        userPassword: '',
        userConfirmPassword: ''
    })

    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        if(userForm.userPassword !== userForm.userConfirmPassword){
            setError('Password Does not match!!');
        }else{
            setError('');
        }
    },[userForm.userConfirmPassword]);

    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name: string = e.target.id;
        const value: string = e.target.value;
        setUserForm(form => ({...form, [name]: value}));
    }

    type validateDetailsProps = {
        userName : string;
        userEmail: string;
        password: string;
        confirmPassword: string;
    }
    const validateDetails = ({userName, userEmail, password, confirmPassword} : validateDetailsProps) : boolean => {
        return userName.trim().length !== 0 && userEmail.trim().length !== 0 && password.trim().length !== 0 && password === confirmPassword;
    }

    // signup
    const handleSubmit = async (event : React.MouseEvent<HTMLInputElement, MouseEvent>) : Promise<void> => {
        event.preventDefault();
        if(!validateDetails({userName: userForm.userName, userEmail: userForm.userEmail, password: userForm.userPassword,confirmPassword : userForm.userConfirmPassword})){
            setError('All values required !!');
            return;
        }
        try{
            type bodyType = {
                user_name: string;
                user_email: string;
                user_password: string;
            }
            const body : bodyType = { user_name : userForm.userName, user_email : userForm.userEmail, user_password : userForm.userPassword }
            const response = await axiosInstance.post('/api/signup', body);
            console.log("signup response: ",response);
            navigate('/login');
        }catch(err : unknown){
            if (axios.isAxiosError(err)) {
                // This is an Axios error, so it has a response property
                console.log("Error at signup handleSubmit: ", err);
                setError(err.response?.data?.error)
            } else {
                // Handle other types of errors (non-Axios errors)
                console.log("Error at signup handleSubmit: ", err);
            }
        }
    }

    return (
        <div className='p-7 flex flex-col gap-10'>
            <span className='font-semibold text-2xl'>The secret of getting ahead is getting started.</span> 
            <div>
                {error && <span className='text-error-light'>{error}</span>}
                <form className="flex flex-col justify-between gap-12">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="userName" className="font-medium">User Name</label>
                            <input type="text" placeholder="Enter User Name" id="userName" className="p-1 border-2 border-zinc-300" required value={userForm.userName} onChange={(e) => handleInputOnChange(e)}/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="userEmail" className="font-medium">User email</label>
                            <input type="email" placeholder="Enter user email" id="userEmail" className="p-1 border-2 border-zinc-300" required value={userForm.userEmail} onChange={(e) => handleInputOnChange(e)}/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="userPassword" className="font-medium">Password</label>
                            <input type="password" placeholder="Enter user Password" id="userPassword" className="p-1 border-2 border-zinc-300" required value={userForm.userPassword} onChange={(e) => handleInputOnChange(e)}/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="userConfirmPassword" className="font-medium">Confirm Password</label>
                            <input type="password" placeholder="Enter user Password Again" id="userConfirmPassword" className="p-1 border-2 border-zinc-300" required value={userForm.userConfirmPassword} onChange={(e) => handleInputOnChange(e)}/>
                        </div>
                    </div>
                    <input type='submit' className="bg-primary-light rounded-md text-white p-1 cursor-pointer"  value='Sign Up' onClick={(e) => handleSubmit(e)}/>
                </form>
            </div>
        </div>
    )
}

export default SignupForm;
