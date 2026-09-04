import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getFromLocalStorage } from './local-storage';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const user = getFromLocalStorage("user");

    if (user?.token) {
        return children;
    }

    const next = `${location.pathname}${location.search || ""}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
};

export default ProtectedRoute;
