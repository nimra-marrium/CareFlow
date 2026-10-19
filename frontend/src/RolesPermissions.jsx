import { useEffect, useState } from "react";

const API = "http://localhost:5000";

function RolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [addingRole, setAddingRole] = useState(false);

  // Track permission checkbox changes
  const [permissionChanges, setPermissionChanges] = useState({});
  const [savingPermissions, setSavingPermissions] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        fetch(`${API}/api/roles`),
        fetch(`${API}/api/roles/permissions`),
      ]);

      const rolesData = await rolesResponse.json();
      const permissionsData = await permissionsResponse.json();

      if (!rolesResponse.ok || !permissionsResponse.ok) {
        throw new Error("Failed to load roles or permissions.");
      }

      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(
        Array.isArray(permissionsData) ? permissionsData : []
      );
    } catch (err) {
      console.error("Roles and permissions error:", err);
      setError("Could not load roles and permissions. Check your backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setShowAddModal(false);
        setShowDeleteModal(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  function togglePermission(permissionId) {
    setSelectedPermissions((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId]
    );
  }

  async function handleAddRole(event) {
    event.preventDefault();

    if (!roleName.trim()) {
      alert("Please enter a role name.");
      return;
    }

    if (selectedPermissions.length === 0) {
      alert("Please select at least one permission.");
      return;
    }

    try {
      setAddingRole(true);

      const response = await fetch(`${API}/api/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role_name: roleName.trim(),
          permission_ids: selectedPermissions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add role.");
      }

      alert(`Role "${data.role_name || roleName}" added successfully!`);
      setShowAddModal(false);
      setRoleName("");
      setSelectedPermissions([]);
      await loadData();
    } catch (err) {
      console.error("Add role error:", err);
      alert(err.message || "Could not connect to the backend.");
    } finally {
      setAddingRole(false);
    }
  }

  async function handleDeleteRole() {
    if (!roleToDelete) return;

    try {
      const response = await fetch(
        `${API}/api/roles/${roleToDelete.role_id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete role.");
      }

      alert("Role deleted successfully!");
      setShowDeleteModal(false);
      setRoleToDelete(null);
      setPermissionChanges({});
      await loadData();
    } catch (err) {
      console.error("Delete role error:", err);
      alert(err.message || "Could not connect to the backend.");
    }
  }

  // Save changed permissions to the backend
  async function handleSavePermissions() {
    try {
      setSavingPermissions(true);

      // Save only roles whose checkboxes were changed
      const changedRoleIds = Object.keys(permissionChanges);

      if (changedRoleIds.length === 0) {
        alert("No permission changes to save.");
        return;
      }

      for (const roleId of changedRoleIds) {
        const permissionIds = permissionChanges[roleId];

        const response = await fetch(
          `${API}/api/roles/${roleId}/permissions`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              permission_ids: permissionIds,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || `Failed to save permissions for role ${roleId}.`
          );
        }
      }

      setPermissionChanges({});
      await loadData();
      alert("Permissions saved successfully!");
    } catch (err) {
      console.error("Save permissions error:", err);
      alert(err.message || "Could not save permissions.");
    } finally {
      setSavingPermissions(false);
    }
  }

  // Update a role's selected permissions when a checkbox changes
  function handlePermissionChange(role, permission, isChecked) {
    const roleId = role.role_id;
    const permissionId = Number(permission.permission_id);

    setPermissionChanges((current) => {
      const currentIds =
        current[roleId] ??
        (role.permissions || []).map((item) =>
          Number(item.permission_id)
        );

      const updatedIds = isChecked
        ? [...new Set([...currentIds, permissionId])]
        : currentIds.filter((id) => id !== permissionId);

      return {
        ...current,
        [roleId]: updatedIds,
      };
    });
  }

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      {error && (
        <div role="alert" style={{ marginBottom: 20 }}>
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadData}
          >
            Try Again
          </button>
        </div>
      )}

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Hospital Roles</h2>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Manage roles and their assigned permissions.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setRoleName("");
              setSelectedPermissions([]);
              setShowAddModal(true);
            }}
          >
            + Add Role
          </button>
        </div>

        <div className="roles-grid">
          {loading ? (
            <p>Loading roles...</p>
          ) : roles.length === 0 ? (
            <p>No roles found.</p>
          ) : (
            roles.map((role) => (
              <div className="role-card" key={role.role_id}>
                <h3>{role.role_name}</h3>

                {role.permissions?.length > 0 && (
                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: 13,
                      marginTop: 8,
                    }}
                  >
                    {role.permissions
                      .map((permission) => permission.permission_name)
                      .join(", ")}
                  </p>
                )}

                {role.role_name !== "Admin" && (
                  <button
                    type="button"
                    className="btn"
                    style={{
                      marginTop: 12,
                      background: "var(--red)",
                      color: "white",
                    }}
                    onClick={() => {
                      setRoleToDelete(role);
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Permissions</h2>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Configure what each role can access.
            </p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Permission</th>
                {roles.map((role) => (
                  <th key={role.role_id}>{role.role_name}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {permissions.map((permission) => (
                <tr key={permission.permission_id}>
                  <td>{permission.permission_name}</td>

                  {roles.map((role) => {
                    const currentPermissionIds =
                      permissionChanges[role.role_id] ??
                      (role.permissions || []).map((item) =>
                        Number(item.permission_id)
                      );

                    const isChecked = currentPermissionIds.includes(
                      Number(permission.permission_id)
                    );

                    return (
                      <td key={role.role_id}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={loading || savingPermissions}
                          onChange={(event) =>
                            handlePermissionChange(
                              role,
                              permission,
                              event.target.checked
                            )
                          }
                          aria-label={`${role.role_name}: ${permission.permission_name}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}

              {!loading && permissions.length === 0 && (
                <tr>
                  <td colSpan={roles.length + 1}>
                    No permissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          className="form-actions"
          style={{ padding: "0 20px 20px" }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSavePermissions}
            disabled={loading || savingPermissions}
          >
            {savingPermissions ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      </div>

      {/* Add Role Modal */}
      <div
        className={`role-modal ${showAddModal ? "show" : ""}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setShowAddModal(false);
          }
        }}
      >
        <div className="role-modal-box">
          <div className="role-modal-header">
            <div>
              <h2>Add Role</h2>
              <p>Create a new role and assign permissions.</p>
            </div>

            <button
              type="button"
              className="role-modal-close"
              aria-label="Close"
              onClick={() => setShowAddModal(false)}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleAddRole}>
            <div className="role-form-group">
              <label htmlFor="roleName">Role Name</label>
              <input
                id="roleName"
                type="text"
                placeholder="Enter role name"
                value={roleName}
                onChange={(event) => setRoleName(event.target.value)}
                required
              />
            </div>

            <div className="role-form-group">
              <label>Permissions</label>
              <div className="role-permissions">
                {permissions.length === 0 ? (
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>
                    No permissions available.
                  </p>
                ) : (
                  permissions.map((permission) => (
                    <label
                      className="role-permission"
                      key={permission.permission_id}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(
                          Number(permission.permission_id)
                        )}
                        onChange={() =>
                          togglePermission(Number(permission.permission_id))
                        }
                      />
                      <span>{permission.permission_name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="role-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={addingRole}
              >
                {addingRole ? "Adding..." : "Add Role"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Role Modal */}
      <div
        className={`role-modal ${showDeleteModal ? "show" : ""}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setShowDeleteModal(false);
          }
        }}
      >
        <div className="role-modal-box">
          <div className="role-modal-header">
            <div>
              <h2>Delete Role</h2>
              <p>This action cannot be undone.</p>
            </div>

            <button
              type="button"
              className="role-modal-close"
              aria-label="Close"
              onClick={() => setShowDeleteModal(false)}
            >
              ×
            </button>
          </div>

          <div style={{ padding: 20 }}>
            <p style={{ color: "var(--text)", lineHeight: 1.6 }}>
              Are you sure you want to delete{" "}
              <strong>{roleToDelete?.role_name || "this role"}</strong>?
            </p>
            <p
              style={{
                color: "var(--muted)",
                fontSize: 13,
                marginTop: 8,
              }}
            >
              The role and its permissions will be permanently removed.
            </p>
          </div>

          <div className="role-modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn"
              style={{ background: "var(--red)", color: "white" }}
              onClick={handleDeleteRole}
            >
              Delete Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RolesPermissions;