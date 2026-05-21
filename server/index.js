const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const battleHistoryRoutes = require("./routes/battleHistoryRoutes");
const battleRoutes = require("./routes/battleRoutes");
const creatureRoutes = require("./routes/creatureRoutes");
const teamRoutes = require("./routes/teamRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("BattleMon server is running");
});

app.use("/api/battle", battleRoutes);
app.use("/api/battles", battleHistoryRoutes);
app.use("/api/creatures", creatureRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
