export function generateInvoiceNumber() {
    const staticPart = "01";
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = now.getFullYear()
    const datePart = `${day}${month}${year}`;
    const customNumber = generateCustomNumber(10);
    return `INV/${staticPart}/${datePart}${customNumber}`;
}

export function generateCustomNumber(digitCount) {
    if (digitCount <= 0) {
        throw new Error("Jumlah digit harus lebih besar dari 0");
    }

    var customNumber = '';
    for (var i = 0; i < digitCount; i++) {
        customNumber += Math.floor(Math.random() * 10);
    }
    return customNumber;
}
