
// --- TYPE DEFINITIONS ---
export interface PatientSignupRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface PatientLoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  session: {
    access_token: string;
    refresh_token: string;
    [key: string]: any;
  };
  user: {
    id: string;
    email: string;
    [key: string]: any;
  };
}

export interface LesionData {
    nickname: string;
    body_part: string;
}

export interface CaseStatusUpdate {
    status: string;
    notes?: string;
}

export type SubmitCasePayload = Record<string, any>;


// --- CORE LOGIC ---
const API_BASE_URL = 'https://dermsense-1067130927657.us-central1.run.app';
const AUTH_TOKEN_KEY = 'derma-sense-auth-token';

/**
 * Retrieves the authentication token from localStorage.
 * This function is exported for potential direct use but is also included in the 'api' object.
 * @returns The token string or null if not found.
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * A robust helper function for making all API requests.
 */
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'An unknown server error occurred.' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

// --- UNIFIED API SERVICE OBJECT ---
export const api = {
  // --- Authentication ---
  async signup(data: PatientSignupRequest) {
    return apiFetch('/api/auth/patient/signup', { method: 'POST', body: JSON.stringify(data) });
  },
  async login(data: PatientLoginRequest): Promise<LoginResponse> {
    const response: LoginResponse = await apiFetch('/api/auth/patient/login', { method: 'POST', body: JSON.stringify(data) });
    if (response.session?.access_token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.session.access_token);
    }
    return response;
  },
  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  // FIX: This line makes getAuthToken available as a method on the 'api' object.
  getAuthToken: getAuthToken,
  
  // --- Clinical-Specific Auth ---
  async clinicalLogin(password: string) {
    const response = await apiFetch('/api/auth/login/clinical', { method: 'POST', body: JSON.stringify({ password }) });
    if (response.success) {
      localStorage.setItem('isClinicalAuthenticated', 'true');
    }
    return response;
  },
  clinicalLogout() {
      localStorage.removeItem('isClinicalAuthenticated');
  },
  
  // --- Patient & Lesion Data ---
  getMyProfile: () => apiFetch('/api/auth/patient/me'),
  getMyLesions: () => apiFetch('/api/lesions'),
  getLesionScans: (lesionId: number) => apiFetch(`/api/lesions/${lesionId}/scans`),
  getLesionComparison: (lesionId: number) => apiFetch(`/api/lesions/${lesionId}/compare`),
  createLesion: (data: LesionData) => apiFetch('/api/lesions', { method: 'POST', body: JSON.stringify(data) }),
  deleteLesion: (lesionId: number) => apiFetch(`/api/lesions/${lesionId}`, { method: 'DELETE' }),

  // --- Case & Scan Management ---
  submitCase: (payload: SubmitCasePayload) => apiFetch('/api/cases/submit', { method: 'POST', body: JSON.stringify(payload) }),
  getCases: () => apiFetch('/api/cases'),
  updateCaseStatus: (caseId: number, data: CaseStatusUpdate) => apiFetch(`/api/cases/${caseId}/status`, { method: 'PUT', body: JSON.stringify(data) }),
};