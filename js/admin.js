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


                /* Role names → database role IDs */

                const roleIds = {
                    doctor: 1,
                    receptionist: 2,
                    pharmacist: 3
                };


                /* Department values → database department IDs */

                const departmentIds = {
                    administration: "DEP-001",
                    cardiology: "DEP-002",
                    dermatology: "DEP-003",
                    emergency: "DEP-004",
                    ent: "DEP-005",
                    gastroenterology: "DEP-006",
                    "general-medicine": "DEP-007",
                    gynecology: "DEP-008",
                    neurology: "DEP-009",
                    oncology: "DEP-010",
                    orthopedics: "DEP-011",
                    pharmacy: "DEP-012",
                    radiology: "DEP-013",
                    urology: "DEP-014"
                };


                const roleId =
                    roleIds[role];

                const departmentId =
                    departmentIds[department];


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

                                    full_name: fullName,

                                    email: email,

                                    password: password,

                                    phone: phone,

                                    role_id: roleId,

                                    department_id:
                                        departmentId,

                                    specialization:
                                        specialization || null,

                                    status: "Active"

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
                    ).style.display = "none";


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

        addRoleBtn.addEventListener("click", () => {

            addRoleModal.classList.add("show");

            const roleName =
                document.getElementById("roleName");

            if (roleName) {
                roleName.focus();
            }

        });

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
            (event) => {

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
                        checkbox => checkbox.value
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


                alert(
                    "Role added successfully!\n\n" +
                    "Role: " +
                    roleName +
                    "\n\n" +
                    "Permissions:\n" +
                    selectedPermissions.join("\n")
                );


                closeRoleModal();

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

});