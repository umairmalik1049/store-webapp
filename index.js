const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000;

// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   database: "store",
//   password: "qualo666",
// });

const connection = mysql.createConnection({
  host: process.env.DB_HOST, // Use the environment variable for DB host
  user: process.env.DB_USER, // Your DB username
  password: process.env.DB_PASSWORD, // Your DB password
  database: process.env.DB_NAME, // Your DB name
  port: process.env.DB_PORT || 3306 // Optional: default to 3306 if not specified
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database!');
  }
});


// ------------------------------------
// ------------ Home Route ------------
// ------------------------------------

app.get("/", (req, res) => {
  res.render("index.ejs");
});

// ------------------------------------
// -------- Invoice Save Route --------
// ------------------------------------

app.post("/save", (req, res) => {
  let q1 = "SELECT * FROM items";

  try {
    connection.query(q1, (err, result1) => {
      if (err) throw err;
      let itemStr = "";

      for (let i = 0; i < req.body.itemName.length; i++) {
        if (i == req.body.itemName.length - 1) {
          itemStr += req.body.itemName[i];
        } else {
          itemStr += req.body.itemName[i] + ", ";
        }

        for (let j = 0; j < result1.length; j++) {
          if (result1[j]["itemsName"] == req.body.itemName[i]) {
            let q = `UPDATE items SET quantitySold = ${Number(
              req.body.quantity[i]
            )} WHERE id = ${result1[j]["id"]}`;
            connection.query(q, (err, result) => {
              if (err) throw err;
            });
          }
        }
      }

      let q2 = `INSERT INTO customers (id, date, customerName, phone, totalBill, buyItemsIds) VALUES ('${uuidv4()}', '${
        req.body.date
      }', '${req.body.billTo}', '${req.body.phoneNo}', '${
        req.body.rupees
      }', '${itemStr}')`;

      connection.query(q2, (err, result2) => {
        if (err) throw err;
        res.redirect("/");
      });
    });
  } catch (error) {
    console.log("ERROR: ", error);
  }
});

// ------------------------------------
// ----- Search items in DB Route -----
// ------------------------------------

app.get("/data/items", (req, res) => {
  let q = "SELECT * FROM items";

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  } catch (error) {
    console.log("ERROR: ", error);
  }
});

// ------------------------------------
// ----- Get Customers Data Route -----
// ------------------------------------

app.get("/data/customers/count", (req, res) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0]; // "YYYY-MM-DD"

  const q = `SELECT COUNT(*) AS count FROM customers WHERE DATE_FORMAT(STR_TO_DATE(date, '%m/%d/%Y, %h:%i:%s %p'), '%Y-%m-%d') = ?`;

  try {
    connection.query(q, [formattedDate], (err, result) => {
      if (err) throw err;

      if (result.length == 0) {
        result.push({ count: 0 });
      }
      res.send(result[0]);
    });
  } catch (error) {
    console.log("ERROR: ", error);
  }
});

// ------------------------------------
// ----------- S E R V E R ------------
// ------------------------------------

app.listen(PORT, () => {
  console.log(`app is listening on port ${PORT}`);
});
