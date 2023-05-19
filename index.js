const express = require("express");
const cors = require("cors");
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;





app.get("/", (req, res) => {
  res.send("Animal toys is running");
});

app.listen(port, () => {
  console.log(`Animal toys is running on ${port}`);
});
