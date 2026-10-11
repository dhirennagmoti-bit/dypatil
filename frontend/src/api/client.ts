import {
  User,
  Policy,
  Claim,
  ClaimDetailResponse,
  AuditLog,
  HashChainVerificationResult,
  Insurer,
  InsurerMetrics,
  AiExtraction,
} from '../types';

const API_BASE = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('insurechain_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('insurechain_token', token);
  } else {
    localStorage.removeItem('insurechain_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) {
        errorMsg = errorJson.message;
      } else if (errorJson.error) {
        errorMsg = errorJson.error;
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: { email: string; password: string; fullName: string; role?: string; insurerId?: string }) =>
      request<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<User>('/auth/me'),
  },

  policies: {
    getAll: () => request<Policy[]>('/policies'),
    getById: (id: string) => request<Policy>(`/policies/${id}`),
    getByInsurer: (insurerId: string) => request<Policy[]>(`/policies/insurer/${insurerId}`),
    getMy: () => request<Policy[]>('/policies/my'),
    enroll: (policyId: string) =>
      request<void>(`/policies/${policyId}/enroll`, { method: 'POST' }),
    create: (data: Partial<Policy>) =>
      request<Policy>('/policies', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  claims: {
    getAll: () => request<Claim[]>('/claims'),
    getById: (id: string) => request<ClaimDetailResponse>(`/claims/${id}`),
    submit: (data: {
      policyId: string;
      category: string;
      requestedAmount: number;
      incidentId?: string;
      incidentDate: string;
      narrative: string;
      incidentLocation?: string;
      evidence?: Array<{ fileName: string; fileType?: string; fileUrl: string; fileSizeBytes?: number; description?: string }>;
    }) =>
      request<ClaimDetailResponse>('/claims', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    transition: (
      id: string,
      data: {
        targetStatus: string;
        approvedAmount?: number;
        decisionReason: string;
        notes?: string;
      }
    ) =>
      request<ClaimDetailResponse>(`/claims/${id}/transition`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  audit: {
    getLogs: (params?: { claimId?: string; insurerId?: string }) => {
      const search = new URLSearchParams();
      if (params?.claimId) search.set('claimId', params.claimId);
      if (params?.insurerId) search.set('insurerId', params.insurerId);
      const query = search.toString() ? `?${search.toString()}` : '';
      return request<AuditLog[]>(`/audit/logs${query}`);
    },
    verifyChain: () => request<HashChainVerificationResult>('/audit/verify-chain'),
  },

  insurers: {
    getAll: () => request<Insurer[]>('/insurers'),
    getById: (id: string) => request<Insurer>(`/insurers/${id}`),
    getMetrics: (id: string) => request<InsurerMetrics>(`/insurers/${id}/metrics`),
    getUsers: (id: string) => request<User[]>(`/insurers/${id}/users`),
  },

  ai: {
    getReview: (claimId: string) => request<AiExtraction>(`/ai/review/${claimId}`),
    reanalyze: (claimId: string) =>
      request<AiExtraction>(`/ai/reanalyze/${claimId}`, { method: 'POST' }),
  },
};
