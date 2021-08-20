import React, {} from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useCheckAuth } from './auth';

const PrivateRoute = ({component: Component, ...rest}) => {
    console.log("Checking authentication")

    return (
        <Route {...rest} render={props=> { return <Component {...props}/> }}></Route>
    );
}

export default PrivateRoute;