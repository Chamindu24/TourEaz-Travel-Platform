import axios from '../axios';

const toursAPI = {
  // Get all tours
  getAll: async () => {
    try {
      const response = await axios.get('/tours');
      return response.data;
    } catch (error) {
      console.error('Error fetching tours:', error);
      throw error;
    }
  },

  // Get tour by ID
  getById: async (tourId) => {
    try {
      const response = await axios.get(`/tours/${tourId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tour:', error);
      throw error;
    }
  },

  // Get user's tour bookings
  getMy: async () => {
    try {
      const response = await axios.get('/tour-bookings/my', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error fetching tour bookings:', error);
      throw error;
    }
  }
};

export default toursAPI;
