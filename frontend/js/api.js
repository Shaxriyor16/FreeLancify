// api.js
const API_BASE = 'http://localhost:8000/api/v1';

async function request(method, endpoint, body = null, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  
  if (auth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(API_BASE + endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });

    if (res.status === 401 && auth) {
      // Possible token expiration, attempt refresh
      await refreshToken();
      // Retry once with new token
      const newToken = localStorage.getItem('access_token');
      if (newToken) headers['Authorization'] = `Bearer ${newToken}`;
      
      const retryRes = await fetch(API_BASE + endpoint, {
        method, headers, body: body ? JSON.stringify(body) : null
      });
      
      if (!retryRes.ok) {
        const err = await retryRes.json();
        throw new Error(err.detail || 'Authentication failed');
      }
      return retryRes.json();
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Something went wrong');
    }

    return res.json();
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) { 
    // Trigger logout logic
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login.html';
    return; 
  }
  
  try {
    const res = await api.publicPost('/auth/refresh', { refresh_token: refresh });
    localStorage.setItem('access_token', res.access_token);
  } catch (err) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login.html';
  }
}

window.api = {
  get: (url) => request('GET', url),
  post: (url, data) => request('POST', url, data),
  patch: (url, data) => request('PATCH', url, data),
  delete: (url) => request('DELETE', url),
  
  publicGet: (url) => request('GET', url, null, false),
  publicPost: (url, data) => request('POST', url, data, false),
};
