import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import type { HardwareRegistryItem } from './solar-data';
import type { QuotationBreakdown } from './solar-logic';
import type { PaymentReceipt } from './solar-users';

export async function generateQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: 240,
    margin: 1,
    color: {
      dark: '#001601',
      light: '#ffffff',
    },
  });
}

function addPdfHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  docRef: string
) {
  doc.setFillColor(0, 22, 1);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SUNPOWER SOLUTIONS PVT LTD', 14, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('MNRE Class-A Channel Partner · ISO 9001:2015 · ALMM Certified', 14, 20);
  doc.setFontSize(9);
  doc.text(`Ref: ${docRef}`, 196, 13, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 196, 20, {
    align: 'right',
  });

  doc.setTextColor(0, 22, 1);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(title, 14, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(66, 73, 63);
  doc.text(subtitle, 14, 48);
  doc.setDrawColor(194, 201, 188);
  doc.line(14, 52, 196, 52);
}

function formatPdfINR(value: number): string {
  return `INR ${Math.round(value).toLocaleString('en-IN')}`;
}

async function attachVerificationQr(
  doc: jsPDF,
  qrPayload: string,
  caption: string,
  x = 158,
  y = 242
) {
  try {
    const dataUrl = await generateQrDataUrl(qrPayload);
    doc.addImage(dataUrl, 'PNG', x, y, 34, 34);
    doc.setFontSize(7.5);
    doc.setTextColor(66, 73, 63);
    doc.text(caption, x + 17, y + 38, { align: 'center' });
  } catch {
    // Fallback text stamp if canvas unavailable
    doc.setFontSize(8);
    doc.text(`Verify: ${qrPayload}`, x, y + 10);
  }
}

export async function downloadQuotationPdf(params: {
  quote: QuotationBreakdown;
  quoteId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  addPdfHeader(
    doc,
    `SOLAR SYSTEM QUOTATION — ${params.quote.label.toUpperCase()}`,
    `Client: ${params.customerName || 'Rajesh Sharma'} · Phone: ${
      params.customerPhone || '+91 98100 10001'
    } · Email: ${params.customerEmail || 'rajesh.sharma@sunpower.in'}`,
    params.quoteId
  );

  let y = 60;
  doc.setFillColor(244, 243, 240);
  doc.rect(14, y, 88, 30, 'F');
  doc.rect(108, y, 88, 30, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 46, 3);
  doc.text('ON-GRID NET-METERED SYSTEM', 18, y + 7);
  doc.text('HYBRID + BATTERY ESS SYSTEM', 112, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(26, 28, 26);
  doc.text(`Modules: ${params.quote.onGridPanelCount}`, 18, y + 13);
  doc.text(`Gross: ${formatPdfINR(params.quote.onGridGross)} | Subsidy: -${formatPdfINR(params.quote.subsidy)}`, 18, y + 19);
  doc.setFont('helvetica', 'bold');
  doc.text(`Net Payable: ${formatPdfINR(params.quote.onGridNet)}`, 18, y + 25);

  doc.setFont('helvetica', 'normal');
  doc.text(`Battery: ${params.quote.hybridBattery}`, 112, y + 13);
  doc.text(`Gross: ${formatPdfINR(params.quote.hybridGross)} | Subsidy: -${formatPdfINR(params.quote.subsidy)}`, 112, y + 19);
  doc.setFont('helvetica', 'bold');
  doc.text(`Net Payable: ${formatPdfINR(params.quote.hybridNet)}`, 112, y + 25);

  y += 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 22, 1);
  doc.text('ITEMIZED BILL OF MATERIALS (BOM)', 14, y);
  y += 5;

  doc.setFillColor(0, 46, 3);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text('Component', 17, y + 5.5);
  doc.text('Qty', 132, y + 5.5);
  doc.text('Unit Rate', 155, y + 5.5);
  doc.text('Amount', 193, y + 5.5, { align: 'right' });
  y += 10;

  doc.setTextColor(26, 28, 26);
  params.quote.bomItems.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(250, 249, 246);
      doc.rect(14, y - 3.5, 182, 11, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(item.title, 17, y + 1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(66, 73, 63);
    doc.text(item.spec.slice(0, 72), 17, y + 5.2);
    doc.setTextColor(26, 28, 26);
    doc.setFontSize(8.5);
    doc.text(item.qtyLabel, 132, y + 2);
    doc.text(formatPdfINR(item.unitPrice), 155, y + 2);
    doc.setFont('helvetica', 'bold');
    doc.text(formatPdfINR(item.total), 193, y + 2, { align: 'right' });
    y += 12;
  });

  y += 4;
  doc.setDrawColor(14, 122, 102);
  doc.line(14, y, 196, y);
  y += 7;
  doc.setFontSize(10);
  doc.text(`Total Estimated BOM Value: ${formatPdfINR(params.quote.onGridGross)}`, 14, y);
  doc.setTextColor(14, 122, 102);
  doc.text(`Est. Monthly Generation: ${params.quote.estMonthlyUnits}`, 14, y + 6);
  doc.text(`Annual Savings: ${params.quote.annualSavings.replace('₹', 'INR ')}`, 14, y + 12);

  doc.setTextColor(66, 73, 63);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Includes 5-Year Comprehensive AMC & 25-Year Linear Yield Guarantee.', 14, 256);
  doc.text('Scan QR to verify digital quotation authenticity & MNRE filing status.', 14, 262);

  await attachVerificationQr(
    doc,
    `SUNPOWER|QUOTE|${params.quoteId}|${params.quote.kw}KW|NET:${params.quote.onGridNet}`,
    `Verify ${params.quoteId}`
  );

  doc.save(`${params.quoteId}-SunPower-Quotation.pdf`);
}

export async function downloadSurveyReportPdf(params: {
  siteId: string;
  projectTitle: string;
  address: string;
  engineerName: string;
  checklist: { title: string; meta: string; checked: boolean }[];
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  addPdfHeader(
    doc,
    'ENGINEERING SITE SURVEY & LIDAR REPORT',
    `${params.projectTitle} · ${params.address}`,
    params.siteId
  );

  let y = 60;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SURVEYOR & ORIENTATION TELEMETRY', 14, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const metaRows = [
    ['Lead Solar Engineer', params.engineerName],
    ['Roof Orientation (Azimuth)', '180° True South (Optimal Max Insolation)'],
    ['Recommended Tilt / Pitch', '24° Elevated Strut Kit'],
    ['Usable Shadow-Free Area', '480 sq.ft (73.8% of 650 sq.ft total RCC roof)'],
    ['AC/DC Cable Route Length', '32 Meters · 16 sq.mm Electrolytic Copper (0.84% Drop)'],
    ['Earthing Pit Resistance', '2.8 Ohm (IS 3043:2018 Compliant < 5 Ohm)'],
  ];
  metaRows.forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${k}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(v, 72, y);
    y += 7;
  });

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PRE-DISPATCH TECHNICAL SIGN-OFF CHECKLIST', 14, y);
  y += 7;
  params.checklist.forEach((item) => {
    doc.setFillColor(244, 243, 240);
    doc.rect(14, y - 4, 182, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`[${item.checked ? 'PASS' : 'PENDING'}] ${item.title}`, 18, y + 1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(item.meta, 18, y + 5.5);
    y += 15;
  });

  doc.setFontSize(8.5);
  doc.text('Signed Digitally: Er. Marcus Reed (#ENG-9941) & Customer Co-Owner Consent.', 14, 255);
  await attachVerificationQr(
    doc,
    `SUNPOWER|SURVEY|${params.siteId}|180S|480SQFT|VERIFIED`,
    `Verify ${params.siteId}`
  );
  doc.save(`${params.siteId}-Engineering-Survey-Report.pdf`);
}

export async function downloadDispatchDossierPdf(params: {
  workOrderId: string;
  waybill: string;
  hardware: HardwareRegistryItem[];
  completedTasks: number;
  totalTasks: number;
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  addPdfHeader(
    doc,
    'DISPATCH DOSSIER & HARDWARE SERIAL REGISTRY',
    `Work Order: ${params.workOrderId} · Waybill: ${params.waybill} · Quality Gates: ${params.completedTasks}/${params.totalTasks}`,
    params.waybill
  );

  let y = 60;
  doc.setFillColor(0, 46, 3);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Component', 17, y + 5.5);
  doc.text('Serial / Batch ID', 95, y + 5.5);
  doc.text('Quality Gate', 142, y + 5.5);
  doc.text('Status', 193, y + 5.5, { align: 'right' });
  y += 11;

  doc.setTextColor(26, 28, 26);
  params.hardware.forEach((hw) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(hw.spec.slice(0, 38), 17, y);
    doc.setFont('helvetica', 'normal');
    doc.text(hw.serialRange.slice(0, 26), 95, y);
    doc.text(hw.qualityGate, 142, y);
    doc.text(hw.status, 193, y, { align: 'right' });
    y += 9;
  });

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('FLUKE TELEMETRY & DISCOM SANCTION', 14, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Voc Open Circuit: 412V DC  |  Isc Short Circuit: 11.2A  |  Insulation: 25 MOhm (PASS)', 14, y);
  doc.text('DISCOM Token: DS-2025-NETMTR-99824-OK · Earth Pit: 1.34 Ohm', 14, y + 6);

  await attachVerificationQr(
    doc,
    `SUNPOWER|DISPATCH|${params.workOrderId}|${params.waybill}|ITEMS:${params.hardware.length}`,
    `Verify ${params.waybill}`
  );
  doc.save(`${params.waybill}-Dispatch-Dossier.pdf`);
}

export async function downloadWarrantyCertificatePdf(params: {
  policyNo: string;
  arraySerial: string;
  customerName: string;
  inceptionDate: string;
  expiryDate: string;
  coverageCap: string;
  certHash: string;
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  addPdfHeader(
    doc,
    '25-YEAR LINEAR PERFORMANCE WARRANTY CERTIFICATE',
    `Munich Re Underwritten Policy ${params.policyNo} · Array Serial ${params.arraySerial}`,
    params.arraySerial
  );

  doc.setDrawColor(14, 122, 102);
  doc.setLineWidth(0.7);
  doc.rect(14, 58, 182, 115);

  let y = 70;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 46, 3);
  doc.text('CERTIFIED PHOTOVOLTAIC ASSET SAFEGUARD', 105, y, { align: 'center' });

  y += 12;
  const fields = [
    ['Insured Customer', params.customerName],
    ['Underwriter & Policy No', `Munich Re Direct · ${params.policyNo}`],
    ['Array Serial Number', params.arraySerial],
    ['Policy Inception Date', params.inceptionDate],
    ['Policy Expiry Date', params.expiryDate],
    ['Guaranteed Output at Yr 25', '87.4% Min Linear Performance (0.40% Max Annual Degradation)'],
    ['Coverage Cap', params.coverageCap.replace('₹', 'INR')],
    ['Inverter OEM Coverage', '12-Year Replacement (Solax X3-Hybrid G4 · 72h Swap SLA)'],
    ['Certificate SHA-256 Hash', params.certHash],
  ];
  doc.setFontSize(9.5);
  doc.setTextColor(26, 28, 26);
  fields.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 22, y);
    doc.setFont('helvetica', 'normal');
    doc.text(val, 82, y);
    y += 9;
  });

  await attachVerificationQr(
    doc,
    `SUNPOWER|WARRANTY|${params.arraySerial}|${params.policyNo}|EXP:${params.expiryDate}`,
    `Verify ${params.arraySerial}`
  );
  doc.save(`${params.arraySerial}-25Yr-Warranty-Certificate.pdf`);
}

export async function downloadPaymentReceiptPdf(receipt: PaymentReceipt) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  addPdfHeader(
    doc,
    'OFFICIAL PAYMENT & SETTLEMENT RECEIPT',
    `Invoice: ${receipt.invoiceId} · Settled via ${receipt.methodLabel}`,
    receipt.receiptId
  );

  let y = 62;
  doc.setFillColor(244, 243, 240);
  doc.rect(14, y, 182, 82, 'F');
  y += 10;

  const rows = [
    ['Receipt Number', receipt.receiptId],
    ['Invoice / Quote Ref', receipt.invoiceId],
    ['Customer Name', receipt.customerName],
    ['Customer Contact', `${receipt.customerPhone} · ${receipt.customerEmail}`],
    ['Payment Channel', receipt.methodLabel],
    ['Transaction / UTR Ref', receipt.reference],
    ['Timestamp', receipt.timestamp],
    ['Amount Settled', formatPdfINR(receipt.amountPaid)],
    ['Remaining Balance', formatPdfINR(receipt.remainingBalance)],
  ];
  if (receipt.changeDue > 0) {
    rows.push(['Cash Change Returned', formatPdfINR(receipt.changeDue)]);
  }

  doc.setFontSize(9.5);
  rows.forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(66, 73, 63);
    doc.text(`${k}:`, 20, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 22, 1);
    doc.text(v, 76, y);
    y += 7.5;
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(66, 73, 63);
  doc.text('This is an electronically generated GST-compliant receipt from SunPower Solutions Pvt Ltd.', 14, 165);

  await attachVerificationQr(
    doc,
    `SUNPOWER|RECEIPT|${receipt.receiptId}|INV:${receipt.invoiceId}|AMT:${receipt.amountPaid}|REF:${receipt.reference}`,
    `Verify ${receipt.receiptId}`
  );
  doc.save(`${receipt.receiptId}-SunPower-Receipt.pdf`);
}

export function downloadCsvFile(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>
) {
  const escapeCell = (cell: string | number) => {
    const str = String(cell ?? '');
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csv = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 1000);
}

export function buildWhatsAppShareUrl(phone: string, message: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function buildGmailComposeUrl(params: {
  to: string;
  subject: string;
  body: string;
}): string {
  const qs = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: params.to.trim(),
    su: params.subject.trim(),
    body: params.body.trim(),
  });
  return `https://mail.google.com/mail/?${qs.toString()}`;
}

export function buildMailtoUrl(params: {
  to: string;
  subject: string;
  body: string;
}): string {
  const qs = new URLSearchParams({
    subject: params.subject.trim(),
    body: params.body.trim(),
  });
  return `mailto:${encodeURIComponent(params.to.trim())}?${qs.toString()}`;
}

export function isSafeExternalHref(url: string): boolean {
  return (
    url.startsWith('https://') ||
    url.startsWith('mailto:') ||
    url.startsWith('upi://')
  );
}
