document.addEventListener("DOMContentLoaded", () => {

/* =====================================================
   CREATE USER FORM
===================================================== */

const createUserForm =
    document.getElementById("createUserForm");


if (createUserForm) {

    createUserForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const fullName =
                document.getElementById("fullName").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const phone =
                document.getElementById("phone").value.trim();

            const password =
                document.getElementById("password").value;

            const role =
                document.getElementById("role").value;

            const department =
                document.getElementById("department").value;

            const specialization =
                document.getElementById("specialization").value.trim();


            const roleId =
                role;

            const departmentId =
                department;


            if (!roleId || !departmentId) {

                alert(
                    "Please select a valid role and department."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/users",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                full_name:
                                    fullName,

                                email:
                                    email,

                                password:
                                    password,

                                phone:
                                    phone,

                                role_id:
                                    roleId,

                                department_id:
                                    departmentId,

                                specialization:
                                    specialization || null,

                                status:
                                    "Active"

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to create user."
                    );

                    return;

                }


                alert(
                    "User created successfully!\n\n" +
                    "User ID: " +
                    data.user_id
                );


                createUserForm.reset();


                document.getElementById(
                    "specializationField"
                ).style.display =
                    "none";


                window.location.href =
                    "users.html";


            } catch (error) {

                console.error(
                    "Create user error:",
                    error
                );

                alert(
                    "Could not connect to the CareFlow backend."
                );

            }

        }
    );

}


/* =====================================================
   ADD ROLE
===================================================== */

const addRoleBtn =
    document.getElementById("addRoleBtn");

const addRoleModal =
    document.getElementById("addRoleModal");

const addRoleForm =
    document.getElementById("addRoleForm");

const closeRoleModalBtn =
    document.getElementById("closeRoleModalBtn");

const cancelRoleBtn =
    document.getElementById("cancelRoleBtn");


if (addRoleBtn && addRoleModal) {

    addRoleBtn.addEventListener(
        "click",
        () => {

            addRoleModal.classList.add("show");


            const roleName =
                document.getElementById("roleName");


            if (roleName) {

                roleName.focus();

            }

        }
    );

}


function closeRoleModal() {

    if (!addRoleModal) {

        return;

    }


    addRoleModal.classList.remove("show");


    if (addRoleForm) {

        addRoleForm.reset();

    }

}


if (closeRoleModalBtn) {

    closeRoleModalBtn.addEventListener(
        "click",
        closeRoleModal
    );

}


if (cancelRoleBtn) {

    cancelRoleBtn.addEventListener(
        "click",
        closeRoleModal
    );

}


if (addRoleForm) {

    addRoleForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const roleNameElement =
                document.getElementById("roleName");


            const roleName =
                roleNameElement
                    ? roleNameElement.value.trim()
                    : "";


            const selectedPermissions =
                Array.from(
                    addRoleForm.querySelectorAll(
                        'input[type="checkbox"]:checked'
                    )
                ).map(
                    checkbox =>
                        checkbox.value
                );


            if (!roleName) {

                alert(
                    "Please enter a role name."
                );

                return;

            }


            if (
                selectedPermissions.length === 0
            ) {

                alert(
                    "Please select at least one permission."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/roles",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                role_name:
                                    roleName
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to add role."
                    );

                    return;

                }


                alert(
                    "Role added successfully!\n\n" +
                    "Role: " +
                    data.role_name
                );


                closeRoleModal();


                window.location.reload();


            } catch (error) {

                console.error(
                    "Add role error:",
                    error
                );

                alert(
                    "Could not connect to the CareFlow backend."
                );

            }

        }
    );

}


if (addRoleModal) {

    addRoleModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === addRoleModal
            ) {

                closeRoleModal();

            }

        }
    );

}


document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            addRoleModal &&
            addRoleModal.classList.contains("show")
        ) {

            closeRoleModal();

        }

    }
);


/* =====================================================
   DELETE ROLE
===================================================== */

const deleteRoleModal =
    document.getElementById(
        "deleteRoleModal"
    );

const deleteRoleName =
    document.getElementById(
        "deleteRoleName"
    );

const closeDeleteRoleModalBtn =
    document.getElementById(
        "closeDeleteRoleModalBtn"
    );

const cancelDeleteRoleBtn =
    document.getElementById(
        "cancelDeleteRoleBtn"
    );

const confirmDeleteRoleBtn =
    document.getElementById(
        "confirmDeleteRoleBtn"
    );


let roleToDelete = null;


function openDeleteRoleModal(
    roleId,
    roleName
) {

    if (!deleteRoleModal) {

        return;

    }


    roleToDelete =
        roleId;


    if (deleteRoleName) {

        deleteRoleName.textContent =
            roleName;

    }


    deleteRoleModal.classList.add(
        "show"
    );

}


function closeDeleteRoleModal() {

    if (!deleteRoleModal) {

        return;

    }


    deleteRoleModal.classList.remove(
        "show"
    );


    roleToDelete =
        null;

}


if (closeDeleteRoleModalBtn) {

    closeDeleteRoleModalBtn.addEventListener(
        "click",
        closeDeleteRoleModal
    );

}


if (cancelDeleteRoleBtn) {

    cancelDeleteRoleBtn.addEventListener(
        "click",
        closeDeleteRoleModal
    );

}


if (deleteRoleModal) {

    deleteRoleModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                deleteRoleModal
            ) {

                closeDeleteRoleModal();

            }

        }
    );

}


if (confirmDeleteRoleBtn) {

    confirmDeleteRoleBtn.addEventListener(
        "click",
        async () => {

            if (!roleToDelete) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `http://localhost:5000/api/roles/${roleToDelete}`,
                        {
                            method: "DELETE"
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to delete role."
                    );

                    closeDeleteRoleModal();

                    return;

                }


                alert(
                    "Role deleted successfully!"
                );


                closeDeleteRoleModal();


                window.location.reload();


            } catch (error) {

                console.error(
                    "Delete role error:",
                    error
                );

                alert(
                    "Could not connect to the CareFlow backend."
                );

            }

        }
    );

}


/* =====================================================
   SAVE PERMISSIONS
===================================================== */

const savePermissionsBtn =
    document.getElementById(
        "savePermissionsBtn"
    );


if (savePermissionsBtn) {

    savePermissionsBtn.addEventListener(
        "click",
        () => {

            alert(
                "Permissions saved successfully! (Demo only)"
            );

        }
    );

}


/* =====================================================
   LOAD ROLES AND PERMISSIONS
===================================================== */

const rolesGrid =
    document.getElementById(
        "rolesGrid"
    );

const permissionsTableHead =
    document.getElementById(
        "permissionsTableHead"
    );

const permissionsTableBody =
    document.getElementById(
        "permissionsTableBody"
    );


if (
    rolesGrid &&
    permissionsTableHead &&
    permissionsTableBody
) {

    async function loadRoles() {

        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/roles"
                );


            const roles =
                await response.json();


            if (!response.ok) {

                alert(
                    "Failed to load roles."
                );

                return;

            }


            /* =========================
               ROLE CARDS
            ========================== */

            rolesGrid.innerHTML =
                "";


            roles.forEach(
                (role) => {

                    const roleCard =
                        document.createElement(
                            "div"
                        );


                    roleCard.className =
                        "role-card";


                    const roleTitle =
                        document.createElement(
                            "h3"
                        );


                    roleTitle.textContent =
                        role.role_name;


                    roleCard.appendChild(
                        roleTitle
                    );


                    /*
                       Admin cannot be deleted.
                    */

                    if (
                        role.role_name !==
                        "Admin"
                    ) {

                        const deleteButton =
                            document.createElement(
                                "button"
                            );


                        deleteButton.type =
                            "button";


                        deleteButton.className =
                            "btn";


                        deleteButton.textContent =
                            "Delete";


                        deleteButton.style.marginTop =
                            "12px";


                        deleteButton.style.background =
                            "var(--red)";


                        deleteButton.style.color =
                            "white";


                        deleteButton.addEventListener(
                            "click",
                            () => {

                                openDeleteRoleModal(
                                    role.role_id,
                                    role.role_name
                                );

                            }
                        );


                        roleCard.appendChild(
                            deleteButton
                        );

                    }


                    rolesGrid.appendChild(
                        roleCard
                    );

                }
            );


            /* =========================
               TABLE HEADER
            ========================== */

            permissionsTableHead.innerHTML =
                "";


            const headerRow =
                document.createElement(
                    "tr"
                );


            const permissionHeader =
                document.createElement(
                    "th"
                );


            permissionHeader.textContent =
                "Permission";


            headerRow.appendChild(
                permissionHeader
            );


            roles.forEach(
                (role) => {

                    const roleHeader =
                        document.createElement(
                            "th"
                        );


                    roleHeader.textContent =
                        role.role_name;


                    headerRow.appendChild(
                        roleHeader
                    );

                }
            );


            permissionsTableHead.appendChild(
                headerRow
            );


            /* =========================
               PERMISSION TABLE
            ========================== */

            const permissions = [

                {
                    id: 1,
                    name: "View Doctors"
                },

                {
                    id: 2,
                    name: "View Patients"
                },

                {
                    id: 3,
                    name: "Add Patients"
                },

                {
                    id: 4,
                    name: "View Appointments"
                },

                {
                    id: 5,
                    name: "Book Appointment"
                },

                {
                    id: 6,
                    name: "View Pharmacy"
                },

                {
                    id: 7,
                    name: "Add Medicine"
                }

            ];


            permissionsTableBody.innerHTML =
                "";


            permissions.forEach(
                (permission) => {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    const nameCell =
                        document.createElement(
                            "td"
                        );


                    nameCell.textContent =
                        permission.name;


                    row.appendChild(
                        nameCell
                    );


                    roles.forEach(
                        (role) => {

                            const cell =
                                document.createElement(
                                    "td"
                                );


                            const checkbox =
                                document.createElement(
                                    "input"
                                );


                            checkbox.type =
                                "checkbox";


                            checkbox.dataset.role =
                                role.role_id;


                            checkbox.dataset.permission =
                                permission.id;


                            const hasPermission =
                                role.permissions.includes(
                                    permission.name
                                );


                            checkbox.checked =
                                hasPermission;


                            cell.appendChild(
                                checkbox
                            );


                            row.appendChild(
                                cell
                            );

                        }
                    );


                    permissionsTableBody.appendChild(
                        row
                    );

                }
            );


        } catch (error) {

            console.error(
                "Load roles error:",
                error
            );

            alert(
                "Could not connect to the CareFlow backend."
            );

        }

    }


    loadRoles();

}
});
