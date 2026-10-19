import { useEffect, useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";

const API = "http://localhost:5000";

function Sidebar({ type, permissions = [] }) {
  const location = useLocation();
  const isAdmin = type === "admin";

  const links = isAdmin
    ? [
        ["Dashboard", "/admin/dashboard"],
        ["User Management", "/admin/users"],
        ["Roles & Permissions", "/admin/roles"],
        ["Departments", "/admin/departments"],
      ]
    : [
        ["Dashboard", "/user/dashboard"],
        ["Doctors", "/user/doctors", "View Doctors"],
        ["Patients", "/user/patients", "View Patients"],
        ["Appointments", "/user/appointments", "View Appointments"],
        ["Pharmacy", "/user/pharmacy", "View Pharmacy"],
      ];

  return (
    <aside className="sidebar" id={isAdmin ? "adminSidebar" : "userSidebar"}>
      <div className="brand">
        <img src="/assets/logo/careflow-logo.png" alt="CareFlow logo" />
        <div>
          <strong>CareFlow</strong>
          <span>Hospital Management</span>
        </div>
      </div>

      <nav className="nav">
        {links.map(([label, href, permission]) => {
          if (permission && !permissions.includes(permission)) return null;

          const current = location.pathname === href;

          return (
            <Link
              key={label}
              to={href}
              className={current ? "active" : ""}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <a
          href="/"
          onClick={() => {
            sessionStorage.removeItem("careflowUser");
            sessionStorage.removeItem("careflowPermissions");
          }}
        >
          Logout
        </a>
      </div>
    </aside>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDoctors: 0,
    totalDepartments: 0,
  });

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const [usersResponse, departmentsResponse] = await Promise.all([
          fetch(`${API}/api/users`),
          fetch(`${API}/api/departments`),
        ]);

        if (!usersResponse.ok || !departmentsResponse.ok) {
          throw new Error("Failed to load dashboard data.");
        }

        const users = await usersResponse.json();
        const departments = await departmentsResponse.json();

        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((user) => user.status === "Active").length,
          totalDoctors: users.filter((user) => user.role_name === "Doctor").length,
          totalDepartments: departments.length,
        });
      } catch (error) {
        console.error("Dashboard stats error:", error);
      }
    }

    loadDashboardStats();
  }, []);

  return (
    <DashboardLayout type="admin" subtitle="Overview of your hospital system">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, marginBottom: 4 }}>Welcome back, Admin</h2>
        <p style={{ color: "var(--muted)" }}>
          Here's an overview of CareFlow today.
        </p>
      </div>

      <div className="cards">
        {[
          ["Total Users", stats.totalUsers],
          ["Active Users", stats.activeUsers],
          ["Doctors", stats.totalDoctors],
          ["Departments", stats.totalDepartments],
        ].map(([label, number]) => (
          <div className="stat" key={label}>
            <div>
              <div className="num">{number}</div>
              <div className="lbl">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Quick Actions</h2>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            padding: "0 20px 20px",
          }}
        >
          <Link to="/admin/create-user" className="btn btn-primary">
            + Create User
          </Link>
          <Link to="/admin/users" className="btn btn-secondary">
            Manage Users
          </Link>
          <Link to="/admin/roles" className="btn btn-secondary">
            Manage Roles
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StaffDashboard() {
  const user = JSON.parse(sessionStorage.getItem("careflowUser") || "null");
  const [permissions, setPermissions] = useState(null);

  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    activeAppointments: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadPermissions() {
      try {
        const response = await fetch(`${API}/api/roles`);

        if (!response.ok) {
          throw new Error("Failed to load roles");
        }

        const roles = await response.json();
        const currentRole = roles.find(
          (role) => Number(role.role_id) === Number(user?.role_id)
        );

        if (!currentRole) {
          throw new Error("User role not found.");
        }

        const names = (currentRole.permissions || []).map(
          (permission) => permission.permission_name
        );

        if (!cancelled) {
          sessionStorage.setItem("careflowPermissions", JSON.stringify(names));
          setPermissions(names);
        }
      } catch (error) {
        console.error("Permission loading error:", error);

        if (!cancelled) {
          setPermissions([]);
        }
      }
    }

    if (user?.role_id) {
      loadPermissions();
    }

    return () => {
      cancelled = true;
    };
  }, [user?.role_id]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const [usersResponse, patientsResponse, appointmentsResponse] =
          await Promise.all([
            fetch(`${API}/api/users`),
            fetch(`${API}/api/patients`),
            fetch(`${API}/api/appointments`),
          ]);

        if (
          !usersResponse.ok ||
          !patientsResponse.ok ||
          !appointmentsResponse.ok
        ) {
          throw new Error("Failed to load dashboard statistics.");
        }

        const users = await usersResponse.json();
        const patients = await patientsResponse.json();
        const appointments = await appointmentsResponse.json();

        if (cancelled) return;

        setStats({
          doctors: users.filter(
            (item) =>
              item.role_name === "Doctor" && item.status === "Active"
          ).length,

          patients: patients.filter(
            (item) => item.status === "Active"
          ).length,

          appointments: appointments.length,

          activeAppointments: appointments.filter(
            (item) => item.status === "Scheduled"
          ).length,
        });
      } catch (error) {
        console.error("Dashboard statistics error:", error);
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!user?.role_id) return <Navigate to="/" replace />;

  if (permissions === null) {
    return <p style={{ padding: 24 }}>Loading dashboard...</p>;
  }

  const staffName = user.full_name || "User";

  const actions = [
    ["View Patients", "/user/patients", "View Patients", "quickPatients"],
    [
      "View Appointments",
      "/user/appointments",
      "View Appointments",
      "quickAppointments",
    ],
    ["View Doctors", "/user/doctors", "View Doctors", "quickDoctors"],
    ["Pharmacy", "/user/pharmacy", "View Pharmacy", "quickPharmacy"],
  ];

  return (
    <DashboardLayout
      type="user"
      permissions={permissions}
      subtitle="Overview of your hospital activities"
      staffName={staffName}
    >
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22 }}>Welcome back, {staffName}</h2>
        <p style={{ color: "var(--muted)", marginTop: 4 }}>
          Here's what's happening in the hospital today.
        </p>
      </div>

      <div className="cards">
        {[
          ["Doctors", stats.doctors],
          ["Patients", stats.patients],
          ["Appointments", stats.appointments],
          ["Active Appointments", stats.activeAppointments],
        ].map(([label, number]) => (
          <div className="stat" key={label}>
            <div>
              <div className="num">{number}</div>
              <div className="lbl">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Quick Actions</h2>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Access commonly used hospital features
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "0 20px 20px",
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {actions.map(([label, href, permission, id]) => {
            if (!permissions.includes(permission)) return null;

            return (
              <Link key={id} to={href} id={id} className="btn btn-secondary">
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

function DashboardLayout({
  type,
  title = "Dashboard",
  subtitle,
  permissions = [],
  staffName = "User",
  children,
}) {
  const isAdmin = type === "admin";

  return (
    <div className="dashboard-page">
      <Sidebar type={type} permissions={permissions} />

      <main className="main">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="menu-btn"
              type="button"
              aria-label="Open menu"
              onClick={() =>
                document
                  .getElementById(isAdmin ? "adminSidebar" : "userSidebar")
                  ?.classList.toggle("open")
              }
            >
              ☰
            </button>

            <div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </div>

          <div className="profile">
            <div className="avatar">
              {isAdmin ? "A" : staffName.charAt(0).toUpperCase()}
            </div>
            <div>
              <b>{isAdmin ? "Admin" : staffName}</b>
              <small>{isAdmin ? "Administrator" : "Hospital Staff"}</small>
            </div>
          </div>
        </header>

        <section className="content">{children}</section>
      </main>
    </div>
  );
}

export { AdminDashboard, StaffDashboard, DashboardLayout };
