
console.log("PATIENTS ROUTE LOADED");

const express = require("express");
const router = express.Router();
const db = require("../db");

// Test route
router.get("/test", (req, res) => {
    res.send("Patients route is working!");
});

// Get all patients
router.get("/", (req, res) => {
    const sql = `
        SELECT p.*, d.department_name AS department_name
        FROM patients p
        LEFT JOIN departments d ON p.department_id = d.department_id
        ORDER BY p.created_at DESC
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

    if (
        !full_name?.trim() ||
        age === undefined ||
        age === "" ||
        !gender ||
        !phone?.trim() ||
        !Number.isInteger(Number(age)) ||
        Number(age) < 0
    ) {
        return res.status(400).json({
            message: "Enter a valid name, age, gender and phone number"
        });
    }

    if (status && !["Active", "Inactive"].includes(status)) {
        return res.status(400).json({
            message: "Invalid patient status"
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
        full_name.trim(),
        Number(age),
        gender,
        phone.trim(),
        address || null,
        assigned_doctor_id || null,
        department_id || null,
        status || "Active"
    ];

    db.query(sql, values, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                message: "Failed to add patient"
            });
        }

        res.status(201).json({
            message: "Patient added successfully",
            patient_id
        });
    });
});

// Edit an existing patient
router.put("/:id", (req, res) => {
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

    if (
        !full_name?.trim() ||
        age === undefined ||
        age === "" ||
        !gender ||
        !phone?.trim() ||
        !Number.isInteger(Number(age)) ||
        Number(age) < 0
    ) {
        return res.status(400).json({
            message: "Enter a valid name, age, gender and phone number"
        });
    }

    if (status && !["Active", "Inactive"].includes(status)) {
        return res.status(400).json({
            message: "Invalid patient status"
        });
    }

    const sql = `
        UPDATE patients
        SET full_name = ?,
            age = ?,
            gender = ?,
            phone = ?,
            address = ?,
            assigned_doctor_id = ?,
            department_id = ?,
            status = ?
        WHERE patient_id = ?
    `;

    const values = [
        full_name.trim(),
        Number(age),
        gender,
        phone.trim(),
        address || null,
        assigned_doctor_id || null,
        department_id || null,
        status || "Active",
        req.params.id
    ];

    db.query(sql, values, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                message: "Failed to update patient"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        res.json({
            message: "Patient updated successfully"
        });
    });
});

// Delete a patient
router.delete("/:id", (req, res) => {
    const sql = "DELETE FROM patients WHERE patient_id = ?";

    db.query(sql, [req.params.id], (error, result) => {
        if (error) {
            console.error(error);

            if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({
                    message:
                        "This patient has appointments. Delete their appointments first."
                });
            }

            return res.status(500).json({
                message: "Failed to delete patient"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        res.json({
            message: "Patient deleted successfully"
        });
    });
});

module.exports = router;
