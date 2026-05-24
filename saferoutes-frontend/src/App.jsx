import Home from "./Home Page/Home.jsx";
import Login from "./Login-Register/Login.jsx";
import SectorDashboard from "./SectorDashboard/sectordashboard.jsx";
import SectorCitizens from "./SectorCitizens/SectorCitizens.jsx";
import ReportDetails from "./MyReports/ReportDetails.jsx";
import AnalyticsDashboard from "./AnalyticsDashboard/AnalyticsDashboard.jsx";
import Profile from "./Profile/Profile.jsx";
import EditProfile from "./Profile/EditProfile.jsx";
import Reports from "./Reports/Reports.jsx";
import MyReports from "./MyReports/MyReports.jsx";

import Report from "./Report/Report.jsx";

function App() {
  const userType = localStorage.getItem("userType");
  const path = window.location.pathname;
  const userId = localStorage.getItem("userId");


  if (path === "/login") {
    return <Login />;
  }

  if (path === "/reports") {
    return <Reports />;
  }

  if (path === "/my-reports") {
    return <MyReports />;
  }

  if (path === "/report-details") {
    return <ReportDetails />;
  }

  if (path === "/analytics") {
    return <AnalyticsDashboard />;
  }

  if (path === "/profile") {
    return <Profile />;
  }

  if (path === "/edit-profile") {
    return <EditProfile />;
  }
  
  if (path === "/report") {
  return <Report />;
    } 

  if (path === "/sector-dashboard") {
    return userType === "Sector" ? <SectorDashboard /> : <Login />;
  }

  if (path === "/sector-citizens") {
    return userType === "Sector" ? <SectorCitizens /> : <Login />;
  }

  return <Home />;
   
}

export default App;