const express = require("express");
const router = express.Router();

const db = require("../db");


/* =====================================================
   GET ALL ACTIVE DEPARTMENTS
===================================================== */

router.get("/", (req, res) => {

    const sql = `
        SELECT
            department_id,
            department_name,
            department_code,
            status
        FROM departments
        WHERE status = 'Active'
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


module.exports = router;