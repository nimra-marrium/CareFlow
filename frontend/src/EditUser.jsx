import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "./Dashboard";

const API = "http://localhost:5000";

function EditUser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("id");

  const [formData, setFormData] = useState({
    user_id: "",
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role_id: "",
    department_id: "",
    specialization: "",
    status: "Active",
  });

  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = userId === "USR-001";
  const isDoctor = String(formData.role_id) === "1";

  useEffect(() => {
    async function loadData() {
      if (!userId) {
        setError("No user ID was provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [userResponse, rolesResponse, departmentsResponse] =
          await Promise.all([
            fetch(`${API}/api/users/${encodeURIComponent(userId)}`),
            fetch(`${API}/api/roles`),
            fetch(`${API}/api/departments`),
          ]);

        const user = await userResponse.json();
        const rolesData = await rolesResponse.json();
        const departmentsData = await departmentsResponse.json();

        if (!userResponse.ok) {
          throw new Error(user.message || "Failed to load user.");
        }

        if (!rolesResponse.ok || !departmentsResponse.ok) {
          throw new Error("Failed to load roles or departments.");
        }

        setRoles(
          (Array.isArray(rolesData) ? rolesData : []).filter(
            (role) => role.role_name !== "Admin"
          )
        );

        setDepartments(
          Array.isArray(departmentsData) ? departmentsData : []
        );

        setFormData({
          user_id: user.user_id,
          full_name: user.full_name || "",
          email: user.email || "",
          password: "",
          phone: user.phone || "",
          role_id: user.role_id == null ? "" : String(user.role_id),
          department_id:
            user.department_id == null
              ? ""
              : String(user.department_id),
          specialization: user.specialization || "",
          status: user.status || "Active",
        });
      } catch (err) {
        console.error("Load edit user error:", err);
        setError(err.message || "Could not connect to the backend.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!userId) {
      setError("No user ID was provided.");
      return;
    }

    const updatedUser = {
      email: formData.email.trim(),
      status: formData.status,
    };

    if (formData.password.trim()) {
      updatedUser.password = formData.password;
    }

    if (!isAdmin) {
      updatedUser.full_name = formData.full_name.trim();
      updatedUser.phone = formData.phone.trim();
      updatedUser.role_id = formData.role_id;
      updatedUser.department_id = formData.department_id;
      updatedUser.specialization = isDoctor
        ? formData.specialization.trim()
        : "";
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API}/api/users/${encodeURIComponent(userId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user.");
      }

      window.alert(data.message || "User updated successfully.");
      navigate("/admin/users");
    } catch (err) {
      console.error("Update user error:", err);
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout
      type="admin"
      title="Edit User"
      subtitle="Update hospital system user information"
    >
      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>User Information</h2>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Update the details of the selected user.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 20 }}>Loading user information...</div>
        ) : error && !formData.user_id ? (
          <div style={{ padding: 20 }}>
            <p role="alert">{error}</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/admin/users")}
              style={{ marginTop: 12 }}
            >
              Back to Users
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <p
                role="alert"
                style={{
                  color: "var(--red)",
                  padding: "0 20px",
                }}
              >
                {error}
              </p>
            )}

            <div
              className="form-grid"
              style={{ padding: 20 }}
            >
              <div className="field">
                <label htmlFor="user_id">User ID</label>
                <input
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  readOnly
                />
              </div>

              {!isAdmin && (
                <>
                  <div className="field">
                    <label htmlFor="full_name">Full Name</label>
                    <input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="role_id">Role</label>
                    <select
                      id="role_id"
                      name="role_id"
                      value={formData.role_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select role</option>
                      {roles.map((role) => (
                        <option
                          key={role.role_id}
                          value={String(role.role_id)}
                        >
                          {role.role_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="department_id">Department</label>
                    <select
                      id="department_id"
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select department</option>
                      {departments.map((department) => (
                        <option
                          key={department.department_id}
                          value={String(department.department_id)}
                        >
                          {department.department_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isDoctor && (
                    <div className="field">
                      <label htmlFor="specialization">
                        Specialization
                      </label>
                      <input
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="Enter specialization"
                        required
                      />
                    </div>
                  )}
                </>
              )}

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="password">
                  New Password (optional)
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  autoComplete="new-password"
                />
              </div>

              <div className="field">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div
              className="form-actions"
              style={{ padding: "0 20px 20px" }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/admin/users")}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default EditUser;