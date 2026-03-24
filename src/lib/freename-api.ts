// lib/freename-api.ts

// Module-level token cache — persists across requests within the same server process
let _cachedToken: string | null = null;
let _tokenExpiresAt = 0;
let _refreshToken: string | null = null;

class FreenameAPI {
  baseURL: string;
  username: string | undefined;
  password: string | undefined;
  apiPath: string;

  constructor() {
    this.baseURL = process.env.FREENAME_API_URL || 'https://apis.freename.io';
    this.username = process.env.FREENAME_API_EMAIL;
    this.password = process.env.FREENAME_API_PASSWORD;
    this.apiPath = 'reseller-logic';
  }

  /**
   * Get a valid access token, logging in or refreshing as needed.
   */
  async getAccessToken() {
    const now = Date.now();

    // Return cached token if still valid (with 60s buffer)
    if (_cachedToken && _tokenExpiresAt > now + 60000) {
      return _cachedToken;
    }

    // Try refresh token first
    if (_refreshToken && _cachedToken) {
      try {
        const refreshResp = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${_cachedToken}`,
          },
          body: JSON.stringify({ refreshToken: _refreshToken }),
        });

        if (refreshResp.ok) {
          const data = await refreshResp.json();
          _cachedToken = data.access_token;
          _tokenExpiresAt = now + (data.expires_in * 1000);
          return _cachedToken;
        }
      } catch (err: unknown) {
        console.warn('Token refresh failed, will re-login:', err instanceof Error ? err.message : err);
      }
    }

    // Login with credentials
    if (!this.username || !this.password) {
      throw new Error('FREENAME_API_EMAIL and FREENAME_API_PASSWORD must be set in .env.local');
    }

    const loginResp = await fetch(`${this.baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.username,
        password: this.password,
      }),
    });

    if (!loginResp.ok) {
      const errBody = await loginResp.text();
      throw new Error(`Freename login failed (${loginResp.status}): ${errBody}`);
    }

    const data = await loginResp.json();
    _cachedToken = data.access_token;
    _refreshToken = data.refresh_token;
    _tokenExpiresAt = now + (data.expires_in * 1000);

    return _cachedToken;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async request(endpoint: string, options: any = {}): Promise<any> {
    const token = await this.getAccessToken();
    const url = `${this.baseURL}/api/v1/${this.apiPath}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Freename API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // Search for domains
  async searchDomains(searchString: string) {
    return this.request(`/search?searchString=${encodeURIComponent(searchString)}`);
  }

  // Check availability
  async checkAvailability(zoneName: string) {
    const response = await this.request(`/zones/availability/${encodeURIComponent(zoneName)}`);
    return response.data;
  }

  // Create zone (domain registration)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createZone(data: any) {
    return this.request('/zones?mint=false', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        status: 'OK',
        level: 'SLD',
        chain: data.chain || 'POLYGON',
        walletAddress: data.walletAddress,
        registrationDate: new Date().toISOString(),
        records: data.records || []
      })
    });
  }

  // Trigger minting
  async triggerMinting(zoneName: string, walletAddress: string) {
    return this.request('/zones/minting', {
      method: 'POST',
      body: JSON.stringify({
        mintDetail: [{
          blockchain: 'POLYGON',
          name: zoneName
        }],
        walletAddress: walletAddress
      })
    });
  }

  // Check minting status
  async checkMintingStatus(zoneName: string) {
    return this.request(`/minting/${encodeURIComponent(zoneName)}`);
  }

  // Create records on a zone
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createRecords(zoneUuid: string, records: any[]) {
    return this.request(`/records?zone=${encodeURIComponent(zoneUuid)}`, {
      method: 'POST',
      body: JSON.stringify(records)
    });
  }

  // Fetch records for a zone
  async getRecords(zoneUuid: string) {
    return this.request(`/records?zone=${encodeURIComponent(zoneUuid)}`);
  }

  // Update a specific record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateRecord(recordUuid: string, data: any) {
    return this.request(`/records?record=${encodeURIComponent(recordUuid)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Delete a specific record
  async deleteRecord(recordUuid: string) {
    return this.request(`/records/${encodeURIComponent(recordUuid)}`, {
      method: 'DELETE'
    });
  }
}

export default FreenameAPI;
