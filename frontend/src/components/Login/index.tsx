import React, { useState } from 'react'
import loginImg from "../../assets/images/sign_in.svg"
import SigninForm from "./SigninForm";
import SignupForm from './SignupForm';

const Login : React.FC = () => {
    const [isSigninForm, setIsSigninForm] =  useState<boolean>(true);
    const handleFormPageChange = (e : React.MouseEvent<HTMLButtonElement, MouseEvent>, isSigninForm: boolean) => {
        e.preventDefault();
        setIsSigninForm(isSigninForm);
    }
    return (
        <div className="flex w-full h-[100vh]">
        <div className="hidden flex-1  min-h-full lg:flex lg:align-center lg:justify-center">
            <img src={loginImg} alt='Login image' className='w-[75%] object-contain'/>
        </div>
        <div className="flex-1 flex items-center justify-center flex-col w-full">
            <div className='bg-white w-[90%]  lg:w-[50%] rounded-lg'>
                <div className='flex flex-row w-full'>
                    <button className={`flex-1  p-2 rounded-tl-lg ${isSigninForm ? 'bg-white' : 'bg-slate-300'}`} onClick={(e) => handleFormPageChange(e, true)}>Sign in</button>
                    <button className={`flex-1  p-2 rounded-tr-lg ${isSigninForm ? 'bg-slate-300' : 'bg-white'}`} onClick={(e) => handleFormPageChange(e, false)}>Sign up</button>
                </div>
                {
                    isSigninForm ?
                    <SigninForm/> :
                    <SignupForm/>
                }
            </div>
        </div>
        </div>
    )
}

export default Login;
