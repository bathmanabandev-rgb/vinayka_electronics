const Bill = require('../models/Bill');
const Product = require('../models/Product');
const PDFDocument = require('pdfkit');
// Company constants used in invoice PDFs
const COMPANY_NAME = 'VINAYAGA ELECTRICALS';
const COMPANY_GST = '33AWAPV1924E2ZS';
const COMPANY_ADDRESS = ['201-N, Palathurai Road', 'Madukkarai, Coimbatore', 'Tamil Nadu, 641105'];

// Helper: safe numeric coercion
const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Convert amount to Indian Rupees in words (e.g. 123456.78 -> "One Lakh Twenty Three Thousand Four Hundred Fifty Six Rupees and Seventy Eight Paise Only")
function numberToWordsInRupees(amount) {
  const n = toNumber(amount);
  const intPart = Math.floor(n);
  const decPart = Math.round((n - intPart) * 100);

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function toWords2Digit(num) {
    if (num < 20) return ones[num];
    return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  }
  function toWords3Digit(num) {
    if (num === 0) return '';
    let s = '';
    if (num >= 100) s += ones[Math.floor(num / 100)] + ' Hundred ';
    const r = num % 100;
    if (r) s += toWords2Digit(r);
    return s.trim();
  }

  if (intPart === 0 && decPart === 0) return 'Zero Rupees Only';
  let words = '';

  let x = intPart;
  if (x >= 10000000) {
    const crore = Math.floor(x / 10000000);
    if (crore > 0) words += (crore >= 100 ? toWords3Digit(crore) : toWords2Digit(crore)) + ' Crore ';
    x %= 10000000;
  }
  if (x >= 100000) {
    const lakh = Math.floor(x / 100000);
    if (lakh > 0) words += toWords2Digit(lakh) + ' Lakh ';
    x %= 100000;
  }
  if (x >= 1000) {
    const thousand = Math.floor(x / 1000);
    if (thousand > 0) words += toWords3Digit(thousand) + ' Thousand ';
    x %= 1000;
  }
  if (x > 0) words += toWords3Digit(x) + ' ';
  words += 'Rupees';
  if (decPart > 0) words += ' and ' + toWords2Digit(decPart) + ' Paise';
  words += ' Only';
  return words.trim();
}

// Wrap text to fit width and draw each line (left or center aligned)
function drawRupeesInWords(doc, text, x, y, maxWidth, fontSize = 9, lineHeight = 11, align = 'center') {
  doc.font('Helvetica').fontSize(fontSize).fillColor('black');
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const w of words) {
    const trial = current ? current + ' ' + w : w;
    if (doc.widthOfString(trial) <= maxWidth) {
      current = trial;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  lines.forEach((line, i) => {
    const lineY = y + i * lineHeight;
    if (align === 'center') {
      const lineW = doc.widthOfString(line);
      const startX = x + Math.max(0, (maxWidth - lineW) / 2);
      doc.text(line, startX, lineY);
    } else {
      doc.text(line, x, lineY);
    }
  });
}

// Create a new bill (used by routes)
exports.createBill = async (req, res) => {
  try {
    // Get user_id from session (set by isStaff middleware)
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const billData = {
      ...req.body,
      user_id: req.session.userId  // Add user_id from authenticated session
    };

    const result = await Bill.createBill(billData);
    const billId = result.insertId || result.insert_id || result.id;
    const invoiceNo = result.invoice_no || `INV-${String(billId).padStart(4, '0')}`;
    
    // insert items if provided
    if (Array.isArray(billData.items) && billId) {
      for (const it of billData.items) {
        await Bill.addBillItem({ bill_id: billId, product_id: it.product_id, quantity: it.quantity, price: it.price });
      }
    }
    
    res.status(201).json({ success: true, data: { id: billId, invoice_no: invoiceNo }, billId: billId, invoice_no: invoiceNo });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Get bill by ID
exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.getBillById(id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (error) {
    console.error('Get bill by id error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.getAllBills();
    res.json({ success: true, data: bills });
  } catch (error) {
    console.error('Get all bills error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Delete bill
exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Bill ID is required' });
    
    const bill = await Bill.getBillById(id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    
    await Bill.deleteBill(id);
    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
exports.generateInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Bill ID is required' });
    const bill = await Bill.getBillById(id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    
    const doc = new PDFDocument({ size: 'A4', margin: 15 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    // Generate filename with invoice number and company name
    const invoiceNo = bill.invoice_no || `INV-${String(bill.id).padStart(4, '0')}`;
    const safeCompanyName = 'VINAYAGA_ELECTRICALS';
    const filename = `${safeCompanyName}_${invoiceNo}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    const BLUE = '#003366';
    const pageW = doc.page.width;
    const pageH = doc.page.height;

    // Full page border to mimic printed invoice sheet
    const outerMarginX = 20;
    // lower margins slightly to push bottom border down towards page edge
    const outerMarginY = 10;
    doc.lineWidth(0.8)
      .strokeColor('#000000')
      .rect(outerMarginX, outerMarginY, pageW - outerMarginX * 2, pageH - outerMarginY * 2)
      .stroke();

    // Start header a little lower for nicer top padding
    let y = outerMarginY + 8;

    // ===== HEADER ROW =====
    doc.fontSize(14).font('Helvetica-Bold').text('TAX INVOICE', pageW / 2 - 60, y - 2);
    // Right header contact - right aligned to the same edge
    const contactX = pageW - outerMarginX - 120;
    const contactW = 110;
    doc.fontSize(8).font('Helvetica').text('Cell : 99431 37207', contactX, y, { width: contactW, align: 'right' });
    doc.text('63696 35827', contactX, y + 11, { width: contactW, align: 'right' });
    
    y += 28;
    // ===== COMPANY NAME & ADDRESS =====
    doc.fontSize(18).font('Helvetica-Bold').fillColor(BLUE).text(COMPANY_NAME, 25, y, { width: pageW - 50, align: 'center' });
    y += 22;
    doc.fontSize(10).font('Helvetica').fillColor('#000000').text(COMPANY_ADDRESS.join(', '), 25, y, { width: pageW - 50, align: 'center' });
    y += 18;
    doc.fontSize(9).font('Helvetica-Bold').text(`GSTIN: ${COMPANY_GST}`, 25, y, { width: pageW - 50, align: 'center' });
    y += 14;

    // ===== PARTY SECTION (LEFT BOX) & INVOICE META (RIGHT FIELDS) =====
    const leftBoxX = 25;
    const leftBoxW = 270;
    const rightBoxX = 310;
    const boxH = 80;

    // Left box: To / Party (no dotted lines)
    doc.lineWidth(0.8).strokeColor('#000000').rect(leftBoxX, y, leftBoxW, boxH).stroke();
    doc.font('Helvetica-Bold').fontSize(10).text('To', leftBoxX + 6, y + 4);
    // Display to_address if provided
    if (bill.to_address) {
      const addressLines = bill.to_address.split('\n').slice(0, 3); // Max 3 lines
      addressLines.forEach((line, idx) => {
        doc.font('Helvetica').fontSize(9).text(line.substring(0, 50), leftBoxX + 6, y + 18 + (idx * 14), { width: leftBoxW - 12 });
      });
    }

    // Right box: Invoice details (with border box like printed format)
    const rightBoxW = pageW - rightBoxX - outerMarginX - 10;
    doc.lineWidth(0.8).strokeColor('#000000').rect(rightBoxX, y, rightBoxW, boxH).stroke();
    
    // Right fields: Invoice No, Date, Order No, Vehicle No with dashed guides inside box
    // All lines should be same size - calculate max label width for consistent start position
    const labelX = rightBoxX + 6;
    const fieldXEnd = rightBoxX + rightBoxW - 6;
    const labelFont = 'Helvetica-Bold';
    const labelFontSize = 9;
    
    // Calculate the maximum label width to ensure all lines start at the same position
    doc.font(labelFont).fontSize(labelFontSize);
    const maxLabelWidth = Math.max(
      doc.widthOfString('Invoice No :'),
      doc.widthOfString('Invoice Date :'),
      doc.widthOfString('Order No :'),
      doc.widthOfString('Vehicle No :')
    );
    const valueX = labelX + maxLabelWidth + 8;
    const valueWidth = fieldXEnd - valueX;
    
    function drawGuide(yPos) {
      doc.save();
      doc.lineWidth(0.5).dash(1, { space: 2 }).strokeColor('#000000')
        .moveTo(valueX, yPos).lineTo(fieldXEnd, yPos).stroke();
      doc.undash();
      doc.restore();
    }
    
    const rowY = [12, 28, 44, 60];
    const valueOpts = { width: valueWidth, align: 'right' };
    
    doc.font(labelFont).fontSize(labelFontSize).text('Invoice No :', labelX, y + rowY[0]);
    doc.font('Helvetica').fontSize(9).text(invoiceNo || '', valueX, y + rowY[0], valueOpts);
    
    doc.font(labelFont).fontSize(labelFontSize).text('Invoice Date :', labelX, y + rowY[1]);
    const dateStr = bill.invoice_date ? new Date(bill.invoice_date).toLocaleDateString('en-IN') : (bill.created_at ? new Date(bill.created_at).toLocaleDateString('en-IN') : '');
    doc.font('Helvetica').fontSize(9).text(dateStr, valueX, y + rowY[1], valueOpts);
    
    doc.font(labelFont).fontSize(labelFontSize).text('Order No :', labelX, y + rowY[2]);
    doc.font('Helvetica').fontSize(9).text(bill.order_no || '', valueX, y + rowY[2], valueOpts);
    
    doc.font(labelFont).fontSize(labelFontSize).text('Vehicle No :', labelX, y + rowY[3]);
    doc.font('Helvetica').fontSize(9).text(bill.vehicle_no || '', valueX, y + rowY[3], valueOpts);

    y += boxH + 4;

    // Party's GST No field
    doc.font('Helvetica-Bold').fontSize(9).text("Party's GST No :", leftBoxX, y);
    doc.font('Helvetica').text(bill.customer_gst || '', leftBoxX + 110, y);
    y += 14;

    // ===== ITEMS TABLE =====
    const tableX = 25;
    const tableW = pageW - 50;
    const col1 = tableX + 8;
    const col2 = tableX + 50;
    const col3 = tableX + 230;
    const col4 = tableX + 290;
    const col5 = tableX + 335;
    const col6 = tableX + 385;
    const descWidth = 175; // Description column width (col3 - col2 - small gap)
    const rowH = 58; // Tall enough for 2 lines of description

    // Header row (closed box)
    const tableTopY = y;
    const headerH = 18;
    doc.lineWidth(1).strokeColor('#000000').rect(tableX, y, tableW, headerH).stroke();
    doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(9).text('S.No', col1, y + 4);
    doc.text('Description', col2, y + 4);
    doc.text('HSN Code', col3, y + 4);
    doc.text('Qty', col4, y + 4);
    doc.text('Rate', col5, y + 4);
    doc.text('Amount', col6, y + 4);
    
    let itemsY = y + headerH;

    // Item rows - full description with wrap
    doc.fillColor('#000000').font('Helvetica').fontSize(9);
    let itemNo = 1;

    for (const item of bill.items) {
      const qty = parseInt(item.quantity) || 0;
      const price = toNumber(item.price || 0);
      const lineTotal = qty * price;
      const desc = (item.product_name || 'N/A').trim();

      doc.text(String(itemNo), col1, itemsY + 4);
      doc.text(desc, col2, itemsY + 4, { width: descWidth, align: 'left' });
      doc.text(item.hsn_code || '0', col3, itemsY + 4);
      doc.text(String(qty), col4, itemsY + 4);
      doc.text(price.toFixed(2), col5, itemsY + 4);
      doc.text(lineTotal.toFixed(2), col6, itemsY + 4);

      itemsY += rowH;
      itemNo++;
    }

    // Empty rows to minimum 5 (reserve vertical space only)
    for (; itemNo <= 5; itemNo++) {
      itemsY += rowH;
    }

    const bodyTopY = tableTopY + headerH;
    const bodyBottomY = itemsY;

    // Outer left/right borders for body
    doc.lineWidth(0.8).strokeColor('#000000');
    doc.moveTo(tableX, bodyTopY).lineTo(tableX, bodyBottomY + 10).stroke();
    doc.moveTo(tableX + tableW, bodyTopY).lineTo(tableX + tableW, bodyBottomY + 10).stroke();

    // Vertical column lines (no horizontal lines between rows)
    const colBoundaries = [
      tableX + 35,  // after S.No
      tableX + 225, // after Description
      tableX + 285, // after HSN Code
      tableX + 330, // after Qty
      tableX + 380  // after Rate
    ];
    colBoundaries.forEach((xPos) => {
      doc.moveTo(xPos, tableTopY).lineTo(xPos, bodyBottomY + 10).stroke();
    });

    y = bodyBottomY;

    // ===== ONE CONTINUOUS FOOTER BOX =====
    // Contains: Bank Details + Totals (top), Rupees in Words + Terms + Signature (bottom)
    const bottomBoxX = tableX;
    const bottomBoxW = tableW;
    const bankBoxH = 70; // Height for bank details + totals section
    const rupeesBoxH = 70; // Height for rupees in words + terms + signature section
    const totalFooterH = bankBoxH + rupeesBoxH; // Total height of combined footer box

    // Place footer directly after items table to guarantee single-page layout
    const bankBoxY = y + 10;

    // ONE OUTER RECTANGLE for entire footer (bank + totals + rupees + terms + signature)
    doc.lineWidth(0.8).rect(bottomBoxX, bankBoxY, bottomBoxW, totalFooterH).stroke();

    // Vertical divider - same position for entire footer
    const splitX = col3;
    doc.moveTo(splitX, bankBoxY).lineTo(splitX, bankBoxY + totalFooterH).stroke();
    
    // Horizontal divider between bank/totals section and rupees/terms/signature section
    const horizontalDividerY = bankBoxY + bankBoxH;
    doc.moveTo(bottomBoxX, horizontalDividerY).lineTo(bottomBoxX + bottomBoxW, horizontalDividerY).stroke();

    // Bank Details (left side - top section)
    doc.font('Helvetica-Bold').fontSize(9).text('BANK DETAILS :', bottomBoxX + 4, bankBoxY + 4);
    doc.font('Helvetica').fontSize(8)
      .text('Bank Name : IDBI Bank', bottomBoxX + 4, bankBoxY + 18)
      .text('Branch : Raja Street, Coimbatore', bottomBoxX + 4, bankBoxY + 30)
      .text('A/C No : 1621102000014641', bottomBoxX + 4, bankBoxY + 42)
      .text('IFSC : IBKL0001621', bottomBoxX + 4, bankBoxY + 54);

    // Totals table (right side - top section)
    const totalsX = splitX;
    const totalsW = bottomBoxX + bottomBoxW - totalsX;
    let totalsY = bankBoxY;
    const totalsRowH = 14;

    const subtotal = toNumber(bill.subtotal);
    const tax = toNumber(bill.tax);
    const cgst = tax / 2 || 0;
    const sgst = tax / 2 || 0;
    const igst = 0;
    const grandTotal = toNumber(bill.grand_total ?? bill.grandTotal ?? subtotal);

    // Helper to render a standard total row
    const renderRow = (label, value) => {
      doc.rect(totalsX, totalsY, totalsW, totalsRowH).stroke();
      doc.font('Helvetica').fontSize(8).text(label, totalsX + 6, totalsY + 3);
      doc.text(value.toFixed(2), totalsX + totalsW - 52, totalsY + 3, { width: 46, align: 'right' });
      totalsY += totalsRowH;
    };

    renderRow('Total', subtotal);
    renderRow('CGST @ 9%', cgst);
    renderRow('SGST @ 9%', sgst);
    renderRow('IGST @ 0%', igst);
    renderRow('Round Off', 0);

    // TOTAL row (bold, slightly taller)
    const totalRowH = totalsRowH + 2;
    doc.lineWidth(1.1).rect(totalsX, totalsY, totalsW, totalRowH).stroke();
    doc.font('Helvetica-Bold').fontSize(9).text('TOTAL', totalsX + 6, totalsY + 3);
    doc.text(grandTotal.toFixed(2), totalsX + totalsW - 52, totalsY + 3, { width: 46, align: 'right' });

    // ===== RUPEES IN WORDS + TERMS + SIGNATURE SECTION (bottom part of same box) =====
    const rupeesBoxY = horizontalDividerY; // Start right after the horizontal divider
    
    // Use SAME vertical divider (splitX) as top section
    // The vertical divider already extends through the entire box from line 276

    // Rupees in Words (left) - label and amount centered in column
    const wordsLabelY = rupeesBoxY + 6;
    const leftColWidth = splitX - bottomBoxX;
    doc.font('Helvetica-Bold').fontSize(9).text('Rupees in Words :', bottomBoxX, wordsLabelY, { width: leftColWidth, align: 'center' });
    const wordsY = wordsLabelY + 14;
    const wordsWidth = Math.max(80, leftColWidth - 8);
    const wordsStartX = bottomBoxX + 4;
    let amountInWords;
    try {
      amountInWords = String(numberToWordsInRupees(grandTotal) || 'Zero Rupees Only');
    } catch (_) {
      amountInWords = grandTotal != null ? `Rupees ${Number(grandTotal).toFixed(2)} Only` : 'Zero Rupees Only';
    }
    drawRupeesInWords(doc, amountInWords, wordsStartX, wordsY, wordsWidth);

    // Terms & Conditions (bottom section - left side)
    // Position it much lower to give MUCH MORE space for "Rupees in Words"
    const termsY = rupeesBoxY + 45; // Much more space for Rupees in Words
    doc.font('Helvetica-Bold').fontSize(8).text('Terms & Conditions :', bottomBoxX + 4, termsY);
    doc.font('Helvetica').fontSize(7)
      .text('• All Subject in Coimbatore Jurisdiction only.', bottomBoxX + 6, termsY + 9)
      .text('  Certified that the Particulars given above true and correct', bottomBoxX + 6, termsY + 18);

    // Company name & Signature (right side - in the bottom section)
    // Position in the empty space on the right side, visible and properly placed
    const signBaseY = rupeesBoxY + 30; // Position in the middle-right area, clearly visible
    const rightHalfWidth = bottomBoxX + bottomBoxW - splitX;
    
    // Company name - bold, uppercase, right-aligned - MAKE SURE IT'S VISIBLE
    doc.font('Helvetica-Bold').fontSize(9);
    const companyText = 'For ' + COMPANY_NAME.toUpperCase();
    const companyNameX = splitX + 8;
    const companyNameWidth = rightHalfWidth - 16;
    doc.text(companyText, companyNameX, signBaseY, { align: 'right', width: companyNameWidth });
    
    // Draw a signature line for handwritten signature
    const sigLineY = signBaseY + 15;
    const sigLineStartX = splitX + 8;
    const sigLineEndX = splitX + rightHalfWidth - 8;
    doc.save();
    doc.lineWidth(0.8).strokeColor('#000000')
      .moveTo(sigLineStartX, sigLineY)
      .lineTo(sigLineEndX, sigLineY)
      .stroke();
    doc.restore();
    
    // Authorised Signature label - right-aligned below the signature line - MAKE SURE IT'S VISIBLE
    doc.font('Helvetica').fontSize(8);
    const sigText = 'Authorised Signature';
    doc.text(sigText, companyNameX, sigLineY + 5, { align: 'right', width: companyNameWidth });

    doc.end();
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};


// Get recent bills
exports.getRecentBills = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const bills = await Bill.getRecentBills(parseInt(limit));
    res.json({ 
      success: true, 
      data: bills 
    });
  } catch (error) {
    console.error('Get recent bills error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Get total sales
exports.getTotalSales = async (req, res) => {
  try {
    const totalSales = await Bill.getTotalSales();
    res.json({ 
      success: true, 
      data: { total_sales: totalSales } 
    });
  } catch (error) {
    console.error('Get total sales error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Get total bills
exports.getTotalBills = async (req, res) => {
  try {
    const totalBills = await Bill.getTotalBills();
    res.json({ 
      success: true, 
      data: { total_bills: totalBills } 
    });
  } catch (error) {
    console.error('Get total bills error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Get daily sales
exports.getDailySales = async (req, res) => {
  try {
    const dailySales = await Bill.getDailySales();
    res.json({ 
      success: true, 
      data: dailySales 
    });
  } catch (error) {
    console.error('Get daily sales error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Get monthly sales
exports.getMonthlySales = async (req, res) => {
  try {
    const monthlySales = await Bill.getMonthlySales();
    res.json({ 
      success: true, 
      data: monthlySales 
    });
  } catch (error) {
    console.error('Get monthly sales error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Generate PDF invoice - GST-compliant professional format
// Helper: convert number to words in Indian format (simplified)
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const scales = ['', 'Thousand', 'Lakh', 'Crore'];

  if (num === 0) return 'Zero';
  const parts = [];
  let scaleIdx = 0;

  while (num > 0) {
    let part = num % (scaleIdx === 0 ? 1000 : 100);
    if (part > 0) {
      let partStr = '';
      if (part >= 100) {
        partStr = ones[Math.floor(part / 100)] + ' Hundred ';
        part %= 100;
      }
      if (part >= 20) {
        partStr += tens[Math.floor(part / 10)];
        if (part % 10 > 0) partStr += ' ' + ones[part % 10];
      } else if (part >= 10) {
        partStr += teens[part - 10];
      } else if (part > 0) {
        partStr += ones[part];
      }
      if (scales[scaleIdx]) partStr += ' ' + scales[scaleIdx];
      parts.unshift(partStr.trim());
    }
    num = Math.floor(num / (scaleIdx === 0 ? 1000 : 100));
    scaleIdx++;
  }
  return parts.join(' ').trim();
};

// Public invoice generator (no auth) - VINAYAGA ELECTRICALS style
exports.generateInvoicePDFPublic = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.getBillById(id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    
    const doc = new PDFDocument({ size: 'A4', margin: 15 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    // Generate filename with invoice number and company name
    const invoiceNo = bill.invoice_no || `INV-${String(bill.id).padStart(4, '0')}`;
    const safeCompanyName = 'VINAYAGA_ELECTRICALS';
    const filename = `${safeCompanyName}_${invoiceNo}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    const BLUE = '#003366';
    const pageW = doc.page.width;
    const pageH = doc.page.height;

    // Full page border to mimic printed invoice sheet
    const outerMarginX = 20;
    // tipping margin downward from 15 to 10 makes bottom border sit lower
    const outerMarginY = 10;
    doc.lineWidth(0.8)
      .strokeColor('#000000')
      .rect(outerMarginX, outerMarginY, pageW - outerMarginX * 2, pageH - outerMarginY * 2)
      .stroke();

    // Start header a little lower for nicer top padding
    let y = outerMarginY + 8;

    // ===== HEADER ROW =====
    doc.fontSize(14).font('Helvetica-Bold').text('TAX INVOICE', pageW/2 - 60, y - 2);
    // Right header contact - right aligned to the same edge
    const contactX = pageW - outerMarginX - 120;
    const contactW = 110;
    doc.fontSize(8).font('Helvetica').text('Cell : 99431 37207', contactX, y, { width: contactW, align: 'right' });
    doc.text('63696 35827', contactX, y + 11, { width: contactW, align: 'right' });
    
    y += 28;
    // ===== COMPANY NAME & ADDRESS =====
    doc.fontSize(18).font('Helvetica-Bold').fillColor(BLUE).text(COMPANY_NAME, 25, y, { width: pageW - 50, align: 'center' });
    y += 22;
    doc.fontSize(10).font('Helvetica').fillColor('#000000').text(COMPANY_ADDRESS.join(', '), 25, y, { width: pageW - 50, align: 'center' });
    y += 18;
    doc.fontSize(9).font('Helvetica-Bold').text(`GSTIN: ${COMPANY_GST}`, 25, y, { width: pageW - 50, align: 'center' });
    y += 14;

    // ===== PARTY SECTION (LEFT BOX) & INVOICE META (RIGHT FIELDS) =====
    const leftBoxX = 25;
    const leftBoxW = 270;
    const rightBoxX = 310;
    const boxH = 80;

    // Left box: To / Party (no dotted lines)
    doc.lineWidth(0.8).strokeColor('#000000').rect(leftBoxX, y, leftBoxW, boxH).stroke();
    doc.font('Helvetica-Bold').fontSize(10).text('To', leftBoxX + 6, y + 4);
    // Display to_address if provided
    if (bill.to_address) {
      const addressLines = bill.to_address.split('\n').slice(0, 3); // Max 3 lines
      addressLines.forEach((line, idx) => {
        doc.font('Helvetica').fontSize(9).text(line.substring(0, 50), leftBoxX + 6, y + 18 + (idx * 14), { width: leftBoxW - 12 });
      });
    }

    // Right box: Invoice details (with border box like printed format)
    const rightBoxW = pageW - rightBoxX - outerMarginX - 10;
    doc.lineWidth(0.8).strokeColor('#000000').rect(rightBoxX, y, rightBoxW, boxH).stroke();
    
    // Right fields: Invoice No, Date, Order No, Vehicle No with dashed guides inside box
    // All lines should be same size - calculate max label width for consistent start position
    const labelX = rightBoxX + 6;
    const fieldXEnd = rightBoxX + rightBoxW - 6;
    const labelFont = 'Helvetica-Bold';
    const labelFontSize = 9;
    
    // Calculate the maximum label width to ensure all lines start at the same position
    doc.font(labelFont).fontSize(labelFontSize);
    const maxLabelWidth = Math.max(
      doc.widthOfString('Invoice No :'),
      doc.widthOfString('Invoice Date :'),
      doc.widthOfString('Order No :'),
      doc.widthOfString('Vehicle No :')
    );
    const valueX = labelX + maxLabelWidth + 8;
    const valueWidth = fieldXEnd - valueX;
    
    function drawGuide(yPos) {
      doc.save();
      doc.lineWidth(0.5).dash(1, { space: 2 }).strokeColor('#000000')
        .moveTo(valueX, yPos).lineTo(fieldXEnd, yPos).stroke();
      doc.undash();
      doc.restore();
    }
    
    const rowY = [12, 28, 44, 60];
    const valueOpts = { width: valueWidth, align: 'right' };
    
    doc.font(labelFont).fontSize(labelFontSize).text('Invoice No :', labelX, y + rowY[0]);
    doc.font('Helvetica').fontSize(9).text(invoiceNo || '', valueX, y + rowY[0], valueOpts);
    
    doc.font(labelFont).fontSize(labelFontSize).text('Invoice Date :', labelX, y + rowY[1]);
    const dateStr = bill.invoice_date ? new Date(bill.invoice_date).toLocaleDateString('en-IN') : (bill.created_at ? new Date(bill.created_at).toLocaleDateString('en-IN') : '');
    doc.font('Helvetica').fontSize(9).text(dateStr, valueX, y + rowY[1], valueOpts);
    
    doc.font(labelFont).fontSize(labelFontSize).text('Order No :', labelX, y + rowY[2]);
    doc.font('Helvetica').fontSize(9).text(bill.order_no || '', valueX, y + rowY[2], valueOpts);
    
    doc.font(labelFont).fontSize(labelFontSize).text('Vehicle No :', labelX, y + rowY[3]);
    doc.font('Helvetica').fontSize(9).text(bill.vehicle_no || '', valueX, y + rowY[3], valueOpts);

    y += boxH + 4;

    // Party's GST No field
    doc.font('Helvetica-Bold').fontSize(9).text("Party's GST No :", leftBoxX, y);
    doc.font('Helvetica').text(bill.customer_gst || '', leftBoxX + 110, y);
    y += 14;

    // ===== ITEMS TABLE =====
    const tableX = 25;
    const tableW = pageW - 50;
    const col1 = tableX + 8;
    const col2 = tableX + 50;
    const col3 = tableX + 230;
    const col4 = tableX + 290;
    const col5 = tableX + 335;
    const col6 = tableX + 385;
    const descWidth = 175; // Description column width (col3 - col2 - small gap)
    const rowH = 58; // Tall enough for 2 lines of description

    // Header row (closed box)
    const tableTopY = y;
    const headerH = 18;
    doc.lineWidth(1).strokeColor('#000000').rect(tableX, y, tableW, headerH).stroke();
    doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(9).text('S.No', col1, y + 4);
    doc.text('Description', col2, y + 4);
    doc.text('HSN Code', col3, y + 4);
    doc.text('Qty', col4, y + 4);
    doc.text('Rate', col5, y + 4);
    doc.text('Amount', col6, y + 4);
    
    let itemsY = y + headerH;

    // Item rows - full description with wrap
    doc.fillColor('#000000').font('Helvetica').fontSize(9);
    let itemNo = 1;

    for (const item of bill.items) {
      const qty = parseInt(item.quantity) || 0;
      const price = toNumber(item.price || 0);
      const lineTotal = qty * price;
      const desc = (item.product_name || 'N/A').trim();

      doc.text(String(itemNo), col1, itemsY + 4);
      doc.text(desc, col2, itemsY + 4, { width: descWidth, align: 'left' });
      doc.text(item.hsn_code || '0', col3, itemsY + 4);
      doc.text(String(qty), col4, itemsY + 4);
      doc.text(price.toFixed(2), col5, itemsY + 4);
      doc.text(lineTotal.toFixed(2), col6, itemsY + 4);

      itemsY += rowH;
      itemNo++;
    }

    // Empty rows to minimum 5 (reserve vertical space only)
    for (; itemNo <= 5; itemNo++) {
      itemsY += rowH;
    }

    const bodyTopY = tableTopY + headerH;
    const bodyBottomY = itemsY;

    // Outer left/right borders for body
    doc.lineWidth(0.8).strokeColor('#000000');
    doc.moveTo(tableX, bodyTopY).lineTo(tableX, bodyBottomY + 10).stroke();
    doc.moveTo(tableX + tableW, bodyTopY).lineTo(tableX + tableW, bodyBottomY + 10).stroke();

    // Vertical column lines (no horizontal lines between rows)
    const colBoundaries = [
      tableX + 35,  // after S.No
      tableX + 225, // after Description
      tableX + 285, // after HSN Code
      tableX + 330, // after Qty
      tableX + 380  // after Rate
    ];
    colBoundaries.forEach((xPos) => {
      doc.moveTo(xPos, tableTopY).lineTo(xPos, bodyBottomY + 10).stroke();
    });

    y = bodyBottomY;

    // ===== ONE CONTINUOUS FOOTER BOX =====
    // Contains: Bank Details + Totals (top), Rupees in Words + Terms + Signature (bottom)
    const bottomBoxX = tableX;
    const bottomBoxW = tableW;
    const bankBoxH = 70; // Height for bank details + totals section
    const rupeesBoxH = 70; // Height for rupees in words + terms + signature section
    const totalFooterH = bankBoxH + rupeesBoxH; // Total height of combined footer box

    // Place footer directly after items table to guarantee single-page layout
    const bankBoxY = y + 10;

    // ONE OUTER RECTANGLE for entire footer (bank + totals + rupees + terms + signature)
    doc.lineWidth(0.8).rect(bottomBoxX, bankBoxY, bottomBoxW, totalFooterH).stroke();

    // Vertical divider - same position for entire footer
    const splitX = col3;
    doc.moveTo(splitX, bankBoxY).lineTo(splitX, bankBoxY + totalFooterH).stroke();
    
    // Horizontal divider between bank/totals section and rupees/terms/signature section
    const horizontalDividerY = bankBoxY + bankBoxH;
    doc.moveTo(bottomBoxX, horizontalDividerY).lineTo(bottomBoxX + bottomBoxW, horizontalDividerY).stroke();

    // Bank Details (left side - top section)
    doc.font('Helvetica-Bold').fontSize(9).text('BANK DETAILS :', bottomBoxX + 4, bankBoxY + 4);
    doc.font('Helvetica').fontSize(8)
      .text('Bank Name : IDBI Bank', bottomBoxX + 4, bankBoxY + 18)
      .text('Branch : Raja Street, Coimbatore', bottomBoxX + 4, bankBoxY + 30)
      .text('A/C No : 1621102000014641', bottomBoxX + 4, bankBoxY + 42)
      .text('IFSC : IBKL0001621', bottomBoxX + 4, bankBoxY + 54);

    // Totals table (right side - top section)
    const totalsX = splitX;
    const totalsW = bottomBoxX + bottomBoxW - totalsX;
    let totalsY = bankBoxY;
    const totalsRowH = 14;

    const subtotal = toNumber(bill.subtotal);
    const tax = toNumber(bill.tax);
    const cgst = tax / 2 || 0;
    const sgst = tax / 2 || 0;
    const igst = 0;
    const grandTotal = toNumber(bill.grand_total ?? bill.grandTotal ?? subtotal);

    const renderRow = (label, value) => {
      doc.rect(totalsX, totalsY, totalsW, totalsRowH).stroke();
      doc.font('Helvetica').fontSize(8).text(label, totalsX + 6, totalsY + 3);
      doc.text(value.toFixed(2), totalsX + totalsW - 52, totalsY + 3, { width: 46, align: 'right' });
      totalsY += totalsRowH;
    };

    renderRow('Total', subtotal);
    renderRow('CGST @ 9%', cgst);
    renderRow('SGST @ 9%', sgst);
    renderRow('IGST @ 0%', igst);
    renderRow('Round Off', 0);

    const totalRowH = totalsRowH + 2;
    doc.lineWidth(1.1).rect(totalsX, totalsY, totalsW, totalRowH).stroke();
    doc.font('Helvetica-Bold').fontSize(9).text('TOTAL', totalsX + 6, totalsY + 3);
    doc.text(grandTotal.toFixed(2), totalsX + totalsW - 52, totalsY + 3, { width: 46, align: 'right' });

    // ===== RUPEES IN WORDS + TERMS + SIGNATURE SECTION (bottom part of same box) =====
    const rupeesBoxY = horizontalDividerY; // Start right after the horizontal divider
    
    // Use SAME vertical divider (splitX) as top section for proper alignment
    // Bank Details and Rupees in Words are in the SAME left column
    // Totals and Signature are in the SAME right column

    // Rupees in Words - label and amount centered in column
    const wordsLabelY = rupeesBoxY + 6;
    const leftColWidth = splitX - bottomBoxX;
    doc.font('Helvetica-Bold').fontSize(9).text('Rupees in Words :', bottomBoxX, wordsLabelY, { width: leftColWidth, align: 'center' });
    const wordsY = wordsLabelY + 14;
    const wordsWidth = Math.max(80, leftColWidth - 8);
    const wordsStartX = bottomBoxX + 4;
    let amountInWords;
    try {
      amountInWords = String(numberToWordsInRupees(grandTotal) || 'Zero Rupees Only');
    } catch (_) {
      amountInWords = grandTotal != null ? `Rupees ${Number(grandTotal).toFixed(2)} Only` : 'Zero Rupees Only';
    }
    drawRupeesInWords(doc, amountInWords, wordsStartX, wordsY, wordsWidth);

     // Terms & Conditions (bottom section - left side)
     const termsY = rupeesBoxY + 44; // Below amount in words (label + 3 lines)
     doc.font('Helvetica-Bold').fontSize(8).text('Terms & Conditions :', bottomBoxX + 4, termsY);
     doc.font('Helvetica').fontSize(7)
      .text('• All Subject in Coimbatore Jurisdiction only.', bottomBoxX + 6, termsY + 9)
      .text('  Certified that the Particulars given above true and correct', bottomBoxX + 6, termsY + 18);

    // Company name & Signature (right side) - right-aligned as per printed format
    const signBaseY = rupeesBoxY + 45; // Align with Terms & Conditions
    const rightHalfWidth = bottomBoxX + bottomBoxW - splitX; // Use splitX for alignment
    // Company name - bold, uppercase, right-aligned (as per image)
    doc.font('Helvetica-Bold').fontSize(9);
    const companyText = 'For ' + COMPANY_NAME.toUpperCase();
    const companyNameX = splitX + rightHalfWidth - 8; // Right-aligned with margin, use splitX
    doc.text(companyText, companyNameX, signBaseY, { align: 'right', width: rightHalfWidth - 8 });
    
    // Draw a signature line above the signature text
    const sigLineY = signBaseY + 15;
    const sigLineStartX = splitX + 8;
    const sigLineEndX = splitX + rightHalfWidth - 8;
    doc.save();
    doc.lineWidth(0.8).strokeColor('#000000')
      .moveTo(sigLineStartX, sigLineY)
      .lineTo(sigLineEndX, sigLineY)
      .stroke();
    doc.restore();
    
    // Authorised Signature label - right-aligned in the right half
    doc.font('Helvetica').fontSize(8);
    const sigText = 'Authorised Signature';
    doc.text(sigText, companyNameX, sigLineY + 4, { align: 'right', width: rightHalfWidth - 8 });

    doc.end();
  } catch (error) {
    console.error('Generate public PDF error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
