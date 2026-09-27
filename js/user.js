document.addEventListener("DOMContentLoaded", function () {

  const page = window.location.pathname.split("/").pop();


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

    const form = document.getElementById("addPatientForm");

    if (form) {

      form.addEventListener("submit", function (event) {

        event.preventDefault();

        const patients =
          JSON.parse(localStorage.getItem("careflow_patients")) || [];

        const patient = {
          id: document.getElementById("patientId").value,
          name: document.getElementById("fullName").value,
          age: document.getElementById("age").value,
          gender: document.getElementById("gender").value,
          phone: document.getElementById("phone").value,
          department: document.getElementById("department").value,
          status: "Active"
        };

        patients.push(patient);

        localStorage.setItem(
          "careflow_patients",
          JSON.stringify(patients)
        );

        alert("Patient added successfully!");

        window.location.href = "patients.html";

      });

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

    const form = document.getElementById("bookAppointmentForm");

    if (form) {

      form.addEventListener("submit", function (event) {

        event.preventDefault();

        const appointments =
          JSON.parse(
            localStorage.getItem("careflow_appointments")
          ) || [];

        const patientSelect =
          document.getElementById("patient");

        const selectedPatient =
          patientSelect.options[
            patientSelect.selectedIndex
          ];

        const appointment = {

          id: document.getElementById("appointmentId").value,

          patient:
            selectedPatient.textContent,

          doctor:
            document.getElementById("doctor").value,

          date:
            document.getElementById("appointmentDate").value,

          time:
            document.getElementById("appointmentTime").value,

          department:
            document.getElementById("department").value,

          status: "Scheduled"

        };

        appointments.push(appointment);

        localStorage.setItem(
          "careflow_appointments",
          JSON.stringify(appointments)
        );

        alert("Appointment booked successfully!");

        window.location.href = "appointments.html";

      });

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

    const form = document.getElementById("addMedicineForm");

    if (form) {

      form.addEventListener("submit", function (event) {

        event.preventDefault();

        const medicines =
          JSON.parse(
            localStorage.getItem("careflow_medicines")
          ) || [];

        const medicine = {

          id:
            document.getElementById("medicineId").value,

          name:
            document.getElementById("medicineName").value,

          category:
            document.getElementById("category").value,

          quantity:
            Number(document.getElementById("quantity").value),

          expiry:
            document.getElementById("expiryDate").value

        };

        medicines.push(medicine);

        localStorage.setItem(
          "careflow_medicines",
          JSON.stringify(medicines)
        );

        alert("Medicine added successfully!");

        window.location.href = "pharmacy.html";

      });

    }
  }

});


// =========================
// ID GENERATOR
// =========================

function setNextId(inputId, prefix, storageKey, startingNumber) {

  const input = document.getElementById(inputId);

  if (!input) return;

  const records =
    JSON.parse(localStorage.getItem(storageKey)) || [];

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
    document.querySelector("table[data-filterable] tbody");

  if (!tbody) return;

  const patients =
    JSON.parse(
      localStorage.getItem("careflow_patients")
    ) || [];


  patients.forEach(function (patient) {

    const row = document.createElement("tr");

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
      localStorage.getItem("careflow_patients")
    ) || [];


  patients.forEach(function (patient) {

    const option =
      document.createElement("option");

    option.value = patient.id;

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
    document.querySelector("table[data-filterable] tbody");

  if (!tbody) return;

  const appointments =
    JSON.parse(
      localStorage.getItem("careflow_appointments")
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
    document.querySelector("table[data-filterable] tbody");

  if (!tbody) return;

  const medicines =
    JSON.parse(
      localStorage.getItem("careflow_medicines")
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

  const d = new Date(date + "T00:00:00");

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

}


function formatExpiry(date) {

  if (!date) return "";

  const d = new Date(date + "T00:00:00");

  return d.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric"
  });

}


function formatTime(time) {

  if (!time) return "";

  const parts = time.split(":");

  let hour = Number(parts[0]);

  const minutes = parts[1];

  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;

  if (hour === 0) {
    hour = 12;
  }

  return `${hour}:${minutes} ${ampm}`;

}