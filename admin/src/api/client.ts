const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken(): string | null {
  return localStorage.getItem('iam_token');
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Login failed');
  }
  return res.json();
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('iam_token');
    localStorage.removeItem('iam_user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || Array.isArray(err.message) ? err.message.join(', ') : 'Request failed');
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export const members = {
  list: () =>
    api<{ id: string; fullName: string; email: string | null; churchId: string }[]>('/members'),
  get: (id: string) => api<{ id: string; fullName: string; email: string | null }>(`/members/${id}`),
  create: (data: { fullName: string; email?: string }) =>
    api<{ id: string; fullName: string; email: string | null }>('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { fullName?: string; email?: string }) =>
    api<{ id: string; fullName: string; email: string | null }>(`/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => api(`/members/${id}`, { method: 'DELETE' }),
};

export const users = {
  list: () =>
    api<any[]>('/users'),
  get: (id: string) => api<any>(`/users/${id}`),
  create: (data: { fullName: string; email: string; password: string; roleId: string; churchId?: string; districtId?: string; conferenceId?: string }) =>
    api<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  invite: (data: { email: string; roleId: string; churchId?: string; districtId?: string; conferenceId?: string }) =>
    api<any>('/users/invite', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{ fullName: string; email: string; roleId: string; status: string }>) =>
    api<any>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api(`/users/${id}`, { method: 'DELETE' }),
};

export const roles = {
  list: () => api<{ id: string; name: string; description: string | null }[]>('/roles'),
  get: (id: string) =>
    api<{ id: string; name: string; description: string | null; rolePermissions: { permissionId: string }[] }>(`/roles/${id}`),
  create: (data: { name: string; description?: string }) =>
    api<any>('/roles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; description?: string }) =>
    api<any>(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api(`/roles/${id}`, { method: 'DELETE' }),
  assignPermissions: (id: string, permissionIds: string[]) =>
    api(`/roles/${id}/permissions`, { method: 'POST', body: JSON.stringify({ permissionIds }) }),
};

export const permissions = {
  list: () =>
    api<{ id: string; name: string; resource: string; action: string; description: string | null }[]>('/permissions'),
  get: (id: string) => api<any>(`/permissions/${id}`),
  create: (data: { name: string; resource: string; action: string; description?: string }) =>
    api<any>('/permissions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; resource?: string; action?: string; description?: string }) =>
    api<any>(`/permissions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api(`/permissions/${id}`, { method: 'DELETE' }),
};

export const organization = {
  conferences: {
    list: () => api<{ id: string; name: string }[]>('/organization/conferences'),
    create: (data: { name: string }) =>
      api<any>('/organization/conferences', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name: string }) =>
      api<any>(`/organization/conferences/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => api(`/organization/conferences/${id}`, { method: 'DELETE' }),
  },
  districts: {
    list: () => api<{ id: string; name: string; conferenceId: string }[]>('/organization/districts'),
    create: (data: { name: string; conferenceId: string }) =>
      api<any>('/organization/districts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name: string }) =>
      api<any>(`/organization/districts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => api(`/organization/districts/${id}`, { method: 'DELETE' }),
  },
  churches: {
    list: () => api<{ id: string; name: string; districtId: string }[]>('/organization/churches'),
    create: (data: { name: string; districtId: string }) =>
      api<any>('/organization/churches', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name: string }) =>
      api<any>(`/organization/churches/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => api(`/organization/churches/${id}`, { method: 'DELETE' }),
  },
};

export const audit = {
  scope: (params?: { resource?: string; action?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.resource) q.set('resource', params.resource);
    if (params?.action) q.set('action', params.action);
    if (params?.limit) q.set('limit', String(params.limit));
    return api<any[]>(`/audit/scope?${q}`);
  },
};
