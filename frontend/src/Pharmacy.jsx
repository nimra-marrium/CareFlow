
import { useEffect, useState } from "react";
import { DashboardLayout } from "./Dashboard";

const API = "http://localhost:5000";

const emptyForm = {
  medicine_name: "",
  category: "",
  quantity: "",
  unit_price: "",
  expiry_date: ""
};

function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMedicineId, setEditingMedicineId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const permissions = JSON.parse(
    sessionStorage.getItem("careflowPermissions") || "[]"
  );

  const staffName =
    JSON.parse(sessionStorage.getItem("careflowUser") || "null")
      ?.full_name || "User";


const canView = permissions.includes("View Pharmacy");
const canAdd = permissions.includes("Add Medicine");
const canEdit = canAdd;
const canDelete = canAdd;


  async function loadMedicines() {
    try {
      setError("");

      const response = await fetch(`${API}/api/medicines`);

      if (!response.ok) {
        throw new Error("Failed to load medicines.");
      }

      const data = await response.json();
      setMedicines(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load medicines. Please check your backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedicines();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  function openAddForm() {
    setForm(emptyForm);
    setEditingMedicineId(null);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function openEditForm(medicine) {
    setForm({
      medicine_name: medicine.medicine_name || "",
      category: medicine.category || "",
      quantity: String(medicine.quantity ?? ""),
      unit_price: String(medicine.unit_price ?? ""),
      expiry_date: medicine.expiry_date
        ? String(medicine.expiry_date).slice(0, 10)
        : ""
    });

    setEditingMedicineId(medicine.medicine_id);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingMedicineId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const isEditing = editingMedicineId !== null;

    try {
      const url = isEditing
        ? `${API}/api/medicines/${encodeURIComponent(editingMedicineId)}`
        : `${API}/api/medicines`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            (isEditing
              ? "Failed to update medicine."
              : "Failed to add medicine.")
        );
      }

      setMessage(
        isEditing
          ? "Medicine updated successfully!"
          : "Medicine added successfully!"
      );

      closeForm();
      await loadMedicines();
    } catch (err) {
      setError(err.message || "Unable to save medicine.");
    }
  }

  async function handleDelete(medicine) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${medicine.medicine_name}"?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API}/api/medicines/${encodeURIComponent(medicine.medicine_id)}`,
        {
          method: "DELETE"
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete medicine.");
      }

      setMessage("Medicine deleted successfully!");
      await loadMedicines();
    } catch (err) {
      setError(err.message || "Unable to delete medicine.");
    }
  }

  const filteredMedicines = medicines.filter((medicine) => {
    const search = searchValue.trim().toLowerCase();

    return (
      String(medicine.medicine_id || "").toLowerCase().includes(search) ||
      String(medicine.medicine_name || "").toLowerCase().includes(search) ||
      String(medicine.category || "").toLowerCase().includes(search) ||
      String(medicine.status || "").toLowerCase().includes(search)
    );
  });

  return (
    <DashboardLayout
      type="user"
      title="Pharmacy"
      subtitle="Manage and view medicine stock"
      permissions={permissions}
      staffName={staffName}
    >
      {!canView ? (
        <div className="panel" style={{ padding: 24 }}>
          You do not have permission to view the pharmacy.
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
              flexWrap: "wrap"
            }}
          >
            <div>
              <h2>Medicine Inventory</h2>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>
                Total medicines: {medicines.length}
              </p>
            </div>

            {canAdd && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (showForm) {
                    closeForm();
                  } else {
                    openAddForm();
                  }
                }}
              >
                {showForm ? "Cancel" : "+ Add Medicine"}
              </button>
            )}
          </div>

          {message && (
            <p style={{ padding: "0 20px", color: "green" }}>
              {message}
            </p>
          )}

          {error && (
            <p style={{ padding: "0 20px", color: "red" }}>
              {error}
            </p>
          )}

          {showForm && (
            <div
              onClick={(event) => {
                if (event.target === event.currentTarget) closeForm();
              }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
                zIndex: 1000
              }}
            >
              <form
                onSubmit={handleSubmit}
                onClick={(event) => event.stopPropagation()}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: 24,
                  width: "100%",
                  maxWidth: 650,
                  maxHeight: "90vh",
                  overflowY: "auto",
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16
                }}
              >
                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <h2>
                    {editingMedicineId !== null
                      ? "Edit Medicine"
                      : "Add Medicine"}
                  </h2>

                  <button
                    type="button"
                    className="btn"
                    onClick={closeForm}
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label>Medicine Name *</label>
                  <input
                    className="input"
                    name="medicine_name"
                    value={form.medicine_name}
                    onChange={handleChange}
                    placeholder="Enter medicine name"
                    required
                  />
                </div>

                <div>
                  <label>Category</label>
                  <input
                    className="input"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. Pain relief"
                  />
                </div>

                <div>
                  <label>Quantity *</label>
                  <input
                    className="input"
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    required
                  />
                </div>

                <div>
                  <label>Unit Price (PKR) *</label>
                  <input
                    className="input"
                    type="number"
                    name="unit_price"
                    value={form.unit_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label>Expiry Date</label>
                  <input
                    className="input"
                    type="date"
                    name="expiry_date"
                    value={form.expiry_date}
                    onChange={handleChange}
                  />
                </div>

                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    gap: 10
                  }}
                >
                  <button type="submit" className="btn btn-primary">
                    {editingMedicineId !== null
                      ? "Save Changes"
                      : "Save Medicine"}
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={closeForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ padding: "0 20px 20px" }}>
            <input
              className="input"
              placeholder="Search by ID, name, category or status..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Medicine ID</th>
                  <th>Medicine Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      Loading medicines...
                    </td>
                  </tr>
                ) : filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      No medicines found.
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((medicine) => (
                    <tr key={medicine.medicine_id}>
                      <td>{medicine.medicine_id}</td>
                      <td>{medicine.medicine_name}</td>
                      <td>{medicine.category || "—"}</td>
                      <td>{medicine.quantity}</td>
                      <td>
                        PKR {Number(medicine.unit_price).toFixed(2)}
                      </td>
                      <td>
                        {medicine.expiry_date
                          ? String(medicine.expiry_date).slice(0, 10)
                          : "—"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            medicine.status === "Available"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {medicine.status}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap"
                          }}
                        >
                          {canEdit && (
                            <button
                              type="button"
                              className="btn"
                              onClick={() => openEditForm(medicine)}
                            >
                              Edit
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              className="btn"
                              style={{ color: "#c62828" }}
                              onClick={() => handleDelete(medicine)}
                            >
                              Delete
                            </button>
                          )}

                          {!canEdit && !canDelete && "—"}
                        </div>
                      </td>
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

export default Pharmacy;
