import { Navigate, Outlet } from "react-router-dom";
import useStore from "../store/useStore";

const RoleRedirect = () => {
  const user = useStore((state) => state.user);
  if (user?.role_name === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
};

export default RoleRedirect;
