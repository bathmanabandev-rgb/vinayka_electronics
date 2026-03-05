const fs = require('fs');
const path = 'c:/Projects/vickey/backend/controllers/billController.js';
let content = fs.readFileSync(path, 'utf8');
const oldPattern = /\/\/ Left box: To \/ Party \(with dashed guide lines\)[\s\S]*?doc\.font\('Helvetica'\)\.text\('', fieldXStart, y \+ 52\);/g;
const replacement = `// Left box: To / Party
    doc.lineWidth(0.8).strokeColor('#000000').rect(leftBoxX, y, leftBoxW, boxH).stroke();
    doc.font('Helvetica-Bold').fontSize(10).text('To', leftBoxX + 6, y + 4);
    doc.font('Helvetica').fontSize(9).text(bill.customer_name || 'The Executive Officer', leftBoxX + 6, y + 18);
    doc.fontSize(8).text((bill.customer_address || 'Address').substring(0, 60), leftBoxX + 6, y + 32, { width: leftBoxW - 12 });

    // Right fields: Invoice No, Date, Order No, Vehicle No
    doc.font('Helvetica-Bold').fontSize(9).text('Invoice No :', rightBoxX, y + 4);
    doc.font('Helvetica').text(String(bill.id).padStart(3, '0'), rightBoxX + 100, y + 4);
    doc.font('Helvetica-Bold').text('Invoice Date :', rightBoxX, y + 20);
    doc.font('Helvetica').text(new Date(bill.created_at).toLocaleDateString('en-IN'), rightBoxX + 100, y + 20);
    doc.font('Helvetica-Bold').text('Order No :', rightBoxX, y + 36);
    doc.font('Helvetica').text(bill.order_no || '', rightBoxX + 100, y + 36);
    doc.font('Helvetica-Bold').text('Vehicle No :', rightBoxX, y + 52);
    doc.font('Helvetica').text('', rightBoxX + 100, y + 52);`;

// replace all occurrences
content = content.replace(oldPattern, replacement);
fs.writeFileSync(path, content, 'utf8');
console.log('header dashed lines removed');
