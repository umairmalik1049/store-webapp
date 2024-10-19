const mysql = require("mysql2");

// Connect to the Railway MySQL Database
const connection = mysql.createConnection({
  host: process.env.DB_HOST, // Use the environment variable for DB host
  user: process.env.DB_USER, // Your DB username
  password: process.env.DB_PASSWORD, // Your DB password
  database: process.env.DB_NAME, // Your DB name
  port: process.env.DB_PORT || 3306, // Optional: default to 3306 if not specified
});

// Query to create the tables
const q = `
CREATE TABLE items (
	id VARCHAR(50) UNIQUE NOT NULL,
    itemsName VARCHAR(60) NOT NULL,
    rate INT NOT NULL,
    quantitySold INT DEFAULT 0
);

INSERT INTO items
(id, itemsName, rate)
VALUES
("1", "PC", 15000),
("2", "LED", 5000),
("3", "Mouse", 500),
("4", "Cables", 200),
("5", "Laptop", 55000),
("6", "Keyboard", 1200);

CREATE TABLE customers (
	id VARCHAR(50) UNIQUE NOT NULL,
    date VARCHAR(50) NOT NULL,
    customerName VARCHAR(50) NOT NULL,
    phone VARCHAR(20) DEFAULT "undefined",
    totalBill VARCHAR(50) NOT NULL,
    buyItemsIds VARCHAR(100) NOT NULL
);
`;

// Execute the query to create tables
connection.query(q, (err, results) => {
  if (err) {
    console.error("Error creating tables:", err);
  } else {
    console.log("Tables created successfully:", results);
  }
  connection.end(); // Close the connection
});
