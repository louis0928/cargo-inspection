/* eslint-disable no-unused-vars */
import "./App.css";
import { ModernNavbar } from "./components/ModernNavbar";
import { OutboundLoadingSummaryForm } from "./pages/OutboundPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
//import { ReviewPage } from "./pages/ReviewPage";
import ValidationPage from "./pages/ValidationPage";
import VerificationPage from "./pages/VerificationPage";
import { Routes, Route } from "react-router-dom";
import { ProfilePage } from "./pages/ProfilePage";
import RequireAuth from "./components/utility/RequireAuth";
import { useLocation } from "react-router-dom";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import PersistLogin from "./components/utility/PersistLogin";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  return (
    <>
      {!isLoginPage && <ModernNavbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/*Protected Routes when login*/}
        <Route element={<PersistLogin />}>
          <Route
            element={<RequireAuth allowedRoles={["ADMIN", "INSPECTOR"]} />}
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/outbound/:routeNum"
              element={<OutboundLoadingSummaryForm />}
            />
            <Route path="/outbound" element={<OutboundLoadingSummaryForm />} />
          </Route>
          <Route element={<RequireAuth allowedRoles={["TEST"]} />}>
            <Route path="/validation" element={<ValidationPage />} />
            <Route
              path="/validation/:selectedYear/:selectedSite"
              element={<ValidationPage />}
            />
            <Route path="/verification" element={<VerificationPage />} />
            <Route
              path="/verification/:verificationYear/:verificationMonth/:verificationSite"
              element={<VerificationPage />}
            />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
        {/* <Route path="*" element={<PageDoesNotExist />} /> */}
      </Routes>
    </>
  );
}

export default App;
