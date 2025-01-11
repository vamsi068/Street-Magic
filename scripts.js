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


function Order() {
    // Check if the cart is empty
    if (!cart || cart.length === 0) {
        alert("Cart is empty. Add items to generate an order bill.");
        return;
    }

    const now = new Date();
    const date = now.toLocaleDateString(); // Current date (e.g., "01/05/2025")
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Get the pickup type (default to "Pickup" if not selected)
    const pickupTypeElement = document.querySelector('input[name="pickup-type"]:checked');
    const pickupType = pickupTypeElement ? pickupTypeElement.value : "Pickup";

    // Get the selected table number (only if pickup type is "Table")
    const tableNumberElement = document.getElementById('table-number');
    const tableNumber = (pickupType === "Table" && tableNumberElement && tableNumberElement.value)
        ? tableNumberElement.value
        : null;

    // Get the discount percentage
    const discountInput = document.getElementById('discount-percentage');
    const discountPercentage = discountInput ? parseFloat(discountInput.value) : 0;

    // Get the payment amount
    const paymentInput = document.getElementById('payment-amount');
    const paymentAmount = paymentInput ? parseFloat(paymentInput.value) : 0;

    // Prepare the order bill for a 3-inch paper
    let orderBill = "         STREET MAGIC\n";
    orderBill += "    CURRENCY NAGAR, 6TH LANE\n";
    orderBill += "  ANJANEYA SWAMI TEMPLE ROAD\n";
    orderBill += "       VIJAYAWADA-520008\n";
    orderBill += "         MO: 8885999948\n";
    orderBill += "-------------------------------\n";
    orderBill += `Date: ${date}  ${time}\n`;
    orderBill += `Pickup: ${pickupType}\n`;
    if (tableNumber) {
        orderBill += `Table: ${tableNumber}\n`;
    }
    orderBill += "-------------------------------\n";
    orderBill += "No. Item            Qty   Price\n";
    orderBill += "-------------------------------\n";

    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.quantity * item.price; // Assuming `price` is part of each cart item

        // Adjust item name for smaller width (max 15 characters)
        const maxNameLength = 15;
        const itemNameLines = item.name.match(new RegExp(`.{1,${maxNameLength}}`, 'g')) || [item.name];

        // Print the first line of the item name with quantity and price
        orderBill += `${(index + 1).toString().padEnd(3)} ${itemNameLines[0].padEnd(maxNameLength)} ${item.quantity.toString().padStart(3)} ₹${itemTotal.toFixed(2).padStart(6)}\n`;

        // Print additional lines of the item name (indented)
        for (let i = 1; i < itemNameLines.length; i++) {
            orderBill += `    ${itemNameLines[i]}\n`;
        }

        totalItems += item.quantity;
        totalPrice += itemTotal;
    });

    // Apply discount if applicable
    const discountAmount = (discountPercentage / 100) * totalPrice;
    const finalTotal = totalPrice - discountAmount;

    // Calculate return change or balance
    const balanceAmount = paymentAmount - finalTotal;

    orderBill += "-------------------------------\n";
    orderBill += `Subtotal: ₹${totalPrice.toFixed(2)}\n`;
    if (discountPercentage > 0) {
        orderBill += `Discount: -₹${discountAmount.toFixed(2)}\n`;
    }
    orderBill += `Total: ₹${finalTotal.toFixed(2)}\n`;
    orderBill += `Payment: ₹${paymentAmount.toFixed(2)}\n`;
    if (balanceAmount >= 0) {
        orderBill += `Change: ₹${balanceAmount.toFixed(2)}\n`;
    } else {
        orderBill += `Due: ₹${Math.abs(balanceAmount).toFixed(2)}\n`;
    }
    orderBill += "-------------------------------\n";
    orderBill += "      THANKS FOR VISITING!\n";

    // Open a new window for printing the order bill
    const printWindow = window.open('', '', 'width=300,height=600');

    if (printWindow) {
        printWindow.document.write(`
            <html>
            <head>
                <title>Street Magic - Order Bill</title>
                <style>
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        margin: 0;
                        padding: 10px;
                        text-align: center;
                    }
                    pre {
                        font-size: 12px;
                        line-height: 1.4;
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

        // Refresh the cart after printing
        clearCart();
    } else {
        alert("Popup blocker is enabled. Please disable it to print the order bill.");
    }
}

// Function to clear the cart
function clearCart() {
    // Reset the cart array
    cart = [];

    // Reset the cart display
    document.getElementById("cart-items").innerHTML = '<p>Your cart is empty. Add items to see them here!</p>';
    document.getElementById("cart-total").innerText = 'Total: ₹0';

    // Reset the discount and payment fields
    const discountInput = document.getElementById('discount-percentage');
    if (discountInput) discountInput.value = '';
    const paymentInput = document.getElementById('payment-amount');
    if (paymentInput) paymentInput.value = '';
}









