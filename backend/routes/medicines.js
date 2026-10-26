
const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all medicines
router.get("/", (req, res) => {
    const sql = `
        SELECT *
        FROM medicines
        ORDER BY medicine_name ASC
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.error("Fetch medicines error:", error);
            return res.status(500).json({
                message: "Failed to fetch medicines"
            });
        }

        res.json(results);
    });
});

// Add a medicine
router.post("/", (req, res) => {
    const {
        medicine_name,
        category,
        quantity,
        unit_price,
        expiry_date
    } = req.body;

    if (
        !medicine_name ||
        !medicine_name.trim() ||
        quantity === undefined ||
        unit_price === undefined ||
        quantity === "" ||
        unit_price === "" ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 0 ||
        !Number.isFinite(Number(unit_price)) ||
        Number(unit_price) < 0
    ) {
        return res.status(400).json({
            message: "Enter a valid medicine name, quantity and unit price"
        });
    }

    // Generate the next sequential medicine ID
    const getNextIdSql = `
        SELECT COALESCE(
            MAX(CAST(SUBSTRING(medicine_id, 5) AS UNSIGNED)),
            1000
        ) AS max_id
        FROM medicines
        WHERE medicine_id REGEXP '^MED-[0-9]+$'
    `;

    db.query(getNextIdSql, (idError, rows) => {
        if (idError) {
            console.error("Generate medicine ID error:", idError);
            return res.status(500).json({
                message: "Failed to generate medicine ID"
            });
        }

        const medicine_id = `MED-${Number(rows[0].max_id) + 1}`;

        const status =
            Number(quantity) === 0 ? "Out of Stock" : "Available";

        const sql = `
            INSERT INTO medicines (
                medicine_id,
                medicine_name,
                category,
                quantity,
                unit_price,
                expiry_date,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            medicine_id,
            medicine_name.trim(),
            category || null,
            Number(quantity),
            Number(unit_price),
            expiry_date || null,
            status
        ];

        db.query(sql, values, (error) => {
            if (error) {
                console.error("Add medicine error:", error);
                return res.status(500).json({
                    message: "Failed to add medicine"
                });
            }

            res.status(201).json({
                message: "Medicine added successfully",
                medicine_id
            });
        });
    });
});

// Edit a medicine
router.put("/:id", (req, res) => {
    const { id } = req.params;

    const {
        medicine_name,
        category,
        quantity,
        unit_price,
        expiry_date
    } = req.body;

    if (
        !medicine_name ||
        !medicine_name.trim() ||
        quantity === undefined ||
        unit_price === undefined ||
        quantity === "" ||
        unit_price === "" ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 0 ||
        !Number.isFinite(Number(unit_price)) ||
        Number(unit_price) < 0
    ) {
        return res.status(400).json({
            message: "Enter a valid medicine name, quantity and unit price"
        });
    }

    const status =
        Number(quantity) === 0 ? "Out of Stock" : "Available";

    const sql = `
        UPDATE medicines
        SET
            medicine_name = ?,
            category = ?,
            quantity = ?,
            unit_price = ?,
            expiry_date = ?,
            status = ?
        WHERE medicine_id = ?
    `;

    const values = [
        medicine_name.trim(),
        category || null,
        Number(quantity),
        Number(unit_price),
        expiry_date || null,
        status,
        id
    ];

    db.query(sql, values, (error, result) => {
        if (error) {
            console.error("Update medicine error:", error);
            return res.status(500).json({
                message: "Failed to update medicine"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Medicine not found"
            });
        }

        res.json({
            message: "Medicine updated successfully"
        });
    });
});

// Delete a medicine
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM medicines
        WHERE medicine_id = ?
    `;

    db.query(sql, [id], (error, result) => {
        if (error) {
            console.error("Delete medicine error:", error);
            return res.status(500).json({
                message: "Failed to delete medicine"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Medicine not found"
            });
        }

        res.json({
            message: "Medicine deleted successfully"
        });
    });
});

module.exports = router;
