import React, {useEffect} from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useState } from 'react/cjs/react.development';
import { useAuth } from '../providers/authProvider';

const PrivateRoute = ({component: Component, ...rest}) => {
    const {user} = useAuth();
    const [allow, setAllow] = useState(false);

    useEffect(() => {
        setAllow(!user.isAnonymous);
    }, [user]);

    return (
        <Route {...rest} render={props=> {
            return allow ? <Component {...props}/> : <Redirect to="/" />  }
        }>
        </Route>
    );
}

export default PrivateRoute;