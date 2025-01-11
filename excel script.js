function exportOrderHistory() {
    if (orderHistory.length === 0) {
        alert("No orders to export!");
        return;
    }

    // Create a new workbook and sheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(orderHistory);

    // Append sheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Order History");

    // Save the workbook
    XLSX.writeFile(workbook, "OrderHistory.xlsx");
}
