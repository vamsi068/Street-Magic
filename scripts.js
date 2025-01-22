// Inventory object to track stock for each item
const inventory = {
    "Classic Burger": 50,
    "Chicken Pizza": 50,
    "Vanilla Ice Cream": 50,
    "Chicken Burger": 50,
};


// Initialize the cart and bill count
const cart = [];
let billGenerated = false;
let billCount = parseInt(localStorage.getItem("billCount")) || 1;

function addToCart(itemName, itemPrice, quantity) {
    // Check if enough stock is available
    if (inventory[itemName] < quantity) {
        alert(`Not enough stock for ${itemName}. Only ${inventory[itemName]} left.`);
        return;
    }

    // Find if the item already exists in the cart
    const existingItem = cart.find(item => item.name === itemName);

    if (existingItem) {
        // Check if adding the quantity exceeds stock
        if (inventory[itemName] < existingItem.quantity + quantity) {
            alert(`Not enough stock for ${itemName}. Only ${inventory[itemName]} left.`);
            return;
        }
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.quantity * itemPrice;
    } else {
        cart.push({
            name: itemName,
            price: itemPrice,
            quantity: quantity,
            totalPrice: itemPrice * quantity
        });
    }

    // Reduce the stock
    inventory[itemName] -= quantity;

    updateCart();
    updateInventoryDisplay();
}

function updateInventoryDisplay() {
    const inventoryContainer = document.getElementById("inventory-status");
    inventoryContainer.innerHTML = "";

    for (const item in inventory) {
        const inventoryItem = document.createElement("p");
        inventoryItem.textContent = `${item}: ${inventory[item]} left`;
        inventoryContainer.appendChild(inventoryItem);
    }
}

function updateCart() {
    const cartContainer = document.getElementById("cart-items");
    cartContainer.innerHTML = "";
    let grandTotal = 0;

    cart.forEach((item, index) => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");

        const itemContent = document.createElement("p");
        itemContent.textContent = `${item.name} - ${item.quantity} x ₹${item.price} = ₹${item.totalPrice}`;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = function () {
            removeItem(index);
        };

        itemElement.appendChild(itemContent);
        itemElement.appendChild(deleteButton);
        cartContainer.appendChild(itemElement);

        grandTotal += item.totalPrice;
    });

    const totalElement = document.getElementById("cart-total");
    totalElement.textContent = `Total: ₹${grandTotal}`;
}

function removeItem(index) {
    const item = cart[index];

    // Restore the stock for the removed item
    inventory[item.name] += item.quantity;

    // Remove the item from the cart
    cart.splice(index, 1);

    updateCart();
    updateInventoryDisplay();
}

function generateBill() {
    if (!cart || cart.length === 0) {
        alert("Cart is empty. Add items to generate a bill.");
        return;
    }

    const now = new Date();
    const date = now.toLocaleDateString();  // e.g., "01/20/2025"
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const paymentAmount = parseFloat(document.getElementById("payment-amount").value);
    const orderType = document.getElementById("order-type").value;  // Get the selected order type

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        alert("Please enter a valid payment amount.");
        return;
    }

    // Manage token number per day using localStorage
    const lastTokenData = JSON.parse(localStorage.getItem("tokenData")) || { date: "", tokenNumber: 0 };
    let tokenNumber;

    if (lastTokenData.date === date) {
        tokenNumber = lastTokenData.tokenNumber + 1;
    } else {
        tokenNumber = 1;  // Reset token number if it's a new day
    }

    localStorage.setItem("tokenData", JSON.stringify({ date: date, tokenNumber: tokenNumber }));

    // Bill Header
    let bill = "         STREET MAGIC\n";
    bill += "      DOOR.NO:48-11/3-5C,\n";
    bill += "        CURRENCY NAGAR,\n";
    bill += "           6th LANE,\n";
    bill += "  Anjaneya Swami Temple Road,\n";
    bill += "       VIJAYAWADA-520008\n";
    bill += "         MO: 8885999948\n";
    bill += "---------------------------------------------\n";
    bill += `Date: ${date} ${time}  ${orderType}\n`;
    bill += `Cashier: Vamsi BillNo: ${billCount} Token: ${tokenNumber}\n`;
    bill += "----------------------------------------------\n";
    bill += "No.Item Name           Qty  Price Amount\n";
    bill += "----------------------------------------------\n";

    let index = 1;
    let grandTotal = 0;
    let totalQty = 0;

    cart.forEach((item) => {
        let itemName = item.name;
        grandTotal += item.totalPrice;
        totalQty += item.quantity;

        if (itemName.length > 20) {
            // Split long item names for better alignment
            const firstLine = itemName.slice(0, 20);  // First 20 characters
            const secondLine = itemName.slice(20);    // Remaining characters

            bill += `${index.toString().padEnd(3)} ${firstLine.padEnd(20)} ${item.quantity.toString().padEnd(3)} ₹${item.price.toString().padEnd(5)} ₹${item.totalPrice}\n`;
            bill += `    ${secondLine.padEnd(20)}\n`;  // Indent the second line
        } else {
            bill += `${index.toString().padEnd(3)} ${itemName.padEnd(20)} ${item.quantity.toString().padEnd(3)} ₹${item.price.toString().padEnd(5)} ₹${item.totalPrice}\n`;
        }
        
        index++;
    });

    const change = paymentAmount - grandTotal;

    bill += "----------------------------------------------\n";
    bill += `Total Qty: ${totalQty.toString().padEnd(3)}  Sub Total: ₹${grandTotal}\n`;
    bill += `Grand Total: ₹${grandTotal}\n`;
    if (change >= 0) {
        bill += `Payment: ₹${paymentAmount}\n`;
        bill += `Change to Return: ₹${change}\n`;
    } else {
        bill += `Payment: ₹${paymentAmount}\n`;
        bill += `Balance Due: ₹${Math.abs(change)}\n`;
    }
    bill += "----------------------------------------------\n";
    bill += "     Thanks for Visiting!\n";

    // Display bill in HTML
    const billElement = document.getElementById("generated-bill");
    billElement.textContent = bill;

    billCount++;  // Increment bill count
    localStorage.setItem("billCount", billCount);  // Store updated bill count

    updateCart();
}


function printBill() {
    const billContent = document.getElementById("generated-bill").textContent;

    if (!billContent.trim()) {
        alert("Please generate the bill first.");
        return;
    }

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Street Magic - Bill</title>
            <style>
                body {
                    font-family: 'Courier New', Courier, monospace;
                    padding: 20px;
                    margin: 0;
                }
                pre {
                    font-size: 14px;
                    line-height: 1.6;
                }
            </style>
        </head>
        <body>
            <pre>${billContent}</pre>
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function downloadBill() {
    if (!billGenerated) {
        alert("Please generate the bill first.");
        return;
    }

    const billContent = document.getElementById("generated-bill").textContent;
    const blob = new Blob([billContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Street_Magic_Bill.txt";
    link.click();
}

function updateFontSize() {
    const fontSize = document.getElementById("font-size").value;
    const billElement = document.getElementById("generated-bill");

    // Update the font size dynamically
    billElement.style.fontSize = `${fontSize}px`;
}


let kotCounter = 1;  // Counter for KOT numbers

function Order() {
    // Check if the cart is empty
    if (!cart || cart.length === 0) {
        alert("Cart is empty. Add items to generate an order bill.");
        return;
    }

    const now = new Date();
    const date = now.toLocaleDateString();  // Current date (e.g., "01/20/2025")
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Get the pickup type (default to "Pickup" if not selected)
    const pickupTypeElement = document.querySelector('input[name="pickup-type"]:checked');
    const pickupType = pickupTypeElement ? pickupTypeElement.value : "Pickup";

    // Get the selected table number (only if pickup type is "Table")
    const tableNumberElement = document.getElementById('table-number');
    const tableNumber = (pickupType === "Table" && tableNumberElement && tableNumberElement.value)
        ? tableNumberElement.value
        : "N/A";

    // Increment KOT number for each new bill
    const kotNumber = kotCounter++;

    // Prepare the order bill with uppercase address
    let orderBill = "         STREET MAGIC\n";
    orderBill += `Date: ${date}       ${time}\n`;
    orderBill += `KOT No: ${kotNumber}       ${pickupType}\n`;
    if (pickupType === "Table") {
        orderBill += `Table Number: ${tableNumber}\n`;
    }
    orderBill += "---------------------------------------------\n";
    orderBill += "No. Item                  Qty\n";
    orderBill += "---------------------------------------------\n";

    let totalItems = 0;
    let totalQuantity = 0;

    cart.forEach((item, index) => {
        let itemName = item.name;
        let qty = item.quantity.toString().padStart(4);

        // Split long item names into two lines if necessary
        if (itemName.length > 20) {
            orderBill += `${(index + 1).toString().padEnd(3)} ${itemName.substring(0, 20)} ${qty}\n`;
            orderBill += `    ${itemName.substring(20)}\n`;  // Print remaining name on the next line
        } else {
            orderBill += `${(index + 1).toString().padEnd(3)} ${itemName.padEnd(20)} ${qty}\n`;
        }

        totalItems++;
        totalQuantity += item.quantity;
    });

    orderBill += "---------------------------------------------\n";
    orderBill += `Total Items: ${totalItems}   Quantity: ${totalQuantity}\n`;

    // Open a new window for printing the order bill
    const printWindow = window.open('', '', 'width=800,height=600');

    if (printWindow) {
        printWindow.document.write(`
            <html>
            <head>
                <title>Street Magic - Order Bill</title>
                <style>
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        padding: 20px;
                        margin: 0;
                        text-align: center;
                    }
                    pre {
                        font-size: 14px;
                        line-height: 1.6;
                        text-align: left;
                    }
                </style>
            </head>
            <body>
                <pre>${orderBill}</pre>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    } else {
        alert("Popup blocker is enabled. Please disable it to print the order bill.");
    }
}
