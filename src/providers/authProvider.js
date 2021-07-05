import React, { useState, useContext, useEffect } from 'react';
// import { v4 } from 'uuid';
import firebase from '../firebase';
import { useError } from './errorProvider';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

function AuthProvider({ children }) {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const {error, createError} = useError()

    // initializing firestore refs
    // const store = firebase.firestore();
    const fireAuth = firebase.auth();

    useEffect(() => {
        setLoading(true);
        const unsubscribe = fireAuth.onAuthStateChanged(result=>{
            setLoading(false);
            if(result){
                setUser(result);
            }else{
                signInAnonymously();
            }
        })
        return unsubscribe;
    }, [fireAuth]);

    const signInAnonymously = ()=>{
        fireAuth.signInAnonymously()
        .catch(({message})=> createError("Anonymous Error: " + message))
        .finally(()=> setLoading(false));
    }

    const login = ({email, password}) => {
        setLoading(true);
        fireAuth.signInWithEmailAndPassword(email, password)
        .catch(({message})=>{ createError(message); })
        .finally(()=>{ setLoading(false); })
    }

    const signup = (data) => {
        setLoading(true);
        if(data.password === data.c_password){
            fireAuth.createUserWithEmailAndPassword(data.email, data.password)
            .then(({user})=>{
                user.updateProfile({displayName: data.username, phoneNumber: data.phone})
                .catch(({message})=>{ createError(message); });
            })
            .catch(({message})=>{ createError(message); })
            .finally(()=>{
                setLoading(false);
            });
        }else{
            setLoading(false);
            createError("Passwords does not match", 2000)
        }
    }

    const logout = () => {
        setLoading(true);
        // Sign out here
        fireAuth.signOut()        
        .then(()=> setLoading(false))
        .catch(({message})=> createError(message))
        .finally(()=>{ setLoading(false); })
    }

    return (
        <AuthContext.Provider value={{
            user, loading, error,
            login, signup, logout,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;
