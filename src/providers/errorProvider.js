import React, { useState, useContext } from 'react';
// Create error context
const ErrorContext = React.createContext();


export function useError() {
    return useContext(ErrorContext);
}

function ErrorProvider({ children }) {
    const [error, setError] = useState(null);

    const createError = (errorMsg, timelapse = 3000)=>{
        setError(errorMsg);
        setTimeout(()=> setError(null), timelapse);
    }

    return (
        <ErrorContext.Provider value={{ error, createError }}>
            {children}
        </ErrorContext.Provider>
    )
}

export default ErrorProvider;
