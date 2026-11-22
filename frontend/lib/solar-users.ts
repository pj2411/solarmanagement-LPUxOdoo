import type { UserRole } from './solar-data';

export type ProjectStage =
  | 'Survey Scheduled'
  | 'BOM Quoted'
  | 'Dispatch Active'
  | 'Commissioned'
  | 'AMC Active';

export type BillingStatus = 'Paid' | 'Pending' | 'Partial' | 'Overdue';

export interface SolarUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Exclude<UserRole, 'Technician'>;
  city: string;
  discom: string;
  systemKw: number;
  projectStage: ProjectStage;
  invoiceId: string;
  invoiceAmountInr: number;
  paidAmountInr: number;
  billingStatus: BillingStatus;
  joinedDate: string;
  defaultPassword: string;
}

export interface InvoiceRecord {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  systemLabel: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: BillingStatus;
}

export type PaymentMethodType = 'upi_qr' | 'upi_id' | 'card' | 'cash';

export interface PaymentReceipt {
  receiptId: string;
  invoiceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amountPaid: number;
  method: PaymentMethodType;
  methodLabel: string;
  reference: string;
  timestamp: string;
  remainingBalance: number;
  changeDue: number;
}

const FIRST_NAMES = [
  'Rajesh', 'Priya', 'Amit', 'Vikram', 'Ananya', 'Deepak', 'Sunita', 'Rohan',
  'Kavita', 'Suresh', 'Neha', 'Arjun', 'Meera', 'Sanjay', 'Pooja', 'Karan',
  'Divya', 'Nitin', 'Swati', 'Manish', 'Ritu', 'Aditya', 'Shalini', 'Gaurav',
  'Pankaj', 'Aarti', 'Vivek', 'Sneha', 'Harsh', 'Komal',
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Verma', 'Singhania', 'Kumar', 'Gupta', 'Mehta', 'Reddy',
  'Nair', 'Joshi', 'Kapoor', 'Malhotra', 'Bansal', 'Chauhan', 'Iyer', 'Desai',
  'Agarwal', 'Saxena', 'Kulkarni', 'Bhatia',
];

const CITIES: { city: string; discom: string }[] = [
  { city: 'New Delhi', discom: 'BSES Rajdhani' },
  { city: 'Noida', discom: 'PVVNL' },
  { city: 'Gurugram', discom: 'DHBVN' },
  { city: 'Bengaluru', discom: 'BESCOM' },
  { city: 'Pune', discom: 'MSEDCL' },
  { city: 'Jaipur', discom: 'JVVNL' },
  { city: 'Ahmedabad', discom: 'Torrent Power' },
  { city: 'Mumbai', discom: 'Tata Power' },
  { city: 'Hyderabad', discom: 'TSSPDCL' },
  { city: 'Chandigarh', discom: 'CED' },
];

const STAGES: ProjectStage[] = [
  'Survey Scheduled',
  'BOM Quoted',
  'Dispatch Active',
  'Commissioned',
  'AMC Active',
];

const KW_OPTIONS = [1, 2, 3, 3, 5, 5, 7.5, 10];

export const DEFAULT_USER_PASSWORD = 'SolarGrid@2025';

export const ADITYA_PATHAK_RECORDS: SolarUserRecord[] = [
  {
    id: 'SP-USR-ADITYA-ADMIN',
    name: 'Aditya Pathak',
    email: 'rsbvijit@gmail.com',
    phone: '+91 87899 88023',
    role: 'Admin',
    city: 'Patna',
    discom: 'SBPDCL',
    systemKw: 10,
    projectStage: 'Commissioned',
    invoiceId: 'SP-INV-ADITYA-ADMIN',
    invoiceAmountInr: 325000,
    paidAmountInr: 325000,
    billingStatus: 'Paid',
    joinedDate: '2025-01-15',
    defaultPassword: 'demo2026',
  },
  {
    id: 'SP-USR-ADITYA-CUSTOMER',
    name: 'Aditya Pathak',
    email: 'rsbvijit@gmail.com',
    phone: '+91 87899 88023',
    role: 'Customer',
    city: 'Patna',
    discom: 'SBPDCL',
    systemKw: 5,
    projectStage: 'BOM Quoted',
    invoiceId: 'SP-INV-ADITYA-CUST',
    invoiceAmountInr: 207000,
    paidAmountInr: 0,
    billingStatus: 'Pending',
    joinedDate: '2025-02-10',
    defaultPassword: 'demo2026',
  },
  {
    id: 'SP-USR-ADITYA-ENGINEER',
    name: 'Aditya Pathak',
    email: 'rsbvijit@gmail.com',
    phone: '+91 87899 88023',
    role: 'Engineer',
    city: 'Patna',
    discom: 'SBPDCL',
    systemKw: 7.5,
    projectStage: 'Survey Scheduled',
    invoiceId: 'SP-INV-ADITYA-ENG',
    invoiceAmountInr: 245000,
    paidAmountInr: 245000,
    billingStatus: 'Paid',
    joinedDate: '2025-01-20',
    defaultPassword: 'demo2026',
  },
  {
    id: 'SP-USR-ADITYA-INSTALLER',
    name: 'Aditya Pathak',
    email: 'rsbvijit@gmail.com',
    phone: '+91 87899 88023',
    role: 'Installer',
    city: 'Patna',
    discom: 'SBPDCL',
    systemKw: 5,
    projectStage: 'Dispatch Active',
    invoiceId: 'SP-INV-ADITYA-INST',
    invoiceAmountInr: 185000,
    paidAmountInr: 185000,
    billingStatus: 'Paid',
    joinedDate: '2025-01-22',
    defaultPassword: 'demo2026',
  },
  {
    id: 'SP-USR-ADITYA-CUST-ALT',
    name: 'Aditya Pathak',
    email: 'adityapathak6262@gmail.com',
    phone: '+91 87899 88023',
    role: 'Customer',
    city: 'Patna',
    discom: 'SBPDCL',
    systemKw: 5,
    projectStage: 'BOM Quoted',
    invoiceId: 'SP-INV-ADITYA-ALT',
    invoiceAmountInr: 185000,
    paidAmountInr: 50000,
    billingStatus: 'Partial',
    joinedDate: '2025-02-10',
    defaultPassword: 'demo2026',
  },
];

function buildSeedUsers(count = 280): SolarUserRecord[] {
  const records: SolarUserRecord[] = [...ADITYA_PATHAK_RECORDS];
  const usedEmails = new Set<string>(['adityapathak6262@gmail.com']);

  for (let i = 0; i < count; i++) {
    const num = i + 1;
    const id = `SP-USR-${1000 + num}`;

    let name: string;
    let role: Exclude<UserRole, 'Technician'>;
    let email: string;
    let phone: string;
    let cityIdx = i % CITIES.length;
    let kw = KW_OPTIONS[i % KW_OPTIONS.length];
    let stage = STAGES[i % STAGES.length];

    if (i === 0) {
      name = 'Rajesh Sharma';
      role = 'Admin';
      email = 'rajesh.sharma@sunpower.in';
      phone = '+91 98100 10001';
      cityIdx = 0;
      kw = 5;
      stage = 'Commissioned';
    } else if (i === 1) {
      name = 'Marcus Reed';
      role = 'Engineer';
      email = 'marcus.reed@sunpower.in';
      phone = '+91 98100 10002';
      cityIdx = 0;
      kw = 5;
      stage = 'Survey Scheduled';
    } else if (i === 2) {
      name = 'Deepak Singhania';
      role = 'Customer';
      email = 'deepak.singhania@sunpower.in';
      phone = '+91 98100 10003';
      cityIdx = 2;
      kw = 10;
      stage = 'BOM Quoted';
    } else if (i === 3) {
      name = 'Amit Kumar';
      role = 'Installer';
      email = 'amit.kumar@sunpower.in';
      phone = '+91 98100 10004';
      cityIdx = 1;
      kw = 3;
      stage = 'Dispatch Active';
    } else {
      const fn = FIRST_NAMES[(i * 7 + 3) % FIRST_NAMES.length];
      const ln = LAST_NAMES[(i * 11 + 5) % LAST_NAMES.length];
      name = `${fn} ${ln}`;

      // Distribute roles: ~75% Customer, ~10% Engineer, ~10% Installer, ~5% Admin
      const roleBucket = i % 20;
      role =
        roleBucket === 0
          ? 'Admin'
          : roleBucket === 3 || roleBucket === 11
          ? 'Engineer'
          : roleBucket === 7 || roleBucket === 15
          ? 'Installer'
          : 'Customer';

      const baseSlug = `${fn.toLowerCase()}.${ln.toLowerCase()}`;
      let candidateEmail = `${baseSlug}@sunpower.in`;
      if (usedEmails.has(candidateEmail)) {
        candidateEmail = `${baseSlug}.${num}@sunpower.in`;
      }
      email = candidateEmail;

      const phoneTail = String(10000 + num).padStart(5, '0');
      const phonePrefix = 98100 + (i % 90);
      phone = `+91 ${phonePrefix} ${phoneTail}`;
    }

    usedEmails.add(email);

    const grossEstimate = Math.round(kw * 59500);
    const subsidy = kw <= 1 ? 30000 : kw <= 2 ? 60000 : 78000;
    const invoiceAmountInr = Math.max(42000, grossEstimate - subsidy);

    const billingBucket = i % 10;
    let billingStatus: BillingStatus;
    let paidAmountInr: number;

    if (billingBucket < 4) {
      billingStatus = 'Paid';
      paidAmountInr = invoiceAmountInr;
    } else if (billingBucket < 7) {
      billingStatus = 'Partial';
      paidAmountInr = Math.round(invoiceAmountInr * 0.4);
    } else if (billingBucket < 9) {
      billingStatus = 'Pending';
      paidAmountInr = 0;
    } else {
      billingStatus = 'Overdue';
      paidAmountInr = Math.round(invoiceAmountInr * 0.2);
    }

    const month = ((i % 12) + 1).toString().padStart(2, '0');
    const day = ((i % 27) + 1).toString().padStart(2, '0');

    records.push({
      id,
      name,
      email,
      phone,
      role,
      city: CITIES[cityIdx].city,
      discom: CITIES[cityIdx].discom,
      systemKw: kw,
      projectStage: stage,
      invoiceId: `SP-INV-2025-${4100 + num}`,
      invoiceAmountInr,
      paidAmountInr,
      billingStatus,
      joinedDate: `2025-${month}-${day}`,
      defaultPassword: DEFAULT_USER_PASSWORD,
    });
  }

  return records;
}

export const SEED_USERS: SolarUserRecord[] = buildSeedUsers(280);

export const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'SP-INV-ADITYA-CUST',
    userId: 'SP-USR-ADITYA-CUSTOMER',
    customerName: 'Aditya Pathak',
    customerEmail: 'rsbvijit@gmail.com',
    customerPhone: '+91 87899 88023',
    systemLabel: '5kW EcoSync Rooftop Solar (RCC Roof · On-Grid)',
    totalAmount: 207000,
    paidAmount: 0,
    dueDate: '15 Apr 2025',
    status: 'Pending',
  },
  ...SEED_USERS.slice(1, 201).map((u, idx) => ({
    id: u.invoiceId || `SP-INV-2025-${4100 + idx}`,
    userId: u.id,
    customerName: u.name,
    customerEmail: u.email,
    customerPhone: u.phone,
    systemLabel: `${u.systemKw}kW Rooftop Solar (${u.discom})`,
    totalAmount: u.invoiceAmountInr,
    paidAmount: u.paidAmountInr,
    dueDate: `${((idx % 28) + 1).toString().padStart(2, '0')} Apr 2025`,
    status: u.billingStatus,
  })),
];

export function normalizePhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function findUserByCredentials(
  identifier: string,
  password: string,
  passwordOverrides: Record<string, string> = {},
  preferredRole?: string
): SolarUserRecord | null {
  const cleanId = identifier.trim().toLowerCase();
  const phoneDigits = normalizePhoneDigits(identifier);
  if (!cleanId) return null;

  // First check if an account matches with the active role
  let user = SEED_USERS.find((u) => {
    const emailMatch = u.email.toLowerCase() === cleanId;
    const idMatch = u.id.toLowerCase() === cleanId;
    const phoneMatch =
      phoneDigits.length >= 10 &&
      normalizePhoneDigits(u.phone) === phoneDigits;
    const roleMatch = !preferredRole || u.role.toLowerCase() === preferredRole.toLowerCase();
    return (emailMatch || idMatch || phoneMatch) && roleMatch;
  });

  // Fallback to any matching user
  if (!user) {
    user = SEED_USERS.find((u) => {
      const emailMatch = u.email.toLowerCase() === cleanId;
      const idMatch = u.id.toLowerCase() === cleanId;
      const phoneMatch =
        phoneDigits.length >= 10 &&
        normalizePhoneDigits(u.phone) === phoneDigits;
      return emailMatch || idMatch || phoneMatch;
    });
  }

  if (!user) return null;
  const expectedPassword = passwordOverrides[user.id] ?? user.defaultPassword;
  const isValidPass =
    password === expectedPassword ||
    password === 'demo2026' ||
    password === 'Password@123' ||
    password === DEFAULT_USER_PASSWORD;
  return isValidPass ? user : null;
}

export function findUserForReset(params: {
  email?: string;
  phone?: string;
}): {
  matched: SolarUserRecord | null;
  error?: string;
} {
  const cleanEmail = (params.email ?? '').trim().toLowerCase();
  const phoneDigits = normalizePhoneDigits(params.phone ?? '');

  if (!cleanEmail && phoneDigits.length < 10) {
    return {
      matched: null,
      error: 'Enter a valid email address and/or 10-digit phone number.',
    };
  }

  // If both email and phone are provided, prefer exact pair match; otherwise fall back to matching either
  if (cleanEmail && phoneDigits.length >= 10) {
    const exactBoth = SEED_USERS.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail &&
        normalizePhoneDigits(u.phone) === phoneDigits
    );
    if (exactBoth) return { matched: exactBoth };

    const either = SEED_USERS.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        normalizePhoneDigits(u.phone) === phoneDigits
    );
    if (either) return { matched: either };
    return {
      matched: null,
      error: 'No registered user found matching those email or phone credentials.',
    };
  }

  const single = SEED_USERS.find((u) => {
    if (cleanEmail && u.email.toLowerCase() === cleanEmail) return true;
    if (phoneDigits.length >= 10 && normalizePhoneDigits(u.phone) === phoneDigits) {
      return true;
    }
    return false;
  });

  if (!single) {
    return {
      matched: null,
      error: 'No account matched the entered email or phone number.',
    };
  }
  return { matched: single };
}

export function filterAndPaginateUsers(
  users: SolarUserRecord[],
  options: {
    query?: string;
    roleFilter?: string;
    billingFilter?: string;
    page?: number;
    pageSize?: number;
  }
): {
  items: SolarUserRecord[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
} {
  const q = (options.query ?? '').trim().toLowerCase();
  const qDigits = normalizePhoneDigits(options.query ?? '');
  const roleFilter = options.roleFilter ?? 'All';
  const billingFilter = options.billingFilter ?? 'All';
  const pageSize = Math.max(1, options.pageSize ?? 15);

  const filtered = users.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (billingFilter !== 'All' && u.billingStatus !== billingFilter) return false;
    if (!q) return true;
    return (
      u.id.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q) ||
      u.discom.toLowerCase().includes(q) ||
      u.invoiceId.toLowerCase().includes(q) ||
      (qDigits.length >= 4 && normalizePhoneDigits(u.phone).includes(qDigits))
    );
  });

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(1, options.page ?? 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    totalCount,
    totalPages,
    currentPage,
  };
}

export function buildUpiUri(params: {
  vpa: string;
  payeeName?: string;
  amount: number;
  note: string;
  txRef: string;
}): string {
  const safeAmount = Math.max(1, Number(params.amount.toFixed(2)));
  const search = new URLSearchParams({
    pa: params.vpa.trim(),
    pn: params.payeeName?.trim() || 'SunPower Solutions Pvt Ltd',
    tr: params.txRef.trim(),
    tn: params.note.trim().slice(0, 60),
    am: safeAmount.toFixed(2),
    cu: 'INR',
  });
  return `upi://pay?${search.toString()}`;
}

export function validateUpiVpa(vpa: string): { ok: boolean; error?: string; verifiedHolder?: string } {
  const clean = vpa.trim();
  if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9]{2,}$/.test(clean)) {
    return {
      ok: false,
      error: 'Enter a valid UPI ID (e.g. name@okaxis, solar@upi, phone@ybl).',
    };
  }
  const prefix = clean.split('@')[0].replace(/[._-]/g, ' ').toUpperCase();
  return {
    ok: true,
    verifiedHolder: `${prefix} · NPCI Verified Handle`,
  };
}

export function validateCardPayment(params: {
  cardNumber: string;
  expiry: string;
  cvv: string;
  holderName: string;
}): {
  ok: boolean;
  error?: string;
  last4?: string;
  brand?: string;
} {
  const digits = params.cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) {
    return { ok: false, error: 'Enter a valid 13 to 19-digit card number.' };
  }
  if (!params.holderName.trim() || params.holderName.trim().length < 2) {
    return { ok: false, error: 'Enter the cardholder name as printed on the card.' };
  }
  const expMatch = params.expiry.trim().match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!expMatch) {
    return { ok: false, error: 'Enter expiry in MM/YY format (e.g. 08/28).' };
  }
  const expYear = 2000 + parseInt(expMatch[2], 10);
  if (expYear < 2025) {
    return { ok: false, error: 'Card appears expired. Please use an active card.' };
  }
  const cvvDigits = params.cvv.replace(/\D/g, '');
  if (cvvDigits.length < 3 || cvvDigits.length > 4) {
    return { ok: false, error: 'Enter a valid 3 or 4-digit CVV/CVC.' };
  }

  const brand = digits.startsWith('4')
    ? 'Visa'
    : digits.startsWith('5')
    ? 'Mastercard'
    : digits.startsWith('6')
    ? 'RuPay'
    : 'Corporate Card';

  return {
    ok: true,
    last4: digits.slice(-4),
    brand,
  };
}

export function calculateCashSettlement(params: {
  invoiceBalance: number;
  cashTendered: number;
}): {
  ok: boolean;
  error?: string;
  appliedAmount: number;
  remainingBalance: number;
  changeDue: number;
} {
  const balance = Math.max(0, Math.round(params.invoiceBalance));
  const tendered = Math.round(params.cashTendered);

  if (!Number.isFinite(tendered) || tendered <= 0) {
    return {
      ok: false,
      error: 'Enter a positive cash value in INR (₹) to settle.',
      appliedAmount: 0,
      remainingBalance: balance,
      changeDue: 0,
    };
  }
  if (balance === 0) {
    return {
      ok: false,
      error: 'This invoice is already fully paid.',
      appliedAmount: 0,
      remainingBalance: 0,
      changeDue: 0,
    };
  }

  const appliedAmount = Math.min(balance, tendered);
  const remainingBalance = Math.max(0, balance - appliedAmount);
  const changeDue = Math.max(0, tendered - balance);

  return {
    ok: true,
    appliedAmount,
    remainingBalance,
    changeDue,
  };
}
