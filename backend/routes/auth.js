const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();
const db = require("../db");

router.post("/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required."
        });
    }

    const sql = `
        SELECT
            u.user_id,
            u.full_name,
            u.email,
            u.password,
            u.status,
            u.role_id,
            r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = ?
    `;

    db.query(sql, [email], async (error, results) => {

        if (error) {
            console.error("Login error:", error.message);

            return res.status(500).json({
                message: "Login failed."
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = results[0];

        if (user.status !== "Active") {
            return res.status(403).json({
                message: "Your account is inactive."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        res.json({
            message: "Login successful.",
            user: {
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    role_id: user.role_id,
    role: user.role_name
}
        });

    });

});

module.exports = router;