import { Navigate } from "react-router-dom";

const HomeRedirect = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const designation = user?.designation;

  switch (designation) {
    case "Supervisor":
      return <Navigate to="/monthly-attendance-summary" replace />;

    case "Sanitary Inspector":
      return <Navigate to="/monthly-attendance-summary" replace />;

    default:
      return <Navigate to="/monthly-attendance-summary" replace />;
  }
};

export default HomeRedirect;