const express = require("express");

const router = express.Router();

const db = require("../db");


// GET all departments
router.get("/", (req, res) => {

    const sql = `
        SELECT
            department_id,
            department_name,
            department_code,
            status
        FROM departments
        ORDER BY department_id
    `;

    db.query(sql, (error, results) => {

        if (error) {

            console.error(
                "Error fetching departments:",
                error.message
            );

            return res.status(500).json({
                message: "Failed to fetch departments."
            });

        }

        res.json(results);

    });

});


// GET one department
router.get("/:departmentId", (req, res) => {

    const { departmentId } = req.params;

    const sql = `
        SELECT
            department_id,
            department_name,
            department_code,
            status
        FROM departments
        WHERE department_id = ?
    `;

    db.query(sql, [departmentId], (error, results) => {

        if (error) {

            console.error(
                "Error fetching department:",
                error.message
            );

            return res.status(500).json({
                message: "Failed to fetch department."
            });

        }

        if (results.length === 0) {

            return res.status(404).json({
                message: "Department not found."
            });

        }

        res.json(results[0]);

    });

});


// CREATE department
router.post("/", (req, res) => {

    const {
        department_name,
        department_code,
        status
    } = req.body;


    if (!department_name || !department_code) {

        return res.status(400).json({
            message: "Department name and code are required."
        });

    }


    const idSql = `
        SELECT department_id
        FROM departments
        WHERE department_id LIKE 'DEP-%'
        ORDER BY CAST(SUBSTRING(department_id, 5) AS UNSIGNED) DESC
        LIMIT 1
    `;


    db.query(idSql, (idError, idResults) => {

        if (idError) {

            console.error(
                "Error generating department ID:",
                idError.message
            );

            return res.status(500).json({
                message: "Failed to generate department ID."
            });

        }


        let nextNumber = 1;


        if (idResults.length > 0) {

            const lastId = idResults[0].department_id;

            const lastNumber = parseInt(
                lastId.substring(4),
                10
            );

            nextNumber = lastNumber + 1;

        }


        const departmentId =
            "DEP-" +
            String(nextNumber).padStart(3, "0");


        const sql = `
            INSERT INTO departments
            (
                department_id,
                department_name,
                department_code,
                status
            )
            VALUES (?, ?, ?, ?)
        `;


        const values = [
            departmentId,
            department_name.trim(),
            department_code.trim().toUpperCase(),
            status || "Active"
        ];


        db.query(
            sql,
            values,
            (error, result) => {

                if (error) {

                    console.error(
                        "Error creating department:",
                        error.message
                    );

                    return res.status(500).json({
                        message: "Failed to create department."
                    });

                }


                res.status(201).json({

                    message:
                        "Department created successfully.",

                    department_id:
                        departmentId

                });

            }
        );

    });

});


// UPDATE department
router.put("/:departmentId", (req, res) => {

    const { departmentId } = req.params;

    const {
        department_name,
        department_code,
        status
    } = req.body;


    if (
        !department_name ||
        !department_code ||
        !status
    ) {

        return res.status(400).json({
            message: "Please fill in all required fields."
        });

    }


    const sql = `
        UPDATE departments
        SET
            department_name = ?,
            department_code = ?,
            status = ?
        WHERE department_id = ?
    `;


    const values = [
        department_name.trim(),
        department_code.trim().toUpperCase(),
        status,
        departmentId
    ];


    db.query(
        sql,
        values,
        (error, result) => {

            if (error) {

                console.error(
                    "Error updating department:",
                    error.message
                );

                return res.status(500).json({
                    message: "Failed to update department."
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Department not found."
                });

            }


            res.json({

                message:
                    "Department updated successfully.",

                department_id:
                    departmentId

            });

        }
    );

});


module.exports = router;