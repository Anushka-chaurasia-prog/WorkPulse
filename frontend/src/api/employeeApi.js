import apiClient from './axios';

export const employeeApi = {
  /**
   * Get paginated employees with optional search and sort
   * @param {Object} params - { page, size, search, sort }
   */
  getAllEmployees: async (params = {}) => {
    const response = await apiClient.get('/api/employees', { params });
    return response.data;
  },

  /**
   * Get employee by ID
   * @param {string} id - Employee UUID
   */
  getEmployeeById: async (id) => {
    const response = await apiClient.get(`/api/employees/${id}`);
    return response.data;
  },

  /**
   * Create a new employee
   * @param {Object} data - EmployeeRequest payload
   */
  createEmployee: async (data) => {
    const response = await apiClient.post('/api/employees', data);
    return response.data;
  },

  /**
   * Update an existing employee
   * @param {string} id - Employee UUID
   * @param {Object} data - EmployeeRequest payload
   */
  updateEmployee: async (id, data) => {
    const response = await apiClient.put(`/api/employees/${id}`, data);
    return response.data;
  },

  /**
   * Delete an employee by ID
   * @param {string} id - Employee UUID
   */
  deleteEmployee: async (id) => {
    const response = await apiClient.delete(`/api/employees/${id}`);
    return response.data;
  },
};

export default employeeApi;
