$file = 'c:\Projects\vickey\backend\controllers\billController.js'
$content = Get-Content $file -Raw

# simple header block replacement
$pattern = [regex]::Escape("// Left box: To / Party (with dashed guide lines)") + ".*?" + [regex]::Escape("doc.font('Helvetica').text('', fieldXStart, y + 52);")
$pattern = [regex]::new($pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
$replacement = "// Left box: To / Party\n    doc.lineWidth(0.8).strokeColor('#000000').rect(leftBoxX, y, leftBoxW, boxH).stroke();\n    doc.font('Helvetica-Bold').fontSize(10).text('To', leftBoxX + 6, y + 4);\n    doc.font('Helvetica').fontSize(9).text(bill.customer_name || 'The Executive Officer', leftBoxX + 6, y + 18);\n    doc.fontSize(8).text((bill.customer_address || 'Address').substring(0, 60), leftBoxX + 6, y + 32, { width: leftBoxW - 12 });\n\n    // Right fields: Invoice No, Date, Order No, Vehicle No\n    doc.font('Helvetica-Bold').fontSize(9).text('Invoice No :', rightBoxX, y + 4);\n    doc.font('Helvetica').text(String(bill.id).padStart(3, '0'), rightBoxX + 100, y + 4);\n    doc.font('Helvetica-Bold').text('Invoice Date :', rightBoxX, y + 20);\n    doc.font('Helvetica').text(new Date(bill.created_at).toLocaleDateString('en-IN'), rightBoxX + 100, y + 20);\n    doc.font('Helvetica-Bold').text('Order No :', rightBoxX, y + 36);\n    doc.font('Helvetica').text(bill.order_no || '', rightBoxX + 100, y + 36);\n    doc.font('Helvetica-Bold').text('Vehicle No :', rightBoxX, y + 52);\n    doc.font('Helvetica').text('', rightBoxX + 100, y + 52);"

# replace twice to handle two occurrences
$content = [regex]::Replace($content, $pattern, $replacement, 1)
$content = [regex]::Replace($content, $pattern, $replacement, 1)

Set-Content $file $content
Write-Host "Reverted header blocks"