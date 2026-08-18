const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export async function fetchApi(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;
  
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
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
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
    
    return await response.json();
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
}
