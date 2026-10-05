// =========================
// USER PERMISSIONS
// =========================

async function loadUserPermissions() {

  const user =
    JSON.parse(
      sessionStorage.getItem("careflowUser")
    );

  if (!user || !user.role_id) {
    window.location.href = "../index.html";
    return;
  }

  try {

    const response =
      await fetch("http://localhost:5000/api/roles");

    if (!response.ok) {
      throw new Error("Failed to load roles");
    }

    const roles = await response.json();

    const currentRole =
      roles.find(function (role) {
        return Number(role.role_id) === Number(user.role_id);
      });

    if (!currentRole) {
      console.error("User role not found.");
      return;
    }

    const permissions =
      currentRole.permissions.map(function (permission) {
        return permission.permission_name;
      });

    sessionStorage.setItem(
      "careflowPermissions",
      JSON.stringify(permissions)
    );

  } catch (error) {

    console.error(
      "Permission loading error:",
      error
    );

  }

}


function hasPermission(permissionName) {

  const permissions =
    JSON.parse(
      sessionStorage.getItem("careflowPermissions")
    ) || [];

  return permissions.includes(permissionName);

}


// =========================
// SIDEBAR PERMISSIONS
// =========================

function applyUserPermissions() {

  const links =
    document.querySelectorAll(
      "#userSidebar .nav a"
    );

  links.forEach(function (link) {

    const page =
      link.getAttribute("href").split("/").pop();

    if (page === "dashboard.html") {
      return;
    }

    if (
      page === "doctors.html" &&
      !hasPermission("View Doctors")
    ) {
      link.style.display = "none";
    }

    if (
      page === "patients.html" &&
      !hasPermission("View Patients")
    ) {
      link.style.display = "none";
    }

    if (
      page === "appointments.html" &&
      !hasPermission("View Appointments")
    ) {
      link.style.display = "none";
    }

    if (
      page === "pharmacy.html" &&
      !hasPermission("View Pharmacy")
    ) {
      link.style.display = "none";
    }

  });

}


// =========================
// DASHBOARD PERMISSIONS
// =========================

function applyDashboardPermissions() {

  const patients =
    document.getElementById("quickPatients");

  const appointments =
    document.getElementById("quickAppointments");

  const doctors =
    document.getElementById("quickDoctors");

  const pharmacy =
    document.getElementById("quickPharmacy");


  if (
    patients &&
    !hasPermission("View Patients")
  ) {
    patients.style.display = "none";
  }


  if (
    appointments &&
    !hasPermission("View Appointments")
  ) {
    appointments.style.display = "none";
  }


  if (
    doctors &&
    !hasPermission("View Doctors")
  ) {
    doctors.style.display = "none";
  }


  if (
    pharmacy &&
    !hasPermission("View Pharmacy")
  ) {
    pharmacy.style.display = "none";
  }

}


// =========================
// ACTION PERMISSIONS
// =========================

function applyActionPermissions() {

  if (!hasPermission("Add Patients")) {

    const addPatientButton =
      document.getElementById("addPatientButton");

    if (addPatientButton) {
      addPatientButton.style.display = "none";
    }

    const addPatientElements =
      document.querySelectorAll("[data-add-patient]");

    addPatientElements.forEach(function (element) {
      element.style.display = "none";
    });

  }


  if (!hasPermission("Book Appointment")) {

    const bookAppointmentButton =
      document.getElementById("bookAppointmentButton");

    if (bookAppointmentButton) {
      bookAppointmentButton.style.display = "none";
    }

  }


  if (!hasPermission("Add Medicine")) {

    const addMedicineButton =
      document.getElementById("addMedicineButton");

    if (addMedicineButton) {
      addMedicineButton.style.display = "none";
    }

  }

}


// =========================
// SIDEBAR LOADED
// =========================

document.addEventListener("userSidebarLoaded", function () {

  applyUserPermissions();

});


// =========================
// PAGE LOAD
// =========================

document.addEventListener("DOMContentLoaded", async function () {

  await loadUserPermissions();

  const page =
    window.location.pathname.split("/").pop();

  applyDashboardPermissions();
  applyActionPermissions();


  // =========================
  // PAGE PERMISSIONS
  // =========================

  if (
    page === "doctors.html" &&
    !hasPermission("View Doctors")
  ) {
    window.location.href = "dashboard.html";
    return;
  }


  if (
    page === "patients.html" &&
    !hasPermission("View Patients")
  ) {
    window.location.href = "dashboard.html";
    return;
  }


  if (
    page === "appointments.html" &&
    !hasPermission("View Appointments")
  ) {
    window.location.href = "dashboard.html";
    return;
  }


  if (
    page === "pharmacy.html" &&
    !hasPermission("View Pharmacy")
  ) {
    window.location.href = "dashboard.html";
    return;
  }


  if (
    page === "add-patient.html" &&
    !hasPermission("Add Patients")
  ) {
    window.location.href = "patients.html";
    return;
  }


  if (
    page === "book-appointment.html" &&
    !hasPermission("Book Appointment")
  ) {
    window.location.href = "appointments.html";
    return;
  }


  if (
    page === "add-medicine.html" &&
    !hasPermission("Add Medicine")
  ) {
    window.location.href = "pharmacy.html";
    return;
  }


  // =========================
  // PATIENTS
  // =========================

  if (page === "patients.html") {

    loadPatients();

  }


  if (page === "add-patient.html") {

    setNextId(
      "patientId",
      "PT-",
      "careflow_patients",
      1001
    );


    const form =
      document.getElementById("addPatientForm");


    if (form) {

      form.addEventListener(
        "submit",
        function (event) {

          event.preventDefault();


          const patients =
            JSON.parse(
              localStorage.getItem("careflow_patients")
            ) || [];


          const patient = {

            id:
              document.getElementById("patientId").value,

            name:
              document.getElementById("fullName").value,

            age:
              document.getElementById("age").value,

            gender:
              document.getElementById("gender").value,

            phone:
              document.getElementById("phone").value,

            department:
              document.getElementById("department").value,

            status: "Active"

          };


          patients.push(patient);


          localStorage.setItem(
            "careflow_patients",
            JSON.stringify(patients)
          );


          alert("Patient added successfully!");


          window.location.href =
            "patients.html";

        }
      );

    }

  }


  // =========================
  // APPOINTMENTS
  // =========================

  if (page === "appointments.html") {

    loadAppointments();

  }


  if (page === "book-appointment.html") {

    setNextId(
      "appointmentId",
      "APT-",
      "careflow_appointments",
      1001
    );


    loadPatientOptions();


    const form =
      document.getElementById("bookAppointmentForm");


    if (form) {

      form.addEventListener(
        "submit",
        function (event) {

          event.preventDefault();


          const appointments =
            JSON.parse(
              localStorage.getItem(
                "careflow_appointments"
              )
            ) || [];


          const patientSelect =
            document.getElementById("patient");


          const selectedPatient =
            patientSelect.options[
              patientSelect.selectedIndex
            ];


          const appointment = {

            id:
              document.getElementById(
                "appointmentId"
              ).value,

            patient:
              selectedPatient.textContent,

            doctor:
              document.getElementById(
                "doctor"
              ).value,

            date:
              document.getElementById(
                "appointmentDate"
              ).value,

            time:
              document.getElementById(
                "appointmentTime"
              ).value,

            department:
              document.getElementById(
                "department"
              ).value,

            status: "Scheduled"

          };


          appointments.push(appointment);


          localStorage.setItem(
            "careflow_appointments",
            JSON.stringify(appointments)
          );


          alert(
            "Appointment booked successfully!"
          );


          window.location.href =
            "appointments.html";

        }
      );

    }

  }


  // =========================
  // PHARMACY
  // =========================

  if (page === "pharmacy.html") {

    loadMedicines();

  }


  if (page === "add-medicine.html") {

    setNextId(
      "medicineId",
      "MED-",
      "careflow_medicines",
      1001
    );


    const form =
      document.getElementById(
        "addMedicineForm"
      );


    if (form) {

      form.addEventListener(
        "submit",
        function (event) {

          event.preventDefault();


          const medicines =
            JSON.parse(
              localStorage.getItem(
                "careflow_medicines"
              )
            ) || [];


          const medicine = {

            id:
              document.getElementById(
                "medicineId"
              ).value,

            name:
              document.getElementById(
                "medicineName"
              ).value,

            category:
              document.getElementById(
                "category"
              ).value,

            quantity:
              Number(
                document.getElementById(
                  "quantity"
                ).value
              ),

            expiry:
              document.getElementById(
                "expiryDate"
              ).value

          };


          medicines.push(medicine);


          localStorage.setItem(
            "careflow_medicines",
            JSON.stringify(medicines)
          );


          alert(
            "Medicine added successfully!"
          );


          window.location.href =
            "pharmacy.html";

        }
      );

    }

  }

});


// =========================
// ID GENERATOR
// =========================

function setNextId(
  inputId,
  prefix,
  storageKey,
  startingNumber
) {

  const input =
    document.getElementById(inputId);

  if (!input) return;


  const records =
    JSON.parse(
      localStorage.getItem(storageKey)
    ) || [];


  const nextNumber =
    startingNumber + records.length;


  input.value =
    prefix + nextNumber;

}


// =========================
// PATIENTS LIST
// =========================

function loadPatients() {

  const tbody =
    document.querySelector(
      "table[data-filterable] tbody"
    );

  if (!tbody) return;


  const patients =
    JSON.parse(
      localStorage.getItem(
        "careflow_patients"
      )
    ) || [];


  patients.forEach(function (patient) {

    const row =
      document.createElement("tr");


    row.innerHTML = `
      <td class="id">${patient.id}</td>
      <td>${patient.name}</td>
      <td>${patient.age}</td>
      <td>${patient.gender}</td>
      <td>${patient.phone}</td>
      <td>${patient.department}</td>
      <td>
        <span class="badge green">
          ${patient.status}
        </span>
      </td>
    `;


    tbody.appendChild(row);

  });

}


// =========================
// PATIENT OPTIONS
// =========================

function loadPatientOptions() {

  const select =
    document.getElementById("patient");

  if (!select) return;


  const patients =
    JSON.parse(
      localStorage.getItem(
        "careflow_patients"
      )
    ) || [];


  patients.forEach(function (patient) {

    const option =
      document.createElement("option");


    option.value =
      patient.id;


    option.textContent =
      `${patient.name} - ${patient.id}`;


    select.appendChild(option);

  });

}


// =========================
// APPOINTMENTS LIST
// =========================

function loadAppointments() {

  const tbody =
    document.querySelector(
      "table[data-filterable] tbody"
    );

  if (!tbody) return;


  const appointments =
    JSON.parse(
      localStorage.getItem(
        "careflow_appointments"
      )
    ) || [];


  appointments.forEach(function (appointment) {

    const row =
      document.createElement("tr");


    row.innerHTML = `
      <td class="id">${appointment.id}</td>
      <td>${appointment.patient}</td>
      <td>${appointment.doctor}</td>
      <td>${formatDate(appointment.date)}</td>
      <td>${formatTime(appointment.time)}</td>
      <td>${appointment.department}</td>
      <td>
        <span class="badge blue">
          ${appointment.status}
        </span>
      </td>
    `;


    tbody.appendChild(row);

  });

}


// =========================
// MEDICINES LIST
// =========================

function loadMedicines() {

  const tbody =
    document.querySelector(
      "table[data-filterable] tbody"
    );

  if (!tbody) return;


  const medicines =
    JSON.parse(
      localStorage.getItem(
        "careflow_medicines"
      )
    ) || [];


  medicines.forEach(function (medicine) {

    let status = "Available";

    let badge = "green";


    if (medicine.quantity <= 10) {

      status = "Low Stock";

      badge = "amber";

    }


    const row =
      document.createElement("tr");


    row.innerHTML = `
      <td class="id">${medicine.id}</td>
      <td>${medicine.name}</td>
      <td>${medicine.category}</td>
      <td>${medicine.quantity}</td>
      <td>${formatExpiry(medicine.expiry)}</td>
      <td>
        <span class="badge ${badge}">
          ${status}
        </span>
      </td>
    `;


    tbody.appendChild(row);

  });

}


// =========================
// DATE FORMATTING
// =========================

function formatDate(date) {

  if (!date) return "";


  const d =
    new Date(
      date + "T00:00:00"
    );


  return d.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


function formatExpiry(date) {

  if (!date) return "";


  const d =
    new Date(
      date + "T00:00:00"
    );


  return d.toLocaleDateString(
    "en-GB",
    {
      month: "short",
      year: "numeric"
    }
  );

}


function formatTime(time) {

  if (!time) return "";


  const parts =
    time.split(":");


  let hour =
    Number(parts[0]);


  const minutes =
    parts[1];


  const ampm =
    hour >= 12
      ? "PM"
      : "AM";


  hour =
    hour % 12;


  if (hour === 0) {
    hour = 12;
  }


  return `${hour}:${minutes} ${ampm}`;

}