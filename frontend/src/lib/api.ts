const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.instaimage.in/api/v1';

export async function fetchApi(endpoint: string, options?: RequestInit) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL.replace(/\/$/, '')}${cleanEndpoint}`;
  
  // Get token directly from localStorage (Zustand persist key is 'auth-storage')
  let token = null;
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      token = parsed.state?.token;
    }
  } catch (e) {
    // Ignore SSR errors or parsing errors
  }

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> || {}),
  };

  // Only set Content-Type to JSON if we have a body and it's not FormData
  if (options?.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      // Only redirect on 401 if we HAD a token and we're not already on the login page
      if (response.status === 401 && typeof window !== 'undefined' && token && !window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.message;
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage.join(', ');
      }
      throw new Error(errorMessage || `API error: ${response.status} ${response.statusText}`);
    }
    
    // Handle 204 No Content
    if (response.status === 204) return null;
    
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
}

// Axios-like convenience wrappers that return { data } so callers can use res.data
const api = {
  patch: async (endpoint: string, body: any) => {
    const data = await fetchApi(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return { data };
  },
  post: async (endpoint: string, body: any) => {
    const data = await fetchApi(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return { data };
  },
};

export default api;
