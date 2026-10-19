
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "./Dashboard";

const API = "http://localhost:5000";

function CreateUser() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isDoctor = role === "1";

  useEffect(() => {
    async function loadFormOptions() {
      try {
        const [rolesResponse, departmentsResponse] =
          await Promise.all([
            fetch(`${API}/api/roles`),
            fetch(`${API}/api/departments`),
          ]);

        if (!rolesResponse.ok) {
          throw new Error("Failed to load roles.");
        }

        if (!departmentsResponse.ok) {
          throw new Error("Failed to load departments.");
        }

        const rolesData = await rolesResponse.json();
        const departmentsData = await departmentsResponse.json();

        setRoles(
          rolesData.filter((item) => item.role_name !== "Admin")
        );

        setDepartments(
          departmentsData.filter(
            (item) => item.status === "Active"
          )
        );
      } catch (err) {
        console.error("Load form options error:", err);
        setError(
          "Could not load roles or departments from the CareFlow backend."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFormOptions();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!role || !department) {
      window.alert(
        "Please select a valid role and department."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role_id: role,
          department_id: department,
          specialization: specialization.trim() || null,
          status: "Active",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.message || "Failed to create user.");
        return;
      }

      window.alert(
        "User created successfully!\n\nUser ID: " +
          data.user_id
      );

      navigate("/admin/users");
    } catch (err) {
      console.error("Create user error:", err);
      window.alert(
        "Could not connect to the CareFlow backend."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout
      type="admin"
      title="Create User"
      subtitle="Create a new hospital system account"
    >
      <div className="form-card">
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 18 }}>User Information</h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 13,
              marginTop: 4,
            }}
          >
            Enter the details for the new user
          </p>
        </div>

        {error && (
          <p
            role="alert"
            style={{ color: "var(--red)", marginBottom: 16 }}
          >
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading roles and departments...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="userId">User ID</label>
                <input
                  type="text"
                  id="userId"
                  value="Auto-generated"
                  readOnly
                />
                <small className="form-helper">
                  User ID will be generated automatically.
                </small>
              </div>

              <div className="field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    if (e.target.value !== "1") {
                      setSpecialization("");
                    }
                  }}
                  required
                >
                  <option value="">Select role</option>
                  {roles.map((item) => (
                    <option
                      key={item.role_id}
                      value={String(item.role_id)}
                    >
                      {item.role_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((item) => (
                    <option
                      key={item.department_id}
                      value={String(item.department_id)}
                    >
                      {item.department_name}
                    </option>
                  ))}
                </select>
              </div>

              {isDoctor && (
                <div className="field" id="specializationField">
                  <label htmlFor="specialization">
                    Specialization
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    placeholder="Enter specialization"
                    value={specialization}
                    onChange={(e) =>
                      setSpecialization(e.target.value)
                    }
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/admin/users")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CreateUser;