import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateQuotationPDF(quote) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(245, 158, 11); // amber-500
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SUNPOWER SOLUTIONS', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFont('helvetica', 'normal');
  doc.text('Rooftop Solar Installation & Engineering | PM Surya Ghar Approved', 14, 25);
  doc.text('GSTIN: 07AAACS1234F1Z8 | info@sunpower.in | +91 98100 12345', 14, 32);

  // Quote Metadata
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`SOLAR SYSTEM ESTIMATE / QUOTATION #${quote.id}`, 14, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = quote.created_at ? new Date(quote.created_at).toLocaleDateString() : new Date().toLocaleDateString();
  doc.text(`Date: ${dateStr}`, 150, 48);

  // Customer Details Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 54, 182, 28, 3, 3, 'FD');

  const leadName = quote.lead?.customer_name || 'Valued Customer';
  const leadPhone = quote.lead?.phone || 'N/A';
  const leadEmail = quote.lead?.email || 'N/A';
  const leadAddress = quote.lead?.address || 'N/A';

  doc.setFont('helvetica', 'bold');
  doc.text('Client Information:', 18, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${leadName}  |  Phone: ${leadPhone}`, 18, 68);
  doc.text(`Email: ${leadEmail}`, 18, 73);
  doc.text(`Site Address: ${leadAddress}`, 18, 78);

  // System Specifications Table
  autoTable(doc, {
    startY: 88,
    head: [['Specification', 'Details']],
    body: [
      ['System Capacity', `${quote.capacity_kw} kW`],
      ['System Architecture', quote.system_type === 'ON_GRID' ? 'On-Grid (Net Metering with DISCOM)' : 'Off-Grid (Battery Energy Storage)'],
      ['Solar PV Modules', `${quote.capacity_kw * 2} x 540W Mono-PERC Half-Cut Tier-1 Panels (20 Years Warranty)`],
      ['Inverter & Protection', `${quote.capacity_kw}kW Smart Solar Inverter + Pre-wired ACDB/DCDB Surge Protection (2 Years Warranty)`],
      ['Structure & Mounting', 'Elevated Hot-Dip Galvanized Iron (HDG) / Wind Load Rated 150 km/h'],
      ['Earthing & Safety', 'Chemical Gel Earthing Electrode (2 Pit) + Pure Copper Lightning Arrestor'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Price Breakdown Table
  const finalY = doc.lastAutoTable.finalY + 8;

  autoTable(doc, {
    startY: finalY,
    head: [['Description', 'Amount (INR)']],
    body: [
      ['Hardware & Solar Modules Package Total', `Rs. ${quote.hardware_total_inr.toLocaleString('en-IN')}`],
      ['Professional Installation, Net-Metering Testing & Commissioning', `Rs. ${quote.installation_charge_inr.toLocaleString('en-IN')}`],
      ['Direct Subsidy / Govt PM Surya Ghar Scheme Credit', `- Rs. ${quote.subsidy_discount_inr.toLocaleString('en-IN')}`],
      ['NET CUSTOMER PAYABLE AMOUNT', `Rs. ${quote.grand_total_inr.toLocaleString('en-IN')}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [245, 158, 11], textColor: [15, 23, 42], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
  });

  // Terms and Signature
  const noteY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Terms & Conditions:', 14, noteY);
  doc.text('1. 20% advance required for BoM hardware reservation and site preparation.', 14, noteY + 5);
  doc.text('2. Subsidy disburals are subject to DISCOM inspection and portal compliance.', 14, noteY + 9);
  doc.text('3. Installation schedule guaranteed within 7-10 business days from material dispatch.', 14, noteY + 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('For SunPower Solutions Pvt Ltd', 140, noteY + 22);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signatory', 140, noteY + 30);

  doc.save(`SunPower_Quotation_${quote.id}_${leadName.replace(/\s+/g, '_')}.pdf`);
}

export function generateInvoicePDF(order) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(245, 158, 11);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SUNPOWER SOLUTIONS PVT LTD', 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.text('TAX INVOICE / GST RECEIPT', 14, 25);
  doc.text('CIN: U40106DL2024PTC123456 | GSTIN: 07AAACS1234F1Z8', 14, 31);

  // Invoice Meta
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`TAX INVOICE #SP-INV-${order.id.toString().padStart(5, '0')}`, 14, 48);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 140, 48);
  doc.text(`Order Status: ${order.payment_status}`, 140, 54);

  // Billing details
  const lead = order.lead || {};
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 60, 182, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.text('Billed To Customer:', 18, 67);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${lead.customer_name || 'Customer'}  |  Contact: ${lead.phone || 'N/A'}`, 18, 73);
  doc.text(`Address: ${lead.address || 'N/A'}`, 18, 79);

  // Invoice Table
  const quote = order.quotation || {};
  autoTable(doc, {
    startY: 92,
    head: [['Item Description', 'HSN/SAC', 'Amount (INR)']],
    body: [
      [`Rooftop Solar Power System (${quote.capacity_kw || 3}kW ${quote.system_type || 'ON_GRID'})`, '85414011', `Rs. ${(order.total_amount_inr * 0.85).toLocaleString('en-IN')}`],
      ['Turnkey Installation, Grid Commissioning & Testing Services', '995461', `Rs. ${(order.total_amount_inr * 0.15).toLocaleString('en-IN')}`],
      ['Total Invoice Value', '', `Rs. ${order.total_amount_inr.toLocaleString('en-IN')}`],
      ['Amount Paid to Date', '', `Rs. ${order.advance_paid_inr.toLocaleString('en-IN')}`],
      ['Balance Due Payable', '', `Rs. ${order.balance_due_inr.toLocaleString('en-IN')}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 3.5 },
  });

  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer generated invoice and carries authorized digital certification.', 14, finalY);

  doc.save(`SunPower_Invoice_SP-INV-${order.id}.pdf`);
}
