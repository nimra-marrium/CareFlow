
import { useEffect, useState } from "react";
import { DashboardLayout } from "./Dashboard";

const API = "http://localhost:5000";

const emptyForm = {
  patient_id: "",
  doctor_id: "",
  department_id: "",
  appointment_date: "",
  appointment_time: "",
  reason: "",
  status: "Scheduled",
};

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

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const permissions = JSON.parse(
    sessionStorage.getItem("careflowPermissions") || "[]"
  );

  const staffName =
    JSON.parse(sessionStorage.getItem("careflowUser") || "null")
      ?.full_name || "User";

  const canView = permissions.includes("View Appointments");
  const canBook = permissions.includes("Book Appointment");

  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    try {
      setError("");

      const [
        appointmentsResponse,
        patientsResponse,
        usersResponse,
        departmentsResponse,
      ] = await Promise.all([
        fetch(`${API}/api/appointments`),
        fetch(`${API}/api/patients`),
        fetch(`${API}/api/users`),
        fetch(`${API}/api/departments`),
      ]);

      if (
        !appointmentsResponse.ok ||
        !patientsResponse.ok ||
        !usersResponse.ok ||
        !departmentsResponse.ok
      ) {
        throw new Error("Unable to load appointment information.");
      }

      const appointmentsData = await appointmentsResponse.json();
      const patientsData = await patientsResponse.json();
      const usersData = await usersResponse.json();
      const departmentsData = await departmentsResponse.json();

      setAppointments(appointmentsData);

      setPatients(
        patientsData.filter(
          (patient) =>
            patient.status === "Active" ||
            patient.status === "Inactive"
        ).filter((patient) => patient.status === "Active")
      );

      setDoctors(
        usersData.filter(
          (user) =>
            user.role_name === "Doctor" && user.status === "Active"
        )
      );

      setDepartments(departmentsData);
    } catch (err) {
      console.error("Error loading appointments:", err);
      setError("Unable to load appointments. Please check your backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }

    loadData();
  }, [canView]);

  function handleChange(event) {
    const { name, value } = event.target;

    // Selecting a patient automatically fills their doctor and department.
    if (name === "patient_id") {
      const selectedPatient = patients.find(
        (patient) => String(patient.patient_id) === value
      );

      setForm((previous) => ({
        ...previous,
        patient_id: value,
        doctor_id: String(selectedPatient?.assigned_doctor_id || ""),
        department_id: String(selectedPatient?.department_id || ""),
      }));

      return;
    }

    // Selecting a doctor updates the department to match that doctor.
    if (name === "doctor_id") {
      const selectedDoctor = doctors.find(
        (doctor) => String(doctor.user_id) === value
      );

      setForm((previous) => ({
        ...previous,
        doctor_id: value,
        department_id: String(selectedDoctor?.department_id || ""),
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openAddForm() {
    setEditingAppointment(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function openEditForm(appointment) {
    setEditingAppointment(appointment);

    setForm({
      patient_id: String(appointment.patient_id || ""),
      doctor_id: String(appointment.doctor_id || ""),
      department_id: String(appointment.department_id || ""),
      appointment_date: String(appointment.appointment_date || "").slice(
        0,
        10
      ),
      appointment_time: String(appointment.appointment_time || "").slice(
        0,
        5
      ),
      reason: appointment.reason || "",
      status: appointment.status || "Scheduled",
    });

    setMessage("");
    setError("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingAppointment(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const isEditing = Boolean(editingAppointment);

      const url = isEditing
        ? `${API}/api/appointments/${encodeURIComponent(
            editingAppointment.appointment_id
          )}`
        : `${API}/api/appointments`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          department_id: form.department_id || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Failed to ${isEditing ? "update" : "book"} appointment.`
        );
      }

      setShowForm(false);
      setEditingAppointment(null);
      setForm(emptyForm);

      await loadData();

      setMessage(
        isEditing
          ? "Appointment updated successfully!"
          : "Appointment booked successfully!"
      );
    } catch (err) {
      console.error("Error saving appointment:", err);
      setError(err.message || "Unable to save appointment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(appointment) {
    const confirmed = window.confirm(
      `Are you sure you want to delete appointment ${appointment.appointment_id} for ${appointment.patient_name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API}/api/appointments/${encodeURIComponent(
          appointment.appointment_id
        )}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete appointment.");
      }

      if (
        editingAppointment?.appointment_id === appointment.appointment_id
      ) {
        cancelForm();
      }

      await loadData();
      setMessage("Appointment deleted successfully!");
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError(err.message || "Unable to delete appointment.");
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const search = searchValue.trim().toLowerCase();

    return (
      String(appointment.appointment_id || "").toLowerCase().includes(search) ||
      String(appointment.patient_name || "").toLowerCase().includes(search) ||
      String(appointment.doctor_name || "").toLowerCase().includes(search) ||
      String(appointment.department_name || "").toLowerCase().includes(search) ||
      String(appointment.status || "").toLowerCase().includes(search)
    );
  });

  return (
    <DashboardLayout
      type="user"
      title="Appointments"
      subtitle="View and book patient appointments"
      permissions={permissions}
      staffName={staffName}
    >
      {!canView ? (
        <div className="panel" style={{ padding: 24 }}>
          You do not have permission to view appointments.
        </div>
      ) : (
        <div className="panel">
          <div
            className="panel-head"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2>All Appointments</h2>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>
                Total appointments: {appointments.length}
              </p>
            </div>

            {canBook && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={showForm ? cancelForm : openAddForm}
              >
                {showForm ? "Cancel" : "+ Book Appointment"}
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

          {showForm && canBook && (
            <div style={modalOverlay}>
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="appointment-form-title"
                style={modalBox}
              >
                <form
                  onSubmit={handleSubmit}
                  style={{
                    padding: 24,
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <h3 id="appointment-form-title" style={{ margin: 0 }}>
                      {editingAppointment
                        ? "Edit Appointment"
                        : "Book New Appointment"}
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
                    <p
                      role="alert"
                      style={{ gridColumn: "1 / -1", color: "#b42318" }}
                    >
                      {error}
                    </p>
                  )}

                  <div>
                    <label>Patient *</label>
                    <select
                      className="input"
                      name="patient_id"
                      value={form.patient_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select patient</option>

                      {patients.map((patient) => (
                        <option
                          key={patient.patient_id}
                          value={patient.patient_id}
                        >
                          {patient.full_name} ({patient.patient_id})
                        </option>
                      ))}

                      {editingAppointment &&
                        !patients.some(
                          (patient) =>
                            String(patient.patient_id) === form.patient_id
                        ) && (
                          <option value={form.patient_id}>
                            {editingAppointment.patient_name} (currently assigned)
                          </option>
                        )}
                    </select>
                  </div>

                  <div>
                    <label>Doctor *</label>
                    <select
                      className="input"
                      name="doctor_id"
                      value={form.doctor_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select doctor</option>

                      {doctors.map((doctor) => (
                        <option key={doctor.user_id} value={doctor.user_id}>
                          {doctor.full_name}
                        </option>
                      ))}

                      {editingAppointment &&
                        !doctors.some(
                          (doctor) =>
                            String(doctor.user_id) === form.doctor_id
                        ) && (
                          <option value={form.doctor_id}>
                            {editingAppointment.doctor_name} (currently assigned)
                          </option>
                        )}
                    </select>
                  </div>

                  <div>
                    <label>Department *</label>
                    <select
                      className="input"
                      name="department_id"
                      value={form.department_id}
                      onChange={handleChange}
                      required
                      disabled
                    >
                      <option value="">Select patient or doctor first</option>

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

                  <div>
                    <label>Date *</label>
                    <input
                      className="input"
                      type="date"
                      name="appointment_date"
                      value={form.appointment_date}
                      onChange={handleChange}
                      min={
                        !editingAppointment
                          ? new Date().toLocaleDateString("en-CA")
                          : undefined
                      }
                      required
                    />
                  </div>

                  <div>
                    <label>Time *</label>
                    <input
                      className="input"
                      type="time"
                      name="appointment_time"
                      value={form.appointment_time}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label>Reason for Appointment</label>
                    <textarea
                      className="input"
                      name="reason"
                      value={form.reason}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter reason (optional)"
                    />
                  </div>

                  {editingAppointment && (
                    <div>
                      <label>Appointment Status</label>
                      <select
                        className="input"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  )}

                  <div
                    style={{
                      gridColumn: "1 / -1",
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginTop: 8,
                    }}
                  >
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : editingAppointment
                          ? "Save Changes"
                          : "Save Appointment"}
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

          {canBook && patients.length === 0 && (
            <p style={{ padding: "0 20px 16px", color: "var(--muted)" }}>
              Add an active patient before booking an appointment.
            </p>
          )}

          {canBook && doctors.length === 0 && (
            <p style={{ padding: "0 20px 16px", color: "var(--muted)" }}>
              No active doctors are available for appointments.
            </p>
          )}

          {canBook && departments.length === 0 && (
            <p style={{ padding: "0 20px 16px", color: "var(--muted)" }}>
              No departments are available. Please add a department first.
            </p>
          )}

          <div style={{ padding: "0 20px 20px" }}>
            <input
              type="text"
              className="input"
              placeholder="Search by appointment ID, patient, doctor, department or status..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  {canBook && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={canBook ? 8 : 7}
                      style={{ textAlign: "center" }}
                    >
                      Loading appointments...
                    </td>
                  </tr>
                ) : error && appointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canBook ? 8 : 7}
                      style={{ textAlign: "center" }}
                    >
                      {error}
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canBook ? 8 : 7}
                      style={{ textAlign: "center" }}
                    >
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.appointment_id}>
                      <td>{appointment.appointment_id}</td>
                      <td>{appointment.patient_name}</td>
                      <td>{appointment.doctor_name}</td>
                      <td>{appointment.department_name || "Not assigned"}</td>
                      <td>
                        {String(appointment.appointment_date).slice(0, 10)}
                      </td>
                      <td>
                        {String(appointment.appointment_time).slice(0, 5)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            appointment.status === "Scheduled"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>

                      {canBook && (
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => openEditForm(appointment)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn"
                              style={{ color: "#b42318" }}
                              onClick={() => handleDelete(appointment)}
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

export default Appointments;
