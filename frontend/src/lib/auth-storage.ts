export class AuthStorage {
  private static TOKEN_KEY = 'gct_auth_token';
  private static REFRESH_KEY = 'gct_refresh_token';
  private static USER_KEY = 'gct_user';

  static setTokens(access: string, refresh: string) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.TOKEN_KEY, access);
      localStorage.setItem(this.REFRESH_KEY, refresh);
    }
  }

  static setUser(user: any) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_KEY);
    }
    return null;
  }

  static getUser(): any | null {
    if (typeof window !== 'undefined') {
      const userStr = sessionStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  static async getValidToken(): Promise<string> {
    const token = this.getAccessToken();
    if (token) {
      // Check if token is still valid (basic check)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          return token;
        }
      } catch {
        // Invalid token format
      }
    }
    
    // Try to refresh
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No authentication');
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error('Session expired');
      }
      
      const data = await response.json();
      this.setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch (error) {
      this.clear();
      throw new Error('Session expired');
    }
  }

  static clear() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.REFRESH_KEY);
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}