const API_BASE = '/api';

export async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const errData = await response.json();
      errorDetail = errData.detail || JSON.stringify(errData);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Roles & Health
  getRoles: () => fetchJson('/roles'),
  getHealth: () => fetchJson('/health'),

  // Leads
  getLeads: () => fetchJson('/leads'),
  createLead: (data) => fetchJson('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id, data) => fetchJson(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Surveys
  getSurveys: () => fetchJson('/surveys'),
  approveSurvey: (id) => fetchJson(`/surveys/${id}/approve`, { method: 'POST' }),
  updateSurvey: (id, data) => fetchJson(`/surveys/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Inventory & BoM
  getInventory: () => fetchJson('/inventory'),
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

  // Installations
  getInstallations: () => fetchJson('/installations'),
  updateInstallation: (id, data) => fetchJson(`/installations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  completeInstallation: (id, signature, notes) =>
    fetchJson(`/installations/${id}/complete?customer_signature_base64=${encodeURIComponent(signature)}&completion_notes=${encodeURIComponent(notes)}`, { method: 'POST' }),

  // Service Tickets
  getTickets: () => fetchJson('/tickets'),
  createTicket: (data) => fetchJson('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  updateTicket: (id, data) => fetchJson(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Employees
  getEmployees: () => fetchJson('/employees'),
  updateAttendance: (id, status) => fetchJson(`/employees/${id}/attendance?attendance_status=${status}`, { method: 'PUT' }),

  // Analytics
  getAnalytics: () => fetchJson('/analytics'),
};
