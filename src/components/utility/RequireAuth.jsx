/* eslint-disable react/prop-types */
import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();

  // checks for the accessToken
  return auth && auth.roles && allowedRoles?.includes(auth.roles[0]) ? (
    // if user is logged in, send outlet, if not send to login page. Can also go back to
    // previous page due to the state and replace.
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  );
};

export default RequireAuth;
