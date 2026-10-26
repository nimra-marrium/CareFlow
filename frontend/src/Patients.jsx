
import { useEffect, useState } from "react";
import { DashboardLayout } from "./Dashboard";

const API = "http://localhost:5000";

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
  zIndex: 1000,
};

const modalBox = {
  background: "#ffffff",
  width: "100%",
  maxWidth: 800,
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: 12,
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
};

function Patients() {
  const user = JSON.parse(sessionStorage.getItem("careflowUser") || "null");
  const permissions = JSON.parse(
    sessionStorage.getItem("careflowPermissions") || "[]"
  );

  const canView = permissions.includes("View Patients");
  const canAdd = permissions.includes("Add Patients");

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    full_name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    assigned_doctor_id: "",
    department_id: "",
    status: "Active",
  };

  const [form, setForm] = useState(emptyForm);

  async function loadPatients() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/patients`);

      if (!response.ok) {
        throw new Error("Failed to load patients.");
      }

      setPatients(await response.json());
    } catch (err) {
      console.error("Error loading patients:", err);
      setError("Unable to load patients. Please check the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }

    loadPatients();

    async function loadFormOptions() {
      try {
        const [usersResponse, departmentsResponse] = await Promise.all([
          fetch(`${API}/api/users`),
          fetch(`${API}/api/departments`),
        ]);

        if (usersResponse.ok) {
          const users = await usersResponse.json();
          setDoctors(
            users.filter(
              (item) =>
                item.role_name === "Doctor" && item.status === "Active"
            )
          );
        }

        if (departmentsResponse.ok) {
          const data = await departmentsResponse.json();
          setDepartments(data.filter((item) => item.status === "Active"));
        }
      } catch (err) {
        console.error("Error loading form options:", err);
      }
    }

    loadFormOptions();
  }, [canView]);


  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => {
      if (name === "department_id") {
        const selectedDoctor = doctors.find(
          (doctor) =>
            String(doctor.user_id) === String(previous.assigned_doctor_id)
        );

        const doctorMatchesDepartment =
          selectedDoctor &&
          String(selectedDoctor.department_id) === String(value);

        return {
          ...previous,
          department_id: value,
          assigned_doctor_id: doctorMatchesDepartment
            ? previous.assigned_doctor_id
            : "",
        };
      }

      return { ...previous, [name]: value };
    });
  }


  function openAddForm() {
    setEditingPatient(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function openEditForm(patient) {
    setEditingPatient(patient);
    setForm({
      full_name: patient.full_name || "",
      age: String(patient.age ?? ""),
      gender: patient.gender || "",
      phone: patient.phone || "",
      address: patient.address || "",
      assigned_doctor_id: patient.assigned_doctor_id || "",
      department_id: patient.department_id || "",
      status: patient.status || "Active",
    });
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingPatient(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const isEditing = Boolean(editingPatient);

      const response = await fetch(
        isEditing
          ? `${API}/api/patients/${encodeURIComponent(editingPatient.patient_id)}`
          : `${API}/api/patients`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            age: Number(form.age),
            assigned_doctor_id: form.assigned_doctor_id || null,
            department_id: form.department_id || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to ${isEditing ? "update" : "add"} patient.`
        );
      }

      setMessage(
        isEditing
          ? "Patient updated successfully."
          : `Patient added successfully. Patient ID: ${data.patient_id}`
      );

      cancelForm();
      await loadPatients();
    } catch (err) {
      console.error("Error saving patient:", err);
      setError(err.message || "Unable to connect to the CareFlow backend.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(patient) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${patient.full_name} (${patient.patient_id})? This action cannot be undone.`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API}/api/patients/${encodeURIComponent(patient.patient_id)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete patient.");
      }

      setMessage("Patient deleted successfully.");
      await loadPatients();
    } catch (err) {
      console.error("Error deleting patient:", err);
      setError(err.message || "Unable to delete patient.");
    }
  }

  const filteredDoctors = doctors.filter(
    (doctor) =>
      String(doctor.department_id) === String(form.department_id) &&
      form.department_id !== ""
  );

  const filteredPatients = patients.filter((patient) => {
    const search = searchValue.trim().toLowerCase();

    return (
      String(patient.patient_id || "").toLowerCase().includes(search) ||
      String(patient.full_name || "").toLowerCase().includes(search) ||
      String(patient.phone || "").toLowerCase().includes(search) ||
      String(patient.department_name || "").toLowerCase().includes(search)
    );
  });

  return (
    <DashboardLayout
      type="user"
      title="Patients"
      subtitle="View and manage patient information"
      permissions={permissions}
      staffName={user?.full_name || "User"}
    >
      {!canView ? (
        <div className="panel">
          <div className="panel-head">
            <h2>Access denied</h2>
          </div>
          <p style={{ padding: 20 }}>
            You do not have permission to view patients.
          </p>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>All Patients</h2>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>
                Total patients: {patients.length}
              </p>
            </div>

            {canAdd && (
              <button
  type="button"
  className="btn btn-primary"
  onClick={() => {
    console.log("Add Patient clicked");
    openAddForm();
  }}
>
  + Add Patient
</button>
            )}
          </div>

          {message && (
            <p role="status" style={{ padding: "0 20px", color: "green" }}>
              {message}
            </p>
          )}

          {error && !showForm && (
            <p role="alert" style={{ padding: "0 20px", color: "red" }}>
              {error}
            </p>
          )}

          {showForm && canAdd && (
            <div style={modalOverlay}>
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="patient-form-title"
                style={modalBox}
              >
                <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    <h3 id="patient-form-title" style={{ margin: 0 }}>
                      {editingPatient ? "Edit Patient" : "Add New Patient"}
                    </h3>

                    <button
                      type="button"
                      className="btn"
                      onClick={cancelForm}
                      disabled={saving}
                    >
                      ✕
                    </button>
                  </div>

                  {error && (
                    <p role="alert" style={{ color: "#b42318" }}>
                      {error}
                    </p>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                      gap: 16,
                    }}
                  >
                    <div className="field">
                      <label htmlFor="full_name">Full Name *</label>
                      <input
                        id="full_name"
                        name="full_name"
                        className="input"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="age">Age *</label>
                      <input
                        id="age"
                        name="age"
                        type="number"
                        min="0"
                        max="130"
                        className="input"
                        value={form.age}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="gender">Gender *</label>
                      <select
                        id="gender"
                        name="gender"
                        className="input"
                        value={form.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="phone">Phone *</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="input"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="department_id">Department</label>
                      <select
                        id="department_id"
                        name="department_id"
                        className="input"
                        value={form.department_id}
                        onChange={handleChange}
                      >
                        <option value="">Select department</option>
                        {departments.map((department) => (
                          <option
                            key={department.department_id}
                            value={department.department_id}
                          >
                            {department.department_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="assigned_doctor_id">
                        Assigned Doctor
                      </label>
                      <select
                        id="assigned_doctor_id"
                        name="assigned_doctor_id"
                        className="input"
                        value={form.assigned_doctor_id}
                        onChange={handleChange}
                      >
                        <option value="">
                          {form.department_id
                            ? "Select doctor"
                            : "Select department first"}
                        </option>
                        {filteredDoctors.map((doctor) => (
                          <option key={doctor.user_id} value={doctor.user_id}>
                            {doctor.full_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="address">Address</label>
                      <input
                        id="address"
                        name="address"
                        className="input"
                        value={form.address}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="status">Status</label>
                      <select
                        id="status"
                        name="status"
                        className="input"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginTop: 24,
                    }}
                  >
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : editingPatient
                          ? "Save Changes"
                          : "Save Patient"}
                    </button>

                    <button
                      type="button"
                      className="btn"
                      onClick={cancelForm}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div style={{ padding: "0 20px 20px" }}>
            <input
              type="text"
              className="input"
              placeholder="Search by ID, name, phone or department..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Status</th>
                  {canAdd && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={canAdd ? 8 : 7} style={{ textAlign: "center" }}>
                      Loading patients...
                    </td>
                  </tr>
                ) : error && patients.length === 0 ? (
                  <tr>
                    <td colSpan={canAdd ? 8 : 7} style={{ textAlign: "center" }}>
                      {error}
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={canAdd ? 8 : 7} style={{ textAlign: "center" }}>
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.patient_id}>
                      <td>{patient.patient_id}</td>
                      <td>{patient.full_name}</td>
                      <td>{patient.age}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.department_name || "Not assigned"}</td>
                      <td>
                        <span
                          className={`badge ${
                            patient.status === "Active"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>

                      {canAdd && (
                        <td>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => openEditForm(patient)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn"
                              onClick={() => handleDelete(patient)}
                              style={{ color: "#b42318" }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Patients;
