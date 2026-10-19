
const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all appointments
router.get("/", (req, res) => {
    const sql = `
        SELECT
            a.*,
            p.full_name AS patient_name,
            u.full_name AS doctor_name,
            d.department_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.patient_id
        JOIN users u ON a.doctor_id = u.user_id
        LEFT JOIN departments d ON a.department_id = d.department_id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.error("Fetch appointments error:", error);
            return res.status(500).json({
                message: "Failed to fetch appointments"
            });
        }

        res.json(results);
    });
});

// Book a new appointment
router.post("/", (req, res) => {
    const {
        patient_id,
        doctor_id,
        department_id,
        appointment_date,
        appointment_time,
        reason
    } = req.body;

    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
        return res.status(400).json({
            message: "Patient, doctor, date and time are required"
        });
    }

    const appointment_id = "APT-" + Date.now().toString().slice(-6);

    const sql = `
        INSERT INTO appointments (
            appointment_id, patient_id, doctor_id, department_id,
            appointment_date, appointment_time, reason, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Scheduled')
    `;

    const values = [
        appointment_id,
        patient_id,
        doctor_id,
        department_id || null,
        appointment_date,
        appointment_time,
        reason || null
    ];

    db.query(sql, values, (error) => {
        if (error) {
            console.error("Book appointment error:", error);
            return res.status(500).json({
                message: "Failed to book appointment"
            });
        }

        res.status(201).json({
            message: "Appointment booked successfully",
            appointment_id
        });
    });
});

// Edit an appointment
router.put("/:id", (req, res) => {
    const {
        patient_id,
        doctor_id,
        department_id,
        appointment_date,
        appointment_time,
        reason,
        status
    } = req.body;

    if (
        !patient_id ||
        !doctor_id ||
        !appointment_date ||
        !appointment_time
    ) {
        return res.status(400).json({
            message: "Patient, doctor, date and time are required"
        });
    }

    if (
        status &&
        !["Scheduled", "Completed", "Cancelled"].includes(status)
    ) {
        return res.status(400).json({
            message: "Invalid appointment status"
        });
    }

    const sql = `
        UPDATE appointments
        SET patient_id = ?,
            doctor_id = ?,
            department_id = ?,
            appointment_date = ?,
            appointment_time = ?,
            reason = ?,
            status = ?
        WHERE appointment_id = ?
    `;

    const values = [
        patient_id,
        doctor_id,
        department_id || null,
        appointment_date,
        appointment_time,
        reason || null,
        status || "Scheduled",
        req.params.id
    ];

    db.query(sql, values, (error, result) => {
        if (error) {
            console.error("Update appointment error:", error);
            return res.status(500).json({
                message: "Failed to update appointment"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        res.json({
            message: "Appointment updated successfully"
        });
    });
});

// Delete an appointment
router.delete("/:id", (req, res) => {
    const sql = `
        DELETE FROM appointments
        WHERE appointment_id = ?
    `;

    db.query(sql, [req.params.id], (error, result) => {
        if (error) {
            console.error("Delete appointment error:", error);
            return res.status(500).json({
                message: "Failed to delete appointment"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        res.json({
            message: "Appointment deleted successfully"
        });
    });
});

module.exports = router;
