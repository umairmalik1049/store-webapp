// -----------------------------------------------
// ----------------- G L O B A L -----------------
// -----------------------------------------------

let invoiceGenerated = 1;
const options = ["PC", "LED", "Mouse", "Cables", "Laptop", "Keyboard"];

// -----------------------------------------------
// -------------- F U N C T I O N S --------------
// -----------------------------------------------

// ---------- Customers Data Fucntion
async function countCustomersFromDB() {
  try {
    let res = await axios.get("http://localhost:3000/data/customers/count");
    return res.data;
  } catch (error) {
    console.log("ERROR: ", error);
  }
}

async function invoiceNo() {
  const invoiceField = document.querySelector("#invoice > input");
  const res = await countCustomersFromDB();
  invoiceField.value = res.count + 1;
}

function getDate() {
  const date = new Date();
  document.querySelector("#date > input").value = date.toLocaleString();
}

function customerData() {
  invoiceNo();
  getDate();
}

// ---------- Add Item Function
function addItem() {
  // Table reference
  const table = document
    .getElementById("myTable")
    .getElementsByTagName("tbody")[0];

  // New row creation
  const newRow = table.insertRow();

  // New cell for input field
  const newCell1 = newRow.insertCell(0);
  const newCell2 = newRow.insertCell(1);
  const newCell3 = newRow.insertCell(2);
  const newCell4 = newRow.insertCell(3);

  // Create new input elements
  const newInput1 = document.createElement("input");
  newInput1.setAttribute("type", "text");
  newInput1.setAttribute("name", "itemName[]");
  newInput1.setAttribute("placeholder", "name");

  const newInput2 = document.createElement("input");
  newInput2.setAttribute("type", "number");
  newInput2.setAttribute("name", "quantity");
  newInput2.setAttribute("placeholder", "quantity");

  const newInput3 = document.createElement("input");
  newInput3.setAttribute("type", "number");
  newInput3.setAttribute("name", "rate");
  newInput3.setAttribute("placeholder", "rate");
  newInput3.readOnly = true;

  const newInput4 = document.createElement("input");
  newInput4.setAttribute("type", "number");
  newInput4.setAttribute("name", "amount");
  newInput4.setAttribute("placeholder", "amount");
  newInput4.readOnly = true;

  // Create new datalist element
  const newDatalist = document.createElement("datalist");
  newDatalist.setAttribute("id", "suggestions" + table.rows.length); // Unique id for each row

  // Add options to datalist
  options.forEach(function (optionText) {
    const option = document.createElement("option");
    option.setAttribute("value", optionText);
    newDatalist.appendChild(option);
  });

  // Append datalist to the input field
  newInput1.setAttribute("list", newDatalist.id);
  newCell1.appendChild(newInput1);
  newCell1.appendChild(newDatalist);

  newCell2.appendChild(newInput2);
  newCell3.appendChild(newInput3);
  newCell4.appendChild(newInput4);
}

// ---------- Calculate Price Function
function calcPrice(event) {
  if (event.target.name == "quantity") {
    const quantityInp = event.target;
    const rateInp =
      quantityInp.parentElement.parentElement.children[2].children[0];
    const amountInp = rateInp.parentElement.nextElementSibling.children[0];

    amountInp.value = Number(quantityInp.value) * Number(rateInp.value);
  }
}

// ---------- Match Item in List Function
async function getItemsFromDB() {
  try {
    let res = await axios.get("http://localhost:3000/data/items");
    return res.data;
  } catch (error) {
    console.log("ERROR: ", error);
  }
}

async function matchItems(event) {
  let itemInp = event.target;

  for (elm of options) {
    // Matching Options Array Elements with Table Items Name
    if (elm.toLowerCase() == itemInp.value.toLowerCase()) {
      try {
        const res = await getItemsFromDB();

        // Searching Item Name in DB Response
        for (obj of res) {
          if (elm.toLowerCase() == obj.itemsName.toLowerCase()) {
            const rateInp =
              itemInp.parentElement.parentElement.children[2].children[0];
            rateInp.value = obj.rate;
          }
        }
      } catch (err) {
        console.log("ERROR: ", err);
      }
    }
  }
}

// ---------- Calculate Final Price Function
function calcAmount() {
  const amountFields = document.querySelectorAll(
    "tbody tr td input[name='amount']"
  );
  const rsField = document.querySelector("tfoot tr th input[name='rupees']");
  let finalSum = 0;

  for (field of amountFields) {
    finalSum += Number(field.value);
  }
  rsField.value = "Rs. " + finalSum;
}

// -----------------------------------------------
// ---------------- O P T I O N S ----------------
// -----------------------------------------------

// ---------- Customer Data Option
document.getElementById("billTo").addEventListener("input", customerData);

// ---------- Add Item Option
document.getElementById("addRowButton").addEventListener("click", addItem);

// ---------- Calculate Price Option
document.querySelector("table tbody").addEventListener("input", calcPrice);

// ---------- Match Item in List Options
document.querySelector("table tbody").addEventListener("input", matchItems);

// ---------- Calculate Final Price Options
document.querySelector("table tbody").addEventListener("input", calcAmount);
