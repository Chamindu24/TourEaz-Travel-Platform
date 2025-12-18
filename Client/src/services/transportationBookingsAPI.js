import axios from '../axios';

const transportationBookingsAPI = {
  // Create a transportation booking
  create: async (data) => {
    const res = await axios.post('/transportation-bookings', data, { withCredentials: true });
    return res.data;
  },

  // Get current user's transportation bookings
  getMy: async () => {
    const res = await axios.get('/transportation-bookings/my', { withCredentials: true });
    return res.data;
  },

  // Admin: list all bookings with optional query
  getAll: async (queryParams = '') => {
    const res = await axios.get(`/transportation-bookings${queryParams ? `?${queryParams}` : ''}`, { withCredentials: true });
    return res.data;
  },

  // Admin: update booking status
  updateStatus: async (id, payload) => {
    const res = await axios.put(`/transportation-bookings/${id}/status`, payload, { withCredentials: true });
    return res.data;
  },

  // Admin: delete booking
  remove: async (id) => {
    const res = await axios.delete(`/transportation-bookings/${id}`, { withCredentials: true });
    return res.data;
  }
};

export default transportationBookingsAPI;
