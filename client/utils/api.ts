// API utility functions for NetSafi ISP Billing System

const API_BASE_URL = '/api';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string; total?: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Router API functions
export const routerApi = {
  getAll: () => apiRequest('/routers'),
  getById: (id: number) => apiRequest(`/routers/${id}`),
  create: (data: any) => apiRequest('/routers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: number, data: any) => apiRequest(`/routers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  updateStatus: (id: number, status: string, isOnline: boolean) => 
    apiRequest(`/routers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, is_online: isOnline })
    }),
  sync: (id: number) => apiRequest(`/routers/${id}/sync`, { method: 'POST' }),
  delete: (id: number) => apiRequest(`/routers/${id}`, { method: 'DELETE' }),
  getStats: () => apiRequest('/routers/stats'),
  assignToReseller: (data: any) => apiRequest('/routers/assign', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// Plans API functions
export const plansApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/plans${queryString}`);
  },
  getById: (id: number) => apiRequest(`/plans/${id}`),
  create: (data: any) => apiRequest('/plans', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: number, data: any) => apiRequest(`/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  toggle: (id: number) => apiRequest(`/plans/${id}/toggle`, { method: 'PATCH' }),
  duplicate: (id: number, newName: string) => apiRequest(`/plans/${id}/duplicate`, {
    method: 'POST',
    body: JSON.stringify({ new_name: newName })
  }),
  delete: (id: number) => apiRequest(`/plans/${id}`, { method: 'DELETE' }),
  getStats: () => apiRequest('/plans/stats'),
  getCategories: () => apiRequest('/plans/categories')
};

// Resellers API functions
export const resellersApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/resellers${queryString}`);
  },
  getById: (id: number) => apiRequest(`/resellers/${id}`),
  create: (data: any) => apiRequest('/resellers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: number, data: any) => apiRequest(`/resellers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  updateStatus: (id: number, status: string) => apiRequest(`/resellers/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  updateVerification: (id: number, status: string, notes?: string) => 
    apiRequest(`/resellers/${id}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({ verification_status: status, notes })
    }),
  updateCredit: (id: number, amount: number, operation: 'add' | 'subtract', notes?: string) =>
    apiRequest(`/resellers/${id}/credit`, {
      method: 'PATCH',
      body: JSON.stringify({ amount, operation, notes })
    }),
  regenerateApi: (id: number) => apiRequest(`/resellers/${id}/regenerate-api`, { method: 'POST' }),
  delete: (id: number) => apiRequest(`/resellers/${id}`, { method: 'DELETE' }),
  getStats: () => apiRequest('/resellers/stats'),
  getTiers: () => apiRequest('/resellers/tiers')
};

// Vouchers API functions
export const vouchersApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/vouchers${queryString}`);
  },
  getById: (id: number) => apiRequest(`/vouchers/${id}`),
  generate: (data: any) => apiRequest('/vouchers/generate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: number, data: any) => apiRequest(`/vouchers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  cancel: (id: number, reason?: string) => apiRequest(`/vouchers/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason })
  }),
  use: (code: string, data: any) => apiRequest(`/vouchers/${code}/use`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getStats: () => apiRequest('/vouchers/stats'),
  export: (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/vouchers/export${queryString}`);
  },
  getBatchInfo: (batchId: string) => apiRequest(`/vouchers/batch/${batchId}`)
};

// Customers API functions
export const customersApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/customers${queryString}`);
  },
  getById: (id: number) => apiRequest(`/customers/${id}`),
  create: (data: any) => apiRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: number, data: any) => apiRequest(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  updateStatus: (id: number, status: string, reason?: string) =>
    apiRequest(`/customers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason })
    }),
  updatePlan: (id: number, planId: number, autoRenew: boolean = false) =>
    apiRequest(`/customers/${id}/plan`, {
      method: 'PATCH',
      body: JSON.stringify({ plan_id: planId, auto_renew: autoRenew })
    }),
  sendMessage: (id: number, message: string, channel: string = 'sms', subject?: string) =>
    apiRequest(`/customers/${id}/message`, {
      method: 'POST',
      body: JSON.stringify({ message, channel, subject })
    }),
  delete: (id: number) => apiRequest(`/customers/${id}`, { method: 'DELETE' }),
  getStats: () => apiRequest('/customers/stats'),
  search: (query: string, limit: number = 50) => {
    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    return apiRequest(`/customers/search?${params}`);
  }
};

// Users API functions (legacy support)
export const usersApi = {
  getAll: () => apiRequest('/users'),
  getById: (id: number) => apiRequest(`/users/${id}`),
  create: (data: any) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: number, data: any) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  updateStatus: (id: number, status: string) => apiRequest(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  delete: (id: number) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
  getStats: () => apiRequest('/users/stats')
};

// Invoices API functions
export const invoicesApi = {
  getAll: () => apiRequest('/invoices'),
  getById: (id: number) => apiRequest(`/invoices/${id}`),
  create: (data: any) => apiRequest('/invoices', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateStatus: (id: number, status: string) => apiRequest(`/invoices/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  processPayment: (id: number, data: any) => apiRequest(`/invoices/${id}/payment`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  getStats: () => apiRequest('/invoices/stats'),
  getMonthlyRevenue: () => apiRequest('/invoices/revenue/monthly')
};

// System API functions
export const systemApi = {
  health: () => apiRequest('/health'),
  dbHealth: () => apiRequest('/health/db'),
  ping: () => apiRequest('/ping')
};

// Helper function to handle API errors
export const handleApiError = (error: any, defaultMessage: string = 'An error occurred') => {
  if (error?.error) {
    return error.error;
  }
  if (error?.message) {
    return error.message;
  }
  return defaultMessage;
};

// Helper function to show success message
export const showSuccessMessage = (message: string) => {
  // You can integrate this with your notification system
  console.log('Success:', message);
  // Example: toast.success(message);
};

// Helper function to show error message
export const showErrorMessage = (message: string) => {
  // You can integrate this with your notification system
  console.error('Error:', message);
  // Example: toast.error(message);
};

export default {
  routerApi,
  plansApi,
  resellersApi,
  vouchersApi,
  customersApi,
  usersApi,
  invoicesApi,
  systemApi,
  handleApiError,
  showSuccessMessage,
  showErrorMessage
};
