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

function clearCart() {
    document.getElementById("cart-items").innerHTML = '<p>Your cart is empty. Add items to see them here!</p>';
    document.getElementById("cart-total").innerText = 'Total: ₹0';
}

function printBill() {
    const billElement = document.getElementById("generated-bill");

    // Print the bill
    const billContent = billElement.innerText;
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<pre>' + billContent + '</pre>');
    printWindow.document.close();
    printWindow.print();

    // Clear the cart
    clearCart();

    // Optionally, clear the generated bill section
    billElement.innerText = '';
}

function generateBill() {
    if (cart.length === 0) {
        alert("Cart is empty. Add items to generate a bill.");
        return;
    }

    const now = new Date();
    const date = now.toLocaleDateString(); // Current date in string format (e.g., "01/04/2025")
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const paymentAmount = parseFloat(document.getElementById("payment-amount").value);
    const orderType = document.getElementById("order-type").value; // Get the selected order type

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        alert("Please enter a valid payment amount.");
        return;
    }

    // Get the last token number and date from localStorage
    const lastTokenData = JSON.parse(localStorage.getItem("tokenData")) || { date: "", tokenNumber: 0 };

    let tokenNumber;
    if (lastTokenData.date === date) {
        // Same day, increment the token number
        tokenNumber = lastTokenData.tokenNumber + 1;
    } else {
        // New day, reset token number to 1
        tokenNumber = 1;
    }

    // Update localStorage with the new token number and date
    localStorage.setItem(
        "tokenData",
        JSON.stringify({ date: date, tokenNumber: tokenNumber })
    );

    let bill = "      STREET MAGIC\n";
    bill += "   DOOR.NO:48-11/3-5C,\n";
    bill += "     CURRENCY NAGAR,\n";
    bill += "        6th LANE,\n";
    bill += " Anjaneya Swami Temple Rd,\n";
    bill += "      VIJAYAWADA-520008\n";
    bill += "        MO: 8885999948\n";
    bill += "-----------------------------\n";
    bill += `Date: ${date}  ${time}\n`;
    bill += `Cashier: Vamsi     BillNo: ${billCount}\n`;
    bill += `Token: ${tokenNumber}     ${orderType}\n`;
    bill += "-----------------------------\n";
    bill += "No. Item          Qty  Amount\n";
    bill += "-----------------------------\n";

    let index = 1;
    let grandTotal = 0;
    let totalQty = 0;

    cart.forEach((item) => {
        const itemName = item.name;
        const qty = item.quantity.toString().padEnd(4);
        const amount = `₹${item.totalPrice.toFixed(2).padStart(6)}`;

        grandTotal += item.totalPrice;
        totalQty += item.quantity;

        if (itemName.length > 15) {
            // Wrap long item names to the next line
            const firstLine = itemName.slice(0, 15);
            const secondLine = itemName.slice(15);

            bill += `${index.toString().padEnd(3)} ${firstLine}\n`;
            bill += `    ${secondLine.padEnd(15)} ${qty} ${amount}\n`;
        } else {
            // Single-line item
            bill += `${index.toString().padEnd(3)} ${itemName.padEnd(15)} ${qty} ${amount}\n`;
        }
        index++;
    });

    const change = paymentAmount - grandTotal;

    bill += "-----------------------------\n";
    bill += `Total Qty: ${totalQty.toString().padEnd(4)}  ₹${grandTotal.toFixed(2)}\n`;
    if (change >= 0) {
        bill += `Paid: ₹${paymentAmount.toFixed(2)}\n`;
        bill += `Change: ₹${change.toFixed(2)}\n`;
    } else {
        bill += `Paid: ₹${paymentAmount.toFixed(2)}\n`;
        bill += `Due: ₹${Math.abs(change).toFixed(2)}\n`;
    }
    bill += "-----------------------------\n";
    bill += "    THANKS FOR VISITING!\n";

    const billElement = document.getElementById("generated-bill");
    billElement.textContent = bill;
    billCount++;

    localStorage.setItem("billCount", billCount);
    billGenerated = true;

    updateCart();
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
    orderBill += `KOT No: ${kotNumber}     ${pickupType}\n`;
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









