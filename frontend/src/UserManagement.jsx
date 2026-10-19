import { useEffect, useState } from "react";
import { DashboardLayout } from "./Dashboard";

const API = "http://localhost:5000";

function UserManagement() {
  const [allUsers, setAllUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/users`);

      if (!response.ok) {
        throw new Error("Failed to load users.");
      }

      const users = await response.json();
      setAllUsers(users);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function deleteUser(userId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?\n\n" +
        "User ID: " +
        userId +
        "\n\nThis action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/api/users/${encodeURIComponent(userId)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.message || "Failed to delete user.");
        return;
      }

      window.alert("User deleted successfully.");

      // Refresh the table without reloading the entire page.
      await loadUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      window.alert("Could not connect to the CareFlow backend.");
    }
  }

  const filteredUsers = allUsers.filter((user) =>
    String(user.user_id || "")
      .toLowerCase()
      .includes(searchValue.trim().toLowerCase())
  );

  return (
    <DashboardLayout
      type="admin"
      title="User Management"
      subtitle="Manage hospital system users"
    >
      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>All Users</h2>
          </div>

          <a
            href="/admin/create-user"
            className="btn btn-primary"
          >
            + Create User
          </a>
        </div>

        <div style={{ padding: "0 20px 20px" }}>
          <input
            type="text"
            className="input"
            placeholder="Search user by ID..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    {error}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td>{user.user_id}</td>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>{user.role_name}</td>
                    <td>{user.department_name}</td>

                    <td>
                      <span
                        className={`badge ${
                          user.status === "Active"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <a
  href={`/admin/edit-user?id=${encodeURIComponent(user.user_id)}`}
  className="btn btn-secondary btn-small"
>
  Edit
</a>

                        {user.role_name !== "Admin" && (
                          <button
                            type="button"
                            className="btn btn-danger btn-small"
                            onClick={() => deleteUser(user.user_id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
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

export default UserManagement;