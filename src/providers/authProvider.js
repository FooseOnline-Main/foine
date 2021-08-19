import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getUserDetails, signIn, signUp } from '../api';
// import { v4 } from 'uuid';
import firebase from '../firebase';
import { useJWT } from '../hooks';
import { useAuthentication } from '../hooks/auth';
import { useError } from './errorProvider';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

function AuthProvider({ children }) {
    const [jwt, setJwt] = useJWT();
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const {error, createError} = useError()

    // initializing firestore refs
    const fireAuth = firebase.auth();

    useEffect(async () => {
        setLoading(true);

        if(jwt){
            const {data} = await getUserDetails(jwt);
            console.log(data);

            if (data && data.success) {
                setLoading(false);
                setUser({...data.user});
            } else {
                setLoading(false);
                window.localStorage.removeItem('_fu_jwt');
            }
        }else{
            const unsubscribe = fireAuth.onAuthStateChanged(result=>{
                setLoading(false);
                if(result){
                    setUser(result);
                }else{
                    signInAnonymously();
                }
            })
            return unsubscribe;
        }
    }, [fireAuth]);

    const signInAnonymously = ()=>{
        fireAuth.signInAnonymously()
        .catch(({message})=> createError("Anonymous Error: " + message))
        .finally(()=> setLoading(false));
    }

    const login = async ({email, password}) => {
        setLoading(true);
        const {data} = await signIn({email, password});
        console.log({email, password});

        if(data.success){
            setLoading(false);
            setUser(data.user)
            setJwt(data.user.token)
        }else{
            setLoading(false);
            createError(data.message);
        }
    }

    const signup = async (fields) => {
        if(fields.password === fields.c_password){
            if(fields.password.length > 8){
                setLoading(true);
                
                delete fields.c_password
                const {data} = await signUp(fields);
        
                if(data.success){
                    setLoading(false);
                    setUser(data.user)
                    setJwt(data.user.token)
                }else{
                    setLoading(false);
                    createError(data.message)
                }
            }else{
                createError("Password is too short. ( >= 8 chars)")
            }
        }else{
            createError("Passwords do not match")
        }
    }

    const logout = () => {
        setUser({});
        setJwt("");
        window.location.href = "/";
    }

    return (
        <AuthContext.Provider value={{
            user, loading, error,
            login, signup, logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;
