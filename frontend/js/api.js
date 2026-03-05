// API Helper Functions
class API {
  // Generic POST request
  static async post(endpoint, data = {}) {
    try {
      const isFormData = data instanceof FormData;
      const options = {
        method: 'POST',
        credentials: 'include'
      };

      // Only set Content-Type for JSON, not for FormData
      if (!isFormData) {
        options.headers = {
          'Content-Type': 'application/json'
        };
        options.body = JSON.stringify(data);
      } else {
        options.body = data;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'API Error');
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Generic GET request
  static async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'API Error');
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Generic PUT request
  static async put(endpoint, data = {}) {
    try {
      const isFormData = data instanceof FormData;
      const options = {
        method: 'PUT',
        credentials: 'include'
      };

      // Only set Content-Type for JSON, not for FormData
      if (!isFormData) {
        options.headers = {
          'Content-Type': 'application/json'
        };
        options.body = JSON.stringify(data);
      } else {
        options.body = data;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'API Error');
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Generic DELETE request
  static async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      // Check if response is valid
      if (!response || typeof response.json !== 'function') {
        throw new Error('Invalid response from server');
      }

      // Check if response has content and is JSON
      let result;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          result = await response.json();
        } catch (e) {
          // If JSON parsing fails, return default success
          result = { success: response.ok, message: 'Request completed' };
        }
      } else {
        // If no JSON content, get text
        const text = await response.text();
        result = { success: response.ok, message: text || 'Request completed' };
      }

      if (!response.ok) {
        throw new Error(result.message || 'API Error');
      }

      return result;
    } catch (error) {
      // If it's already an Error object, throw it; otherwise create one
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error.message || 'Failed to delete');
    }
  }

  // Authentication endpoints
  static async login(username, password) {
    return this.post('/auth/login', { username, password });
  }

  static async logout() {
    return this.post('/auth/logout');
  }

  static async getCurrentUser() {
    return this.get('/auth/user');
  }

  static async checkSession() {
    return this.get('/auth/check');
  }

  // Product endpoints
  static async getAllProducts() {
    return this.get('/products');
  }

  static async getProductById(id) {
    return this.get(`/products/${id}`);
  }

  static async searchProducts(searchTerm) {
    return this.get(`/products/search/products?searchTerm=${encodeURIComponent(searchTerm)}`);
  }

  static async createProduct(data) {
    return this.post('/products', data);
  }

  static async updateProduct(id, data) {
    return this.put(`/products/${id}`, data);
  }

  static async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  static async getTotalProducts() {
    return this.get('/products/total/count');
  }

  static async getLowStockProducts(threshold = 10) {
    return this.get(`/products/low-stock/list?threshold=${threshold}`);
  }

  // Bill endpoints
  static async createBill(data) {
    return this.post('/bills', data);
  }

  static async getBillById(id) {
    return this.get(`/bills/${id}`);
  }

  static async getAllBills() {
    return this.get('/bills');
  }

  static async getRecentBills(limit = 10) {
    return this.get(`/bills/recent/list?limit=${limit}`);
  }

  static async getTotalSales() {
    return this.get('/bills/stats/total-sales');
  }

  static async getTotalBills() {
    return this.get('/bills/stats/total-bills');
  }

  static async getDailySales() {
    return this.get('/bills/reports/daily');
  }

  static async getMonthlySales() {
    return this.get('/bills/reports/monthly');
  }

  static async fetchInvoiceBlob(billId) {
    const url = `${API_BASE_URL}/bills/${billId}/invoice`;
    let resp = await fetch(url, { credentials: 'include' });
    
    if (!resp.ok) {
      // If unauthorized, try public fallback route
      if (resp.status === 401) {
        const publicUrl = `${API_BASE_URL}/bills/public/${billId}/invoice`;
        try {
          const publicResp = await fetch(publicUrl);
          if (publicResp.ok) {
            return { blob: await publicResp.blob(), resp: publicResp };
          }
        } catch (e) {
          console.error('Public invoice fetch failed', e);
        }
      }

      try {
        const err = await resp.json();
        throw new Error(err.message || 'Failed to fetch invoice');
      } catch (e) {
        if (e.message) throw e;
        throw new Error('Failed to fetch invoice');
      }
    }
    
    return { blob: await resp.blob(), resp: resp };
  }

  static async viewInvoicePDF(billId) {
    try {
      const { blob } = await this.fetchInvoiceBlob(billId);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      // Revoke object URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch (error) {
      alert(error.message || 'Failed to view invoice');
    }
  }

  static async generateInvoicePDF(billId) {
    try {
      const { blob, resp } = await this.fetchInvoiceBlob(billId);
      
      // Get filename from Content-Disposition header if available
      const contentDisposition = resp.headers.get('Content-Disposition');
      let filename = `VINAYAGA_ELECTRICALS_Invoice_${billId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      this.downloadBlob(blob, filename);
    } catch (error) {
      alert(error.message || 'Invoice download failed');
    }
  }

  static downloadBlob(blob, filename) {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoke object URL after a delay
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
  }

  // Delete bill
  static async deleteBill(billId) {
    return this.delete(`/bills/${billId}`);
  }

  // User endpoints
  static async getAllUsers() {
    return this.get('/users');
  }

  static async getUserById(id) {
    return this.get(`/users/${id}`);
  }

  static async createUser(data) {
    return this.post('/users', data);
  }

  static async updateUser(id, data) {
    return this.put(`/users/${id}`, data);
  }

  static async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  static async changePassword(id, data) {
    return this.post(`/users/${id}/change-password`, data);
  }
}
