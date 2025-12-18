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
  ArrowLeft,
  Zap,
  Download,
  MapPin,
  ArrowRight,
  Star,
  PlusCircle
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
      const placeholder = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400';

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
          className="group relative bg-white rounded-[2rem] overflow-hidden border border-slate-300 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 cursor-pointer flex flex-col h-full"
        >
          {/* IMAGE CONTAINER */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={image}
              alt={service.title || service.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Subtle Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Floating Status Badge */}
            <div className="absolute top-4 left-4 z-20">
              <div className="px-3 py-1.5 rounded-xl bg-teal-50 backdrop-blur-md shadow-sm">
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                  {service.status || 'Live'}
                </p>
              </div>
            </div>

            {/* Floating Price Tag */}
            <div className="absolute top-4 right-4 z-20">
              <div className="px-4 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md text-white shadow-xl">
                <p className="text-sm font-semibold">
                  {service.price ? `$${service.price}` : 'Quote'}
                </p>
              </div>
            </div>
          </div>

          {/* CONTENT BODY */}
          <div className="p-6 flex flex-col flex-grow">
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-[0.2em] bg-teal-teal-500 px-2 py-0.5 rounded-md">
                  {serviceType.replace('s', '')}
                </span>
                {service.rating && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-xs font-bold text-slate-700">{service.rating}</span>
                  </div>
                )}
              </div>
              
              <h4 className="text-xl font-black text-slate-700  group-hover:text-teal-300 transition-colors line-clamp-1">
                {service.title || service.name || 'Premium Listing'}
              </h4>
              
              <p className="flex items-center gap-1 text-sm font-bold text-slate-500 mt-1">
                <MapPin className="h-3 w-3" />
                {secondary || 'Global Location'}
              </p>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-medium mb-2">
              {service.description || 'Experience our world-class hospitality and professional service standards.'}
            </p>

            {/* FOOTER ACTION */}
            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex -space-x-2">
                {/* Small visual detail: user avatars or icons */}
                <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  +12
                </div>
                <span className="pl-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest self-center">Views</span>
              </div>

              <button className="flex items-center border-2 border-teal-500/50 p-2 rounded-2xl gap-2 text-sm font-black text-slate-900 group-hover:gap-4 transition-all uppercase tracking-tighter">
                Manage <ArrowRight className="h-4 w-4 text-teal-500" />
              </button>
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
                  <div className="flex flex-col mb-8 items-center text-center">
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Tour & <span className="text-teal-500">Experience Management</span>
                  </h1>
                  {/* Minimalist Underline Accent */}
                  <div className="mt-4 h-1 w-12 bg-slate-200 rounded-full" />
                  </div>

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
                <div className="flex flex-col mb-8 items-center text-center">
                {/* Clean, Bold Title */}
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Hotel & <span className="text-teal-500">Room Management</span>
                </h1>
                {/* Minimalist Underline Accent */}
                <div className="mt-4 h-1 w-12 bg-slate-200 rounded-full" />
                </div>
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
                 <div className="flex flex-col mb-8 items-center text-center">
                  {/* Clean, Bold Title */}
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Activity & <span className="text-teal-500">Experience Management</span>
                  </h1>
                  {/* Minimalist Underline Accent */}
                  <div className="mt-4 h-1 w-12 bg-slate-200 rounded-full" />
                </div>
                
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
      <div className="bg-white mt-2 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            
            {/* Left Side: Welcome & Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-xs font-black uppercase  text-slate-400">
                  System Active
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
                Provider <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">Dashboard</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-500 font-medium ">
                Welcome back, <span className="text-slate-900 font-bold">{providerData?.companyName || 'Partner'}</span>. 
                <span className="hidden md:inline"> Here is what's happening today.</span>
              </p>
            </div>

            {/* Right Side: Quick Stats / Meta Info */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end px-6 border-r border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Services</span>
                <span className="text-2xl font-black text-slate-900">
                  {postedServices.tours.length + postedServices.hotels.length + postedServices.activities.length + postedServices.transportation.length}
                </span>
              </div>
              
              <div className="flex flex-col items-end">
                <button className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <Settings className="h-6 w-6 text-slate-600" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Categories Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {loadingCategories ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-6 bg-slate-50/50">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="relative bg-white border border-slate-200 rounded-3xl p-8 overflow-hidden shadow-sm">
                    {/* Background accent skeleton */}
                    <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-slate-100 opacity-50"></div>
                    
                    {/* Header: Icon & Title skeleton */}
                    <div className="flex items-center gap-5 mb-8">
                      <div className="flex-shrink-0 p-4 rounded-2xl bg-slate-100 animate-pulse">
                        <div className="h-10 w-10 bg-slate-200 rounded"></div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 w-28 bg-slate-200 rounded-lg animate-pulse"></div>
                        <div className="h-6 w-24 bg-slate-100 rounded-full animate-pulse"></div>
                      </div>
                    </div>

                    {/* Description skeleton */}
                    <div className="mb-10 space-y-2">
                      <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
                      <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse"></div>
                    </div>

                    {/* Action buttons skeleton */}
                    <div className="space-y-3">
                      <div className="h-14 bg-slate-200 rounded-2xl animate-pulse"></div>
                      <div className="h-12 bg-slate-100 rounded-2xl animate-pulse"></div>
                    </div>

                    {/* Footer skeleton */}
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="h-3 w-24 bg-slate-100 rounded animate-pulse"></div>
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="h-6 w-6 rounded-full bg-slate-100 border-2 border-white animate-pulse" />
                        ))}
                      </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-6 bg-slate-50/50">
                  {providerData.services.map((category) => {
                    const config = CATEGORY_CONFIG[category];
                    const CategoryIcon = config.icon;
                    const status = getCategoryStatus(category);
                    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG['not-requested'];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={category}
                        className="group relative bg-white border border-slate-200 rounded-3xl p-8 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-slate-300 flex flex-col justify-between overflow-hidden"
                      >
                        {/* Subtle Background Accent */}
                        <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.08] transition-transform duration-700 group-hover:scale-150 ${config.color}`} />

                        <div>
                          {/* Header: Icon & Title */}
                          <div className="flex items-center gap-5 mb-8">
                            <div className={`flex-shrink-0 p-4 rounded-2xl ${config.color} bg-opacity-10 transition-transform duration-500 group-hover:rotate-6`}>
                              <CategoryIcon className={`h-10 w-10 ${config.textColor}`} />
                            </div>
                            <div>
                              <h3 className="text-2xl font-semibold text-slate-600  leading-none">
                                {config.label}
                              </h3>
                              <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border-opacity-40`}>
                                <StatusIcon className="h-3.5 w-3.5" />
                                <span className="text-[11px] font-medium uppercase tracking-wider">
                                  {statusConfig.label}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Description - Larger Body Text */}
                          <div className="mb-10">
                            <p className="text-lg text-slate-700 leading-relaxed ">
                              {config.description}
                            </p>
                          </div>
                        </div>

                        {/* Action Tray */}
                        <div className="space-y-3">
                          {status === 'approved' ? (
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => handlePostService(category)}
                                className="col-span-2 flex items-center justify-center gap-2 py-4 px-6 bg-teal-500 text-white rounded-2xl font-bold text-base hover:bg-white hover:text-black border-2 border-teal-500 duration-500 active:scale-[0.98] transition-all shadow-md shadow-indigo-200"
                              >
                                <Plus className="h-5 w-5 stroke-[3px]" />
                                Post Service
                              </button>
                              <button
                                onClick={() => handleManageServices(category)}
                                className="col-span-2 flex items-center justify-center gap-2 py-3.5 px-6 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-white hover:border-slate-400 transition-all"
                              >
                                <Eye className="h-5 w-5" />
                                Manage Listings
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => (status === 'not-requested' || status === 'rejected') ? handleRequestApproval(category) : navigate('/service-provider/approvals')}
                              className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] border-2
                                ${status === 'pending' 
                                  ? 'bg-white border-amber-200 text-amber-600 hover:bg-amber-50' 
                                  : 'bg-blue-500 border-blue-600 text-white hover:bg-white hover:text-black hover:border-blue-500 duration-500'}`}
                            >
                              {status === 'pending' ? (
                                <>
                                  <Clock className="h-5 w-5" />
                                  Reviewing Application
                                </>
                              ) : (
                                <>
                                  <FileText className="h-5 w-5" />
                                  {status === 'rejected' ? 'Resubmit Request' : 'Get Approved'}
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Subtle Decorative Footer */}
                        <div className="mt-6 pt-6 border-t border-slate-300 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Service</span>
                            <div className="flex -space-x-2">
                                {[1,2,3].map(i => (
                                    <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-200" />
                                ))}
                            </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            )}
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-6 relative z-10">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-3 shadow-xl shadow-slate-200/50 flex flex-wrap items-center justify-between gap-4">
            
            {/* Left Side: Labels */}
            <div className="flex items-center gap-4 px-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
                <Zap className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">Quick Access</p>
                <p className="text-sm font-bold text-slate-600">Manage your operations</p>
              </div>
            </div>

            {/* Right Side: Action Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => navigate('/service-provider/approvals')}
                className="group flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-2xl font-bold text-sm hover:bg-white hover:text-black border-2 hover:border-teal-500 transition-all duration-300 shadow-lg shadow-slate-200"
              >
                <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>View Approval Requests</span>
              </button>



              <button
                onClick={() => window.print()}
                className="flex items-center justify-center h-11 w-11 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                title="Download Report"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>


        {/* Active Listings Section */}
        <div className="mt-16 space-y-12">
          
          {/* Header Section */}
          <div className="relative">
            <div className="flex flex-col items-center text-center space-y-4">
              <h2 className="text-5xl font-black text-slate-700 tracking-tight leading-none">
                Inventory <span className="text-teal-500 underline decoration-slate-200 underline-offset-8">Overview</span>
              </h2>
              <div className="max-w-2xl px-6 py-2 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-lg text-slate-500 font-medium italic">
                  {(() => {
                    const counts = {
                      tours: postedServices.tours.length,
                      hotels: postedServices.hotels.length,
                      activities: postedServices.activities.length,
                      transport: postedServices.transportation.length
                    };
                    const total = Object.values(counts).reduce((a, b) => a + b, 0);
                    
                    return total > 0 
                      ? `You are currently syncing ${total} live listings across the global marketplace.`
                      : 'Your digital storefront is empty. Activate a service to begin.';
                  })()}
                </p>
              </div>
            </div>
          </div>

          {loadingServices ? (
            /* Professional Skeleton Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="group relative bg-white rounded-[2rem] overflow-hidden border border-slate-300 shadow-sm animate-pulse">
                  {/* Image skeleton */}
                  <div className="relative h-64 bg-gradient-to-br from-slate-200 to-slate-100">
                    {/* Status badge skeleton */}
                    <div className="absolute top-4 left-4">
                      <div className="h-7 w-20 bg-white/60 backdrop-blur-sm rounded-xl"></div>
                    </div>
                    {/* Price badge skeleton */}
                    <div className="absolute top-4 right-4">
                      <div className="h-9 w-20 bg-slate-900/60 backdrop-blur-sm rounded-2xl"></div>
                    </div>
                  </div>

                  {/* Content skeleton */}
                  <div className="p-6 space-y-4">
                    {/* Category tag & rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-16 bg-slate-200 rounded-md"></div>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <div key={s} className="h-3 w-3 bg-slate-100 rounded-sm"></div>
                        ))}
                      </div>
                    </div>

                    {/* Title skeleton */}
                    <div className="h-6 w-3/4 bg-slate-200 rounded-lg"></div>
                    
                    {/* Location skeleton */}
                    <div className="h-4 w-1/2 bg-slate-100 rounded-lg"></div>

                    {/* Description skeleton */}
                    <div className="space-y-2 py-2">
                      <div className="h-3 w-full bg-slate-100 rounded"></div>
                      <div className="h-3 w-5/6 bg-slate-100 rounded"></div>
                    </div>

                    {/* Footer skeleton */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 bg-slate-100 rounded-full"></div>
                        <div className="h-3 w-16 bg-slate-100 rounded"></div>
                      </div>
                      <div className="h-10 w-28 bg-slate-200 rounded-2xl"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {/* Dynamic Sections Generator */}
              {[
                { id: 'tours', label: ' Tours', icon: Package, data: postedServices.tours, color: 'bg-blue-50 text-blue-600' },
                { id: 'hotels', label: 'Accommodation', icon: Building2, data: postedServices.hotels, color: 'bg-purple-50 text-purple-600' },
                { id: 'activities', label: ' Activities', icon: Compass, data: postedServices.activities, color: 'bg-emerald-50 text-emerald-600' },
                { id: 'transportation', label: 'Transportations', icon: Car, data: postedServices.transportation, color: 'bg-orange-50 text-orange-600' }
              ].map((section) => section.data.length > 0 && (
                <section key={section.id} className="relative">
                  {/* Section Heading with "View All" Style */}
                  <div className="flex items-end justify-between mb-8 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${section.color}`}>
                        <section.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-700 ">{section.label}</h3>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{section.data.length} Live Assets</p>
                      </div>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {section.data.map(item => renderServiceCard(item, section.id))}
                  </div>
                </section>
              ))}

              {/* No Services - "Empty State" Component */}
              {Object.values(postedServices).every(arr => arr.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20 px-6 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <div className="h-24 w-24 bg-white rounded-full shadow-2xl flex items-center justify-center mb-6">
                    <PlusCircle className="h-12 w-12 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Ready to expand?</h3>
                  <p className="text-slate-500 text-center max-w-sm font-medium mb-8">
                    Your inventory is currently empty. Start by selecting an approved category above to list your first service.
                  </p>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                  >
                    Browse Categories
                  </button>
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
