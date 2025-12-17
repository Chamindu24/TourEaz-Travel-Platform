import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Typography, Paper, Button, Box, CircularProgress, Snackbar, Alert
} from '@mui/material';
import { Tabs, Tab, Badge } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// Components
import TabPanel from './components/TabPanel';
import RoomsTable from './components/RoomsTable';
import RoomInquiriesView from './components/RoomInquiriesView';
import RoomBookingsView from './components/RoomBookingsView';
import BookingDetailsDialog from './components/BookingDetailsDialog';
import RoomProfileDialog from './components/RoomProfileDialog';
import RoomFormDialog from './components/RoomFormDialog';

// Hooks
import { useRoomForm } from './hooks/useRoomForm';
import { useImageUpload } from './hooks/useImageUpload';
import { AuthContext } from '../../context/AuthContext';

const RoomManagement = () => {
  const { user } = useContext(AuthContext);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatuses, setUploadStatuses] = useState([]);
  const [customMarkets, setCustomMarkets] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [roomInquiries, setRoomInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [roomBookings, setRoomBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Custom hooks
  const roomForm = useRoomForm(customMarkets, setCustomMarkets);
  const { handleImageSelect } = useImageUpload(
    roomForm.setForm,
    (msg) => setSnackbar(msg),
    setUploadProgress,
    setUploadStatuses
  );

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Role-based endpoints
        const hotelsEndpoint =
          user?.role === 'admin' ? '/hotels' : '/hotels/my-hotels';

        const roomsEndpoint =
          user?.role === 'admin' ? '/rooms' : '/rooms/my-rooms';

        const [hRes, rRes] = await Promise.all([
          axios.get(hotelsEndpoint, { withCredentials: true }),
          axios.get(roomsEndpoint, { withCredentials: true })
        ]);
        setHotels(hRes.data);
        setRooms(rRes.data);
      } catch (err) {
        console.error('Error fetching room data:', err);
        setError('Failed to load room data. Please try refreshing the page.');
        setSnackbar({ open: true, message: 'Failed to load data', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchRoomInquiries = async () => {
    try {
      setInquiriesLoading(true);
      const response = await axios.get('/inquiries?inquiry_type=room', { withCredentials: true });
      setRoomInquiries(response.data);
    } catch (err) {
      console.error('Error fetching room inquiries:', err);
      setSnackbar({ open: true, message: 'Failed to load room inquiries', severity: 'error' });
    } finally {
      setInquiriesLoading(false);
    }
  };

  const fetchRoomBookings = async () => {
    try {
      setBookingsLoading(true);
      const response = await axios.get('/bookings', { withCredentials: true });
      setRoomBookings(response.data);
    } catch (err) {
      console.error('Error fetching room bookings:', err);
      setSnackbar({ open: true, message: 'Failed to load room bookings', severity: 'error' });
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 1) {
      fetchRoomInquiries();
    } else if (activeTab === 2) {
      fetchRoomBookings();
    }
  }, [activeTab]);

  const openDialog = (room) => {
    if (room) {
      setEditing(room);
      roomForm.populateForm(room);
      setUploadStatuses((room.gallery || []).map(url => ({ file: null, status: 'success', url, error: null })));
    } else {
      setEditing(null);
      roomForm.resetForm();
      setUploadStatuses([]);
    }
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    roomForm.resetForm();
    setUploadStatuses([]);
  };

  const handleSubmit = async () => {
    const payload = {
      hotel: roomForm.form.hotelId,
      roomName: roomForm.form.roomName,
      roomType: roomForm.form.roomType,
      description: roomForm.form.description,
      size: Number(roomForm.form.size) || 0,
      bedType: roomForm.form.bedType,
      maxOccupancy: {
        adults: Number(roomForm.form.maxAdults) || 0,
        children: Number(roomForm.form.maxChildren) || 0
      },
      amenities: roomForm.form.amenities,
      basePrice: Number(roomForm.form.basePrice) || 0,
      availabilityCalendar: roomForm.form.availabilityCalendar.map(r => ({
        startDate: r.startDate,
        endDate: r.endDate
      })),
      gallery: roomForm.form.gallery,
      prices: roomForm.form.prices.map(p => ({
        market: p.market,
        price: p.price
      })),
      pricePeriods: roomForm.form.pricePeriods.map(p => ({
        startDate: p.startDate,
        endDate: p.endDate,
        price: p.price
      })),
      transportations: roomForm.form.transportations
    };
    try {
      let res;
      if (editing) {
        res = await axios.put(`/rooms/${editing._id}`, payload, { withCredentials: true });
        setRooms(rs => rs.map(r => (r._id === editing._id ? res.data : r)));
        setSnackbar({ open: true, message: 'Room updated', severity: 'success' });
      } else {
        res = await axios.post('/rooms', payload, { withCredentials: true });
        setRooms(rs => [res.data, ...rs]);
        setSnackbar({ open: true, message: 'Room added', severity: 'success' });
      }
      closeDialog();
    } catch (err) {
      console.error('Error saving room:', err);
      setSnackbar({ open: true, message: 'Save failed', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await axios.delete(`/rooms/${id}`, { withCredentials: true });
      setRooms(rs => rs.filter(r => r._id !== id));
      setSnackbar({ open: true, message: 'Room deleted', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
  };

  const openRoomProfile = (room) => {
    setSelectedRoom(room);
    setOpenProfile(true);
  };

  const closeRoomProfile = () => setOpenProfile(false);

  const handleInquiryAction = async (inquiryId, action) => {
    try {
      const endpoint = action === 'confirmed' ? 'confirm' : 'cancel';
      await axios.put(`/inquiries/${inquiryId}/${endpoint}`, {}, { withCredentials: true });
      const newStatus = action === 'confirmed' ? 'Confirmed' : 'Cancelled';
      setRoomInquiries(prev => prev.map(inquiry =>
        inquiry._id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
      ));
      setSnackbar({ open: true, message: `Inquiry ${action} successfully`, severity: 'success' });
    } catch (err) {
      console.error(`Error ${action}ing inquiry:`, err);
      setSnackbar({ open: true, message: `Failed to ${action} inquiry`, severity: 'error' });
    }
  };

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setBookingDetailsOpen(true);
  };

  const handleCloseBookingDetails = () => {
    setBookingDetailsOpen(false);
    setSelectedBooking(null);
  };

  const handleEditBooking = (booking) => {
    // For now, just show an alert. You can implement edit functionality later
    alert(`Edit booking: ${booking.bookingReference}\nThis feature can be implemented with a booking edit dialog.`);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      await axios.delete(`/bookings/${bookingId}`, { withCredentials: true });
      setRoomBookings(prev => prev.filter(booking => booking._id !== bookingId));
      setSnackbar({ open: true, message: 'Booking deleted successfully', severity: 'success' });
    } catch (err) {
      console.error('Error deleting booking:', err);
      setSnackbar({ open: true, message: 'Failed to delete booking', severity: 'error' });
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    if (!window.confirm('Confirm this booking?')) return;
    try {
      const { data } = await axios.put(`/bookings/${bookingId}`, { status: 'Confirmed' }, { withCredentials: true });
      setRoomBookings(prev => prev.map(booking =>
        booking._id === bookingId ? data : booking
      ));
      setSnackbar({ open: true, message: 'Booking confirmed successfully', severity: 'success' });
    } catch (err) {
      console.error('Error confirming booking:', err);
      setSnackbar({ open: true, message: 'Failed to confirm booking', severity: 'error' });
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      const { data } = await axios.put(`/bookings/${bookingId}`, { status: 'Cancelled' }, { withCredentials: true });
      setRoomBookings(prev => prev.map(booking =>
        booking._id === bookingId ? data : booking
      ));
      setSnackbar({ open: true, message: 'Booking cancelled successfully', severity: 'success' });
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setSnackbar({ open: true, message: 'Failed to cancel booking', severity: 'error' });
    }
  };

  const handleMarkBookingPaid = async (bookingId) => {
    if (!window.confirm('Mark this booking as paid?')) return;
    try {
      const { data } = await axios.put(`/bookings/${bookingId}`, { status: 'Paid' }, { withCredentials: true });
      setRoomBookings(prev => prev.map(booking =>
        booking._id === bookingId ? data : booking
      ));
      setSnackbar({ open: true, message: 'Booking marked as paid successfully', severity: 'success' });
    } catch (err) {
      console.error('Error marking booking as paid:', err);
      setSnackbar({ open: true, message: 'Failed to mark booking as paid', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Room Management</Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Rooms" />
          <Tab
            label={
              <Badge badgeContent={roomInquiries.filter(i => i.status === 'pending').length} color="primary">
                Room Inquiries
              </Badge>
            }
          />
          <Tab label="Room Bookings" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog(null)} sx={{ mb: 2 }}>
            Add Room
          </Button>
          <RoomsTable
            rooms={rooms}
            hotels={hotels}
            onEdit={openDialog}
            onDelete={handleDelete}
            onViewProfile={openRoomProfile}
          />
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box sx={{ mt: 3 }}>
          {inquiriesLoading ? (
            <Box textAlign="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <RoomInquiriesView
              inquiries={roomInquiries}
              onAction={handleInquiryAction}
            />
          )}
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Box sx={{ mt: 3 }}>
          {bookingsLoading ? (
            <Box textAlign="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <RoomBookingsView
              bookings={roomBookings}
              onViewDetails={handleViewBookingDetails}
              onEdit={handleEditBooking}
              onDelete={handleDeleteBooking}
              onConfirm={handleConfirmBooking}
              onCancel={handleCancelBooking}
              onMarkPaid={handleMarkBookingPaid}
            />
          )}
        </Box>
      </TabPanel>

      <RoomFormDialog
        open={open}
        onClose={closeDialog}
        editing={editing}
        form={roomForm.form}
        setForm={roomForm.setForm}
        hotels={hotels}
        markets={roomForm.markets}
        transportationOptions={roomForm.transportationOptions}
        uploadStatuses={uploadStatuses}
        setUploadStatuses={setUploadStatuses}
        uploadProgress={uploadProgress}
        onSubmit={handleSubmit}
        onAddAvailability={roomForm.addAvailability}
        onRemoveAvailability={roomForm.removeAvailability}
        onAddPriceEntry={roomForm.addPriceEntry}
        onAddPricePeriod={roomForm.addPricePeriod}
        onRemovePricePeriod={roomForm.removePricePeriod}
        onAddTransportation={roomForm.addTransportation}
        onRemoveTransportation={roomForm.removeTransportation}
        onAddCustomMarket={roomForm.addCustomMarket}
        onRemoveCustomMarket={roomForm.removeCustomMarket}
        onImageSelect={handleImageSelect}
        onChange={roomForm.handleChange}
      />

      <RoomProfileDialog
        open={openProfile}
        onClose={closeRoomProfile}
        selectedRoom={selectedRoom}
      />

      <BookingDetailsDialog
        open={bookingDetailsOpen}
        onClose={handleCloseBookingDetails}
        booking={selectedBooking}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default RoomManagement;