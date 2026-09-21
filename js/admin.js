document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".form-card form");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const role = document.getElementById("role").value;
        const status = document.getElementById("status").value;

        alert(
            "User created successfully!\n\n" +
            "Name: " + name + "\n" +
            "Email: " + email + "\n" +
            "Role: " + role + "\n" +
            "Status: " + status
        );
    });
});