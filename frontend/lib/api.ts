/**
 * Unified API Client for FastAPI backend integration
 * Supports JWT authentication, Razorpay payments, and error handling.
 */

const API_BASE = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  : 'http://localhost:8000';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; data?: T; error?: string; status: number }> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Prepend /api if not present
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${normalizedEndpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    // Read the stream exactly once as text to prevent "Failed to execute 'text' on 'Response': body stream already read"
    let responseText = '';
    try {
      responseText = await res.text();
    } catch {
      responseText = '';
    }

    let data: any = null;
    if (responseText && responseText.trim()) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }
    }

    if (!res.ok) {
      let errMsg = 'Request failed';
      if (typeof data === 'object' && data !== null) {
        if (typeof data.detail === 'string') {
          errMsg = data.detail;
        } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
          errMsg = data.detail[0].msg;
        } else if (data.message) {
          errMsg = data.message;
        }
      }
      return { ok: false, error: errMsg, status: res.status, data };
    }

    return { ok: true, data, status: res.status };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'Network error connecting to backend API',
      status: 0,
    };
  }
}

export const api = {
  // Authentication
  auth: {
    login: async (email: string, password: string) => {
      const res = await apiRequest<{
        access_token: string;
        token?: string;
        role?: string;
        user?: { id: number | string; full_name: string; name?: string; role: string; email: string };
      }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.ok && res.data) {
        const token = res.data.access_token || res.data.token;
        if (token) setAuthToken(token);
      }
      return res;
    },
    register: async (payload: { email: string; password: string; name: string; phone: string; role?: string }) => {
      return apiRequest('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
          full_name: payload.name,
          phone: payload.phone,
          role: payload.role || 'CUSTOMER',
        }),
      });
    },
    me: async () => {
      return apiRequest('/api/v1/auth/me', { method: 'GET' });
    },
    forgotPassword: async (emailOrPhone: string) => {
      return apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: emailOrPhone, phone_or_email: emailOrPhone }),
      });
    },
    resetPassword: async (phoneOrEmail: string, otp: string, newPass: string) => {
      return apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          phone_or_email: phoneOrEmail,
          otp,
          new_password: newPass,
        }),
      });
    },
    getGoogleAuthUrl: () => {
      return `${API_BASE}/api/v1/auth/oauth/google`;
    },
    getDigiLockerAuthUrl: () => {
      return `${API_BASE}/api/v1/auth/oauth/digilocker`;
    },
    verifyDigiLocker: async (payload: { aadhaar_or_mobile: string; otp?: string; consent: boolean; discom?: string; consumer_number?: string }) => {
      return apiRequest('/api/v1/auth/digilocker/verify', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  // CRM Leads
  leads: {
    list: async () => apiRequest('/api/leads'),
    create: async (data: any) =>
      apiRequest('/api/leads', { method: 'POST', body: JSON.stringify(data) }),
    update: async (leadId: number | string, data: any) =>
      apiRequest(`/api/leads/${leadId}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Engineering Surveys
  surveys: {
    list: async () => apiRequest('/api/surveys'),
    create: async (data: any) =>
      apiRequest('/api/surveys', { method: 'POST', body: JSON.stringify(data) }),
    update: async (surveyId: number | string, data: any) =>
      apiRequest(`/api/surveys/${surveyId}`, { method: 'PUT', body: JSON.stringify(data) }),
    approve: async (surveyId: number | string) =>
      apiRequest(`/api/surveys/${surveyId}/approve`, { method: 'POST' }),
  },

  // BoM and Quotations
  quotations: {
    list: async () => apiRequest('/api/quotations'),
    create: async (data: any) =>
      apiRequest('/api/quotations', { method: 'POST', body: JSON.stringify(data) }),
    approve: async (quotationId: number | string) =>
      apiRequest(`/api/quotations/${quotationId}/approve`, { method: 'POST' }),
    templates: async () => apiRequest('/api/bom/templates'),
    calculateBom: async (systemKw: number) =>
      apiRequest(`/api/bom/calculate?capacity_kw=${systemKw}`),
  },

  // Orders and Razorpay Payments
  orders: {
    list: async () => apiRequest('/api/orders'),
    create: async (data: any) =>
      apiRequest('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
    createRazorpayOrder: async (orderId: number | string, amountInr?: number) => {
      return apiRequest(`/api/v1/orders/${orderId}/razorpay/create-order`, {
        method: 'POST',
        body: JSON.stringify(amountInr ? { amount: amountInr, amount_inr: amountInr } : {}),
      });
    },
    verifyRazorpayPayment: async (
      orderId: number | string,
      payload: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        amount: number;
      }
    ) => {
      return apiRequest(`/api/v1/orders/${orderId}/razorpay/verify`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    settlePayment: async (orderId: number | string, payload: any) => {
      return apiRequest(`/api/v1/orders/${orderId}/pay`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  // Warehouse & Logistics
  warehouse: {
    serials: async () => apiRequest('/api/warehouse/serials'),
    dispatch: async (data: any) =>
      apiRequest('/api/warehouse/dispatch', { method: 'POST', body: JSON.stringify(data) }),
    confirmDelivery: async (serialNumber: string) =>
      apiRequest(`/api/warehouse/delivery-confirm/${encodeURIComponent(serialNumber)}`, {
        method: 'POST',
      }),
    dispatches: async () => apiRequest('/api/dispatch'),
    inventory: async () => apiRequest('/api/inventory'),
  },

  // Field Installation & Handover
  installations: {
    list: async () => apiRequest('/api/installations'),
    update: async (installId: number | string, data: any) =>
      apiRequest(`/api/installations/${installId}`, { method: 'PUT', body: JSON.stringify(data) }),
    sync: async (installId: number | string, payload: any) =>
      apiRequest(`/api/v1/installations/${installId}/sync`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    handover: async (installId: number | string, payload: any) =>
      apiRequest(`/api/v1/installations/${installId}/handover`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // Warranties & Tickets
  support: {
    warranties: async () => apiRequest('/api/warranties'),
    tickets: async () => apiRequest('/api/tickets'),
    createTicket: async (data: any) =>
      apiRequest('/api/tickets', { method: 'POST', body: JSON.stringify(data) }),
    updateTicket: async (ticketId: number | string, data: any) =>
      apiRequest(`/api/tickets/${ticketId}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Employees & Attendance
  employees: {
    list: async () => apiRequest('/api/employees'),
    jobs: async (employeeId: number | string) =>
      apiRequest(`/api/employees/${employeeId}/jobs`),
    punchAttendance: async (employeeId: number | string, data: any) =>
      apiRequest(`/api/v1/employees/${employeeId}/attendance`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Operations Analytics
  analytics: {
    dashboard: async () => apiRequest('/api/analytics'),
    recordExpense: async (data: any) =>
      apiRequest('/api/analytics/expenses', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Public Catalog
  public: {
    site: async () => apiRequest('/api/public/site'),
    packages: async () => apiRequest('/api/public/packages'),
    products: async () => apiRequest('/api/public/products'),
    testimonials: async () => apiRequest('/api/public/testimonials'),
    faqs: async () => apiRequest('/api/public/faqs'),
  },
};
