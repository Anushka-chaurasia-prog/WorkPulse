import apiClient from './axios';

export const departmentApi = {
  /**
   * Get all departments with employee counts
   */
  getAllDepartments: async () => {
    const response = await apiClient.get('/api/departments');
    return response.data;
  },

  /**
   * Get department by ID
   * @param {string} id - Department UUID
   */
  getDepartmentById: async (id) => {
    const response = await apiClient.get(`/api/departments/${id}`);
    return response.data;
  },

  /**
   * Create a new department
   * @param {Object} data - { name: string }
   */
  createDepartment: async (data) => {
    const response = await apiClient.post('/api/departments', data);
    return response.data;
  },

  /**
   * Update an existing department
   * @param {string} id - Department UUID
   * @param {Object} data - { name: string }
   */
  updateDepartment: async (id, data) => {
    const response = await apiClient.put(`/api/departments/${id}`, data);
    return response.data;
  },

  /**
   * Delete a department by ID
   * @param {string} id - Department UUID
   */
  deleteDepartment: async (id) => {
    const response = await apiClient.delete(`/api/departments/${id}`);
    return response.data;
  },
};

export default departmentApi;
