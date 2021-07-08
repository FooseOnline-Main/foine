import '../css/auth.css';

import { AiOutlineLock, AiOutlineMail } from '@meronex/icons/ai';
import { Link, useHistory } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import InputBox from './input_box';
import Loader from './simple_loader';
import { useAuth } from '../providers/authProvider';

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {user, login, loading} = useAuth()
    const history = useHistory();

    useEffect(() => {
        document.body.style.overflow = "hidden";
    }, []);

    useEffect(() => {
        if(!user.isAnonymous)
            handleClose();
    }, [user]);

    const handleClose = ()=>{
        document.body.style.overflow = "auto";
        history.replace('/')
    }

    const handleSubmit = (e)=>{
        e.preventDefault();
        if(email && password){
            login({email, password})
        }
    }

    return (
        <div className="auth-popup">
            <div className="overlay" onClick={handleClose}></div>
            <div className="inner">
                <h3>Login to account</h3>
                <form onSubmit={handleSubmit} className="form-area">
                    <InputBox icon={AiOutlineMail} value={email} name="email" placeholder="Enter your email" type="email" onChange={({target: {value}})=> setEmail(value)} />
                    <InputBox icon={AiOutlineLock} value={password} name="password" placeholder="Enter password" type="password" onChange={({target: {value}})=> setPassword(value)} />
                    <div className="btn-box">
                        {!loading ? <button submit className="submit-btn">Login</button> :
                        <Loader />}
                    </div>
                    <div className="alt">
                        <p>Don't have an account?</p>
                        <Link className="link" to="/signup">Sign Up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
