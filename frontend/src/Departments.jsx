
import { useEffect, useState } from "react";
import { DashboardLayout } from "./Dashboard";

const API_URL = "http://localhost:5000/api/departments";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedId, setSelectedId] = useState(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("Active");
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [result, setResult] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadDepartments() {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load departments.");
      }

      setDepartments(data);
    } catch (error) {
      console.error("Load departments error:", error);
      setResult({
        title: "Loading Error",
        message: error.message || "Could not connect to the backend.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  function openAddModal() {
    setMode("add");
    setSelectedId(null);
    setName("");
    setCode("");
    setStatus("Active");
    setModalOpen(true);
  }

  function openEditModal(department) {
    setMode("edit");
    setSelectedId(department.department_id);
    setName(department.department_name);
    setCode(department.department_code);
    setStatus(department.status);
    setModalOpen(true);
  }

  function closeModal() {
    if (!saving) {
      setModalOpen(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const departmentName = name.trim();
    const departmentCode = code.trim().toUpperCase();

    if (!departmentName || !departmentCode) {
      setResult({
        title: "Missing Information",
        message: "Department name and code are required.",
      });
      return;
    }

    try {
      setSaving(true);

      const isEditing = mode === "edit";

      const response = await fetch(
        isEditing ? `${API_URL}/${selectedId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            department_name: departmentName,
            department_code: departmentCode,
            status: isEditing ? status : "Active",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save department.");
      }

      setModalOpen(false);

      await loadDepartments();

      setResult({
        title: isEditing ? "Department Updated" : "Department Created",
        message:
          data.message ||
          (isEditing
            ? "Department updated successfully."
            : "Department created successfully."),
      });
    } catch (error) {
      setResult({
        title: "Save Error",
        message: error.message || "Could not connect to the backend.",
      });
    } finally {
      setSaving(false);
    }
  }

  function openDeleteModal(department) {
    setDeleteId(department.department_id);
    setDeleteName(department.department_name);
  }

  async function confirmDelete() {
    if (!deleteId || deleting) return;

    try {
      setDeleting(true);

      const response = await fetch(`${API_URL}/${deleteId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteId(null);
        setResult({
          title: "Cannot Delete Department",
          message: data.message || "Failed to delete department.",
        });
        return;
      }

      setDeleteId(null);

      await loadDepartments();

      setResult({
        title: "Department Deleted",
        message: data.message || "Department deleted successfully.",
      });
    } catch (error) {
      setDeleteId(null);

      setResult({
        title: "Connection Error",
        message: "Could not connect to the CareFlow backend.",
      });
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setModalOpen(false);
        setDeleteId(null);
        setResult(null);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <DashboardLayout
      type="admin"
      title="Departments"
      subtitle="Manage hospital departments"
    >
      <section className="content">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Hospital Departments</h2>
              <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                View and manage departments in CareFlow.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={openAddModal}
            >
              + Add Department
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4">Loading departments...</td>
                  </tr>
                ) : departments.length === 0 ? (
                  <tr>
                    <td colSpan="4">No departments found.</td>
                  </tr>
                ) : (
                  departments.map((department) => (
                    <tr key={department.department_id}>
                      <td>{department.department_name}</td>
                      <td>{department.department_code}</td>
                      <td>
                        <span
                          className={
                            department.status === "Active"
                              ? "badge green"
                              : "badge"
                          }
                        >
                          {department.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => openEditModal(department)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn"
                          style={{
                            marginLeft: "8px",
                            background: "var(--red)",
                            color: "white",
                          }}
                          onClick={() => openDeleteModal(department)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div
          className="cf-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="cf-modal">
            <div className="cf-modal-header">
              <h3>{mode === "add" ? "Add Department" : "Edit Department"}</h3>
              <button
                type="button"
                className="cf-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="cf-modal-body">
                <div className="field">
                  <label htmlFor="departmentName">Department Name</label>
                  <input
                    id="departmentName"
                    type="text"
                    placeholder="Enter department name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>

                <div className="field" style={{ marginTop: "16px" }}>
                  <label htmlFor="departmentCode">Department Code</label>
                  <input
                    id="departmentCode"
                    type="text"
                    placeholder="e.g. CAR"
                    maxLength={5}
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    required
                  />
                </div>

                {mode === "edit" && (
                  <div className="field" style={{ marginTop: "16px" }}>
                    <label htmlFor="departmentStatus">Status</label>
                    <select
                      id="departmentStatus"
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : mode === "add"
                        ? "Create Department"
                        : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteId && (
        <div
          className="cf-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteId(null);
            }
          }}
        >
          <div className="cf-modal cf-modal-small">
            <div className="cf-modal-header">
              <h3>Delete Department</h3>
            </div>

            <div className="cf-modal-body">
              <p>
                Are you sure you want to delete {deleteName}?
              </p>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn"
                  style={{ background: "var(--red)", color: "white" }}
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESULT MODAL */}
      {result && (
        <div
          className="cf-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setResult(null);
          }}
        >
          <div className="cf-modal cf-modal-small">
            <div className="cf-modal-header">
              <h3>{result.title}</h3>
            </div>

            <div className="cf-modal-body">
              <p>{result.message}</p>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setResult(null)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Departments;
