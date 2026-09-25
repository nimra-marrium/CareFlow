/* =========================================================
   CareFlow HMS - Shared Module
   Yeh file admin.js aur user.js dono load karte hain. Isme
   sirf woh cheezein hain jo dono modules mein use hoti hain:
   1. Popup (modal) kholna / band karna
   2. Delete confirmation
   3. Tabs + Search se table filter karna
   4. Chota message (toast) dikhana
   5. Mobile sidebar
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

/* ---------- 4. TOAST (chota message) ---------- */
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

/* ---------- 5. Mobile par sidebar kholna ---------- */
function toggleSidebar() {
  document.getElementById("adminSidebar").classList.toggle("open");
}

document.addEventListener("DOMContentLoaded", function () {
  const sidebarContainer = document.getElementById("sidebar-container");

  if (!sidebarContainer) return;

  const currentFolder = window.location.pathname.includes("/user/")
    ? "user"
    : "admin";

  const sidebarFile =
    currentFolder === "user"
      ? "../components/user-sidebar.html"
      : "../components/admin-sidebar.html";

  fetch(sidebarFile)
    .then(response => response.text())
    .then(data => {
      sidebarContainer.innerHTML = data;

      /* Highlight the current page */
      const currentPage = window.location.pathname.split("/").pop();

      document.querySelectorAll(".sidebar .nav a").forEach(function (link) {
        const linkPage = link.getAttribute("href").split("/").pop();

        link.classList.remove("active");

        if (linkPage === currentPage) {
          link.classList.add("active");
        }
      });

      /* Create User and Edit User belong to User Management */
      if (
        currentFolder === "admin" &&
        (currentPage === "create-user.html" ||
          currentPage === "edit-user.html")
      ) {
        const usersLink = document.querySelector(
          '.sidebar .nav a[href*="users.html"]'
        );

        if (usersLink) {
          usersLink.classList.add("active");
        }
      }
    })
    .catch(error => {
      console.error("Sidebar failed to load:", error);
    });
});