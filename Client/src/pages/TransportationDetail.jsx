import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axios';
import { useAuthCheck } from '../hooks/useAuthCheck';
import transportationBookingsAPI from '../services/transportationBookingsAPI';
import { 
  Car, 
  Users, 
  DollarSign, 
  MapPin, 
  Star,
  Fuel,
  Settings,
  Calendar,
  Shield,
  Wind,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
  Award,
  Sparkles,
  ChevronRight,
  Navigation,
  Package,
  User,
  MessageSquare,
  ArrowUpRight,
  Zap,
  ShieldCheck,
  Gauge,
  Check,
  AlertCircle,
  Share2,
  Heart
} from 'lucide-react';

const TransportationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transportation, setTransportation] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [relatedTransportations, setRelatedTransportations] = useState([]);
  const [mainTab, setMainTab] = useState('vehicle');
  const [driverTab, setDriverTab] = useState('info');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const { user, requireAuthForBooking } = useAuthCheck();
  const [showBooking, setShowBooking] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingForm, setBookingForm] = useState({
    date: '',
    days: 1,
    passengers: 1,
    pickupLocation: '',
    dropoffLocation: '',
    fullName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    fetchTransportation();
    // eslint-disable-next-line
  }, [id]);

  const fetchTransportation = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/transportations/${id}`);
      const transportData = response.data;
      setTransportation(transportData);
      setSelectedImage(transportData.mainImage);

      // Fetch driver if available
      if (transportData.assignedDrivers && transportData.assignedDrivers.length > 0) {
        await fetchDriver(transportData.assignedDrivers[0]);
      }

      // Fetch related transportations
      const allResponse = await axios.get('/transportations', {
        params: { status: 'active', type: transportData.type }
      });
      const related = allResponse.data
        .filter(t => t._id !== transportData._id)
        .slice(0, 4);
      setRelatedTransportations(related);
    } catch (error) {
      console.error('Error fetching transportation details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDriver = async (driverId) => {
    try {
      const driverResponse = await axios.get(`/drivers/${driverId}`);
      setDriver(driverResponse.data);
    } catch (error) {
      console.error('Error fetching driver details:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!driver?._id) return;
    setSubmittingReview(true);
    setReviewError('');
    try {
      await axios.post(
        `/drivers/${driver._id}/reviews`,
        { rating: Number(reviewRating), comment: reviewComment },
        { withCredentials: true }
      );
      setReviewComment('');
      setReviewRating(5);
      await fetchDriver(driver._id);
    } catch (error) {
      const msg = error.response?.data?.msg || 'Failed to submit review. Please try again.';
      setReviewError(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const openBooking = () => {
    if (!transportation) return;
    const ok = requireAuthForBooking('transportation-booking', { vehicleId: transportation._id });
    if (!ok) return;
    setBookingError('');
    setBookingForm((prev) => ({
      ...prev,
      fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : prev.fullName,
      email: user?.email || prev.email,
      phone: user?.phoneNumber || prev.phone
    }));
    setShowBooking(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!transportation) return;
    setSubmittingBooking(true);
    setBookingError('');
    try {
      const payload = {
        vehicleId: transportation._id,
        customerDetails: {
          fullName: bookingForm.fullName,
          email: bookingForm.email,
          phone: bookingForm.phone
        },
        tripDetails: {
          date: bookingForm.date,
          days: Number(bookingForm.days) || 1,
          passengers: Number(bookingForm.passengers) || 1,
          pickupLocation: bookingForm.pickupLocation,
          dropoffLocation: bookingForm.dropoffLocation,
          specialRequests: ''
        }
      };
      const res = await transportationBookingsAPI.create(payload);
      if (res?.booking) {
        setShowBooking(false);
        navigate('/account', { state: { activeTab: 'transportation' } });
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-teal-50 via-white to-blue-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-teal-500 border-t-transparent"></div>
          <Car className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-teal-500 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!transportation) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="bg-white border-2 border-red-200 text-red-700 px-8 py-6 rounded-2xl shadow-2xl max-w-md text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-6">Sorry, we couldn't find the vehicle you're looking for.</p>
          <button
            onClick={() => navigate('/transportations')}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="inline w-4 h-4 mr-2" />
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="bg-white px-20 mt-6 min-h-screen">
      

      {/* Image Gallery Container */}
      <div className="container mx-auto px-4 pb-12">


        <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          {/* Main Image Section */}
          <div className="relative h-[600px] overflow-hidden group">
            <img
              src={selectedImage || transportation.mainImage}
              alt={transportation.name}
              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            />
            
            {/* Premium Dark Gradient Overlay - Deeper at the bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            
            {/* Action Buttons Top Left (Share/Save) */}
            <div className="absolute top-6 left-6 flex gap-3">
              <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-gray-900 transition-all shadow-lg">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-all shadow-lg">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Availability Badge - High contrast */}
            <div className="absolute top-6 right-6">
              {transportation.availability !== 'available' ? (
                <div className="bg-amber-400 text-amber-950 px-6 py-2 rounded-2xl font-bold shadow-2xl flex items-center gap-2 animate-pulse">
                  <Clock className="w-4 h-4" />
                  {transportation.availability}
                </div>
              ) : (
                <div className="bg-emerald-500 text-white px-6 py-2 rounded-2xl font-bold shadow-2xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Ready for Booking
                </div>
              )}
            </div>
            
            {/* Center Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-10">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="flex-1 space-y-4">                
                  <h1 className="text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">
                    {transportation.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-white bg-white/15 border border-white/10 backdrop-blur-xl px-5 py-2.5 rounded-2xl">
                      <MapPin className="w-5 h-5 text-teal-500" />
                      <span className="font-medium">{transportation.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white bg-white/15 border border-white/10 backdrop-blur-xl px-5 py-2.5 rounded-2xl">
                      <Users className="w-5 h-5 text-teal-500" />
                      <span className="font-medium">{transportation.capacity} People</span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Rating Card */}
                {transportation.rating > 0 && (
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-4 transform transition-transform hover:-translate-y-2">
                    <div className="bg-yellow-50 p-3 rounded-2xl">
                      <Star className="w-8 h-8 text-yellow-500 fill-current" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-black text-3xl text-gray-900">
                          {transportation.rating.toFixed(1)}
                        </span>
                        <span className="text-gray-400 font-bold">/ 5</span>
                      </div>
                      <p className="text-sm font-semibold text-teal-600">
                        {transportation.reviewCount}+ Happy Clients
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail Strip with Soft Background */}
          {transportation.images && transportation.images.length > 1 && (
            <div className="p-8 bg-gray-50/50">
              <div className="flex gap-4 overflow-x-auto p-4 pb-2 scrollbar-hide">
                {transportation.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative min-w-[140px] h-24 rounded-2xl overflow-hidden transition-all duration-500 ${
                      selectedImage === img 
                        ? 'ring-4 ring-teal-500 scale-105 shadow-2xl' 
                        : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                    }`}
                  >
                    <img
                      src={img}
                      alt="Gallery"
                      className="w-full h-full object-cover"
                    />
                    {selectedImage === img && (
                      <div className="absolute inset-0 bg-teal-500/10 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Main Tabs */}
            <div className="bg-white  p-2 mb-8 border border-gray-100">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setMainTab('vehicle')}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-md font-semibold text-lg transition-all duration-300 ${
                    mainTab === 'vehicle'
                      ? 'bg-teal-500 text-white shadow-2xl'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-gray-300'
                  }`}
                >
                  <Car className="w-5 h-5" />
                  About This Vehicle
                </button>
                {driver && (
                  <button
                    onClick={() => setMainTab('driver')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-md font-semibold text-lg transition-all duration-300 ${
                      mainTab === 'driver'
                        ? 'bg-teal-500 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-gray-300'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    Your Driver
                  </button>
                )}
              </div>
            </div>

            {/* Vehicle Tab Content */}
            {mainTab === 'vehicle' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Executive Description Card */}
                <div className="relative overflow-hidden bg-white rounded-[2rem] p-8 md:p-10 border border-slate-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <div className="absolute top-0 left-0 w-2 h-full bg-teal-500" />
                  <h2 className="text-md font-semibold uppercase tracking-[0.2em] text-teal-500 mb-4">About this vehicle</h2>
                  <p className="text-slate-700 leading-relaxed text-xl  italic">
                    "{transportation.description}"
                  </p>
                </div>

                {/* Vehicle Specifications - Technical Grid */}
                <div className="bg-slate-50/50 rounded-[2.5rem] p-8 md:p-10 border border-slate-300">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100">
                      <Settings className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Technical Specifications</h2>
                      <p className="text-md text-slate-500 font-medium">Core performance and comfort metrics</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {[
                      { label: 'Capacity', val: `${transportation.capacity} Persons`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Fuel Type', val: transportation.fuelType, icon: Fuel, color: 'text-orange-600', bg: 'bg-orange-50' },
                      { label: 'Transmission', val: transportation.transmission, icon: Gauge, color: 'text-purple-600', bg: 'bg-purple-50' },
                      { label: 'Build Year', val: transportation.year || 'N/A', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { label: 'Insurance', val: transportation.insuranceIncluded ? 'Comprehensive' : 'Standard', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'Climate Control', val: transportation.airConditioning ? 'A/C Available' : 'No A/C', icon: Wind, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                    ].map((spec, i) => (
                      <div key={i} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`w-10 h-10 ${spec.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <spec.icon className={`w-5 h-5 ${spec.color}`} />
                        </div>
                        <p className="text-md font-semibold uppercase tracking-widest text-slate-400 mb-1">{spec.label}</p>
                        <p className="text-xl font-bold text-slate-800 capitalize">{spec.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features & Amenities - Modern Pills */}
                {transportation.features?.length > 0 && (
                  <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-300 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-pink-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Included Amenities</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {transportation.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-50/80 p-4 rounded-2xl border border-transparent hover:border-teal-200 hover:bg-white transition-all">
                          <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-white stroke-[4]" />
                          </div>
                          <span className="text-slate-700 font-semibold text-md tracking-tight">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locations Section - Split View */}
                {(transportation.pickupLocations?.length > 0 || transportation.dropoffLocations?.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pickup Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-300 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-slate-900 uppercase tracking-widest text-md">Pickup Hubs</h3>
                      </div>
                      <div className="space-y-2">
                        {transportation.pickupLocations.map((loc, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50/30 rounded-xl text-slate-700 font-semibold text-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            {loc}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dropoff Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-300 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                          <Navigation className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-slate-900 uppercase tracking-widest text-md">Dropoff Hubs</h3>
                      </div>
                      <div className="space-y-2">
                        {transportation.dropoffLocations.map((loc, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-emerald-50/30 rounded-xl text-slate-700 font-semibold text-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {loc}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Services - Pricing List */}
                {transportation.additionalServices?.length > 0 && (
                  <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-[100px]" />
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-teal-400" />
                      </div>
                      <h2 className="text-2xl font-black tracking-tight">Add-on Services</h2>
                    </div>
                    <div className="space-y-3">
                      {transportation.additionalServices.map((service, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-all group">
                          <div>
                            <p className="font-black text-lg text-white tracking-tight">{service.serviceName}</p>
                            {service.description && (
                              <p className="text-sm text-slate-400 mt-0.5">{service.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-teal-400">${service.price}</span>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Fixed Price</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cancellation Policy - Safety Card */}
                {transportation.cancellationPolicy && (
                  <div className="bg-rose-50 rounded-[2.5rem] p-8 border border-rose-100">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-rose-500" />
                      <h2 className="text-lg font-black text-rose-900 uppercase tracking-widest">Cancellation Policy</h2>
                    </div>
                    <p className="text-rose-800/80 leading-relaxed font-semibold">
                      {transportation.cancellationPolicy}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Driver Tab Content */}
            {mainTab === 'driver' && driver && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Profile Card Container */}
                <div className="bg-white rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-300 overflow-hidden">
                  
                  {/* Dynamic Tab Switcher - "SaaS Glass" Style */}
                  <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex gap-3">
                    <button
                      onClick={() => setDriverTab('info')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-semibold text-md transition-all duration-300 ${
                        driverTab === 'info'
                          ? 'bg-teal-500 text-white shadow-lg shadow-slate-200 scale-[1.02]'
                          : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-500 hover:text-teal-600'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Driver Profile
                    </button>
                    <button
                      onClick={() => setDriverTab('reviews')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-semibold text-md transition-all duration-300 ${
                        driverTab === 'reviews'
                          ? 'bg-teal-500 text-white shadow-lg shadow-slate-200 scale-[1.02]'
                          : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-500 hover:text-teal-600'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Reviews ({driver.reviews?.length || 0})
                    </button>
                  </div>

                  <div className="p-8 md:p-10">
                    {driverTab === 'info' && (
                      <div className="space-y-10">
                        {/* Driver Hero Section */}
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 pb-8 border-b border-slate-100">
                          <div className="relative group">
                            <div className="w-32 h-32 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-teal-900 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                              <User className="w-16 h-16 text-white -rotate-3 group-hover:rotate-0 transition-transform duration-500" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-md border border-slate-50">
                              <ShieldCheck className="w-5 h-5 text-teal-500" />
                            </div>
                          </div>

                          <div className="text-center md:text-left flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                              <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                                {driver.firstName} {driver.lastName}
                              </h3>
                              <div className="flex items-center justify-center md:justify-start gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                <Star className="w-4 h-4 text-amber-500 fill-current" />
                                <span className="font-bold text-amber-700">{driver.rating?.toFixed(1) || 0} Rating</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 font-medium text-sm">
                              {driver.gender && (
                                <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-lg capitalize">
                                  {driver.gender}
                                </span>
                              )}
                              {driver.joinDate && (
                                <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-lg">
                                  Expert since {new Date(driver.joinDate).getFullYear()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Contact & Languages Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-300">
                            <p className="text-md font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">Secure Contact</p>
                            <div className="space-y-4">
                              {driver.phone && (
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                                    <Phone className="w-4 h-4 text-teal-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-400 font-bold">Phone Number</p>
                                    <p className="text-slate-900 font-bold">{driver.phone}</p>
                                  </div>
                                </div>
                              )}
                              {driver.email && (
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                                    <Mail className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="text-sm text-slate-400 font-bold">Official Email</p>
                                    <p className="text-slate-900 font-bold truncate">{driver.email}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-300">
                            <p className="text-md font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">Communication</p>
                            <div className="flex flex-wrap gap-2">
                              {driver.languagesSpoken?.map((lang, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                                  <span className="text-sm font-bold text-slate-700">{lang}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Address Info */}
                        {driver.address && (
                          <div className="p-6 bg-slate-50/50 rounded-[2rem] text-slate-700 border border-slate-300 flex items-center gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-6 h-6 text-teal-400" />
                            </div>
                            <div>
                              <p className="text-md font-semibold uppercase tracking-[0.2em] text-slate-500 mb-1">Base Location</p>
                              <p className="text-lg tracking-tight font-medium text-slate-700">
                                {typeof driver.address === 'string' ? driver.address : `${driver.address.street || ''}, ${driver.address.city || ''}, ${driver.address.country || ''}`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {driverTab === 'reviews' && (
                      <div className="space-y-8">
                        {/* Reviews List */}
                        <div className="grid grid-cols-1 gap-6">
                          {driver?.reviews && driver.reviews.length > 0 ? (
                            driver.reviews.map((review, index) => (
                              <div key={index} className="group p-6 rounded-[2rem] border border-slate-300 bg-white hover:bg-slate-50/50 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                                        {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                    </p>
                                  </div>
                                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-2xl">
                                    {review.user?.email?.charAt(0) || 'U'}
                                  </div>
                                </div>
                                <p className="text-slate-700 text-lg leading-relaxed mb-4">"{review.comment}"</p>
                                <p className="text-sm font-bold text-slate-700">
                                  — {review.user.name || review.user.email || 'Anonymous Traveler'}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                              <p className="text-slate-500 font-medium">Be the first to share your experience</p>
                            </div>
                          )}
                        </div>

                        {/* Review Form - "Elevated UI" */}
                        <form onSubmit={handleSubmitReview} className="mt-12 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-300">
                          <h4 className="text-2xl font-semibold text-slate-900 tracking-tight mb-6 text-center">Rate your journey</h4>

                          <div className="flex flex-col items-center mb-8">
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  disabled={submittingReview}
                                  className="transition-all transform hover:scale-125 focus:scale-110"
                                >
                                  <Star className={`w-10 h-10 ${reviewRating >= star ? 'text-amber-400 fill-current' : 'text-slate-300'}`} />
                                </button>
                              ))}
                            </div>
                            <p className="text-md font-bold text-slate-400 uppercase mt-4 tracking-widest">Tap to rate</p>
                          </div>

                          <div className="mb-6">
                            <textarea
                              className="w-full rounded-2xl border-none p-5 text-slate-700 shadow-inner focus:ring-2 focus:ring-teal-500 transition-all text-lg"
                              rows="4"
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Tell us about the driver, the comfort, and the service..."
                              disabled={submittingReview}
                              required
                            />
                          </div>

                          {reviewError && <p className="text-sm text-rose-600 mb-4 font-bold text-center">⚠️ {reviewError}</p>}

                          <button
                            type="submit"
                            disabled={submittingReview || !reviewComment.trim()}
                            className="w-full py-5 rounded-2xl bg-teal-500 text-white font-semibold hover:text-black uppercase tracking-widest text-md hover:bg-white border-2 hover:border-teal-500 disabled:bg-teal-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                          >
                            {submittingReview ? 'Submitting Feedback...' : 'Post Experience'}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 flex flex-col gap-4">
            
            {/* Pricing Card */}
            <div className="bg-white rounded-3xl border border-slate-300 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.03)] overflow-hidden">
              {/* Frosted Status Header */}
              <div className="bg-slate-100 backdrop-blur-sm border-b border-slate-100 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${transportation.availability === 'available' ? 'bg-teal-500' : 'bg-rose-500'}`} />
                  <span className="text-xs font-black text-slate-500 uppercase tracking-[0.15em]">
                    Status: {transportation.availability}
                  </span>
                </div>
                <ShieldCheck className="w-5 h-5 text-teal-500" />
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold text-slate-900 tracking-tighter">${transportation.pricePerDay}</span>
                    <span className="text-slate-600 font-bold text-md uppercase tracking-widest">USD</span>
                  </div>
                  <p className="text-md text-slate-400 font-medium mt-1 uppercase tracking-tighter">Base rate per 24h period</p>
                </div>

                {/* Pricing Specs Table */}
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center text-md py-2 border-b border-slate-50">
                    <span className="text-slate-800">Kilometer Rate</span>
                    <span className="font-bold text-slate-900">${transportation.pricePerKm || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center text-md py-2 border-b border-slate-50">
                    <span className="text-slate-800">Service Fee</span>
                    <span className="font-bold text-teal-500">Included</span>
                  </div>
                </div>

                {/* The Primary Action Button */}
                <button
                  disabled={transportation.availability !== 'available'}
                  onClick={openBooking}
                  className="relative w-full overflow-hidden group/btn bg-teal-500 disabled:bg-slate-100 text-white disabled:text-slate-400 py-4 rounded-2xl font-bold transition-all duration-300"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <Zap className={`w-4 h-4 ${transportation.availability === 'available' ? 'text-white hover:text-black fill-teal-400' : ''}`} />
                    <span className="uppercase tracking-[0.1em] text-xs">Request Instant Booking</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Direct Contact Channels Card */}
            <div className="bg-white rounded-3xl border border-slate-300 p-4 space-y-1">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] px-4 py-2">Direct Channels</p>
              
              {/* Phone Link */}
              <a href="tel:+94714749285" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                  <Phone className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">+94 71 474 9285</span>
              </a>

              {/* Email Link */}
              <a href="mailto:fleet@agency.com" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                  <Mail className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">fleet@agency.com</span>
              </a>

              {/* WhatsApp Link */}
              <a 
                href="https://wa.me/94714749285" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-200">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-emerald-700">Chat on WhatsApp</span>
              </a>
            </div>

            {/* Trust Footer */}
            <div className="px-6 py-2 flex items-center justify-center gap-4 border-t border-slate-300">
                <div className="flex items-center gap-1 opacity-40">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-xs font-bold uppercase tracking-widest">Verified Fleet</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <div className="flex items-center gap-1 opacity-40">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs font-bold uppercase tracking-widest">Secure Payment</span>
                </div>
            </div>
          </div>
        </div>
        </div>

        {/* Related Vehicles */}
        {relatedTransportations.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="  rounded-xl">
                <Car className="w-7 h-7 text-teal-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Similar Vehicles You Might Like</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTransportations.map((related) => (
                <div
                  key={related._id}
                  className="bg-white rounded-md shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300  border border-gray-100 group"
                  onClick={() => navigate(`/transportations/${related._id}`)}
                >
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={related.mainImage}
                      alt={related.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-bold text-teal-200 capitalize">{related.type}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 mb-3 transition-colors">{related.name}</h3>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-baseline gap-1">
                        <DollarSign className="w-4 h-4 text-teal-600" />
                        <span className="text-2xl font-black text-teal-200">
                          {related.pricePerDay}
                        </span>
                        <span className="text-sm text-gray-600">/day</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        Up to {related.capacity} passengers
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <button
                onClick={() => navigate('/transportations')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 text-white rounded-md font-semibold text-lg hover:bg-white hover:text-black border-2 hover:border-teal-500 shadow-xl hover:shadow-2xl transition-all hover:scale-105 duration-300"
              >
                View All Vehicles
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Booking Modal */}
    {showBooking && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Book {transportation.name}</h3>
            <button onClick={() => setShowBooking(false)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pickup Date</label>
                <input type="date" required value={bookingForm.date}
                  onChange={(e)=>setBookingForm({...bookingForm, date: e.target.value})}
                  className="mt-1 w-full border rounded-md p-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Days</label>
                <input type="number" min="1" value={bookingForm.days}
                  onChange={(e)=>setBookingForm({...bookingForm, days: e.target.value})}
                  className="mt-1 w-full border rounded-md p-2"/>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Passengers</label>
                <input type="number" min="1" value={bookingForm.passengers}
                  onChange={(e)=>setBookingForm({...bookingForm, passengers: e.target.value})}
                  className="mt-1 w-full border rounded-md p-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                <input type="text" value={bookingForm.pickupLocation}
                  onChange={(e)=>setBookingForm({...bookingForm, pickupLocation: e.target.value})}
                  className="mt-1 w-full border rounded-md p-2"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dropoff Location</label>
              <input type="text" value={bookingForm.dropoffLocation}
                onChange={(e)=>setBookingForm({...bookingForm, dropoffLocation: e.target.value})}
                className="mt-1 w-full border rounded-md p-2"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" required value={bookingForm.fullName}
                  onChange={(e)=>setBookingForm({...bookingForm, fullName: e.target.value})}
                  className="mt-1 w-full border rounded-md p-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" required value={bookingForm.email}
                  onChange={(e)=>setBookingForm({...bookingForm, email: e.target.value})}
                  className="mt-1 w-full border rounded-md p-2"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" required value={bookingForm.phone}
                onChange={(e)=>setBookingForm({...bookingForm, phone: e.target.value})}
                className="mt-1 w-full border rounded-md p-2"/>
            </div>
            {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}
            <button type="submit" disabled={submittingBooking}
              className="w-full py-3 rounded-md bg-teal-500 text-white font-semibold hover:bg-white hover:text-black border-2 border-teal-500 transition">
              {submittingBooking ? 'Submitting...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default TransportationDetail;
