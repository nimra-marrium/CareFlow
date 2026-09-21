/* =========================================================
   CareFlow HMS - User Module
   Yeh file har page par lagti hai. Isme 5 kaam hain:
   1. Popup (modal) kholna / band karna
   2. Delete confirmation
   3. Tabs + Search se table filter karna
   4. Appointment ka status badalna
   5. Chota message (toast) dikhana
   ========================================================= */

/* ---------- 1. POPUP KHOLNA / BAND KARNA ----------
   Popup asal mein HTML mein pehle se maujood hota hai, bas chhupa hua
   (display: none). Hum usko "open" class laga kar dikha dete hain. */
function openModal(id, title) {
  const modal = document.getElementById(id);
  if (title) {
    // popup ki heading badal do (e.g. "Add Doctor" ya "Edit Doctor")
    modal.querySelector(".modal-head h3").textContent = title;
  }
  modal.classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

// Overlay (andhera hissa) par click karo ya Esc dabao to popup band
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("open");
  }
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay.open").forEach(function (m) {
      m.classList.remove("open");
    });
  }
});

/* ---------- Form save (abhi sirf demo) ----------
   Asli data save karna Phase 3/4 (backend + MySQL) mein aayega. */
function saveForm(event, modalId) {
  event.preventDefault();               // page reload hone se roko
  closeModal(modalId);
  event.target.reset();                 // form khali kar do
  showToast("Saved successfully (demo only)");
}

/* ---------- 2. DELETE CONFIRMATION ----------
   Delete button dabao -> popup poochta hai "Are you sure?" -> Yes dabao
   to us row ko table se hata dete hain. */
let rowToDelete = null;                 // yahan yaad rakhte hain kaunsi row delete karni hai

function askDelete(button, itemName) {
  rowToDelete = button.closest("tr");   // button ki row dhoondo
  document.getElementById("deleteText").textContent =
    "You are about to delete " + itemName + ". This cannot be undone.";
  openModal("deleteModal");
}

function confirmDelete() {
  if (rowToDelete) {
    rowToDelete.remove();
    rowToDelete = null;
    applyFilters();                     // "no results" message theek rakhne ke liye
    showToast("Deleted successfully (demo only)");
  }
  closeModal("deleteModal");
}

/* ---------- 3. TABS + SEARCH ----------
   Har table row par data-status="..." likha hota hai.
   Tab dabao -> sirf wohi rows dikhti hain jinka status match kare.
   Search box mein likho -> sirf wohi rows jin mein woh text ho. */
let activeTab = "all";

function setTab(button, status) {
  document.querySelectorAll(".tab").forEach(function (t) {
    t.classList.remove("active");
  });
  button.classList.add("active");
  activeTab = status;
  applyFilters();
}

function applyFilters() {
  const rows = document.querySelectorAll("table[data-filterable] tbody tr");
  if (rows.length === 0 && !document.querySelector("table[data-filterable]")) return;

  const searchBox = document.getElementById("searchInput");
  const query = searchBox ? searchBox.value.trim().toLowerCase() : "";
  let visible = 0;

  rows.forEach(function (row) {
    const matchesTab = activeTab === "all" || row.dataset.status === activeTab;
    const matchesSearch = row.textContent.toLowerCase().includes(query);
    const show = matchesTab && matchesSearch;
    row.style.display = show ? "" : "none";
    if (show) visible++;
  });

  const empty = document.getElementById("emptyState");
  if (empty) empty.classList.toggle("show", visible === 0);
}

/* ---------- 4. APPOINTMENT STATUS BADALNA ---------- */
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

/* ---------- 5. TOAST (chota message) ---------- */
let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2600);
}

/* ---------- Mobile par sidebar kholna ---------- */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

/* ---------- Appointment CANCEL ke liye bhi confirmation ---------- */
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
