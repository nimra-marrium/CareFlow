const express = require("express");
const cors = require("cors");

const db = require("./db");
const usersRoute = require("./routes/users");
const authRoute = require("./routes/auth");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("CareFlow backend is running!");
});

app.use("/api/users", usersRoute);
app.use("/api/auth", authRoute);

app.listen(PORT, () => {
    console.log(`CareFlow backend running on http://localhost:${PORT}`);
});