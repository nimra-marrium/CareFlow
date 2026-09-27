document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CREATE USER FORM
    ===================================================== */

    const form = document.querySelector(".form-card form");

    if (form) {

        form.addEventListener("submit", (event) => {

            event.preventDefault();

            const nameElement =
                document.getElementById("name");

            const emailElement =
                document.getElementById("email");

            const roleElement =
                document.getElementById("role");

            const statusElement =
                document.getElementById("status");


            const name =
                nameElement ? nameElement.value : "";

            const email =
                emailElement ? emailElement.value : "";

            const role =
                roleElement ? roleElement.value : "";

            const status =
                statusElement ? statusElement.value : "";


            alert(
                "User created successfully!\n\n" +
                "Name: " + name + "\n" +
                "Email: " + email + "\n" +
                "Role: " + role + "\n" +
                "Status: " + status
            );

        });

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


    /* Open Modal */

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


    /* Close Modal */

    function closeRoleModal() {

        if (!addRoleModal) {
            return;
        }

        addRoleModal.classList.remove("show");

        if (addRoleForm) {
            addRoleForm.reset();
        }

    }


    /* X Button */

    if (closeRoleModalBtn) {

        closeRoleModalBtn.addEventListener(
            "click",
            closeRoleModal
        );

    }


    /* Cancel Button */

    if (cancelRoleBtn) {

        cancelRoleBtn.addEventListener(
            "click",
            closeRoleModal
        );

    }


    /* Submit Role */

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


                /* Role name required */

                if (!roleName) {

                    alert(
                        "Please enter a role name."
                    );

                    return;

                }


                /* Permission required */

                if (
                    selectedPermissions.length === 0
                ) {

                    alert(
                        "Please select at least one permission."
                    );

                    return;

                }


                /* Demo success */

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


    /* Click outside modal */

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


    /* Escape Key */

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