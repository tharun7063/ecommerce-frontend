import { Navigate, Outlet } from "react-router-dom";
import useStore from "../store/useStore";

const AdminWrapper = () => {
  const user = useStore((state) => state.user);
  if (!user || user.role_name !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default AdminWrapper;
