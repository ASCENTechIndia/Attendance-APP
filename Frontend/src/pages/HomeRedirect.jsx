import { Navigate } from "react-router-dom";

const HomeRedirect = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const designation = user?.designation;

  switch (designation) {
    case "Supervisor":
      return <Navigate to="/dashboard" replace />;

    case "Sanitary Inspector":
      return <Navigate to="/dashboard" replace />;

    default:
      return <Navigate to="/dashboard" replace />;
  }
};

export default HomeRedirect;