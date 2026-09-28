const express = require("express");
const router = express.Router();

const db = require("../db");

/* =====================================================
GET ALL ROLES WITH THEIR PERMISSIONS
===================================================== */

router.get("/", (req, res) => {

const sql = `
    SELECT
        r.role_id,
        r.role_name,
        p.permission_id,
        p.permission_name
    FROM roles r
    LEFT JOIN role_permissions rp
        ON r.role_id = rp.role_id
    LEFT JOIN permissions p
        ON rp.permission_id = p.permission_id
    ORDER BY r.role_id, p.permission_id
`;


db.query(sql, (error, results) => {

    if (error) {

        console.error(
            "Error fetching roles and permissions:",
            error.message
        );

        return res.status(500).json({
            message: "Failed to fetch roles and permissions."
        });

    }


    const roles = {};


    results.forEach((row) => {

        if (!roles[row.role_id]) {

            roles[row.role_id] = {
                role_id: row.role_id,
                role_name: row.role_name,
                permissions: []
            };

        }


        if (row.permission_id) {

            roles[row.role_id].permissions.push(
                row.permission_name
            );

        }

    });


    res.json(
        Object.values(roles)
    );

});


});

/* =====================================================
CREATE ROLE
===================================================== */

router.post("/", (req, res) => {


const { role_name } = req.body;


if (!role_name) {

    return res.status(400).json({
        message: "Role name is required."
    });

}


const sql = `
    INSERT INTO roles (role_name)
    VALUES (?)
`;


db.query(
    sql,
    [role_name],
    (error, result) => {

        if (error) {

            console.error(
                "Error creating role:",
                error.message
            );

            return res.status(500).json({
                message: "Failed to create role."
            });

        }


        res.status(201).json({

            message:
                "Role created successfully.",

            role_id:
                result.insertId,

            role_name:
                role_name

        });

    }
);


});

/* =====================================================
DELETE ROLE
===================================================== */

router.delete("/:roleId", (req, res) => {


const { roleId } = req.params;


if (!roleId) {

    return res.status(400).json({
        message: "Role ID is required."
    });

}


/* =================================================
   CHECK ROLE
================================================= */

const checkRoleSql = `
    SELECT
        role_id,
        role_name
    FROM roles
    WHERE role_id = ?
`;


db.query(
    checkRoleSql,
    [roleId],
    (error, results) => {

        if (error) {

            console.error(
                "Error checking role:",
                error.message
            );

            return res.status(500).json({
                message: "Failed to check role."
            });

        }


        if (results.length === 0) {

            return res.status(404).json({
                message: "Role not found."
            });

        }


        const role =
            results[0];


        /* =========================================
           ADMIN CANNOT BE DELETED
        ========================================= */

        if (role.role_name === "Admin") {

            return res.status(403).json({
                message: "The Admin role cannot be deleted."
            });

        }


        /* =========================================
           CHECK IF ROLE IS USED BY A USER
        ========================================= */

        const checkUsersSql = `
            SELECT COUNT(*) AS userCount
            FROM users
            WHERE role_id = ?
        `;


        db.query(
            checkUsersSql,
            [roleId],
            (userError, userResults) => {

                if (userError) {

                    console.error(
                        "Error checking role users:",
                        userError.message
                    );

                    return res.status(500).json({
                        message:
                            "Failed to check role usage."
                    });

                }


                if (
                    userResults[0].userCount > 0
                ) {

                    return res.status(409).json({
                        message:
                            "This role cannot be deleted because it is currently assigned to one or more users."
                    });

                }


                /* =================================
                   DELETE ROLE PERMISSIONS
                ================================= */

                const deletePermissionsSql = `
                    DELETE FROM role_permissions
                    WHERE role_id = ?
                `;


                db.query(
                    deletePermissionsSql,
                    [roleId],
                    (permissionError) => {

                        if (permissionError) {

                            console.error(
                                "Error deleting role permissions:",
                                permissionError.message
                            );

                            return res.status(500).json({
                                message:
                                    "Failed to delete role permissions."
                            });

                        }


                        /* =============================
                           DELETE ROLE
                        ============================= */

                        const deleteRoleSql = `
                            DELETE FROM roles
                            WHERE role_id = ?
                        `;


                        db.query(
                            deleteRoleSql,
                            [roleId],
                            (deleteError, deleteResult) => {

                                if (deleteError) {

                                    console.error(
                                        "Error deleting role:",
                                        deleteError.message
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Failed to delete role."
                                    });

                                }


                                if (
                                    deleteResult.affectedRows === 0
                                ) {

                                    return res.status(404).json({
                                        message:
                                            "Role not found."
                                    });

                                }


                                res.json({

                                    message:
                                        "Role deleted successfully.",

                                    role_id:
                                        roleId

                                });

                            }
                        );

                    }
                );

            }
        );

    }
);

});

module.exports = router;
