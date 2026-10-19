import { useEffect, useState } from "react";
import { DashboardLayout } from "./Dashboard";

const API = "http://localhost:5000";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDoctors() {
      try {
        const response = await fetch(`${API}/api/users`);

        if (!response.ok) {
          throw new Error("Failed to load doctors.");
        }

        const users = await response.json();

        const doctorUsers = users.filter(
          (user) => user.role_name === "Doctor"
        );

        setDoctors(doctorUsers);
      } catch (err) {
        console.error("Error loading doctors:", err);
        setError("Unable to load doctors.");
      } finally {
        setLoading(false);
      }
    }

    loadDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const search = searchValue.trim().toLowerCase();

    return (
      String(doctor.user_id || "").toLowerCase().includes(search) ||
      String(doctor.full_name || "").toLowerCase().includes(search) ||
      String(doctor.email || "").toLowerCase().includes(search) ||
      String(doctor.department_name || "").toLowerCase().includes(search)
    );
  });

  return (
    <DashboardLayout
      type="user"
      title="Doctors"
      subtitle="View registered hospital doctors"
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
            <h2>All Doctors</h2>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Total doctors: {doctors.length}
            </p>
          </div>
        </div>

        <div style={{ padding: "0 20px 20px" }}>
          <input
            type="text"
            className="input"
            placeholder="Search by ID, name, email or department..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Doctor ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    Loading doctors...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    {error}
                  </td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No doctors found.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor.user_id}>
                    <td>{doctor.user_id}</td>
                    <td>{doctor.full_name}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.department_name || "Not assigned"}</td>
                    <td>
                      <span
                        className={`badge ${
                          doctor.status === "Active"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {doctor.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Doctors;