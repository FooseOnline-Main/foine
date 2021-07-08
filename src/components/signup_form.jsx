import '../css/auth.css';

import { AiOutlineLock, AiOutlineMail, AiOutlinePhone, AiOutlineUser } from '@meronex/icons/ai';
import React, { useEffect, useState } from 'react';

import InputBox from './input_box';
import { Link } from 'react-router-dom';
import Loader from './simple_loader';
import { useAuth } from '../providers/authProvider';
import { useHistory } from 'react-router';

const SignupForm = () => {
    const [username, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [c_password, setCPassword] = useState("");
    const {user, signup, loading} = useAuth();
    const history = useHistory()

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
            signup({username, email, phone, password, c_password})
        }
    }

    return (
        <div className="auth-popup">
            <div className="overlay" onClick={handleClose}></div>
            <div className="inner">
                <h3>Create An Account</h3>
                <form onSubmit={handleSubmit} className="form-area">
                    <InputBox value={username} icon={AiOutlineUser} name="name" placeholder="Enter your name" type="text" onChange={({target: {value}})=> setUserName(value)} />
                    <InputBox value={email} icon={AiOutlineMail} name="email" placeholder="Enter your email" type="text" onChange={({target: {value}})=> setEmail(value)} />
                    <InputBox value={phone} icon={AiOutlinePhone} name="telephone" placeholder="Enter telephone number" type="number" onChange={({target: {value}})=> setPhone(value)} />
                    <InputBox value={password} icon={AiOutlineLock} name="password" placeholder="Choose a password" type="password" onChange={({target: {value}})=> setPassword(value)} />
                    <InputBox value={c_password} icon={AiOutlineLock} name="c_password" placeholder="Confirm password" type="password" onChange={({target: {value}})=> setCPassword(value)} />
                    <div className="btn-box">
                        {!loading ? <button type="submit" className="submit-btn">Sign Up</button> :
                        <Loader />}
                    </div>
                    <div className="alt">
                        <p>Already have an account?</p>
                        <Link className="link" to="/login">Log In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignupForm;
