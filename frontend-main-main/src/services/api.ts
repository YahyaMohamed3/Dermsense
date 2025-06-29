interface PatientSignupRequest {
  email: string;
  password: string;
  full_name?: string;
}

interface PatientLoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  session: {
    access_token: string;
    refresh_token: string;
  };
  user: {
    id: string;
    email: string;
  };
}

const API_BASE_URL = 'http://localhost:8000'; // Update this to your backend URL

export const authAPI = {
  async signup(data: PatientSignupRequest): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/patient/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Signup failed');
    }

    return response.json();
  },

  async login(data: PatientLoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/patient/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    const result = await response.json();
    
    // Save session to localStorage
    if (result.session?.access_token) {
      localStorage.setItem('access_token', result.session.access_token);
      localStorage.setItem('refresh_token', result.session.refresh_token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }

    return result;
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};