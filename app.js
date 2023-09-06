const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const uploadRoutes = require("./routes/uploadRoutes");
const connection = require('./config/db')

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

app.use("/uploads", express.static(__dirname + "/public/uploads"));
app.use("/api", uploadRoutes);

app.listen(8081, () => {
  connection()
  console.log("App is running on port 8081");
});
