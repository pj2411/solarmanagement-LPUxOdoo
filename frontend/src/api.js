const API_BASE = '/api';

export async function fetchJson(endpoint, options = {}) {
  const url = endpoint.startsWith('/api') ? endpoint : `${API_BASE}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('access_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // If body is FormData, delete Content-Type so browser sets boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const responseText = await response.text();
  let responseData = null;
  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  if (!response.ok) {
    let errorDetail = `API Request Failed (HTTP ${response.status})`;
    if (responseData && typeof responseData === 'object') {
      if (responseData.error && responseData.error.message) {
        errorDetail = responseData.error.message;
      } else if (responseData.detail) {
        errorDetail = typeof responseData.detail === 'string' ? responseData.detail : JSON.stringify(responseData.detail);
      } else if (responseData.message) {
        errorDetail = responseData.message;
      } else {
        errorDetail = JSON.stringify(responseData);
      }
    } else if (typeof responseData === 'string' && responseData.trim()) {
      errorDetail = responseData;
    }
    throw new Error(errorDetail);
  }

  // If response is wrapped in standard API envelope: { success: true, data: ... }
  // unwrap data for views that expect raw array/object, while preserving access if needed
  if (responseData && typeof responseData === 'object' && responseData.success === true && 'data' in responseData) {
    return responseData.data;
  }

  return responseData;
}

export const api = {
  // Roles & Health
  getRoles: () => fetchJson('/roles'),
  getHealth: () => fetchJson('/health'),

  // Authentication & Session Flow
  login: (email, password) => fetchJson('/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  requestOtp: (phone) => fetchJson('/v1/auth/request-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (phone, otp) => fetchJson('/v1/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) }),
  refreshToken: (refreshToken) => fetchJson('/v1/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) }),
  register: (data) => fetchJson('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email) => fetchJson('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (email, otp, new_password) => fetchJson('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, new_password }) }),

  // Leads
  getLeads: () => fetchJson('/leads'),
  createLead: (data) => fetchJson('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id, data) => fetchJson(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Surveys
  getSurveys: () => fetchJson('/surveys'),
  createSurvey: (data) => fetchJson('/surveys', { method: 'POST', body: JSON.stringify(data) }),
  approveSurvey: (id) => fetchJson(`/surveys/${id}/approve`, { method: 'POST' }),
  unapproveSurvey: (id) => fetchJson(`/surveys/${id}`, { method: 'PUT', body: JSON.stringify({ is_approved: false }) }),
  updateSurvey: (id, data) => fetchJson(`/surveys/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Inventory & BoM
  getInventory: () => fetchJson('/inventory'),
  restockInventory: (id, quantity) => fetchJson(`/inventory/${id}/restock`, { method: 'POST', body: JSON.stringify({ quantity }) }),
  getBomTemplates: () => fetchJson('/bom/templates'),
  calculateBom: (kw, type) => fetchJson(`/bom/calculate?capacity_kw=${kw}&system_type=${type}`),

  // Quotations
  getQuotations: () => fetchJson('/quotations'),
  createQuotation: (data) => fetchJson('/quotations', { method: 'POST', body: JSON.stringify(data) }),
  approveQuotation: (id) => fetchJson(`/quotations/${id}/approve`, { method: 'POST' }),

  // Orders & Payment
  getOrders: () => fetchJson('/orders'),
  recordPayment: (id, data) => fetchJson(`/orders/${id}/pay`, { method: 'POST', body: JSON.stringify(data) }),
  updateSubsidy: (id, status) => fetchJson(`/orders/${id}/subsidy?status=${status}`, { method: 'PUT' }),

  // Warehouse & Serials
  getSerials: () => fetchJson('/warehouse/serials'),
  dispatchSerial: (data) => fetchJson('/warehouse/dispatch', { method: 'POST', body: JSON.stringify(data) }),
  confirmDelivery: (serial) => fetchJson(`/warehouse/delivery-confirm/${encodeURIComponent(serial)}`, { method: 'POST' }),

  // Installations & PWA Handover / Sync
  getInstallations: () => fetchJson('/installations'),
  updateInstallation: (id, data) => fetchJson(`/installations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  syncInstallation: (id, data) => fetchJson(`/v1/installations/${id}/sync`, { method: 'POST', body: JSON.stringify(data) }),
  handoverInstallation: (id, data) => fetchJson(`/v1/installations/${id}/handover`, { method: 'POST', body: JSON.stringify(data) }),
  completeInstallation: (id, signature, notes) =>
    fetchJson(`/installations/${id}/complete?customer_signature_base64=${encodeURIComponent(signature)}&completion_notes=${encodeURIComponent(notes)}`, { method: 'POST' }),

  // Media Upload with GPS Watermark
  uploadMediaWithGps: (formData) => fetchJson('/v1/media/upload', { method: 'POST', body: formData }),

  // Service Tickets
  getTickets: () => fetchJson('/tickets'),
  createTicket: (data) => fetchJson('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  updateTicket: (id, data) => fetchJson(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Employees
  getEmployees: () => fetchJson('/employees'),
  getEmployeeJobs: (id) => fetchJson(`/employees/${id}/jobs`),
  updateAttendance: (id, status) => fetchJson(`/employees/${id}/attendance?attendance_status=${encodeURIComponent(status)}`, { method: 'PUT', body: JSON.stringify({ attendance_status: status }) }),
  updateAttendanceV1: (id, status) => fetchJson(`/v1/employees/${id}/attendance?attendance_status=${encodeURIComponent(status)}`, { method: 'PUT', body: JSON.stringify({ attendance_status: status }) }),

  // Analytics
  getAnalytics: () => fetchJson('/analytics'),
};
