/* =========================================================
   CareFlow HMS - User Module (module-specific only)
   Yeh functions sirf User Module mein chahiye — appointments
   ka status badalna aur cancel karna. Baaki sab shared.js mein
   chala gaya hai. Is file se pehle shared.js load hona chahiye.
   ========================================================= */

/* ---------- APPOINTMENT STATUS BADALNA ---------- */
function setStatus(button, status) {
  const row = button.closest("tr");
  const badge = row.querySelector(".badge");
  const colors = { scheduled: "blue", completed: "green", cancelled: "red" };
  const labels = { scheduled: "Scheduled", completed: "Completed", cancelled: "Cancelled" };

  row.dataset.status = status;
  badge.textContent = labels[status];
  badge.className = "badge " + colors[status];
  applyFilters();
  showToast("Appointment marked as " + labels[status].toLowerCase());
}

/* ---------- Appointment CANCEL ke liye confirmation ---------- */
let buttonToCancel = null;

function askCancel(button, patientName) {
  buttonToCancel = button;
  document.getElementById("cancelText").textContent =
    "The appointment for " + patientName + " will be marked as cancelled.";
  openModal("cancelModal");
}

function confirmCancel() {
  if (buttonToCancel) {
    setStatus(buttonToCancel, "cancelled");
    buttonToCancel = null;
  }
  closeModal("cancelModal");
}