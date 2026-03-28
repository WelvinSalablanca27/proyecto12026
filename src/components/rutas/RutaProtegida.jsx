import { Navigate } from "react-router-dom";

const RutaProtegida = ({ children }) => {
    const usuario = localStorage.getItem("usuario-supabase");

    // Si NO hay usuario → redirige al login
    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    // Si hay usuario → deja pasar
    return children;
};

export default RutaProtegida;