import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Package, 
  Compass, 
  Building2, 
  Car, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Plus,
  FileText,
  Eye,
  Settings,
  TrendingUp,
  Users,
  ArrowLeft
} from 'lucide-react';

// Import management components
import HotelManagement from './HotelManagement';
import RoomManagement from './RoomManagement/index';
import AddTour from '../Components/AddTour';
import AllTours from '../Components/AllTours';
import ActivityForm from './admin/ActivityForm';
import AllActivities from '../Components/AllActivities';
import TransportationManagement from './TransportationManagement';
import CategoryApprovalModal from '../Components/CategoryApprovalModal';
const CATEGORY_CONFIG = {
  'tour-packages': {
    label: 'Tour Packages',
    icon: Package,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    description: 'Create and manage tour packages',
    postRoute: '/service-provider/tours/manage',
    manageRoute: '/service-provider/tours'
  },
  'excursions': {
    label: 'Excursions',
    icon: Compass,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-700',
    description: 'Create and manage excursion activities',
    postRoute: '/service-provider/activities/manage',
    manageRoute: '/service-provider/activities'
  },
  'accommodation': {
    label: 'Accommodation',
    icon: Building2,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    description: 'List and manage accommodation properties',
    postRoute: '/service-provider/hotels/manage',
    manageRoute: '/service-provider/hotels'
  },
  'transportation': {
    label: 'Transportation',
    icon: Car,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    description: 'Manage transportation services',
    postRoute: '/service-provider/transport/manage',
    manageRoute: '/service-provider/transport'
  }
};

const STATUS_CONFIG = {
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300'
  },
  pending: {
    label: 'Pending Review',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300'
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300'
  },
  'not-requested': {
    label: 'Not Requested',
    icon: AlertCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300'
  }
};

export default function ServiceProviderDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [providerData, setProviderData] = useState(null);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'tours', 'add-tour', 'activities', etc.
  const [stats, setStats] = useState({
    totalCategories: 0,
    approvedCategories: 0,
    pendingCategories: 0,
    rejectedCategories: 0
  });
  const [postedServices, setPostedServices] = useState({
    tours: [],
    hotels: [],
    activities: [],
    transportation: []
  });
  const [loadingServices, setLoadingServices] = useState(false);
  const [tourTab, setTourTab] = useState('add'); // 'add' | 'list'
  const [hotelTab, setHotelTab] = useState('hotels'); // 'hotels' | 'rooms'
  const [activityTab, setActivityTab] = useState('add'); // 'add' | 'list'
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchPostedServices = async () => {
    try {
      setLoadingServices(true);
      
      // Fetch tours
      try {
        const toursRes = await axios.get('/tours/my-tours');
        setPostedServices(prev => ({
          ...prev,
          tours: Array.isArray(toursRes.data) ? toursRes.data : toursRes.data.data || []
        }));
      } catch (err) {
        console.log('Could not fetch tours');
      }

      // Fetch hotels
      try {
        const hotelsRes = await axios.get('/hotels/my-hotels');
        setPostedServices(prev => ({
          ...prev,
          hotels: Array.isArray(hotelsRes.data) ? hotelsRes.data : hotelsRes.data.data || []
        }));
      } catch (err) {
        console.log('Could not fetch hotels');
      }

      // Fetch activities
      try {
        const activitiesRes = await axios.get('/activities/my-activities');
        setPostedServices(prev => ({
          ...prev,
          activities: Array.isArray(activitiesRes.data) ? activitiesRes.data : activitiesRes.data.data || []
        }));
      } catch (err) {
        console.log('Could not fetch activities');
      }

      // Fetch transportation
      try {
        const transportRes = await axios.get('/transportations/my-transportations');
        setPostedServices(prev => ({
          ...prev,
          transportation: Array.isArray(transportRes.data) ? transportRes.data : transportRes.data.data || []
        }));
      } catch (err) {
        console.log('Could not fetch transportation');
      }
    } catch (err) {
      console.error('Error fetching posted services:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch service provider profile
      const profileResponse = await axios.get('/service-providers/profile/me');
      setProviderData(profileResponse.data);
      
      // Fetch approval requests
      const requestsResponse = await axios.get('/category-approvals/my-requests');
      setApprovalRequests(requestsResponse.data);
      
      // Calculate stats
      calculateStats(profileResponse.data, requestsResponse.data);
      
      // Fetch posted services
      await fetchPostedServices();
      setLoadingCategories(false);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.msg || 'Failed to load dashboard data');
      setLoadingCategories(false);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (provider, requests) => {
    const totalCategories = provider.services?.length || 0;
    const approvedCategories = provider.serviceApprovals?.filter(a => a.isApproved).length || 0;
    
    const requestsByCategory = {};
    requests.forEach(req => {
      requestsByCategory[req.category] = req.status;
    });
    
    const pendingCategories = Object.values(requestsByCategory).filter(s => s === 'pending').length;
    const rejectedCategories = Object.values(requestsByCategory).filter(s => s === 'rejected').length;
    
    setStats({
      totalCategories,
      approvedCategories,
      pendingCategories,
      rejectedCategories
    });
  };

  const getCategoryStatus = (category) => {
    // Check if approved
    const approval = providerData?.serviceApprovals?.find(a => a.service === category);
    if (approval?.isApproved) {
      return 'approved';
    }
    
    // Check approval request status
    const request = approvalRequests.find(r => r.category === category);
    if (request) {
      return request.status === 'resubmission-required' ? 'pending' : request.status;
    }
    
    // Check if in services but not requested
    if (providerData?.services?.includes(category)) {
      return 'not-requested';
    }
    
    return null;
  };

  const handleRequestApproval = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleModalSuccess = () => {
    // Refresh dashboard data after successful submission
    fetchDashboardData();
  };

  const handlePostService = (category) => {
    // Set the active view based on category
    switch(category) {
      case 'tour-packages':
        setActiveView('tours');
        break;
      case 'excursions':
        setActiveView('activities');
        break;
      case 'accommodation':
        setActiveView('hotels');
        break;
      case 'transportation':
        setActiveView('transport');
        break;
      default:
        break;
    }
  };

  const handleManageServices = (category) => {
    // Same as handlePostService - the management component handles both adding and managing
    handlePostService(category);
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
  };

  const renderServiceCard = (service, serviceType) => {
    const placeholder = 'https://via.placeholder.com/400x260?text=Service';

    const image =
      service.image ||
      service.mainImage ||
      service.tour_image?.[0] ||
      service.gallery?.[0] ||
      service.images?.[0] ||
      placeholder;

    const secondary = {
      tours: service.destination,
      hotels: service.location,
      activities: service.location,
      transportation: service.location || service.vehicleType,
    }[serviceType];

    return (
      <div
        key={service._id}
        onClick={() => navigate(`/${serviceType}/${service._id}`)}
        className="
          group cursor-pointer
          rounded-xl overflow-hidden
          bg-white border border-gray-200
          shadow-md hover:shadow-2xl
          transition-all duration-300
        "
      >
        {/* IMAGE */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={image}
            alt={service.title || service.name || 'Service'}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholder;
            }}
            className="
              w-full h-full object-cover
              transform transition-transform duration-500
              
            "
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors duration-300" />

          {/* Status */}
          <div className="absolute top-3 right-3 z-20">
            <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-white/80 backdrop-blur text-gray-800">
              {service.status || 'Active'}
            </span>
          </div>

          {/* Title Overlay (X animation fixed) */}
          <div
            className="
              absolute bottom-0 left-0 right-0
              px-4 py-3 z-20
              transform translate-x-0
              transition-transform duration-300 ease-out
              group-hover:translate-x-3
            "
          >
            <h4 className="text-2xl font-semibold text-white line-clamp-2">
              {service.title || service.name || 'Untitled'}
            </h4>

            {secondary && (
              <p className="text-sm text-gray-200">
                {secondary}
              </p>
            )}
          </div>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {service.description ||
              'A carefully curated service designed to deliver an excellent experience.'}
          </p>

          {/* FOOTER */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold text-gray-900">
                {service.price ? `$${service.price}` : 'Contact for price'}
              </div>
              {service.rating && (
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill={star <= service.rating ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        className={`w-4 h-4 ${star <= service.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.947a1 1 0 00.95.69h4.154c.969 0 1.371 1.24.588 1.81l-3.362 2.44a1 1 0 00-.364 1.118l1.287 3.946c.3.922-.755 1.688-1.54 1.118l-3.362-2.44a1 1 0 00-1.176 0l-3.362 2.44c-.784.57-1.838-.196-1.539-1.118l1.286-3.946a1 1 0 00-.364-1.118L2.07 9.374c-.784-.57-.38-1.81.588-1.81h4.154a1 1 0 00.95-.69l1.286-3.947z" />
                      </svg>
                    ))}
                  </div>
              )}
            </div>

            <div
              className="
                px-4 py-2 rounded-md text-sm font-semibold
                bg-teal-500 text-white
                border-2 border-teal-500
                transition-all duration-300
                hover:bg-white hover:text-teal-600
              "
            >
              View Details →
            </div>
          </div>
        </div>
      </div>
    );
  };




  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render different views based on activeView
  const renderSection = () => {
    switch (activeView) {
      case 'tours':
        return (
          <div className="min-h-screen ">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 py-2">
                <button
                  onClick={handleBackToDashboard}
                  className="inline-flex items-center text-sm font-medium bg-white text-black border-2 shadow-2xl rounded-md px-4 py-2 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </button>
              </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="bg-white rounded-md p-2 mb-6 border border-gray-200 shadow-sm">
                      <div className="flex px-6 gap-2">
                        <button
                          onClick={() => setTourTab('add')}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-base transition-all ${
                            tourTab === 'add'
                              ? 'bg-teal-500 text-white shadow-lg shadow-cyan-500/30'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <Plus className="w-5 h-5" />
                          Add Tour
                        </button>
                        <button
                          onClick={() => setTourTab('list')}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-base transition-all ${
                            tourTab === 'list'
                              ? 'bg-teal-500 text-white shadow-lg shadow-cyan-500/30'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <Eye className="w-5 h-5" />
                          All Tours
                        </button>
                      </div>
                    </div>

                    <div className="mt-6">
                      {tourTab === 'add' ? <AddTour /> : <AllTours />}
                    </div>
                  </div>
                </div>
            </div>
           
          </div>
        );

      case 'hotels':
        return (
          <div className="min-h-screen ">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 py-2">
                <button
                  onClick={handleBackToDashboard}
                  className="inline-flex items-center text-sm font-medium bg-white text-black border-2 shadow-2xl rounded-md px-4 py-2 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </button>
              </div>


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="bg-white rounded-md p-2 mb-6 border border-gray-200 shadow-sm">
                    <div className="flex px-6 gap-2">
                      <button
                        onClick={() => setHotelTab('hotels')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-base transition-all ${
                          hotelTab === 'hotels'
                            ? 'bg-teal-500 text-white shadow-lg shadow-cyan-500/30'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                        Hotels
                      </button>
                      <button
                        onClick={() => setHotelTab('rooms')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-base transition-all ${
                          hotelTab === 'rooms'
                            ? 'bg-teal-500 text-white shadow-lg shadow-cyan-500/30'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <Package className="w-5 h-5" />
                        Rooms
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    {hotelTab === 'hotels' ? <HotelManagement /> : <RoomManagement />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'activities':
        return (
          <div className="min-h-screen">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 py-2">
                <button
                  onClick={handleBackToDashboard}
                  className="inline-flex items-center text-sm font-medium bg-white text-black border-2 shadow-2xl rounded-md px-4 py-2 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </button>
              </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="bg-white rounded-md p-2 mb-6 border border-gray-200 shadow-sm">
                    <div className="flex px-6 gap-2">
                      <button
                        onClick={() => setActivityTab('add')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-base transition-all ${
                          activityTab === 'add'
                            ? 'bg-teal-500 text-white shadow-lg shadow-cyan-500/30'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <Plus className="w-5 h-5" />
                        Add Activity
                      </button>
                      <button
                        onClick={() => setActivityTab('list')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-base transition-all ${
                          activityTab === 'list'
                            ? 'bg-teal-500 text-white shadow-lg shadow-cyan-500/30'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <Compass className="w-5 h-5" />
                        My Activities
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    {activityTab === 'add' ? <ActivityForm isStandalone={true} /> : <AllActivities />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'transport':
        return (
          <div className="min-h-screen ">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 py-2">
                <button
                  onClick={handleBackToDashboard}
                  className="inline-flex items-center text-sm font-medium bg-white text-black border-2 shadow-2xl rounded-md px-4 py-2 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </button>
              </div>
            <TransportationManagement />
          </div>
        );

      default:
        return null;
    }
  };

  // If we're not on the dashboard view, render the appropriate section
  if (activeView !== 'dashboard') {
    return renderSection();
  }

  // Default dashboard view
  return (
    <div className="min-h-screen bg-white/80">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center  mt-4">
              <h1 className="text-5xl font-black text-gray-900">
                Service Provider <span className='text-teal-500' >Dashboard</span> 
              </h1>
              <p className="mt-2 text-gray-600 text-xl tracking-wider">
                Welcome back, {providerData?.companyName || 'Service Provider'}
              </p>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Categories Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {loadingCategories ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="border-2 border-gray-200 rounded-lg p-4 bg-white animate-pulse flex flex-col shadow-md">
                    {/* Icon skeleton */}
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                    {/* Title & Description skeleton */}
                    <div className="text-center mb-2">
                      <div className="h-4 w-24 bg-gray-300 rounded mx-auto mb-1"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded mx-auto"></div>
                    </div>
                    {/* Status Badge skeleton */}
                    <div className="h-6 w-20 bg-gray-200 rounded mx-auto mb-3"></div>
                    {/* Buttons skeleton */}
                    <div className="space-y-1.5 flex-grow flex flex-col justify-center">
                      <div className="h-7 bg-gray-300 rounded"></div>
                      <div className="h-7 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : providerData?.services?.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Selected</h3>
                <p className="text-gray-600 mb-6">
                  You haven't selected any service categories yet. Request approval to get started.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Request Category Approval
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {providerData.services.map((category) => {
                  const config = CATEGORY_CONFIG[category];
                  const CategoryIcon = config.icon;
                  const status = getCategoryStatus(category);
                  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG['not-requested'];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={category}
                      className={`border-b-4 border-r-2 rounded-lg p-6 shadow-xl flex flex-col transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 cursor-pointer ${statusConfig.borderColor} ${statusConfig.bgColor}`}
                    >
                      {/* Category Header */}
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center justify-center">
                          <div className={`p-2 rounded-lg ${config.color} bg-opacity-10`}>
                            <CategoryIcon className={`h-10 w-10 ${config.textColor}`} />
                          </div>
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold tracking-wider text-gray-900 mb-0.5">{config.label}</h3>
                          <p className="text-xs text-gray-600">{config.description}</p>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-white">
                          <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.color}`} />
                          <span
                            className={`text-xs font-semibold uppercase tracking-wide ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-1.5 flex-grow flex flex-col justify-center">
                        {status === 'approved' && (
                          <>
                            <button
                              onClick={() => handlePostService(category)}
                              className="w-full px-3 py-1.5 bg-teal-500 text-white rounded-md hover:bg-white hover:text-black border-2 hover:border-teal-500 duration-300 flex items-center justify-center space-x-1.5 font-medium text-sm"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Post Service</span>
                            </button>
                            <button
                              onClick={() => handleManageServices(category)}
                              className="w-full px-3 py-1.5 bg-white text-black border-2 border-teal-500 hover:bg-teal-500 rounded-md hover:text-white duration-300 flex items-center justify-center space-x-1.5 font-medium text-sm"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Manage</span>
                            </button>
                          </>
                        )}

                        {status === 'pending' && (
                          <button
                            onClick={() => navigate('/service-provider/approvals')}
                            className="w-full px-3 py-1.5 bg-yellow-600 text-white rounded-md hover:bg-white hover:border-yellow-600 border-2 hover:text-black duration-300 flex items-center justify-center space-x-1.5 font-medium text-sm"
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>View Status</span>
                          </button>
                        )}

                        {status === 'rejected' && (
                          <button
                            onClick={() => handleRequestApproval(category)}
                            className="w-full px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-white hover:border-red-600 border-2 hover:text-black duration-300 flex items-center justify-center space-x-1.5 font-medium text-sm"
                          >
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Resubmit</span>
                          </button>
                        )}

                        {status === 'not-requested' && (
                          <button
                            onClick={() => handleRequestApproval(category)}
                            className="w-full px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-white hover:border-gray-600 border-2 hover:text-black duration-300 flex items-center justify-center space-x-1.5 font-medium text-sm"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Request Approval</span>
                          </button>
                        )}
                      </div>

                      {/* Approval Date */}
                      {status === 'approved' && (
                        <div className="flex justify-center pt-2 mt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Approved {new Date(
                              providerData.serviceApprovals.find(a => a.service === category)?.approvalDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/service-provider/approvals')}
            className="bg-teal-500 text-white hover:bg-white hover:text-black border-2 hover:border-teal-500 rounded-md shadow px-4 py-2  flex items-center duration-300 justify-center space-x-2"
          >
            <FileText className="h-5 w-5" />
            <span>View Requests</span>
          </button>

        </div>


        {/* Posted Services Section */}
        <div className="mt-10 bg-white rounded-lg shadow">
          <div className="px-6 text-center py-6 border-b border-gray-200">
            <h2 className="text-4xl font-bold text-gray-900">
              My <span className="text-teal-500">Active Listings</span>
            </h2>
            <p className="text-lg text-gray-600 mt-2">
              {(() => {
                const total = postedServices.tours.length + postedServices.hotels.length + 
                              postedServices.activities.length + postedServices.transportation.length;
                const types = [
                  postedServices.tours.length > 0 && `${postedServices.tours.length} Tour${postedServices.tours.length !== 1 ? 's' : ''}`,
                  postedServices.hotels.length > 0 && `${postedServices.hotels.length} Hotel${postedServices.hotels.length !== 1 ? 's' : ''}`,
                  postedServices.activities.length > 0 && `${postedServices.activities.length} ${postedServices.activities.length !== 1 ? 'Activities' : 'Activity'}`,
                  postedServices.transportation.length > 0 && `${postedServices.transportation.length} Transport${postedServices.transportation.length !== 1 ? 's' : ''}`
                ].filter(Boolean);
                
                return total > 0 
                  ? `Managing service across ${types.join(', ')}`
                  : 'Start posting your services to reach more customers';
              })()}
            </p>
          </div>

          {loadingServices ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 animate-pulse">
                    <div className="h-40 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 w-48 bg-gray-100 rounded mb-4"></div>
                      <div className="flex gap-3 mb-2">
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-10 bg-gray-200 rounded mt-3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Tours */}
              {postedServices.tours.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <Package className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Tours ({postedServices.tours.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {postedServices.tours.map(tour => renderServiceCard(tour, 'tours'))}
                  </div>
                </div>
              )}

              {/* Hotels */}
              {postedServices.hotels.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <Building2 className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Hotels ({postedServices.hotels.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {postedServices.hotels.map(hotel => renderServiceCard(hotel, 'hotels'))}
                  </div>
                </div>
              )}

              {/* Activities */}
              {postedServices.activities.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <Compass className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Activities ({postedServices.activities.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {postedServices.activities.map(activity => renderServiceCard(activity, 'activities'))}
                  </div>
                </div>
              )}

              {/* Transportation */}
              {postedServices.transportation.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <Car className="h-5 w-5 text-orange-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Transportation ({postedServices.transportation.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {postedServices.transportation.map(transport => renderServiceCard(transport, 'transportation'))}
                  </div>
                </div>
              )}

              {/* No Services Message */}
              {postedServices.tours.length === 0 && 
               postedServices.hotels.length === 0 && 
               postedServices.activities.length === 0 && 
               postedServices.transportation.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Posted Yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't posted any services yet. Get approval for a category and start posting!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Category Approval Modal */}
      <CategoryApprovalModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        preSelectedCategory={selectedCategory}
        existingRequests={approvalRequests}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
