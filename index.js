const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

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
  port: process.env.DB_PORT || 3306, // Optional: default to 3306 if not specified
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database!");
  }
});

// // Query to create the tables
// const tbQuery1 = `CREATE TABLE items (id VARCHAR(50) UNIQUE NOT NULL, itemsName VARCHAR(60) NOT NULL, rate INT NOT NULL, quantitySold INT DEFAULT 0)`;

// // Execute the query to create tables
// connection.query(tbQuery1, (err1, result1) => {
//   if (err1) {
//     console.error("Query 1 (Faild):", err1);
//   } else {
//     console.log("Query 1 (Successful):", result1);

//     const tbQuery2 = `INSERT INTO items (id, itemsName, rate) VALUES ("1", "PC", 15000), ("2", "LED", 5000), ("3", "Mouse", 500), ("4", "Cables", 200), ("5", "Laptop", 55000), ("6", "Keyboard", 1200)`;

//     connection.query(tbQuery2, (err2, result2) => {
//       if (err2) {
//         console.error("Query 2 (Faild):", err2);
//       } else {
//         console.log("Query 2 (Successful):", result2);
//       }
//     });
//   }
// });

const tbQuery3 = `CREATE TABLE customers (id VARCHAR(50) UNIQUE NOT NULL, date VARCHAR(50) NOT NULL, customerName VARCHAR(50) NOT NULL, phone VARCHAR(20) DEFAULT "undefined", totalBill VARCHAR(50) NOT NULL, buyItemsIds VARCHAR(100) NOT NULL)`;

connection.query(tbQuery3, (err3, result3) => {
  if (err3) {
    console.error("Query 3 (Faild):", err3);
  } else {
    console.log("Query 3 (Successful):", result3);
  }
  connection.end();
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
