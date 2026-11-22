import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSolarMetrics,
  calculateQuotationBOM,
  filterServiceTickets,
  createServiceTicket,
  closeServiceTicketWithOtp,
  validateHandover,
  searchCommandPalette,
} from './solar-logic';
import { INITIAL_SERVICE_TICKETS } from './solar-data';

test('calculateSolarMetrics computes default 4500 INR PM Surya Ghar scenario accurately', () => {
  const res = calculateSolarMetrics({
    monthlyBillInr: 4500,
    scheme: 'pmsuryaghar',
    roofType: 'rcc',
    gridType: 'ongrid',
  });

  assert.equal(res.recommendedKw, 3.5);
  assert.equal(res.roofAreaSqFt, 315);
  assert.equal(res.grossCost, 227500);
  assert.equal(res.subsidyAmount, 78000);
  assert.equal(res.netCost, 149500);
  assert.equal(res.annualSavings, 48600);
  assert.equal(res.paybackYears, '3.1');
  assert.equal(res.lifetimeSavings, 1215000);
  assert.equal(res.co2OffsetTonnes, '84.7');
});

test('calculateSolarMetrics handles 1kW/2kW subsidy slabs and hybrid surcharge', () => {
  const oneKw = calculateSolarMetrics({
    monthlyBillInr: 1300,
    scheme: 'pmsuryaghar',
    roofType: 'rcc',
    gridType: 'ongrid',
  });
  assert.equal(oneKw.recommendedKw, 1.0);
  assert.equal(oneKw.subsidyAmount, 30000);

  const hybridTwoKw = calculateSolarMetrics({
    monthlyBillInr: 2600,
    scheme: 'nosubsidy',
    roofType: 'tiled',
    gridType: 'hybrid',
  });
  assert.equal(hybridTwoKw.recommendedKw, 2.0);
  assert.equal(hybridTwoKw.roofAreaSqFt, 200);
  assert.equal(hybridTwoKw.subsidyAmount, 0);
  assert.equal(hybridTwoKw.grossCost, 200000);
});

test('calculateQuotationBOM returns preset and custom kW breakdowns accurately', () => {
  const preset3 = calculateQuotationBOM(3);
  assert.equal(preset3.onGridGross, 189500);
  assert.equal(preset3.subsidy, 78000);
  assert.equal(preset3.bomItems[0].qtyLabel, '6 Nos');

  const preset5 = calculateQuotationBOM(5);
  assert.equal(preset5.onGridGross, 298000);
  assert.equal(preset5.bomItems[0].qtyLabel, '10 Nos');

  const custom75 = calculateQuotationBOM(7.5);
  assert.equal(custom75.kw, 7.5);
  assert.equal(custom75.bomItems[0].qtyLabel, '14 Nos');
  assert.equal(custom75.subsidy, 78000);
});

test('service ticket filtering, creation, and OTP closure work end-to-end', () => {
  assert.equal(filterServiceTickets(INITIAL_SERVICE_TICKETS, 'all').length, 3);
  assert.equal(filterServiceTickets(INITIAL_SERVICE_TICKETS, 'open').length, 2);
  assert.equal(filterServiceTickets(INITIAL_SERVICE_TICKETS, 'resolved').length, 1);

  const created = createServiceTicket({
    category: 'Inverter Fault',
    severity: 'High Priority',
    capacity: '5 kW Rooftop',
    customerName: 'Ananya Verma',
    description: 'Phase imbalance alert on inverter display',
    ticketNumber: 9012,
  });
  assert.equal(created.id, '#TCK-9012');
  assert.equal(created.status, 'Dispatched');

  const updatedList = [created, ...INITIAL_SERVICE_TICKETS];
  const badOtp = closeServiceTicketWithOtp(updatedList, '#TCK-9012', ['8', '4', '1', '']);
  assert.equal(badOtp.ok, false);

  const goodOtp = closeServiceTicketWithOtp(updatedList, '#TCK-9012', ['8', '4', '1', '9']);
  assert.equal(goodOtp.ok, true);
  assert.equal(filterServiceTickets(goodOtp.tickets, 'resolved').length, 2);
});

test('validateHandover enforces 4-digit OTP and customer signature', () => {
  assert.equal(
    validateHandover({ otpDigits: ['7', '4', '9', ''], hasSignature: true }).ok,
    false
  );
  assert.equal(
    validateHandover({ otpDigits: ['7', '4', '9', '2'], hasSignature: false }).ok,
    false
  );
  assert.equal(
    validateHandover({ otpDigits: ['7', '4', '9', '2'], hasSignature: true }).ok,
    true
  );
});

test('searchCommandPalette finds projects, quotations, and surveys by ID or name', () => {
  const byQuoteId = searchCommandPalette('4198', 'Quotation');
  assert.equal(byQuoteId.length, 1);
  assert.equal(byQuoteId[0].screen, 'quotation-engine');
  assert.ok(
    searchCommandPalette('4198').some((i) => i.category === 'Billing & Invoice')
  );

  const bySurveyId = searchCommandPalette('DL-2025');
  assert.equal(bySurveyId.length, 1);
  assert.equal(bySurveyId[0].category, 'Site Survey');

  const byClientName = searchCommandPalette('Singhania', 'Quotation');
  assert.equal(byClientName.length, 1);
  assert.equal(byClientName[0].id, 'SP-QT-2025-4210');

  assert.ok(searchCommandPalette('').length >= 10);

  const userHit = searchCommandPalette('SP-USR-1120', 'User Directory');
  assert.equal(userHit.length, 1);
  assert.equal(userHit[0].screen, 'operations-analytics');
});

import {
  SEED_USERS,
  DEFAULT_USER_PASSWORD,
  findUserByCredentials,
  findUserForReset,
  filterAndPaginateUsers,
  buildUpiUri,
  validateUpiVpa,
  validateCardPayment,
  calculateCashSettlement,
} from './solar-users';
import {
  buildWhatsAppShareUrl,
  buildGmailComposeUrl,
} from './pdf-qr-comms';

test('SEED_USERS generates 280 unique users (250-300 range) with valid credentials', () => {
  assert.ok(SEED_USERS.length >= 250 && SEED_USERS.length <= 300);
  assert.equal(SEED_USERS.length, 280);

  const uniqueIds = new Set(SEED_USERS.map((u) => u.id));
  const uniqueEmails = new Set(SEED_USERS.map((u) => u.email));
  assert.equal(uniqueIds.size, 280);
  assert.equal(uniqueEmails.size, 280);

  const authByEmail = findUserByCredentials('rajesh.sharma@sunpower.in', DEFAULT_USER_PASSWORD);
  assert.equal(authByEmail?.id, 'SP-USR-1001');

  const authByPhone = findUserByCredentials('9810010002', DEFAULT_USER_PASSWORD);
  assert.equal(authByPhone?.name, 'Marcus Reed');

  const authWithOverride = findUserByCredentials('SP-USR-1001', 'NewSolarPass@99', {
    'SP-USR-1001': 'NewSolarPass@99',
  });
  assert.equal(authWithOverride?.name, 'Rajesh Sharma');
});

test('findUserForReset supports both email and phone lookup and filterAndPaginateUsers slices accurately', () => {
  const byBoth = findUserForReset({
    email: 'rajesh.sharma@sunpower.in',
    phone: '+91 98100 10001',
  });
  assert.equal(byBoth.matched?.id, 'SP-USR-1001');

  const byPhoneOnly = findUserForReset({ phone: '9810010003' });
  assert.equal(byPhoneOnly.matched?.name, 'Deepak Singhania');

  const page2 = filterAndPaginateUsers(SEED_USERS, {
    page: 2,
    pageSize: 20,
  });
  assert.equal(page2.totalCount, 280);
  assert.equal(page2.totalPages, 14);
  assert.equal(page2.items.length, 20);
  assert.equal(page2.items[0].id, 'SP-USR-1021');
});

test('UPI QR URI, UPI VPA, Card validation, Cash settlement, and WhatsApp/Gmail links work accurately', () => {
  const upiUri = buildUpiUri({
    vpa: 'sunpower@okaxis',
    amount: 25000,
    note: 'Solar Milestone',
    txRef: 'TX-4198',
  });
  assert.ok(upiUri.startsWith('upi://pay?'));
  assert.ok(upiUri.includes('pa=sunpower%40okaxis'));
  assert.ok(upiUri.includes('am=25000.00'));

  assert.equal(validateUpiVpa('rajesh@okhdfcbank').ok, true);
  assert.equal(validateUpiVpa('invalid-handle').ok, false);

  const cardOk = validateCardPayment({
    cardNumber: '4111 1111 1111 8814',
    expiry: '09/28',
    cvv: '421',
    holderName: 'Rajesh Sharma',
  });
  assert.equal(cardOk.ok, true);
  assert.equal(cardOk.last4, '8814');
  assert.equal(cardOk.brand, 'Visa');

  const cashRes = calculateCashSettlement({
    invoiceBalance: 25000,
    cashTendered: 30000,
  });
  assert.equal(cashRes.ok, true);
  assert.equal(cashRes.appliedAmount, 25000);
  assert.equal(cashRes.remainingBalance, 0);
  assert.equal(cashRes.changeDue, 5000);

  const waUrl = buildWhatsAppShareUrl('+91 98100 10001', 'Hello Solar');
  assert.equal(waUrl, 'https://wa.me/919810010001?text=Hello%20Solar');

  const gmUrl = buildGmailComposeUrl({
    to: 'kr.yuvrajha@gmail.com',
    subject: 'Quote SP-QT-2025-4198',
    body: 'Attached details',
  });
  assert.ok(gmUrl.startsWith('https://mail.google.com/mail/?'));
  assert.ok(gmUrl.includes('to=kr.yuvrajha%40gmail.com'));
});
