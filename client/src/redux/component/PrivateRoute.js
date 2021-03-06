import React from "react";
import { Route } from "react-router-dom";

const PrivateRoute = ({ component: Component, user, ...rest }) => (
  
  <Route
  {...rest}
    render={() =>
<Component user={user} {...rest} />
      
      
    }
  />
);

export default PrivateRoute;