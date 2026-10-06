console.log("PATIENTS ROUTE LOADED");

const express = require("express");
const router = express.Router();
const db = require("../db");

// Test route
router.get("/test", (req, res) => {
    res.send("Patients route is working!");
});

// Get all patients (with department name)
router.get("/", (req, res) => {
    const sql = `
        SELECT p.*, d.department_name AS department_name
        FROM patients p
        LEFT JOIN departments d ON p.department_id = d.department_id
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                message: "Failed to fetch patients"
            });
        }

        res.json(results);
    });
});

// Add a new patient
router.post("/", (req, res) => {
    const {
        full_name,
        age,
        gender,
        phone,
        address,
        assigned_doctor_id,
        department_id,
        status
    } = req.body;

    if (!full_name || !age || !gender || !phone) {
        return res.status(400).json({
            message: "Required patient information is missing"
        });
    }

    const patient_id = "PAT-" + Date.now().toString().slice(-6);

    const sql = `
        INSERT INTO patients
        (patient_id, full_name, age, gender, phone, address,
         assigned_doctor_id, department_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        patient_id,
        full_name,
        age,
        gender,
        phone,
        address,
        assigned_doctor_id,
        department_id,
        status || "Active"
    ];

    db.query(sql, values, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                message: "Failed to add patient"
            });
        }

        res.status(201).json({
            message: "Patient added successfully",
            patient_id: patient_id
        });
    });
});

module.exports = router;