import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  X, 
  Calendar, 
  Check, 
  CreditCard, 
  Edit, 
  Eye,
  Building2,
  MapPin,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from '../Landing/LandingHeader';
import Footer from '../Components/Footer';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert } from '@mui/material';
import { Dialog as MuiDialog, DialogTitle as MuiDialogTitle, DialogContent as MuiDialogContent, DialogActions as MuiDialogActions, TextField, CircularProgress } from '@mui/material';

const Bookings = ({ sidebarOpen }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('properties'); // 'properties', 'tours', or 'activities'
  const [bookings, setBookings] = useState([]);
  const [tourInquiries, setTourInquiries] = useState([]);
  const [activityBookings, setActivityBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [inquiryFilterStatus, setInquiryFilterStatus] = useState('All');
  const [activityFilterStatus, setActivityFilterStatus] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isInquiryFilterOpen, setIsInquiryFilterOpen] = useState(false);
  const [isActivityFilterOpen, setIsActivityFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inquiryLoading, setInquiryLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [viewBookingDialogOpen, setViewBookingDialogOpen] = useState(false);
  const [viewInquiryDialogOpen, setViewInquiryDialogOpen] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [expandedInquiry, setExpandedInquiry] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, bookingId: null, title: '', message: '' });
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [inquiryQuoteDialogOpen, setInquiryQuoteDialogOpen] = useState(false);
  const [profitMargin, setProfitMargin] = useState(0);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [calculatedProfit, setCalculatedProfit] = useState(null);
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(null);
  const [basePrice, setBasePrice] = useState(null);

  const statusConfig = {
    Pending: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: <Calendar className="w-3 h-3 mr-1" />, canCancel: true },
    Confirmed: { bgColor: 'bg-green-100', textColor: 'text-green-800', icon: <Check className="w-3 h-3 mr-1" />, canCancel: false },
    Paid: { bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: <CreditCard className="w-3 h-3 mr-1" />, canCancel: false },
    Cancelled: { bgColor: 'bg-red-100', textColor: 'text-red-800', icon: <X className="w-3 h-3 mr-1" />, canCancel: false },
    Modified: { bgColor: 'bg-purple-100', textColor: 'text-purple-800', icon: <Edit className="w-3 h-3 mr-1" />, canCancel: true },
  };

  const actionButtonStyles = { cancel: 'text-white bg-red-500 hover:bg-red-600' };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get('/bookings/my', { withCredentials: true });
        setBookings(res.data);
      } catch (err) {
        console.error('Could not load bookings', err);
        setSnackbar({ open: true, message: 'Failed to load bookings', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    const fetchTourInquiries = async () => {
      try {
        const res = await axios.get('/inquiries/my', { withCredentials: true });
        setTourInquiries(res.data.map(item => ({
          ...item,
          _id: item._id?.$oid || item._id,
          travel_date: item.travel_date ? new Date(item.travel_date) : null,
          status: item.status || 'Pending',
        })));
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to load tour inquiries', severity: 'error' });
      } finally {
        setInquiryLoading(false);
      }
    };

    const fetchActivityBookings = async () => {
      try {
        const res = await axios.get('/activity-bookings/my', { withCredentials: true });
        if (res.data.success) {
          setActivityBookings(res.data.data);
        }
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to load activity bookings & inquiries', severity: 'error' });
      } finally {
        setActivityLoading(false);
      }
    };

    fetchBookings();
    fetchTourInquiries();
    fetchActivityBookings();
  }, []);

  const fetchBasePrice = async (id, isInquiry = false) => {
    try {
      const endpoint = isInquiry ? `/inquiries/${id}` : `/bookings/${id}`;
      const res = await axios.get(endpoint, { withCredentials: true });
      const data = res.data;
      return isInquiry ? data.final_price : data.priceBreakdown?.total;
    } catch (err) {
      console.error(`Error fetching base price for ${isInquiry ? 'inquiry' : 'booking'}:`, err);
      setQuoteError(`Failed to fetch base price. Please try again or contact support.`);
      return null;
    }
  };

  const handleAction = (bookingId) => {
    setConfirmDialog({
      open: true,
      bookingId,
      title: 'Cancel Booking?',
      message: 'Are you sure you want to cancel this booking? This action cannot be undone and may incur cancellation fees.',
    });
  };

  const handleConfirmedAction = async () => {
    const { bookingId, isActivity } = confirmDialog;
    try {
      setConfirmDialog(prev => ({ ...prev, open: false }));
      if (isActivity) {
        await axios.put(`/activity-bookings/${bookingId}/cancel`, {}, { withCredentials: true });
        setActivityBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b));
        setSnackbar({ open: true, message: `Activity booking successfully cancelled`, severity: 'success' });
      } else {
        await axios.put(`/bookings/${bookingId}`, { status: 'Cancelled' }, { withCredentials: true });
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b));
        setSnackbar({ open: true, message: `Booking successfully cancelled`, severity: 'success' });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: `Could not cancel ${isActivity ? 'activity booking' : 'booking'}`, severity: 'error' });
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const handleActivityAction = (bookingId) => {
    setConfirmDialog({
      open: true,
      bookingId,
      title: 'Cancel Activity Booking?',
      message: 'Are you sure you want to cancel this activity booking? This action cannot be undone and may incur cancellation fees.',
      isActivity: true
    });
  };

  const handleConfirmedActivityAction = async () => {
    const { bookingId } = confirmDialog;
    try {
      setConfirmDialog(prev => ({ ...prev, open: false }));
      await axios.put(`/activity-bookings/${bookingId}/cancel`, {}, { withCredentials: true });
      setActivityBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b));
      setSnackbar({ open: true, message: `Activity booking successfully cancelled`, severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: `Could not cancel activity booking`, severity: 'error' });
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setViewBookingDialogOpen(true);
  };

  const handleViewInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setViewInquiryDialogOpen(true);
  };

  const handleCloseBookingDialog = () => {
    setViewBookingDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleCloseInquiryDialog = () => {
    setViewInquiryDialogOpen(false);
    setSelectedInquiry(null);
  };

  const toggleBookingDetails = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const toggleInquiryDetails = (inquiryId) => {
    setExpandedInquiry(expandedInquiry === inquiryId ? null : inquiryId);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilterStatus('All');
    setInquiryFilterStatus('All');
    setIsFilterOpen(false);
    setIsInquiryFilterOpen(false);
  };

  const calculatePrices = (base, margin) => {
    if (typeof base !== 'number' || base <= 0) return { profit: null, total: null };
    const profit = (base * (margin / 100)).toFixed(2);
    const total = (base + parseFloat(profit)).toFixed(2);
    return { profit, total };
  };

  const handleMarginChange = (e) => {
    const val = parseFloat(e.target.value);
    const margin = isNaN(val) ? 0 : val;
    setProfitMargin(margin);
    if (basePrice && typeof basePrice === 'number') {
      const { profit, total } = calculatePrices(basePrice, margin);
      setCalculatedProfit(profit);
      setCalculatedTotalPrice(total);
    } else {
      setCalculatedProfit(null);
      setCalculatedTotalPrice(null);
    }
  };

  const handleOpenQuoteDialog = async (item, isInquiry = false) => {
    const id = item._id;
    const price = await fetchBasePrice(id, isInquiry);
    if (price === null) return;
    setBasePrice(price);
    setProfitMargin(0);
    setCalculatedProfit(null);
    setCalculatedTotalPrice(null);
    setQuoteError('');
    if (isInquiry) {
      setSelectedInquiry(item);
      setInquiryQuoteDialogOpen(true);
    } else {
      setSelectedBooking(item);
      setQuoteDialogOpen(true);
    }
  };

  const handleCloseQuoteDialog = (isInquiry = false) => {
    if (isInquiry) {
      setInquiryQuoteDialogOpen(false);
      setSelectedInquiry(null);
    } else {
      setQuoteDialogOpen(false);
      setSelectedBooking(null);
    }
    setBasePrice(null);
    setProfitMargin(0);
    setCalculatedProfit(null);
    setCalculatedTotalPrice(null);
    setQuoteError('');
  };

  const handleGenerateQuote = async (isInquiry = false) => {
    setQuoteLoading(true);
    setQuoteError('');
    try {
      const id = isInquiry ? selectedInquiry._id : selectedBooking._id;
      const endpoint = isInquiry ? `/inquiries/${id}/customer-quote` : `/bookings/${id}/customer-quote`;
      const reference = isInquiry ? selectedInquiry._id : selectedBooking.bookingReference;
      const res = await axios.post(
        endpoint,
        { profitMargin: parseFloat(profitMargin), marginType: 'percentage' },
        { responseType: 'blob', withCredentials: true }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customer-quote-${reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      handleCloseQuoteDialog(isInquiry);
    } catch (err) {
      console.error(`Error generating ${isInquiry ? 'inquiry' : 'booking'} quote:`, err);
      setQuoteError('Failed to generate quote. Please try again or contact support.');
    } finally {
      setQuoteLoading(false);
    }
  };

  if (loading && inquiryLoading && activityLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredBookings = filterStatus === 'All' ? bookings : bookings.filter(b => b.status === filterStatus);
  const filteredInquiries = inquiryFilterStatus === 'All' ? tourInquiries : tourInquiries.filter(i => i.status === inquiryFilterStatus);
  const filteredActivityBookings = activityFilterStatus === 'All' ? activityBookings : activityBookings.filter(b => b.status === activityFilterStatus);

  return (
    <div className={`flex-1 min-h-screen bg-gradient-to-br from-blue-50 to-white transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'} ml-0`}>
      <LandingHeader />
      <main className="px-4 md:px-8 py-6 md:py-10 max-w-3xl md:max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-blue-800">Manage Your Bookings</h2>
          <p className="mt-2 md:mt-4 text-sm md:text-lg text-indigo-900">Track and manage all your booking and inquiry requests in one place.</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 md:mb-8">
          <div className="flex justify-center">
            <div className="bg-white rounded-xl shadow-lg p-1 border border-blue-200">
              <div className="flex space-x-1">
                <button
                  onClick={() => handleTabChange('properties')}
                  className={`flex items-center px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-200 ${
                    activeTab === 'properties'
                      ? 'bg-blue-600 text-white shadow-md transform scale-105'
                      : 'text-indigo-900 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Building2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Property Bookings
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === 'properties' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {bookings.length}
                  </span>
                </button>
                <button
                  onClick={() => handleTabChange('tours')}
                  className={`flex items-center px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-200 ${
                    activeTab === 'tours'
                      ? 'bg-blue-600 text-white shadow-md transform scale-105'
                      : 'text-indigo-900 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Tour Packages
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === 'tours' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {tourInquiries.length}
                  </span>
                </button>
                <button
                  onClick={() => handleTabChange('activities')}
                  className={`flex items-center px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-200 ${
                    activeTab === 'activities'
                      ? 'bg-blue-600 text-white shadow-md transform scale-105'
                      : 'text-indigo-900 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Users className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Activity Bookings & Inquiries
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === 'activities' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {activityBookings.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Property Bookings Tab Content */}
        {activeTab === 'properties' && (
          <div className="animate-fadeIn">
            {/* Property Booking Filter Controls */}
            <div className="mb-4 md:mb-8">
              <div className="md:hidden">
                <button
                  onClick={() => setIsFilterOpen(o => !o)}
                  className="flex items-center justify-between w-full px-4 py-2 bg-white rounded-lg shadow-sm border border-blue-200"
                >
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-sm font-medium text-indigo-900">Filter: {filterStatus}</span>
                  </div>
                  {isFilterOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-blue-400" />
                  )}
                </button>
                {isFilterOpen && (
                  <div className="mt-2 p-2 bg-white rounded-lg shadow-lg border border-blue-200 grid grid-cols-2 gap-2">
                    {['All', 'Pending', 'Confirmed', 'Paid', 'Cancelled', 'Modified'].map(s => (
                      <button
                        key={s}
                        onClick={() => { setFilterStatus(s); setIsFilterOpen(false); }}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          filterStatus === s ? 'bg-blue-100 text-blue-700' : 'text-indigo-900 hover:bg-blue-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="hidden md:flex justify-center flex-wrap gap-3">
                {['All', 'Pending', 'Confirmed', 'Paid', 'Cancelled', 'Modified'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105
                      ${filterStatus === s
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-white text-indigo-900 border border-blue-300 hover:bg-blue-50 hover:text-blue-600'}`}
                  >{s}</button>
                ))}
              </div>
            </div>

            {/* Property Bookings List */}
            <div className="bg-white rounded-xl shadow-xl border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-800 to-indigo-900 px-4 md:px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    <h3 className="font-semibold text-base md:text-lg">Property Bookings</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-xs md:text-sm">
                      Showing {filteredBookings.length} {filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} bookings
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-200">
                  <thead className="bg-blue-50">
                    <tr>
                      {['Ref', 'Hotel', 'Room', 'Status', 'Date', 'Amount', 'Actions', 'Generate Quote'].map((h, i) => (
                        <th key={i} className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {filteredBookings.map(b => (
                      <tr key={b._id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-indigo-900 font-medium">{b.bookingReference}</td>
                        <td className="px-6 py-4 text-sm text-indigo-900">{b.hotel?.name}</td>
                        <td className="px-6 py-4 text-sm text-indigo-900">{b.room?.roomName || b.room?.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[b.status].bgColor} ${statusConfig[b.status].textColor}`}>
                              {statusConfig[b.status].icon}{b.status}
                            </span>
                            {statusConfig[b.status].canCancel && (
                              <button onClick={() => handleAction(b._id)} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${actionButtonStyles.cancel}`}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-indigo-900">{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-indigo-900 font-semibold">{b.status === 'Cancelled' ? '$0' : `$${b.priceBreakdown?.total ?? 0}`}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleViewBooking(b)} className="text-blue-600 hover:text-blue-800 transition-colors hover:scale-110 transform" title="View Details">
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          {b.status === 'Confirmed' ? (
                            <Button variant="outlined" color="success" size="small" onClick={() => handleOpenQuoteDialog(b)}>Generate Quote</Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-indigo-900">
                          <Building2 className="w-12 h-12 mx-auto text-blue-300 mb-4" />
                          <p className="text-lg font-medium">No property bookings found</p>
                          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or make a new booking</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden p-4">
                {filteredBookings.map(b => (
                  <div key={b._id} className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 overflow-hidden">
                    <div
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => toggleBookingDetails(b._id)}
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-indigo-900 flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                          {b.hotel?.name}
                        </h4>
                        <p className="text-xs text-indigo-700 mt-1">{b.room?.roomName || b.room?.name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[b.status].bgColor} ${statusConfig[b.status].textColor}`}>
                          {statusConfig[b.status].icon}{b.status}
                        </span>
                        {expandedBooking === b._id ? (
                          <ChevronUp className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                    {expandedBooking === b._id && (
                      <div className="p-4 bg-white">
                        <div className="text-xs text-indigo-900 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Reference:</span>
                            <span className="font-medium">{b.bookingReference}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">{new Date(b.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-semibold text-blue-600">{b.status === 'Cancelled' ? '$0' : `$${b.priceBreakdown?.total ?? 0}`}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => handleViewBooking(b)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </button>
                          {statusConfig[b.status].canCancel && (
                            <button
                              onClick={() => handleAction(b._id)}
                              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${actionButtonStyles.cancel}`}
                            >
                              Cancel
                            </button>
                          )}
                          {b.status === 'Confirmed' && (
                            <button
                              onClick={() => handleOpenQuoteDialog(b)}
                              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700 transition-colors"
                            >
                              Generate Quote
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {filteredBookings.length === 0 && (
                  <div className="py-12 text-center text-indigo-900">
                    <Building2 className="w-10 h-10 mx-auto text-blue-300 mb-3" />
                    <p className="text-base font-medium">No property bookings found</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tour Packages Tab Content */}
        {activeTab === 'tours' && (
          <div className="animate-fadeIn">
            {/* Tour Inquiry Filter Controls */}
            <div className="mb-4 md:mb-8">
              <div className="md:hidden">
                <button
                  onClick={() => setIsInquiryFilterOpen(o => !o)}
                  className="flex items-center justify-between w-full px-4 py-2 bg-white rounded-lg shadow-sm border border-green-200"
                >
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-sm font-medium text-indigo-900">Filter: {inquiryFilterStatus}</span>
                  </div>
                  {isInquiryFilterOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-blue-400" />
                  )}
                </button>
                {isInquiryFilterOpen && (
                  <div className="mt-2 p-2 bg-white rounded-lg shadow-lg border border-blue-200 grid grid-cols-2 gap-2">
                    {['All', 'Pending', 'Confirmed', 'Cancelled'].map(s => (
                      <button
                        key={s}
                        onClick={() => { setInquiryFilterStatus(s); setIsInquiryFilterOpen(false); }}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          inquiryFilterStatus === s ? 'bg-blue-100 text-blue-700' : 'text-indigo-900 hover:bg-blue-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="hidden md:flex justify-center flex-wrap gap-3">
                {['All', 'Pending', 'Confirmed', 'Cancelled'].map(s => (
                  <button
                    key={s}
                    onClick={() => setInquiryFilterStatus(s)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105
                      ${inquiryFilterStatus === s
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-white text-indigo-900 border border-green-300 hover:bg-green-50 hover:text-green-600'}`}
                  >{s}</button>
                ))}
              </div>
            </div>

            {/* Tour Inquiries List */}
            <div className="bg-white rounded-xl shadow-xl border border-green-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-800 to-blue-900 px-4 md:px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <h3 className="font-semibold text-base md:text-lg">Tour Package Inquiries</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-xs md:text-sm">
                      Showing {filteredInquiries.length} {inquiryFilterStatus !== 'All' ? inquiryFilterStatus.toLowerCase() : ''} inquiries
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-green-200">
                  <thead className="bg-green-50">
                    <tr>
                      {['Tour Name', 'Travel Date', 'Travellers', 'Phone', 'Nights', 'Message', 'Price', 'Status', 'Actions', 'Generate Quote'].map((h, i) => (
                        <th key={i} className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-green-100">
                    {filteredInquiries.map(i => (
                      <tr key={i._id} className="hover:bg-green-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-indigo-900 font-medium">{i.tour || '-'}</td>
                        <td className="px-6 py-4 text-sm text-indigo-900">{i.travel_date ? new Date(i.travel_date).toLocaleDateString() : '-'}</td>
                        <td className="px-6 py-4 text-sm text-indigo-900 flex items-center">
                          <Users className="w-4 h-4 mr-1 text-green-600" />
                          {i.traveller_count || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-indigo-900">{i.phone_number || '-'}</td>
                        <td className="px-6 py-4 text-sm text-indigo-900">{i.selected_nights_key || '-'}</td>
                        <td className="px-6 py-4 text-sm text-indigo-900 max-w-xs truncate">{i.message || '-'}</td>
                        <td className="px-6 py-4 text-sm text-indigo-900 font-semibold">{i.final_price ? `$${i.final_price.toFixed(2)}` : '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[i.status]?.bgColor || 'bg-gray-100'} ${statusConfig[i.status]?.textColor || 'text-gray-800'}`}>
                            {statusConfig[i.status]?.icon || <Calendar className="w-3 h-3 mr-1" />}{i.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewInquiry(i)}
                            className="text-green-600 hover:text-green-800 transition-colors hover:scale-110 transform"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          {i.status === 'Confirmed' ? (
                            <Button variant="outlined" color="success" size="small" onClick={() => handleOpenQuoteDialog(i, true)}>Generate Quote</Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                    {filteredInquiries.length === 0 && (
                      <tr>
                        <td colSpan="10" className="py-12 text-center text-indigo-900">
                          <MapPin className="w-12 h-12 mx-auto text-green-300 mb-4" />
                          <p className="text-lg font-medium">No tour inquiries found</p>
                          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or submit a new inquiry</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden p-4">
                {filteredInquiries.map(i => (
                  <div key={i._id} className="mb-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-sm border border-green-200 overflow-hidden">
                    <div
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-green-100 transition-colors"
                      onClick={() => toggleInquiryDetails(i._id)}
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-indigo-900 flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-green-600" />
                          {i.tour}
                        </h4>
                        <p className="text-xs text-indigo-700 mt-1">{i.selected_nights_key}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[i.status]?.bgColor} ${statusConfig[i.status]?.textColor}`}>
                          {statusConfig[i.status]?.icon}{i.status}
                        </span>
                        {expandedInquiry === i._id ? (
                          <ChevronUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                    {expandedInquiry === i._id && (
                      <div className="p-4 bg-white">
                        <div className="text-xs text-indigo-900 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Tour:</span>
                            <span className="font-medium">{i.tour}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">{i.travel_date ? new Date(i.travel_date).toLocaleDateString() : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Traveller Count:</span>
                            <span className="font-medium">{i.traveller_count || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{i.phone_number || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Message:</span>
                            <span className="font-medium">{i.message || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-semibold text-green-600">{i.final_price ? `$${i.final_price.toFixed(2)}` : '-'}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => handleViewInquiry(i)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </button>
                          {i.status === 'Confirmed' && (
                            <button
                              onClick={() => handleOpenQuoteDialog(i, true)}
                              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700 transition-colors"
                            >
                              Generate Quote
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {filteredInquiries.length === 0 && (
                  <div className="py-12 text-center text-indigo-900">
                    <MapPin className="w-10 h-10 mx-auto text-green-300 mb-3" />
                    <p className="text-base font-medium">No tour inquiries found</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Activity Bookings & Inquiries Tab Content */}
        {activeTab === 'activities' && (
          <div className="animate-fadeIn">
            {/* Activity Booking Filter Controls */}
            <div className="mb-4 md:mb-8">
              <div className="md:hidden">
                <button
                  onClick={() => setIsActivityFilterOpen(o => !o)}
                  className="flex items-center justify-between w-full px-4 py-2 bg-white rounded-lg shadow-sm border border-blue-200"
                >
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Filter by Status</span>
                  </div>
                  {isActivityFilterOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {isActivityFilterOpen && (
                  <div className="mt-2 px-4 py-3 bg-white rounded-lg shadow-sm border border-blue-200">
                    {['All', 'Pending', 'Confirmed', 'Cancelled', 'Completed'].map(s => (
                      <button
                        key={s}
                        onClick={() => { setActivityFilterStatus(s); setIsActivityFilterOpen(false); }}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activityFilterStatus === s ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700 hover:bg-blue-50'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="hidden md:flex justify-center">
                <div className="bg-white rounded-xl shadow-lg p-2 border border-blue-200">
                  <div className="flex space-x-1">
                    {['All', 'Pending', 'Confirmed', 'Cancelled', 'Completed'].map(s => (
                      <button
                        key={s}
                        onClick={() => setActivityFilterStatus(s)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activityFilterStatus === s ? 'bg-blue-600 text-white shadow-md' : 'text-indigo-900 hover:bg-blue-50 hover:text-blue-600'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Bookings & Inquiries List */}
            <div className="space-y-4 md:space-y-6">
              <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
                {filteredActivityBookings.map((b) => (
                  <div key={b._id} className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                    <div className="p-4 md:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg md:text-xl font-bold text-blue-800">{b.activity?.title}</h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              b.type === 'inquiry' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {b.type === 'inquiry' ? 'Inquiry' : 'Booking'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{b.activity?.location}</p>
                          <p className="text-xs text-gray-500 mt-1">Ref: {b.bookingReference}</p>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[b.status]?.bgColor} ${statusConfig[b.status]?.textColor}`}>
                            {statusConfig[b.status]?.icon}
                            {b.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Customer:</span>
                          <span className="font-medium">{b.customerDetails?.fullName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{new Date(b.bookingDetails?.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Guests:</span>
                          <span className="font-medium">{b.bookingDetails?.guests}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{b.activity?.duration} hours</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-lg md:text-xl font-bold text-blue-600">
                          {b.type === 'inquiry' ? 'Inquiry' : 
                           b.status === 'Cancelled' ? '$0' : `$${b.pricing?.totalPrice?.toFixed(2) || '0.00'}`}
                        </span>
                        <div className="flex space-x-2">
                          {statusConfig[b.status]?.canCancel && (
                            <button 
                              onClick={() => handleActivityAction(b._id)} 
                              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${actionButtonStyles.cancel}`}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {b.bookingDetails?.specialRequests && (
                        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">Special Requests:</p>
                          <p className="text-sm">{b.bookingDetails.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredActivityBookings.length === 0 && (
                  <div className="col-span-2 py-12 text-center text-indigo-900">
                    <Users className="w-10 h-10 mx-auto text-green-300 mb-3" />
                    <p className="text-base font-medium">No activity bookings or inquiries found</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or book an activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog open={confirmDialog.open} onClose={handleCloseDialog} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullScreen={window.innerWidth < 768}>
          <DialogTitle id="alert-dialog-title" className="bg-red-50 text-red-900">{confirmDialog.title}</DialogTitle>
          <DialogContent className="pt-4">
            <DialogContentText id="alert-dialog-description">{confirmDialog.message}</DialogContentText>
          </DialogContent>
          <DialogActions className="pb-3 pr-4">
            <Button onClick={handleCloseDialog} variant="outlined" color="inherit">No</Button>
            <Button onClick={handleConfirmedAction} variant="contained" color="error" autoFocus>Yes, Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for Notifications */}
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>

        {/* View Booking Details Dialog */}
        <Dialog open={viewBookingDialogOpen} onClose={handleCloseBookingDialog} maxWidth="md" fullWidth fullScreen={window.innerWidth < 768}>
          <DialogTitle className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold">Booking Details</h2>
              <span className="text-xs md:text-sm bg-white/20 px-2 md:px-3 py-1 rounded-full">{selectedBooking?.status}</span>
            </div>
          </DialogTitle>
          <DialogContent className="p-4 md:p-6">
            {selectedBooking && (
              <div className="space-y-4 md:space-y-8">
                <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                  <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-2 md:space-y-0">
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Booking Reference</p>
                      <p className="text-sm md:text-lg font-semibold text-blue-900">{selectedBooking.bookingReference}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xs md:text-sm text-gray-500">Booking Date</p>
                      <p className="text-xs md:text-sm font-medium text-blue-900">{new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  <div className="bg-white p-3 md:p-4 rounded-lg border border-blue-100 shadow-sm">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                      <Building2 className="w-4 h-4 mr-1 md:mr-2 text-blue-500" />
                      Hotel Information
                    </h4>
                    <p className="text-sm md:text-lg font-medium text-blue-900">{selectedBooking.hotel?.name}</p>
                  </div>
                  <div className="bg-white p-3 md:p-4 rounded-lg border border-blue-100 shadow-sm">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-1 md:mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Room Information
                    </h4>
                    <p className="text-sm md:text-lg font-medium text-blue-900">{selectedBooking.room?.roomName || selectedBooking.room?.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  <div className="bg-white p-3 md:p-4 rounded-lg border border-blue-100 shadow-sm">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-1 md:mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Stay Details
                    </h4>
                    <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Check-in</span>
                        <span className="font-medium text-blue-900">{new Date(selectedBooking.checkIn).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Check-out</span>
                        <span className="font-medium text-blue-900">{new Date(selectedBooking.checkOut).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium text-blue-900">{Math.ceil((new Date(selectedBooking.checkOut) - new Date(selectedBooking.checkIn)) / (1000 * 60 * 60 * 24))} nights</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 md:p-4 rounded-lg border border-blue-100 shadow-sm">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-1 md:mr-2 text-blue-500" />
                      Guest Information
                    </h4>
                    <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Adults</span>
                        <span className="font-medium text-blue-900">{selectedBooking.adults}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Children</span>
                        <span className="font-medium text-blue-900">{selectedBooking.children?.length || 0}</span>
                      </div>
                      {selectedBooking.children?.length > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Children Ages</span>
                          <span className="font-medium text-blue-900">{selectedBooking.children.map(c => c.age).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-lg border border-blue-100 shadow-sm">
                  <h4 className="text-xs md:text-sm font-semibold text-black mb-2 md:mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-1 md:mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Transportation Options
                  </h4>
                  {Array.isArray(selectedBooking.transportations) && selectedBooking.transportations.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {selectedBooking.transportations.map((t, idx) => (
                        <li key={idx} className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full text-xs shadow-sm hover:bg-blue-100 transition-all">
                          <span className="font-semibold capitalize">{t.type}:</span>
                          <span className="font-medium">{t.method}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-gray-500">No transportation options selected.</span>
                  )}
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-emerald-100 rounded-lg p-3 md:p-4 border border-indigo-100 shadow-sm">
                  <h4 className="text-xs md:text-sm font-semibold text-gray-800 mb-2 md:mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-1 md:mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Price Breakdown
                  </h4>
                  <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                    <div className="flex justify-between items-center mb-2 md:mb-3">
                      <div className="text-gray-600">
                        <span className="font-medium">{selectedBooking.nights} night{selectedBooking.nights !== 1 ? "s" : ""}</span> × {selectedBooking.rooms} room{selectedBooking.rooms !== 1 ? "s" : ""}
                      </div>
                      <div className="text-gray-800">
                        ${selectedBooking.priceBreakdown?.basePricePerNight ?? 0} per night
                      </div>
                    </div>
                    <div className="text-gray-800 text-right mb-2 md:mb-3">
                      Room Total: ${(selectedBooking.priceBreakdown?.roomTotal ?? 0).toFixed(2)}
                    </div>
                    {selectedBooking.priceBreakdown?.mealPlan && (
                      <div className="flex justify-between items-center mb-2 md:mb-3">
                        <div className="text-gray-600">
                          {selectedBooking.priceBreakdown.mealPlan.type} ({selectedBooking.adults + (selectedBooking.children?.length || 0)} guest{selectedBooking.adults + (selectedBooking.children?.length || 0) !== 1 ? "s" : ""} × ${selectedBooking.priceBreakdown.mealPlan.price}/night)
                        </div>
                        <div className="text-gray-800">
                          ${(selectedBooking.priceBreakdown.mealPlan.total ?? 0).toFixed(2)}
                        </div>
                      </div>
                    )}
                    {selectedBooking.priceBreakdown?.marketSurcharge && (
                      <div className="flex justify-between items-center mb-2 md:mb-3">
                        <div className="text-gray-600">
                          {selectedBooking.priceBreakdown.marketSurcharge.type} Market Surcharge ({selectedBooking.nights} night{selectedBooking.nights !== 1 ? "s" : ""} × ${selectedBooking.priceBreakdown.marketSurcharge.price}/night)
                        </div>
                        <div className="text-gray-800">
                          ${(selectedBooking.priceBreakdown.marketSurcharge.total ?? 0).toFixed(2)}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-2 md:mb-3">
                      <span className="text-gray-700">All-inclusive package</span>
                      <span className="text-green-600">Included</span>
                    </div>
                    {selectedBooking.priceBreakdown?.discounts?.map((offer, index) => (
                      <div key={index} className="flex justify-between items-center mb-2 md:mb-3">
                        <span className="text-gray-600">
                          {offer.type === "percentage"
                            ? `${offer.value}% Discount`
                            : offer.type === "seasonal"
                              ? "Seasonal Offer"
                              : offer.type === "transportation"
                                ? "Transportation Offer"
                                : offer.type === "libert"
                                  ? "Libert Offer"
                                  : "Exclusive Offer"} ({offer.description})
                        </span>
                        <span className="text-green-600 font-medium">
                        -${(parseFloat(offer.value) || 0).toFixed(2)}
                      </span>
                      </div>
                    ))}
                    <div className="border-t border-indigo-200 my-2 md:my-3"></div>
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-base md:text-lg text-gray-800">Total</div>
                      <div className="font-bold text-lg md:text-xl text-indigo-600">${(selectedBooking.priceBreakdown?.total ?? 0).toFixed(2)}</div>
                    </div>
                    <div className="mt-2 md:mt-4 text-xs text-indigo-700 bg-indigo-100 px-3 py-2 rounded-lg flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      This booking includes complimentary round-trip seaplane transfers, worth $450 per person.
                    </div>
                  </div>
                </div>
                {selectedBooking.additionalServices?.length > 0 && (
                  <div className="bg-white p-3 md:p-4 rounded-lg border border-blue-100 shadow-sm">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-1 md:mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Additional Services
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBooking.additionalServices.map((service, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">{service}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedBooking.specialRequests && (
                  <div className="bg-white p-3 md:p-4 rounded-lg border border-blue-100 shadow-sm">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-1 md:mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Special Requests
                    </h4>
                    <p className="text-xs md:text-sm text-gray-800 bg-gray-50 p-3 md:p-4 rounded-lg">{selectedBooking.specialRequests}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
          <DialogActions className="p-4 bg-gray-50">
            <Button onClick={handleCloseBookingDialog} className="w-full md:w-auto px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">Close</Button>
          </DialogActions>
        </Dialog>

        {/* View Inquiry Details Dialog */}
        <Dialog open={viewInquiryDialogOpen} onClose={handleCloseInquiryDialog} maxWidth="md" fullWidth fullScreen={window.innerWidth < 768}>
          <DialogTitle className="bg-gradient-to-r from-green-600 to-blue-700 text-white p-4 md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold">Tour Inquiry Details</h2>
              <span className="text-xs md:text-sm bg-white/20 px-2 md:px-3 py-1 rounded-full">{selectedInquiry?.status || 'Unknown'}</span>
            </div>
          </DialogTitle>
          <DialogContent className="p-4 md:p-6">
            {selectedInquiry && (
              <div className="space-y-4 md:space-y-8">
                <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                  <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-2 md:space-y-0">
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Tour Name</p>
                      <p className="text-sm md:text-lg font-semibold text-blue-900">{selectedInquiry.tour || '-'}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xs md:text-sm text-gray-500">Inquiry Date</p>
                      <p className="text-xs md:text-sm font-medium text-blue-900">{new Date(selectedInquiry.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  <div className="bg-white p-3 md:p-4 rounded-lg border border-blue-100 shadow-sm">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-1 md:mr-2 text-blue-500" />
                      Contact Information
                    </h4>
                    <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Name</span>
                        <span className="font-medium text-blue-900">{selectedInquiry.name || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Email</span>
                        <span className="font-medium text-blue-900">{selectedInquiry.email || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Phone</span>
                        <span className="font-medium text-blue-900">{selectedInquiry.phone_number || '-'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 md:p-4 rounded-lg border border-blue-100 shadow-sm">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-1 md:mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Travel Details
                    </h4>
                    <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Travel Date</span>
                        <span className="font-medium text-blue-900">{selectedInquiry.travel_date ? new Date(selectedInquiry.travel_date).toLocaleDateString() : '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Traveller Count</span>
                        <span className="font-medium text-blue-900">{selectedInquiry.traveller_count || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-lg border border-blue-100 shadow-sm">
                  <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 md:mr-2 text-blue-500" />
                    Tour Information
                  </h4>
                  <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Nights</span>
                      <span className="font-medium text-blue-900">{selectedInquiry.selected_nights_key || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Option</span>
                      <span className="font-medium text-blue-900">{selectedInquiry.selected_nights_option || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Food Category</span>
                      <span className="font-medium text-blue-900">{selectedInquiry.food_category || '-'}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-lg border border-blue-100 shadow-sm">
                  <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-1 md:mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Price
                  </h4>
                  <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Final Price</span>
                      <span className="font-medium text-blue-900">{selectedInquiry.final_price ? `$${selectedInquiry.final_price.toFixed(2)}` : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Currency</span>
                      <span className="font-medium text-blue-900">{selectedInquiry.currency || 'USD'}</span>
                    </div>
                  </div>
                </div>
                {selectedInquiry.message && (
                  <div className="bg-white p-3 md:p-4 rounded-lg border border-blue-100 shadow-sm">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-1 md:mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Message
                    </h4>
                    <p className="text-xs md:text-sm text-gray-800 bg-gray-50 p-3 md:p-4 rounded-lg">{selectedInquiry.message}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
          <DialogActions className="p-4 bg-gray-50">
            <Button onClick={handleCloseInquiryDialog} variant="contained" className="w-full md:w-auto px-4 md:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">Close</Button>
          </DialogActions>
        </Dialog>

        {/* Quote Dialog for Bookings */}
        <MuiDialog open={quoteDialogOpen} onClose={() => handleCloseQuoteDialog(false)} maxWidth="sm" fullWidth aria-labelledby="quote-dialog-title" aria-describedby="quote-dialog-description">
          <MuiDialogTitle id="quote-dialog-title" className="bg-gradient-to-r from-green-600 to-blue-700 text-white">Generate Customer Quote (Booking)</MuiDialogTitle>          <MuiDialogContent className="p-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-700">Enter the profit margin percentage to calculate the profit and total customer price based on the total price of the booking.</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Total Price</span>
                  <span className="text-sm font-medium text-blue-900">${basePrice ? basePrice.toFixed(2) : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Profit Margin (%)</span>
                  <TextField
                    variant="outlined"
                    size="small"
                    type="number"
                    value={profitMargin}
                    onChange={handleMarginChange}
                    className="w-24"
                    InputProps={{ endAdornment: <span className="text-xs text-gray-700">%</span>, inputProps: { min: 0, step: 0.1 } }}
                    error={profitMargin < 0}
                    helperText={profitMargin < 0 ? 'Margin cannot be negative' : ''}
                  />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Profit Amount</span>
                  <span className="text-sm font-medium text-blue-900">{calculatedProfit ? `$${calculatedProfit}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Total Customer Price</span>
                  <span className="text-sm font-bold text-blue-900">{calculatedTotalPrice ? `$${calculatedTotalPrice}` : 'N/A'}</span>
                </div>
              </div>
              {quoteError && <p className="text-red-500 text-sm text-center">{quoteError}</p>}
              {!basePrice && <p className="text-red-500 text-sm text-center">Total price is not available for this booking. Please contact support.</p>}
            </div>
          </MuiDialogContent>
          <MuiDialogActions className="p-4 bg-gray-50">
            <Button onClick={() => handleCloseQuoteDialog(false)} variant="outlined" color="inherit">Cancel</Button>
            <Button onClick={() => handleGenerateQuote(false)} variant="contained" color="primary" disabled={quoteLoading || profitMargin < 0 || !basePrice || !calculatedTotalPrice}>
              {quoteLoading ? <CircularProgress size={24} color="inherit" /> : 'Generate Quote'}
            </Button>
          </MuiDialogActions>
        </MuiDialog>

        {/* Quote Dialog for Tour Inquiries */}
        <MuiDialog open={inquiryQuoteDialogOpen} onClose={() => handleCloseQuoteDialog(true)} maxWidth="sm" fullWidth aria-labelledby="inquiry-quote-dialog-title" aria-describedby="inquiry-quote-dialog-description">
          <MuiDialogTitle id="inquiry-quote-dialog-title" className="bg-gradient-to-r from-green-600 to-blue-700 text-white">Generate Customer Quote (Tour Inquiry)</MuiDialogTitle>
          <MuiDialogContent className="p-6">
            <div className="space-y-4">              <p className="text-sm text-gray-700">Enter the profit margin percentage to calculate the profit and total customer price based on the total price of the tour inquiry.</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Total Price</span>
                  <span className="text-sm font-medium text-blue-900">${basePrice ? basePrice.toFixed(2) : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Profit Margin (%)</span>
                  <TextField
                    variant="outlined"
                    size="small"
                    type="number"
                    value={profitMargin}
                    onChange={handleMarginChange}
                    className="w-24"
                    InputProps={{ endAdornment: <span className="text-xs text-gray-700">%</span>, inputProps: { min: 0, step: 0.1 } }}
                    error={profitMargin < 0}
                    helperText={profitMargin < 0 ? 'Margin cannot be negative' : ''}
                  />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Profit Amount</span>
                  <span className="text-sm font-medium text-blue-900">{calculatedProfit ? `$${calculatedProfit}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Total Customer Price</span>
                  <span className="text-sm font-bold text-blue-900">{calculatedTotalPrice ? `$${calculatedTotalPrice}` : 'N/A'}</span>
                </div>
              </div>
              {quoteError && <p className="text-red-500 text-sm text-center">{quoteError}</p>}              {!basePrice && <p className="text-red-500 text-sm text-center">Total price is not available for this tour inquiry. Please contact support.</p>}
            </div>
          </MuiDialogContent>
          <MuiDialogActions className="p-4 bg-gray-50">
            <Button onClick={() => handleCloseQuoteDialog(true)} variant="outlined" color="inherit">Cancel</Button>
            <Button onClick={() => handleGenerateQuote(true)} variant="contained" color="primary" disabled={quoteLoading || profitMargin < 0 || !basePrice || !calculatedTotalPrice}>
              {quoteLoading ? <CircularProgress size={24} color="inherit" /> : 'Generate Quote'}
            </Button>
          </MuiDialogActions>
        </MuiDialog>
      </main>
      <Footer />
    </div>
  );
};

export default Bookings;