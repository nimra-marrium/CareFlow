const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CareFlow backend is running!");
});

app.listen(PORT, () => {
  console.log(`CareFlow backend running on http://localhost:${PORT}`);
});