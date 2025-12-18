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
  MessageSquare
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
      

      {/* Image Gallery */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
          {/* Main Image */}
          <div className="relative h-[500px] overflow-hidden group">
            <img
              src={selectedImage || transportation.mainImage}
              alt={transportation.name}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            
            {/* Availability Badge */}
            {transportation.availability !== 'available' ? (
              <div className="absolute top-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-5 py-2.5 rounded-full font-bold shadow-xl animate-pulse">
                <Clock className="inline w-4 h-4 mr-2" />
                {transportation.availability}
              </div>
            ) : (
              <div className="absolute top-6 right-6 bg-teal-500 text-white px-5 py-2.5 rounded-full font-bold shadow-xl">
                <CheckCircle className="inline w-4 h-4 mr-2" />
                Available Now
              </div>
            )}
            
            {/* Title and Basic Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex justify-between items-end">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-teal-500 p-2 rounded-lg">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-emerald-200 text-sm font-semibold uppercase tracking-wider">
                      Premium {transportation.type}
                    </span>
                  </div>
                  <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-2xl">
                    {transportation.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-white/90">
                    <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                      <MapPin className="w-5 h-5 text-emerald-300" />
                      <span >{transportation.location}</span>
                    </span>
                    <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                      <Users className="w-5 h-5 text-emerald-300" />
                      <span >{transportation.capacity} Seats</span>
                    </span>
                    {transportation.year && (
                      <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                        <Calendar className="w-5 h-5 text-emerald-300" />
                        <span >{transportation.year}</span>
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Rating Badge */}
                {transportation.rating > 0 && (
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-xl">
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    <div>
                      <span className="font-bold text-2xl text-gray-800">
                        {transportation.rating.toFixed(1)}
                      </span>
                      <p className="text-xs text-gray-500">
                        {transportation.reviewCount} reviews
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {transportation.images && transportation.images.length > 1 && (
            <div className="flex gap-3 p-6 overflow-x-auto bg-gradient-to-r from-gray-50 to-teal-50">
              {transportation.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative flex-shrink-0 cursor-pointer transition-all duration-300 ${
                    selectedImage === img 
                      ? 'ring-4 ring-teal-500 rounded-md scale-105 shadow-xl' 
                      : 'opacity-70  hover:opacity-100 hover:scale-105 shadow-md'
                  }`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`${transportation.name} ${idx + 1}`}
                    className="w-28 h-28 object-cover rounded-md"
                  />
                  {selectedImage === img && (
                    <div className="absolute inset-0 bg-teal-500/20 rounded-md flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              ))}
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
              <div className="space-y-6 shadow-md p-6 rounded-md border border-gray-100">
            {/* Description */}
            <div className="bg-white rounded-md  p-8  transition-all duration-300 border border-gray-100">
              
              <p className="text-gray-700 leading-relaxed text-lg">{transportation.description}</p>
            </div>

            {/* Vehicle Specifications */}
            <div className="bg-gradient-to-br from-teal-50/50 via-green-50/50 to-blue-50/50 rounded-md  p-8  transition-all duration-300 border border-teal-50/10">
              <div className="flex items-center gap-3 mb-6">
                <div className=" rounded-xl">
                  <Settings className="w-6 h-6 text-teal-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Vehicle Specifications</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-md p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className=" p-2 rounded-lg">
                      <Users className="w-5 h-5 text-teal-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">Capacity</p>
                  </div>
                  <p className="font-semibold text-xl text-gray-800">{transportation.capacity} persons</p>
                </div>
                
                <div className="bg-white rounded-md p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className=" p-2 rounded-lg">
                      <Fuel className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">Fuel Type</p>
                  </div>
                  <p className="font-semibold text-xl text-gray-800 capitalize">{transportation.fuelType}</p>
                </div>
                
                <div className="bg-white rounded-md p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className=" p-2 rounded-lg">
                      <Settings className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">Transmission</p>
                  </div>
                  <p className="font-semibold text-xl text-gray-800 capitalize">{transportation.transmission}</p>
                </div>
                
                {transportation.year && (
                  <div className="bg-white rounded-md p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className=" p-2 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Year</p>
                    </div>
                    <p className="font-semibold text-xl text-gray-800">{transportation.year}</p>
                  </div>
                )}
                
                <div className="bg-white rounded-md p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className=" p-2 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">Insurance</p>
                  </div>
                  <p className="font-semibold text-lg text-gray-800">
                    {transportation.insuranceIncluded ? '✓ Included' : '✗ Not Included'}
                  </p>
                </div>
                
                <div className="bg-white rounded-md p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className=" p-2 rounded-lg">
                      <Wind className="w-5 h-5 text-cyan-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">AC</p>
                  </div>
                  <p className="font-semibold text-lg text-gray-800">
                    {transportation.airConditioning ? '✓ Available' : '✗ Not Available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            {transportation.features && transportation.features.length > 0 && (
              <div className="bg-white rounded-md  p-8  transition-all duration-300 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="  rounded-xl">
                    <Award className="w-6 h-6 text-pink-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Features & Amenities</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {transportation.features.map((feature, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5 border border-green-100"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-800 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pickup & Dropoff Locations */}
            {(transportation.pickupLocations?.length > 0 || transportation.dropoffLocations?.length > 0) && (
              <div className="bg-white rounded-md  p-8  transition-all duration-300 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className=" rounded-md">
                    <Navigation className="w-6 h-6 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Pickup & Dropoff Locations</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {transportation.pickupLocations?.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                      <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Pickup Locations
                      </h3>
                      <ul className="space-y-3">
                        {transportation.pickupLocations.map((loc, idx) => (
                          <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
                            <div className="bg-blue-100 p-1.5 rounded-lg mt-0.5">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-gray-700 font-medium">{loc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {transportation.dropoffLocations?.length > 0 && (
                    <div className="bg-gradient-to-br from-teal-50 to-green-50 p-6 rounded-xl border ">
                      <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-teal-600" />
                        Dropoff Locations
                      </h3>
                      <ul className="space-y-3">
                        {transportation.dropoffLocations.map((loc, idx) => (
                          <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
                            <div className="bg-teal-900 p-1.5 rounded-lg mt-0.5">
                              <MapPin className="w-4 h-4 text-teal-600" />
                            </div>
                            <span className="text-gray-700 font-medium">{loc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Services */}
            {transportation.additionalServices && transportation.additionalServices.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Additional Services</h2>
                </div>
                <div className="space-y-4">
                  {transportation.additionalServices.map((service, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gradient-to-r from-orange-50 to-yellow-50 p-5 rounded-xl hover:shadow-md transition-all border border-orange-100">
                      <div className="flex-1">
                        <p className="font-bold text-lg text-gray-800">{service.serviceName}</p>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        )}
                      </div>
                      <span className="font-bold text-2xl text-teal-600 ml-4">${service.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            {transportation.cancellationPolicy && (
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-md p-8 hover:shadow-xl transition-all duration-300 border border-red-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-red-500 to-pink-500 p-3 rounded-xl">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Cancellation Policy</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">{transportation.cancellationPolicy}</p>
              </div>
            )}
              </div>
            )}

            {/* Driver Tab Content */}
            {mainTab === 'driver' && driver && (
              <div className="space-y-6">
                {/* Driver Info */}
                <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className=" rounded-xl">
                      <User className="w-6 h-6 text-teal-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">Your Driver</h2>
                  </div>

                  {/* Driver Tabs */}
                  <div className="flex gap-2 mb-6 border-b border-gray-200">
                    <button
                      onClick={() => setDriverTab('info')}
                      className={`px-6 py-3 mb-4 font-bold transition-all ${
                        driverTab === 'info'
                          ? 'text-white bg-teal-500 rounded-md  shadow-lg '
                          : 'text-gray-600 hover:text-gray-800 border-2 border-gray-300 rounded-md '
                      }`}
                    >
                      <User className="inline w-4 h-4 mr-2" />
                      Driver Info
                    </button>
                    <button
                      onClick={() => setDriverTab('reviews')}
                      className={`px-6 py-3 mb-4 font-bold transition-all ${
                        driverTab === 'reviews'
                          ? 'text-white bg-teal-500 rounded-md shadow-lg'
                          : 'text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
                      }`}
                    >
                      <MessageSquare className="inline w-4 h-4 mr-2" />
                      Reviews ({driver.reviews?.length || 0})
                    </button>
                  </div>

                  {driverTab === 'info' && (
                    <div className="space-y-6">
                      {/* Driver Header */}
                      <div className="flex items-start gap-6 pb-6 border-b border-gray-200">
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-12 h-12 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {driver.firstName} {driver.lastName}
                          </h3>
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-bold text-gray-800">{driver.rating?.toFixed(1) || 0}</span>
                              <span className="text-sm text-gray-600">({driver.reviews?.length || 0})</span>
                            </div>
                            {driver.gender && (
                              <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold">
                                {driver.gender.charAt(0).toUpperCase() + driver.gender.slice(1)}
                              </span>
                            )}
                          </div>
                          {driver.joinDate && (
                            <p className="text-sm text-gray-600">
                              Joined {new Date(driver.joinDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {driver.phone && (
                          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-4 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-3 mb-2">
                              <Phone className="w-5 h-5 text-blue-600" />
                              <span className="text-sm font-medium text-gray-600">Phone</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-800">{driver.phone}</p>
                          </div>
                        )}
                        {driver.email && (
                          <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-4 rounded-xl border border-purple-100">
                            <div className="flex items-center gap-3 mb-2">
                              <Mail className="w-5 h-5 text-purple-600" />
                              <span className="text-sm font-medium text-gray-600">Email</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800 truncate">{driver.email}</p>
                          </div>
                        )}
                      </div>

                      {/* Languages */}
                      {driver.languagesSpoken && driver.languagesSpoken.length > 0 && (
                        <div className="bg-gradient-to-br from-teal-50/50 to-green-50/50 p-4 rounded-xl ">
                          <h4 className="font-semibold text-gray-800 mb-3">Languages Spoken</h4>
                          <div className="flex flex-wrap gap-2">
                            {driver.languagesSpoken.map((lang, idx) => (
                              <span key={idx} className="bg-white px-4 py-2 rounded-full text-sm font-medium text-teal-700 border border-teal-200">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Address */}
                      {driver.address && (
                        <div className="bg-gradient-to-br from-orange-50/50 to-yellow-50/50 p-4 rounded-xl border border-orange-100">
                          <div className="flex items-center gap-3 mb-3">
                            <MapPin className="w-5 h-5 text-orange-600" />
                            <h4 className="font-semibold text-gray-800">Address</h4>
                          </div>
                          <p className="text-gray-700">
                            {typeof driver.address === 'string' ? driver.address : `${driver.address.street || ''}, ${driver.address.city || ''}, ${driver.address.country || ''}`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {driverTab === 'reviews' && (
                    <div>
                      <div className="grid grid-cols-1 gap-4">
                        {driver?.reviews && driver.reviews.length > 0 ? (
                          driver.reviews.map((review, index) => (
                            <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                              <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <svg
                                        key={i}
                                        className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="ml-2 text-sm text-gray-600">{review.rating.toFixed(1)}</span>
                                </div>
                                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                              {review.user && (
                                <p className="mt-2 text-sm text-gray-500">
                                  By {review.user.name || review.user.email || 'Anonymous'}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No reviews yet.</p>
                        )}
                      </div>

                      <form onSubmit={handleSubmitReview} className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-800">Add a Review</h4>

                      <div className="flex flex-col items-start">
                          <label className="mb-1 text-sm font-medium text-gray-700">Rating</label>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                disabled={submittingReview}
                                className={`text-2xl transition-colors ${
                                  reviewRating >= star ? 'text-yellow-500' : 'text-gray-300'
                                } hover:text-yellow-600`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                      </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Comment</label>
                          <textarea
                            className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:outline-none"
                            rows="3"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your experience with this driver"
                            disabled={submittingReview}
                            required
                          />
                        </div>

                        {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}

                        <button
                          type="submit"
                          className="w-full rounded-md bg-teal-300 px-4 py-2 text-white transition hover:bg-white hover:text-black border-2 border-teal-500 disabled:cursor-not-allowed disabled:bg-teal-500"
                          disabled={submittingReview || !reviewComment.trim()}
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-md p-8 sticky top-4 border-1 border-teal-100/50 hover:border-teal-300/50 transition-all">
              {/* Price */}
              <div className="mb-8 text-center  -mx-8 -mt-8 p-6 rounded-t-2xl">
                <p className="text-black/90 text-sm font-semibold uppercase tracking-wider mb-2">Starting From</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-gray-600">
                    ${transportation.pricePerDay}
                  </span>
                  <span className="text-gray-600 text-2xl font-medium">/day</span>
                </div>
                {transportation.pricePerKm > 0 && (
                  <p className="text-gray-600 text-md mt-3 font-medium">
                    Plus ${transportation.pricePerKm} per kilometer
                  </p>
                )}
              </div>

              

              

              {/* Contact Information */}
              {transportation.contactDetails && (
                <div className="mb-8 bg-white rounded-md p-6  border border-gray-200">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-teal-500" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                  {transportation.contactDetails.phone && (
                    <a
                      href={`tel:${transportation.contactDetails.phone}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-teal-600 hover:bg-teal-50 p-3 rounded-lg transition-all"
                    >
                      <div className="bg-teal-900 p-2 rounded-lg">
                        <Phone className="w-4 h-4 text-teal-600" />
                      </div>
                      {transportation.contactDetails.phone}
                    </a>
                  )}
                  {transportation.contactDetails.email && (
                    <a
                      href={`mailto:${transportation.contactDetails.email}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-teal-600 hover:bg-teal-50 p-3 rounded-lg transition-all"
                    >
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      {transportation.contactDetails.email}
                    </a>
                  )}
                  {transportation.contactDetails.whatsapp && (
                    <a
                      href={`https://wa.me/${transportation.contactDetails.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-700 hover:text-green-600 hover:bg-green-50 p-3 rounded-lg transition-all"
                    >
                      <div className="bg-green-100 p-2 rounded-lg">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                      </div>
                      Chat on WhatsApp
                    </a>
                  )}
                  </div>
                </div>
              )}

              {/* Book Now Button */}
              <button
                className={`w-full py-4 rounded-md font-bold text-lg transition-all duration-300 shadow-xl ${
                  transportation.availability === 'available'
                    ? 'bg-teal-500 text-white hover:bg-white hover:text-black border-2 hover:border-teal-500 hover:scale-102'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                }`}
                disabled={transportation.availability !== 'available'}
                onClick={openBooking}
              >
                {transportation.availability === 'available' ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Book  Now
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Currently Unavailable
                  </span>
                )}
              </button>

              
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
