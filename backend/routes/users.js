const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

const db = require("../db");


// GET all users
router.get("/", (req, res) => {

    const sql = `
        SELECT
            u.user_id,
            u.full_name,
            u.email,
            u.phone,
            u.specialization,
            u.status,
            r.role_name,
            d.department_name
        FROM users u
        JOIN roles r
            ON u.role_id = r.role_id
        LEFT JOIN departments d
            ON u.department_id = d.department_id
        ORDER BY u.user_id
    `;

    db.query(sql, (error, results) => {

        if (error) {

            console.error(
                "Error fetching users:",
                error.message
            );

            return res.status(500).json({
                message: "Failed to fetch users."
            });

        }

        res.json(results);

    });

});

// GET one user
router.get("/:userId", (req, res) => {

    const { userId } = req.params;

    const sql = `
        SELECT
            u.user_id,
            u.full_name,
            u.email,
            u.phone,
            u.specialization,
            u.status,
            r.role_id,
            r.role_name,
            d.department_id,
            d.department_name
        FROM users u
        JOIN roles r
            ON u.role_id = r.role_id
        LEFT JOIN departments d
            ON u.department_id = d.department_id
        WHERE u.user_id = ?
    `;

    db.query(sql, [userId], (error, results) => {

        if (error) {

            console.error(
                "Error fetching user:",
                error.message
            );

            return res.status(500).json({
                message: "Failed to fetch user."
            });

        }

        if (results.length === 0) {

            return res.status(404).json({
                message: "User not found."
            });

        }

        res.json(results[0]);

    });

});

// DELETE user
router.delete("/:userId", (req, res) => {

    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            message: "User ID is required."
        });
    }

    const sql = `
        DELETE FROM users
        WHERE user_id = ?
    `;

    db.query(sql, [userId], (error, result) => {

        if (error) {

            console.error(
                "Error deleting user:",
                error.message
            );

            return res.status(500).json({
                message: "Failed to delete user."
            });
        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "User not found."
            });
        }

        res.json({
            message: "User deleted successfully.",
            user_id: userId
        });

    });

});

// CREATE user
router.post("/", async (req, res) => {

    const {
        full_name,
        email,
        password,
        phone,
        role_id,
        department_id,
        specialization,
        status
    } = req.body;


    // Check required fields
    if (
        !full_name ||
        !email ||
        !password ||
        !role_id ||
        !department_id
    ) {

        return res.status(400).json({
            message: "Please fill in all required fields."
        });

    }


    try {

        // Generate the next User ID automatically
        const idSql = `
            SELECT user_id
            FROM users
            WHERE user_id LIKE 'USR-%'
            ORDER BY CAST(SUBSTRING(user_id, 5) AS UNSIGNED) DESC
            LIMIT 1
        `;


        db.query(idSql, async (idError, idResults) => {

            if (idError) {

                console.error(
                    "Error generating user ID:",
                    idError.message
                );

                return res.status(500).json({
                    message: "Failed to generate user ID."
                });

            }


            let nextNumber = 1;


            if (idResults.length > 0) {

                const lastId = idResults[0].user_id;

                const lastNumber = parseInt(
                    lastId.substring(4),
                    10
                );

                nextNumber = lastNumber + 1;

            }


            const userId =
                "USR-" +
                String(nextNumber).padStart(3, "0");


            // Hash password before saving
            const hashedPassword =
                await bcrypt.hash(password, 10);


            const sql = `
                INSERT INTO users
                (
                    user_id,
                    full_name,
                    email,
                    password,
                    phone,
                    role_id,
                    department_id,
                    specialization,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;


            const values = [
                userId,
                full_name,
                email,
                hashedPassword,
                phone,
                role_id,
                department_id,
                specialization || null,
                status || "Active"
            ];


            db.query(
                sql,
                values,
                (error, result) => {

                    if (error) {

                        console.error(
                            "Error creating user:",
                            error.message
                        );

                        return res.status(500).json({
                            message:
                                "Failed to create user."
                        });

                    }


                    res.status(201).json({

                        message:
                            "User created successfully.",

                        user_id:
                            userId

                    });

                }
            );

        });


    } catch (error) {

        console.error(
            "Password hashing error:",
            error.message
        );

        res.status(500).json({

            message:
                "Failed to process user password."

        });

    }

});


// UPDATE user
router.put("/:userId", (req, res) => {

    const { userId } = req.params;

    const {
        full_name,
        email,
        phone,
        role_id,
        department_id,
        specialization,
        status
    } = req.body;


    if (
        !full_name ||
        !email ||
        !role_id ||
        !department_id ||
        !status
    ) {

        return res.status(400).json({
            message: "Please fill in all required fields."
        });

    }


    const sql = `
        UPDATE users
        SET
            full_name = ?,
            email = ?,
            phone = ?,
            role_id = ?,
            department_id = ?,
            specialization = ?,
            status = ?
        WHERE user_id = ?
    `;


    const values = [
        full_name,
        email,
        phone,
        role_id,
        department_id,
        specialization || null,
        status,
        userId
    ];


    db.query(
        sql,
        values,
        (error, result) => {

            if (error) {

                console.error(
                    "Error updating user:",
                    error.message
                );

                return res.status(500).json({
                    message: "Failed to update user."
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "User not found."
                });

            }


            res.json({
                message: "User updated successfully.",
                user_id: userId
            });

        }
    );

});

module.exports = router;