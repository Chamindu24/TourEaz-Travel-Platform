import React, { useState, useEffect, useContext, useMemo, Fragment } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Dialog, Transition, Listbox, Tab } from '@headlessui/react';
import {
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon,
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckIcon,
  ChevronUpDownIcon,
  CloudArrowUpIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

// Image upload handler
const handleImageUpload = async (e, key, formData, setFormData, setSnackbar, setUploadProgress, setUploadStatuses) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const initialStatuses = files.map(file => ({
    file,
    status: 'pending',
    url: null,
    error: null,
  }));
  setUploadStatuses(prev => [...prev, ...initialStatuses]);

  let successCount = 0;
  let completedCount = 0;

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imgForm = new FormData();
      imgForm.append('image', file);

      setUploadStatuses(prev =>
        prev.map((s, idx) =>
          idx === prev.length - files.length + i ? { ...s, status: 'uploading' } : s
        )
      );

      try {
        const res = await fetch(
          'https://api.imgbb.com/1/upload?key=4e08e03047ee0d48610586ad270e2b39',
          { method: 'POST', body: imgForm }
        );
        const data = await res.json();

        if (data.data?.url) {
          setFormData(prev => ({
            ...prev,
            [key]: [...prev[key], data.data.url],
          }));
          setUploadStatuses(prev =>
            prev.map((s, idx) =>
              idx === prev.length - files.length + i
                ? { ...s, status: 'success', url: data.data.url }
                : s
            )
          );
          successCount++;
          completedCount++;
          setUploadProgress((completedCount / files.length) * 100);
          setSnackbar({
            open: true,
            message: `Image ${successCount} of ${files.length} uploaded`,
            severity: 'success',
          });
        } else {
          throw new Error('Upload failed');
        }
      } catch (err) {
        console.error('Image upload failed:', err);
        setUploadStatuses(prev =>
          prev.map((s, idx) =>
            idx === prev.length - files.length + i
              ? { ...s, status: 'error', error: `Failed to upload ${file.name}` }
              : s
          )
        );
        completedCount++;
        setUploadProgress((completedCount / files.length) * 100);
        setSnackbar({
          open: true,
          message: `Failed to upload image ${file.name}`,
          severity: 'error',
        });
      }
    }

    if (successCount === 0 && completedCount > 0) {
      setSnackbar({ open: true, message: 'No images were uploaded', severity: 'error' });
    }
  } catch (err) {
    console.error('Some images failed to upload:', err);
    setSnackbar({ open: true, message: 'Some images failed to upload', severity: 'error' });
  } finally {
    setTimeout(() => {
      setUploadProgress(0);
      setUploadStatuses(prev => prev.filter(s => s.status === 'success'));
    }, 1000);
  }
};

const TransportationManagement = () => {
  const { user } = useContext(AuthContext);
  const [transportations, setTransportations] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [editingTransportation, setEditingTransportation] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 for transportations, 1 for drivers
  const [formData, setFormData] = useState({
    name: '',
    type: 'car',
    description: '',
    capacity: '',
    pricePerDay: '',
    pricePerKm: '',
    features: [],
    featureInput: '',
    availability: 'available',
    location: '',
    pickupLocations: [],
    pickupInput: '',
    dropoffLocations: [],
    dropoffInput: '',
    driverIncluded: true,
    fuelType: 'petrol',
    transmission: 'manual',
    year: '',
    contactDetails: { phone: '', email: '', whatsapp: '' },
    images: [],
    mainImage: '',
    airConditioning: true,
    status: 'active',
    assignedDrivers: [],
  });
  const [driverFormData, setDriverFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'male',
    address: { street: '', city: '', state: '', postalCode: '', country: '' },
    languagesSpoken: [],
    languageInput: '',
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTransportation, setProfileTransportation] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatuses, setUploadStatuses] = useState([]);
  const placeholderImage = 'https://via.placeholder.com/160x110?text=Vehicle';

  const driverLookup = useMemo(() => (
    drivers.reduce((acc, driver) => {
      if (driver?._id) acc[driver._id] = driver;
      return acc;
    }, {})
  ), [drivers]);

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'Not set';
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    return formatter.format(Number(value));
  };

  useEffect(() => {
    fetchTransportations();
    fetchDrivers();
  }, []);

  const fetchTransportations = async () => {
    try {
      const endpoint = user?.role === 'admin' 
        ? '/transportations' 
        : '/transportations/my-transportations';
      
      const { data } = await axios.get(endpoint, { withCredentials: true });
      console.log('Transportations fetched:', data);
      setTransportations(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load transportations');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const endpoint = user?.role === 'admin'
        ? '/drivers'
        : '/drivers/my-drivers';
      const { data } = await axios.get(endpoint, { withCredentials: true });
      console.log('Drivers fetched:', data);
      setDrivers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load drivers');
    }
  };

  const openDialog = transportation => {
    if (transportation) {
      setEditingTransportation(transportation);
      setFormData({
        name: transportation.name,
        type: transportation.type,
        description: transportation.description || '',
        capacity: transportation.capacity,
        pricePerDay: transportation.pricePerDay,
        pricePerKm: transportation.pricePerKm || '',
        features: transportation.features || [],
        featureInput: '',
        availability: transportation.availability,
        location: transportation.location,
        pickupLocations: transportation.pickupLocations || [],
        pickupInput: '',
        dropoffLocations: transportation.dropoffLocations || [],
        dropoffInput: '',
        driverIncluded: transportation.driverIncluded,
        fuelType: transportation.fuelType,
        transmission: transportation.transmission,
        contactDetails: transportation.contactDetails || { phone: '', email: '', whatsapp: '' },
        images: transportation.images || [],
        mainImage: transportation.mainImage || '',
        airConditioning: transportation.airConditioning,
        status: transportation.status || 'active',
        assignedDrivers: transportation.assignedDrivers?.map(d => typeof d === 'string' ? d : d._id) || [],
      });
      setUploadStatuses(transportation.images.map(url => ({ file: null, status: 'success', url, error: null })));
    } else {
      setEditingTransportation(null);
      setFormData({
        name: '',
        type: 'car',
        description: '',
        capacity: '',
        pricePerDay: '',
        pricePerKm: '',
        features: [],
        featureInput: '',
        availability: 'available',
        location: '',
        pickupLocations: [],
        pickupInput: '',
        dropoffLocations: [],
        dropoffInput: '',
        driverIncluded: true,
        fuelType: 'petrol',
        transmission: 'manual',
        contactDetails: { phone: '', email: '', whatsapp: '' },
        images: [],
        mainImage: '',
        airConditioning: true,
        status: 'active',
        assignedDrivers: [],
      });
      setUploadStatuses([]);
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTransportation(null);
    setUploadProgress(0);
    setUploadStatuses([]);
  };

  const closeDriverDialog = () => {
    setDriverDialogOpen(false);
    setEditingDriver(null);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('contactDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactDetails: { ...prev.contactDetails, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleDriverChange = e => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setDriverFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setDriverFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const addFeature = () => {
    if (formData.featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, prev.featureInput.trim()],
        featureInput: ''
      }));
    }
  };

  const removeFeature = index => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addPickupLocation = () => {
    if (formData.pickupInput.trim()) {
      setFormData(prev => ({
        ...prev,
        pickupLocations: [...prev.pickupLocations, prev.pickupInput.trim()],
        pickupInput: ''
      }));
    }
  };

  const removePickupLocation = index => {
    setFormData(prev => ({
      ...prev,
      pickupLocations: prev.pickupLocations.filter((_, i) => i !== index)
    }));
  };

  const addDropoffLocation = () => {
    if (formData.dropoffInput.trim()) {
      setFormData(prev => ({
        ...prev,
        dropoffLocations: [...prev.dropoffLocations, prev.dropoffInput.trim()],
        dropoffInput: ''
      }));
    }
  };

  const removeDropoffLocation = index => {
    setFormData(prev => ({
      ...prev,
      dropoffLocations: prev.dropoffLocations.filter((_, i) => i !== index)
    }));
  };

  const addLanguage = () => {
    if (driverFormData.languageInput.trim()) {
      setDriverFormData(prev => ({
        ...prev,
        languagesSpoken: [...prev.languagesSpoken, prev.languageInput.trim()],
        languageInput: '',
      }));
    }
  };

  const removeLanguage = index => {
    setDriverFormData(prev => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.filter((_, i) => i !== index),
    }));
  };

  const toggleAssignedDriver = driverId => {
    setFormData(prev => ({
      ...prev,
      assignedDrivers: prev.assignedDrivers.includes(driverId)
        ? prev.assignedDrivers.filter(id => id !== driverId)
        : [...prev.assignedDrivers, driverId],
    }));
  };

  const removeImage = index => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setUploadStatuses(prev => prev.filter((_, i) => i !== index));
  };

  const setAsMainImage = url => {
    setFormData(prev => ({ ...prev, mainImage: url }));
  };

  const handleTransportationSubmit = async () => {
    try {
      if (!formData.mainImage && formData.images.length > 0) {
        setFormData(prev => ({ ...prev, mainImage: prev.images[0] }));
      }

      const payload = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        capacity: parseInt(formData.capacity),
        pricePerDay: parseFloat(formData.pricePerDay),
        pricePerKm: formData.pricePerKm ? parseFloat(formData.pricePerKm) : 0,
        features: formData.features,
        availability: formData.availability,
        location: formData.location,
        pickupLocations: formData.pickupLocations,
        dropoffLocations: formData.dropoffLocations,
        driverIncluded: formData.driverIncluded,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        contactDetails: formData.contactDetails,
        images: formData.images,
        mainImage: formData.mainImage || formData.images[0],
        airConditioning: formData.airConditioning,
        assignedDrivers: formData.assignedDrivers,
        status: formData.status,
      };

      if (editingTransportation) {
        const { data } = await axios.put(`/transportations/${editingTransportation._id}`, payload, { withCredentials: true });
        setTransportations(prev => prev.map(t => (t._id === data._id ? data : t)));
        setSnackbar({ open: true, message: 'Transportation updated successfully', severity: 'success' });
      } else {
        const { data } = await axios.post('/transportations', payload, { withCredentials: true });
        setTransportations(prev => [...prev, data]);
        setSnackbar({ open: true, message: 'Transportation created successfully', severity: 'success' });
      }
      closeDialog();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to save transportation', severity: 'error' });
    }
  };

  const handleDriverSubmit = async () => {
    try {
      const payload = {
        firstName: driverFormData.firstName,
        lastName: driverFormData.lastName,
        email: driverFormData.email,
        phone: driverFormData.phone,
        gender: driverFormData.gender,
        address: driverFormData.address,
        languagesSpoken: driverFormData.languagesSpoken,
      };

      if (editingDriver) {
        const { data } = await axios.put(`/drivers/${editingDriver._id}`, payload, { withCredentials: true });
        setDrivers(prev => prev.map(d => (d._id === data._id ? data : d)));
        setSnackbar({ open: true, message: 'Driver updated successfully', severity: 'success' });
      } else {
        const { data } = await axios.post('/drivers', payload, { withCredentials: true });
        setDrivers(prev => [...prev, data]);
        setSnackbar({ open: true, message: 'Driver created successfully', severity: 'success' });
      }
      closeDriverDialog();
      await fetchDrivers();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.msg || 'Failed to save driver';
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    }
  };

  const handleDeleteDriver = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      await axios.delete(`/drivers/${id}`, { withCredentials: true });
      setDrivers(prev => prev.filter(d => d._id !== id));
      setSnackbar({ open: true, message: 'Driver deleted successfully', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to delete driver', severity: 'error' });
    }
  };

  const openDriverDialog = (driver) => {
    if (driver) {
      setEditingDriver(driver);
      setDriverFormData({
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        phone: driver.phone,
        gender: driver.gender,
        address: driver.address || {},
        languagesSpoken: driver.languagesSpoken || [],
        languageInput: '',
      });
    } else {
      setEditingDriver(null);
      setDriverFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: 'male',
        address: { street: '', city: '', state: '', postalCode: '', country: '' },
        languagesSpoken: [],
        languageInput: '',
      });
    }
    setDriverDialogOpen(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this transportation?')) return;
    try {
      await axios.delete(`/transportations/${id}`, { withCredentials: true });
      setTransportations(prev => prev.filter(t => t._id !== id));
      setSnackbar({ open: true, message: 'Transportation deleted successfully', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to delete transportation', severity: 'error' });
    }
  };

  const openProfile = transportation => {
    setProfileTransportation(transportation);
    setProfileOpen(true);
  };

  const vehicleTypes = [
    { value: 'car', label: 'Car' },
    { value: 'van', label: 'Van' },
    { value: 'suv', label: 'SUV' },
    { value: 'bus', label: 'Bus' },
    { value: 'bike', label: 'Motorbike' },
  ];

  const transmissions = [
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automatic' },
  ];

  const fuelTypes = [
    { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'electric', label: 'Electric' },
  ];

  const totalTransportations = transportations.length;
  const availableTransportations = transportations.filter(t => t.availability === 'available').length;
  const activeDrivers = drivers.length;
  const driverAttachedVehicles = transportations.filter(t => (t.assignedDrivers || []).length > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-6 bg-white min-h-screen">
      {/* Header */}
      <div className=" flex flex-col mb-6 items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-700">Transportation & Driver Management</h1>
        <p className="text-gray-600 mt-2">Keep your fleet, drivers, and assignments organized from one modern view.</p>
      </div>

      {/* Stats Cards - Admin Only */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl p-6 text-white shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Fleet Size</p>
            <p className="text-4xl font-extrabold mt-2">{totalTransportations}</p>
            <p className="text-sm mt-1 opacity-90">Total vehicles in your catalog</p>
          </div>
          <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Ready to book</p>
            <p className="text-4xl font-extrabold mt-2">{availableTransportations}</p>
            <p className="text-sm mt-1 text-gray-400">Vehicles marked available</p>
          </div>
          <div className="bg-cyan-50 border border-cyan-200 rounded-3xl p-6 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">Drivers</p>
            <p className="text-4xl font-extrabold mt-2 text-gray-900">{activeDrivers}</p>
            <p className="text-sm mt-1 text-gray-600">Active driver profiles</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-900">Assigned</p>
            <p className="text-4xl font-extrabold mt-2 text-yellow-900">{driverAttachedVehicles}</p>
            <p className="text-sm mt-1 text-yellow-900">Vehicles with drivers attached</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <div className="bg-white rounded-md p-2 mb-6 border border-gray-200 shadow-sm">
          <Tab.List className="flex px-6 gap-2">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-base transition-all ${
                    selected
                      ? 'bg-teal-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <TruckIcon className="w-5 h-5" />
                  Vehicles ({totalTransportations})
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-base transition-all ${
                    selected
                      ? 'bg-teal-500 text-white shadow-lg shadow-purple-500/30'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  Drivers ({activeDrivers})
                </button>
              )}
            </Tab>
          </Tab.List>

          <Tab.Panels className="mt-6">
            {/* Transportations Panel */}
            <Tab.Panel>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => openDialog(null)}
                  className="flex items-center gap-2 bg-teal-500 text-white hover:bg-white hover:text-black border-2 hover:border-teal-500 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Transportation
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-teal-50 to-emerald-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Pricing</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Drivers</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transportations.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                              <TruckIcon className="w-10 h-10 text-cyan-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">No vehicles yet</h3>
                              <p className="text-gray-500 mt-1 mb-4">Start building your fleet by adding your first vehicle</p>
                              <button
                                onClick={() => openDialog(null)}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                              >
                                <PlusIcon className="w-5 h-5" />
                                Add Your First Vehicle
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      transportations.map((transportation) => {
                        const assignedCount = (transportation.assignedDrivers || []).length;
                        return (
                          <tr key={transportation._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <img
                                  src={transportation.mainImage || placeholderImage}
                                  alt={transportation.name}
                                  className="w-36 h-32 object-cover rounded-xl border border-gray-200 bg-gray-50"
                                />
                                <div>
                                  <div className="font-bold text-gray-800">{transportation.name}</div>
                                  <div className="flex gap-2 mt-1">
                                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                      {transportation.type}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                      {transportation.capacity || '-'} seats
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-800">{formatCurrency(transportation.pricePerDay)}/day</div>
                              <div className="text-semibold text-gray-800">
                                {transportation.pricePerKm ? `${formatCurrency(transportation.pricePerKm)}/km` : 'Per km not set'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-800">{transportation.location || 'Not specified'}</div>
                              {transportation.pickupLocations?.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Pickup: {transportation.pickupLocations.slice(0, 2).join(', ')}
                                  {transportation.pickupLocations.length > 2 && ' +'}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                <span
                                  className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${
                                    transportation.availability === 'available'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {transportation.availability}
                                </span>
                                <span className="inline-flex px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                  {transportation.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                                {transportation.driverIncluded && (
                                  <span className="inline-flex px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                    Driver Included
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                {transportation.assignedDrivers?.slice(0, 3).map((driverId) => {
                                  const driver = driverLookup[driverId];
                                  const initials = driver
                                    ? `${driver.firstName?.[0] || ''}${driver.lastName?.[0] || ''}`.toUpperCase()
                                    : 'DR';
                                  return (
                                    <div
                                      key={driverId}
                                      className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                                      title={driver ? `${driver.firstName} ${driver.lastName}` : 'Driver'}
                                    >
                                      {initials || 'DR'}
                                    </div>
                                  );
                                })}
                                {assignedCount > 3 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                                    +{assignedCount - 3}
                                  </span>
                                )}
                                {assignedCount === 0 && (
                                  <span className="text-xs text-gray-500">No drivers yet</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {assignedCount > 0 ? 'Manage from Edit to reassign' : 'Attach drivers to boost trust'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openProfile(transportation)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View profile"
                                >
                                  <EyeIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => openDialog(transportation)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(transportation._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>

            {/* Drivers Panel */}
            <Tab.Panel>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => openDriverDialog(null)}
                  className="flex items-center gap-2 bg-teal-400 text-white hover:bg-white hover:text-black border-2 hover:border-teal-500 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Driver
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Driver</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Languages</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drivers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center">
                              <UserIcon className="w-10 h-10 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">No drivers yet</h3>
                              <p className="text-gray-500 mt-1 mb-4">Build your team by adding professional drivers</p>
                              <button
                                onClick={() => openDriverDialog(null)}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                              >
                                <PlusIcon className="w-5 h-5" />
                                  Add Your First Driver
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      drivers.map((driver) => {
                        const initials = `${driver.firstName?.[0] || ''}${driver.lastName?.[0] || ''}`.toUpperCase();
                        return (
                          <tr key={driver._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                                  {initials || 'D'}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900">{driver.firstName} {driver.lastName}</div>
                                  <span className="inline-flex px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 mt-1">
                                    {driver.gender || 'Not set'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-800">{driver.email}</div>
                              <div className="text-semibold text-gray-800">{driver.phone}</div>
                            </td>
                            <td className="px-6 py-4">
                              {driver.languagesSpoken?.length ? (
                                <div className="flex flex-wrap gap-1">
                                  {driver.languagesSpoken.slice(0, 3).map((lang) => (
                                    <span
                                      key={lang}
                                      className="inline-flex px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                                    >
                                      {lang}
                                    </span>
                                  ))}
                                  {driver.languagesSpoken.length > 3 && (
                                    <span className="inline-flex px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                                      +{driver.languagesSpoken.length - 3}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">No languages set</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {driver.rating > 0 ? (
                                <span className="inline-flex px-3 py-1 rounded-lg text-sm font-semibold bg-green-100 text-green-800">
                                  {driver.rating.toFixed(1)} ({driver.reviewCount || 0})
                                </span>
                              ) : (
                                <span className="inline-flex px-3 py-1 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                  No reviews
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openDriverDialog(driver)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDriver(driver._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg ${
              snackbar.severity === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white font-semibold`}
          >
            {snackbar.message}
          </div>
        </div>
      )}

      {/* Transportation Dialog */}
      <Transition appear show={dialogOpen} as={Fragment}>
        <Dialog as="div" className="relative  z-1300" onClose={closeDialog}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 z-[1300] backdrop-blur-sm overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl z-[1300] transform overflow-hidden rounded-xl  bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 text-center">
                      <Dialog.Title className="text-2xl font-bold text-gray-800">
                        {editingTransportation ? 'Edit Transportation' : 'Add Transportation'}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">Provide vehicle details, pricing, availability, and assign drivers.</p>
                    </div>
                    <button onClick={closeDialog} className="text-gray-400 hover:text-gray-600">
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Name</label>
                          <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            placeholder="Toyota Hiace"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Type</label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          >
                            {vehicleTypes.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Capacity</label>
                          <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            placeholder="10"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Year</label>
                          <input
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            placeholder="2022"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Price Per Day (USD)</label>
                          <input
                            type="number"
                            name="pricePerDay"
                            value={formData.pricePerDay}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            placeholder="80"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Price Per Km (USD)</label>
                          <input
                            type="number"
                            name="pricePerKm"
                            value={formData.pricePerKm}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            placeholder="0.5"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Availability</label>
                          <select
                            name="availability"
                            value={formData.availability}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          >
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Status</label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Fuel Type</label>
                          <select
                            name="fuelType"
                            value={formData.fuelType}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          >
                            {fuelTypes.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Transmission</label>
                          <select
                            name="transmission"
                            value={formData.transmission}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          >
                            {transmissions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Location</label>
                          <input
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            placeholder="Colombo, Sri Lanka"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                          <label className="text-sm font-semibold text-gray-700">Driver Included</label>
                          <input
                            type="checkbox"
                            name="driverIncluded"
                            checked={formData.driverIncluded}
                            onChange={handleChange}
                            className="h-5 w-5 text-teal-500"
                          />
                          <label className="text-sm font-semibold text-gray-700 ml-4">Air Conditioning</label>
                          <input
                            type="checkbox"
                            name="airConditioning"
                            checked={formData.airConditioning}
                            onChange={handleChange}
                            className="h-5 w-5 text-teal-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                          className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          placeholder="Highlight comfort, luggage space, and ideal trip types."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Features</label>
                          <div className="flex gap-2 mt-1">
                            <input
                              name="featureInput"
                              value={formData.featureInput}
                              onChange={handleChange}
                              className="flex-1 rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                              placeholder="USB charging"
                            />
                            <button onClick={addFeature} className="px-4 py-0.5 bg-teal-500 text-white hover:bg-white hover:text-black border-2 hover:border-teal-500 rounded-md">Add</button>
                          </div>
                          {formData.features.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {formData.features.map((feature, idx) => (
                                <span key={feature + idx} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                                  {feature}
                                  <button onClick={() => removeFeature(idx)} className="text-gray-500 hover:text-gray-700">
                                    <XMarkIcon className="w-4 h-4" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Pickup Locations</label>
                            <div className="flex gap-2 mt-1">
                              <input
                                name="pickupInput"
                                value={formData.pickupInput}
                                onChange={handleChange}
                                className="flex-1 rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                placeholder="Airport, hotel"
                              />
                              <button onClick={addPickupLocation} className="px-4 py-0.5 bg-teal-500 text-white hover:bg-white hover:text-black border-2 hover:border-teal-500 rounded-md">Add</button>
                            </div>
                            {formData.pickupLocations.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {formData.pickupLocations.map((loc, idx) => (
                                  <span key={loc + idx} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                                    {loc}
                                    <button onClick={() => removePickupLocation(idx)} className="text-gray-500 hover:text-gray-700">
                                      <XMarkIcon className="w-4 h-4" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Dropoff Locations</label>
                            <div className="flex gap-2 mt-1">
                              <input
                                name="dropoffInput"
                                value={formData.dropoffInput}
                                onChange={handleChange}
                                className="flex-1 rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                placeholder="City center"
                              />
                              <button onClick={addDropoffLocation} className="px-3 py-0.5 bg-teal-500 text-white hover:bg-white hover:text-black border-2 hover:border-teal-500 rounded-md">Add</button>
                            </div>
                            {formData.dropoffLocations.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {formData.dropoffLocations.map((loc, idx) => (
                                  <span key={loc + idx} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                                    {loc}
                                    <button onClick={() => removeDropoffLocation(idx)} className="text-gray-500 hover:text-gray-700">
                                      <XMarkIcon className="w-4 h-4" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Contact Phone</label>
                          <input
                            name="contactDetails.phone"
                            value={formData.contactDetails.phone}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            placeholder="+94 71 234 5678"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Contact Email</label>
                          <input
                            name="contactDetails.email"
                            value={formData.contactDetails.email}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            placeholder="fleet@agency.com"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">WhatsApp</label>
                          <input
                            name="contactDetails.whatsapp"
                            value={formData.contactDetails.whatsapp}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            placeholder="WhatsApp number"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold text-gray-800">Upload Images</p>
                          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-500 cursor-pointer">
                            <CloudArrowUpIcon className="w-5 h-5" />
                            <span className="text-sm font-semibold">Upload</span>
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              onChange={e => handleImageUpload(e, 'images', formData, setFormData, setSnackbar, setUploadProgress, setUploadStatuses)}
                            />
                          </label>
                        </div>
                        {uploadProgress > 0 && (
                          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                            <div
                              className="bg-teal-500 h-2 rounded-full"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          {formData.images.map((img, idx) => (
                            <div key={img + idx} className={`relative rounded-lg overflow-hidden border ${formData.mainImage === img ? 'border-teal-500' : 'border-gray-200'}`}>
                              <img src={img} alt="Vehicle" className="w-full h-28 object-cover" />
                              <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition">
                                <div className="absolute top-2 right-2 flex gap-2">
                                  <button
                                    onClick={() => setAsMainImage(img)}
                                    className="px-2 py-1 rounded-lg text-xs font-semibold bg-white/90 text-teal-700"
                                  >
                                    {formData.mainImage === img ? 'Main' : 'Set Main'}
                                  </button>
                                  <button
                                    onClick={() => removeImage(idx)}
                                    className="p-1 rounded-full bg-white/90 text-red-600"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {uploadStatuses.length > 0 && (
                          <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                            {uploadStatuses.map((status, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm px-2 py-1 rounded bg-gray-50 border border-gray-100">
                                <span className="truncate">{status.file ? status.file.name : status.url}</span>
                                <span className={`text-xs font-semibold ${status.status === 'success' ? 'text-green-600' : status.status === 'uploading' ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {status.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-800">Assign Drivers</p>
                          <button
                            type="button"
                            onClick={() => openDriverDialog(null)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-teal-500 text-white text-sm font-semibold border-2 border-transparent hover:bg-white hover:text-black hover:border-teal-500 transition-all"
                          >
                            <PlusIcon className="w-4 h-4" />
                            Add New Driver
                          </button>
                        </div>
                        {drivers.length === 0 ? (
                          <p className="text-sm text-gray-500">No drivers available. Add drivers first.</p>
                        ) : (
                          <div className="max-h-72 overflow-y-auto space-y-2">
                            {drivers.map(driver => (
                              <label key={driver._id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 hover:border-teal-400">
                                <input
                                  type="checkbox"
                                  checked={formData.assignedDrivers.includes(driver._id)}
                                  onChange={() => toggleAssignedDriver(driver._id)}
                                  className="h-4 w-4 text-teal-500"
                                />
                                <div>
                                  <p className="font-semibold text-gray-800">{driver.firstName} {driver.lastName}</p>
                                  <p className="text-xs text-gray-500">{driver.phone}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={closeDialog}
                          className="px-5 py-3 rounded-md border-2 border-teal-500 text-black font-semibold hover:bg-teal-500 hover:text-white hover:scale-105 duration-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleTransportationSubmit}
                          className="px-5 py-3 rounded-lg  bg-teal-500 text-white hover:bg-white hover:text-black border-2 hover:border-teal-500 hover:scale-105 duration-300"
                        >
                          {editingTransportation ? 'Update Transportation' : 'Create Transportation'}
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Driver Dialog */}
      <Transition appear show={driverDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-1300" onClose={closeDriverDialog}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed z-[1300] inset-0 backdrop-blur-sm overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6  text-left align-middle shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 text-center">
                      <Dialog.Title className="text-2xl font-bold text-gray-800">
                        {editingDriver ? 'Edit Driver' : 'Add Driver'}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">Capture contact details, address, and spoken languages.</p>
                    </div>
                    <button onClick={closeDriverDialog} className="text-gray-400 hover:text-gray-600">
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 p-4 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">First Name</label>
                      <input
                        name="firstName"
                        value={driverFormData.firstName}
                        onChange={handleDriverChange}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none "
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Last Name</label>
                      <input
                        name="lastName"
                        value={driverFormData.lastName}
                        onChange={handleDriverChange}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none "
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Email</label>
                      <input
                        name="email"
                        value={driverFormData.email}
                        onChange={handleDriverChange}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none "
                        placeholder="driver@agency.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Phone</label>
                      <input
                        name="phone"
                        value={driverFormData.phone}
                        onChange={handleDriverChange}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none "
                        placeholder="+94 77 123 4567"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Gender</label>
                      <select
                        name="gender"
                        value={driverFormData.gender}
                        onChange={handleDriverChange}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none "
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Street</label>
                      <input
                        name="address.street"
                        value={driverFormData.address.street}
                        onChange={handleDriverChange}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none "
                        placeholder="123 Main St"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">City</label>
                      <input
                        name="address.city"
                        value={driverFormData.address.city}
                        onChange={handleDriverChange}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none "
                        placeholder="Colombo"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">State/Province</label>
                      <input
                        name="address.state"
                        value={driverFormData.address.state}
                        onChange={handleDriverChange}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none "
                        placeholder="Western"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Postal Code</label>
                      <input
                        name="address.postalCode"
                        value={driverFormData.address.postalCode}
                        onChange={handleDriverChange}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none "
                        placeholder="00100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Country</label>
                      <input
                        name="address.country"
                        value={driverFormData.address.country}
                        onChange={handleDriverChange}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none "
                        placeholder="Sri Lanka"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-semibold text-gray-700">Languages Spoken</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        name="languageInput"
                        value={driverFormData.languageInput}
                        onChange={handleDriverChange}
                        className="flex-1 rounded-lg border border-gray-200 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none "
                        placeholder="English"
                      />
                      <button onClick={addLanguage} className="px-4 py-1 bg-teal-500 text-white hover:bg-white hover:text-black border-2 border-teal-500 rounded-lg">Add</button>
                    </div>
                    {driverFormData.languagesSpoken.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {driverFormData.languagesSpoken.map((lang, idx) => (
                          <span key={lang + idx} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                            {lang}
                            <button onClick={() => removeLanguage(idx)} className="text-gray-500 hover:text-gray-700">
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={closeDriverDialog}
                      className="px-5 py-3 rounded-md border-2 border-teal-500 text-black font-semibold hover:bg-teal-500 hover:text-white hover:scale-105 duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDriverSubmit}
                      className="px-5 py-3   bg-teal-500 text-white hover:bg-white hover:text-black border-2 hover:border-teal-500 hover:scale-105 duration-300 rounded-md font-semibold "
                    >
                      {editingDriver ? 'Update Driver' : 'Create Driver'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Profile Drawer */}
      <Transition appear show={profileOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={() => setProfileOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-y-0 right-0 max-w-3xl w-full bg-white shadow-2xl overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{profileTransportation?.name}</h2>
                  <p className="text-sm text-gray-500">{profileTransportation?.type} • {profileTransportation?.capacity} seats</p>
                </div>
                <button onClick={() => setProfileOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <img
                    src={profileTransportation?.mainImage || placeholderImage}
                    alt="Vehicle"
                    className="w-full h-64 object-cover rounded-xl border border-gray-200"
                  />
                  {profileTransportation?.images?.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {profileTransportation.images.slice(0, 8).map((img, idx) => (
                        <img key={img + idx} src={img} alt="Gallery" className="w-full h-20 object-cover rounded-lg border" />
                      ))}
                    </div>
                  )}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-800 mb-2">Contact</p>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>Phone: {profileTransportation?.contactDetails?.phone || 'N/A'}</p>
                      <p>Email: {profileTransportation?.contactDetails?.email || 'N/A'}</p>
                      <p>WhatsApp: {profileTransportation?.contactDetails?.whatsapp || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="border border-gray-200 rounded-xl p-4">
                      <p className="text-gray-500">Availability</p>
                      <p className="font-bold text-gray-800 capitalize">{profileTransportation?.availability}</p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-4">
                      <p className="text-gray-500">Status</p>
                      <p className="font-bold text-gray-800 capitalize">{profileTransportation?.status}</p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-4">
                      <p className="text-gray-500">Price / day</p>
                      <p className="font-bold text-gray-800">{formatCurrency(profileTransportation?.pricePerDay)}</p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-4">
                      <p className="text-gray-500">Price / km</p>
                      <p className="font-bold text-gray-800">{profileTransportation?.pricePerKm ? formatCurrency(profileTransportation.pricePerKm) : 'Not set'}</p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-4 col-span-2">
                      <p className="text-gray-500">Location</p>
                      <p className="font-bold text-gray-800">{profileTransportation?.location || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-800 mb-2">Description</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{profileTransportation?.description || 'No description provided.'}</p>
                  </div>

                  {profileTransportation?.features?.length > 0 && (
                    <div className="border border-gray-200 rounded-xl p-4">
                      <p className="font-semibold text-gray-800 mb-2">Features</p>
                      <div className="flex flex-wrap gap-2">
                        {profileTransportation.features.map((feature, idx) => (
                          <span key={feature + idx} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">{feature}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(profileTransportation?.pickupLocations?.length || profileTransportation?.dropoffLocations?.length) && (
                    <div className="border border-gray-200 rounded-xl p-4">
                      <p className="font-semibold text-gray-800 mb-2">Locations</p>
                      <div className="text-sm text-gray-700 space-y-1">
                        {profileTransportation.pickupLocations?.length > 0 && (
                          <p>Pickup: {profileTransportation.pickupLocations.join(', ')}</p>
                        )}
                        {profileTransportation.dropoffLocations?.length > 0 && (
                          <p>Dropoff: {profileTransportation.dropoffLocations.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-800 mb-2">Drivers</p>
                    {profileTransportation?.assignedDrivers?.length ? (
                      <div className="space-y-2">
                        {profileTransportation.assignedDrivers.map(driverId => {
                          const driver = driverLookup[driverId];
                          return (
                            <div key={driverId} className="flex items-center justify-between p-2 rounded-lg border border-gray-100">
                              <div>
                                <p className="font-semibold text-gray-800">{driver ? `${driver.firstName} ${driver.lastName}` : 'Driver'}</p>
                                <p className="text-xs text-gray-500">{driver?.phone || driver?.email || 'No contact'}</p>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700">Assigned</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No drivers assigned.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default TransportationManagement;
