const express = require("express");
const cors = require("cors");
const battleRoutes = require("./routes/battleRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("BattleMon server is running");
});

app.use("/api/battle", battleRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});