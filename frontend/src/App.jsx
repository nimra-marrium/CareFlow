import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  AdminDashboard,
  StaffDashboard,
  DashboardLayout,
} from "./Dashboard";
import "./App.css";
import UserManagement from "./UserManagement";
import CreateUser from "./CreateUser";
import RolesPermissions from "./RolesPermissions";
import EditUser from "./EditUser";
import Departments from "./Departments";
import Doctors from "./Doctors";
import Patients from "./Patients";
import Appointments from "./Appointments";
import Pharmacy from "./Pharmacy";

function LoginPage() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState("admin");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [staffError, setStaffError] = useState("");

  async function handleLogin(event, type) {
    event.preventDefault();

    const email = type === "admin" ? adminEmail.trim() : staffEmail.trim();
    const password = type === "admin" ? adminPassword : staffPassword;
    const setError = type === "admin" ? setAdminError : setStaffError;

    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Email or password is incorrect. Please try again."
        );
        return;
      }

      if (type === "admin" && data.user.role !== "Admin") {
        setError("This account is not an Admin account.");
        return;
      }

      if (type === "staff" && data.user.role === "Admin") {
        setError("Please use the Admin login.");
        return;
      }

      if (type === "staff") {
        sessionStorage.setItem("careflowUser", JSON.stringify(data.user));
      }

      navigate(type === "admin" ? "/admin/dashboard" : "/user/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to the server.");
    }
  }

  return (
    <div className="login-page">
      <section className="login-art">
        <div className="brand-lg">
          <span className="logo-tile">
            <img src="/assets/logo/careflow-logo.png" alt="CareFlow logo" />
          </span>
          <strong>CareFlow</strong>
        </div>

        <div>
          <h2>Every patient, doctor and medicine in one place.</h2>
          <p>Log in as an admin or as staff.</p>
        </div>
      </section>

      <section className="login-form-wrap">
        <div className="login-form">
          <div className="tabs" style={{ marginBottom: 26 }}>
            <button
              type="button"
              className={`tab ${loginType === "admin" ? "active" : ""}`}
              onClick={() => setLoginType("admin")}
            >
              Admin
            </button>

            <button
              type="button"
              className={`tab ${loginType === "staff" ? "active" : ""}`}
              onClick={() => setLoginType("staff")}
            >
              Staff
            </button>
          </div>

          {loginType === "admin" ? (
            <form onSubmit={(event) => handleLogin(event, "admin")}>
              <h1>Admin Login</h1>
              <p>Sign in to manage users, roles and the system.</p>

              <div
                className={`error-msg ${adminError ? "show" : ""}`}
                role="alert"
              >
                {adminError}
              </div>

              <div className="field">
                <label htmlFor="adminEmail">Email or username</label>
                <input
                  type="text"
                  id="adminEmail"
                  placeholder="admin@careflow.pk"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="adminPassword">Password</label>
                <input
                  type="password"
                  id="adminPassword"
                  placeholder="Enter your password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  required
                />
              </div>

              <div className="row">
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="checkbox" />
                  Remember me
                </label>
                <a href="#">Forgot password?</a>
              </div>

              <button type="submit" className="btn btn-primary">
                Log in as Admin
              </button>
            </form>
          ) : (
            <form onSubmit={(event) => handleLogin(event, "staff")}>
              <h1>Staff Login</h1>
              <p>Log in with your staff account.</p>

              <div
                className={`error-msg ${staffError ? "show" : ""}`}
                role="alert"
              >
                {staffError}
              </div>

              <div className="field">
                <label htmlFor="staffEmail">Email or username</label>
                <input
                  type="text"
                  id="staffEmail"
                  placeholder="yourname@careflow.pk"
                  value={staffEmail}
                  onChange={(event) => setStaffEmail(event.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="staffPassword">Password</label>
                <input
                  type="password"
                  id="staffPassword"
                  placeholder="Enter your password"
                  value={staffPassword}
                  onChange={(event) => setStaffPassword(event.target.value)}
                  required
                />
              </div>

              <div className="row">
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="checkbox" />
                  Remember me
                </label>
                <a href="#">Forgot password?</a>
              </div>

              <button type="submit" className="btn btn-primary">
                Log in as Staff
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function StaffPagePlaceholder({ title, description }) {
  return (
    <DashboardLayout
      type="user"
      title={title}
      subtitle={description}
      permissions={JSON.parse(
        sessionStorage.getItem("careflowPermissions") || "[]"
      )}
      staffName={
        JSON.parse(sessionStorage.getItem("careflowUser") || "null")
          ?.full_name || "User"
      }
    >
      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>{title}</h2>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              This page is being developed.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      {/* Admin pages */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/create-user" element={<CreateUser />} />
      <Route path="/admin/edit-user" element={<EditUser />} />
      <Route path="/admin/departments" element={<Departments />} />
      <Route path="/user/doctors" element={<Doctors />} />
      <Route path="/user/patients" element={<Patients />} />
      <Route path="/user/appointments" element={<Appointments />} />
      <Route path="/user/pharmacy" element={<Pharmacy />} />

      <Route
        path="/admin/roles"
        element={
          <DashboardLayout
            type="admin"
            title="Roles & Permissions"
            subtitle="Manage system roles and their access"
          >
            <RolesPermissions />
          </DashboardLayout>
        }
      />

      {/* Staff dashboard */}
      <Route path="/user/dashboard" element={<StaffDashboard />} />

      {/* Staff pages - placeholders until implemented */}
      <Route
        path="/user/doctors"
        element={
          <StaffPagePlaceholder
            title="Doctors"
            description="View and access doctor information"
          />
        }
      />

      <Route
        path="/user/patients"
        element={
          <StaffPagePlaceholder
            title="Patients"
            description="View and manage patient information"
          />
        }
      />

      <Route
        path="/user/appointments"
        element={
          <StaffPagePlaceholder
            title="Appointments"
            description="Schedule and manage appointments"
          />
        }
      />

      <Route
        path="/user/pharmacy"
        element={
          <StaffPagePlaceholder
            title="Pharmacy"
            description="View and manage medicines"
          />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;