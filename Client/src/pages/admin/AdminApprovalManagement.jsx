import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye,
  Check,
  X,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Filter,User
} from 'lucide-react';
import { Folder, Bell, Building, Paperclip, File, Award ,ExternalLink,Calendar} from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  },
  'resubmission-required': {
    label: 'Resubmission Required',
    color: 'bg-orange-100 text-orange-800',
    icon: AlertCircle
  }
};

const CATEGORY_LABELS = {
  'tour-packages': 'Tour Packages',
  'excursions': 'Excursions',
  'accommodation': 'Accommodation',
  'transportation': 'Transportation'
};

export default function AdminApprovalManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionModal, setActionModal] = useState({ show: false, action: '', requestId: null });
  const [actionData, setActionData] = useState({ reason: '', notes: '' });
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [resubmissionCount, setResubmissionCount] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      
      const response = await axios.get(`/category-approvals/admin/all?${params.toString()}`);
      const data = response.data || [];
      setRequests(data);
      setPendingCount(data.filter(r => r.status === 'pending').length);
      setApprovedCount(data.filter(r => r.status === 'approved').length);
      setRejectedCount(data.filter(r => r.status === 'rejected').length);
      setResubmissionCount(data.filter(r => r.status === 'resubmission-required').length);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.response?.data?.msg || 'Failed to load approval requests');
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (requestId) => {
    try {
      const response = await axios.get(`/category-approvals/${requestId}`);
      setSelectedRequest(response.data);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching request details:', err);
      alert('Failed to load request details');
    }
  };

  const openActionModal = (action, requestId) => {
    setActionModal({ show: true, action, requestId });
    setActionData({ reason: '', notes: '' });
  };

  const closeActionModal = () => {
    setActionModal({ show: false, action: '', requestId: null });
    setActionData({ reason: '', notes: '' });
  };

  const handleAction = async () => {
    try {
      const { action, requestId } = actionModal;
      let endpoint = '';
      let data = {};

      if (action === 'approve') {
        endpoint = `/category-approvals/admin/${requestId}/approve`;
        data = { adminNotes: actionData.notes };
      } else if (action === 'reject') {
        if (!actionData.reason) {
          alert('Please provide a rejection reason');
          return;
        }
        endpoint = `/category-approvals/admin/${requestId}/reject`;
        data = { rejectionReason: actionData.reason, adminNotes: actionData.notes };
      } else if (action === 'resubmit') {
        if (!actionData.reason) {
          alert('Please provide a reason for resubmission');
          return;
        }
        endpoint = `/category-approvals/admin/${requestId}/resubmit`;
        data = { rejectionReason: actionData.reason, adminNotes: actionData.notes };
      }

      await axios.put(endpoint, data);
      
      closeActionModal();
      setShowModal(false);
      fetchRequests();
      
      alert(`Request ${action}ed successfully!`);
    } catch (err) {
      console.error('Action error:', err);
      alert(err.response?.data?.msg || `Failed to ${actionModal.action} request`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-6 w-full max-w-4xl px-6">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-lg shadow">
                <div className="h-full w-full bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
          <div className="animate-pulse bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-100 w-1/3 mb-4" />
            <div className="h-10 bg-gray-100 w-full" />
          </div>
          <div className="animate-pulse bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-100 w-1/4 mb-4" />
            <div className="h-64 bg-gray-100 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-2  p-6 text-black shadow-md">
          <div className="text-center">
              <h1 className="text-4xl font-bold">Service Approval Management</h1>
              <p className="text-teal-100 mt-2">Review and manage service provider category requests</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-teal-50  rounded-lg shadow-md p-4 my-6 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-800" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="resubmission-required">Resubmission Required</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">All Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setFilters({ status: '', category: '' })}
              className="px-4 py-2 text-sm bg-teal-200 text-white hover:bg-teal-300 border border-gray-900 rounded-md"
            >
              Clear
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-6">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const count = requests.filter(r => r.status === status).length;
            const Icon = config.icon;
            const accent =
              status === 'pending' ? 'border-yellow-300' :
              status === 'approved' ? 'border-green-300' :
              status === 'rejected' ? 'border-red-300' : 'border-orange-300';
            return (
              <div key={status} className={`bg-white rounded-3xl shadow-xl py-4 px-8 border-t-4 ${accent}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{config.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Requests Table */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h2>
            <p className="text-gray-600">No approval requests match your current filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-teal-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-teal-800">
                  {requests.map((request) => {
                    const statusConfig = STATUS_CONFIG[request.status];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr key={request._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.user?.firstName} {request.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{request.user?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {CATEGORY_LABELS[request.category]}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color} shadow-sm`}> 
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.submittedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => viewDetails(request._id)}
                              className="text-teal-500 hover:text-teal-400 flex items-center px-2 py-1 rounded hover:bg-teal-50"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => openActionModal('approve', request._id)}
                                  className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                                  title="Approve"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => openActionModal('reject', request._id)}
                                  className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                                  title="Reject"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => openActionModal('resubmit', request._id)}
                                  className="text-orange-600 hover:text-orange-900 px-2 py-1 rounded hover:bg-orange-50"
                                  title="Request Resubmission"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

  
      {/* Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-teal-50 text-gray-800 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Request Details</h2>
                  <p className="text-gray-700 text-sm mt-1">Complete information and documentation review</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded-lg"
                  aria-label="Close modal"
                >
                  <XCircle className="h-7 w-7" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-8">
              <div className="space-y-8">
                
                {/* Service Provider Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-teal-500/10 p-2 rounded-lg">
                      <User className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Service Provider Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</p>
                      <p className="text-gray-900 font-medium">{selectedRequest.user?.firstName} {selectedRequest.user?.lastName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</p>
                      <p className="text-gray-900 font-medium">{selectedRequest.user?.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</p>
                      <p className="text-gray-900 font-medium">{selectedRequest.user?.phoneNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Request Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Category & Status Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Category */}
                      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Folder className="h-4 w-4 text-purple-500" />
                          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Category</p>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{CATEGORY_LABELS[selectedRequest.category]}</p>
                      </div>

                      {/* Status */}
                      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Bell className="h-4 w-4 text-indigo-500" />
                          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Status</p>
                        </div>
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 shadow-sm">
                          <div className={`h-2 w-2 rounded-full ${STATUS_CONFIG[selectedRequest.status].color.replace('text-', 'bg-')} mr-2`}></div>
                          <span className="font-semibold text-gray-900">{STATUS_CONFIG[selectedRequest.status].label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Business Information */}
                    {(selectedRequest.companyName || selectedRequest.businessRegistration) && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Building className="h-5 w-5 text-gray-600" />
                          <h4 className="text-base font-semibold text-gray-900">Business Information</h4>
                        </div>
                        <div className="space-y-4">
                          {selectedRequest.companyName && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Company Name</p>
                              <p className="text-gray-900 font-medium">{selectedRequest.companyName}</p>
                            </div>
                          )}
                          {selectedRequest.businessRegistration && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Registration Number</p>
                              <p className="text-gray-900 font-medium">{selectedRequest.businessRegistration}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Description & Experience */}
                    <div className="space-y-6">
                      {selectedRequest.categoryDescription && (
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-amber-600" />
                            <h4 className="text-base font-semibold text-gray-900">Service Description</h4>
                          </div>
                          <p className="text-gray-800 leading-relaxed">{selectedRequest.categoryDescription}</p>
                        </div>
                      )}

                      {selectedRequest.experience && (
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-6 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <Award className="h-5 w-5 text-emerald-600" />
                            <h4 className="text-base font-semibold text-gray-900">Experience & Qualifications</h4>
                          </div>
                          <p className="text-gray-800 leading-relaxed">{selectedRequest.experience}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Documents Section */}
                    {selectedRequest.documents?.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                          <Paperclip className="h-5 w-5 text-gray-600" />
                          <h4 className="text-base font-semibold text-gray-900">Uploaded Documents</h4>
                          <span className="ml-auto bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                            {selectedRequest.documents.length} file{selectedRequest.documents.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedRequest.documents.map((doc, index) => {
                            const isImage = doc.type === 'image' || doc.url.match(/\.(jpg|jpeg|png|webp|gif)$/i);
                            const isPdf = doc.url.match(/\.pdf$/i);

                            return (
                              <div
                                key={index}
                                className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-teal-300 transition-all duration-200 hover:shadow-md"
                              >
                                {/* Document Preview */}
                                <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                  {isImage ? (
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block h-full"
                                    >
                                      <img
                                        src={doc.url}
                                        alt={doc.name}
                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                                    </a>
                                  ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-4">
                                      {isPdf ? (
                                        <FileText className="h-12 w-12 text-red-500" />
                                      ) : (
                                        <File className="h-12 w-12 text-gray-400" />
                                      )}
                                      <p className="mt-3 text-sm text-gray-600 text-center px-2 line-clamp-2">
                                        {doc.name}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Document Info */}
                                <div className="p-4 border-t border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {isImage ? (
                                        <ImageIcon className="h-4 w-4 text-teal-600" />
                                      ) : isPdf ? (
                                        <FileText className="h-4 w-4 text-red-500" />
                                      ) : (
                                        <File className="h-4 w-4 text-gray-500" />
                                      )}
                                      <span className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                                        {doc.name}
                                      </span>
                                    </div>
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1"
                                    >
                                      {isImage ? 'View' : 'Open'}
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Admin Feedback Section */}
                    <div className="space-y-6">
                      {selectedRequest.rejectionReason && (
                        <div className="bg-gradient-to-br from-red-50 to-red-100/50 border-l-4 border-red-500 rounded-xl p-5 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <h4 className="text-base font-semibold text-gray-900">Rejection Reason</h4>
                          </div>
                          <p className="text-gray-800 leading-relaxed">{selectedRequest.rejectionReason}</p>
                        </div>
                      )}

                      {selectedRequest.adminNotes && (
                        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border-l-4 border-teal-500 rounded-xl p-5 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="h-5 w-5 text-teal-600" />
                            <h4 className="text-base font-semibold text-gray-900">Admin Notes</h4>
                          </div>
                          <p className="text-gray-800 leading-relaxed">{selectedRequest.adminNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Timeline Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-6">
                        <Calendar className="h-5 w-5 text-gray-600" />
                        <h4 className="text-base font-semibold text-gray-900">Timeline</h4>
                      </div>
                      <div className="space-y-5">
                        <div className="flex items-start">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500">Submitted</p>
                            <p className="text-gray-900 font-semibold">{formatDate(selectedRequest.submittedAt)}</p>
                          </div>
                        </div>

                        {selectedRequest.reviewedAt && (
                          <div className="flex items-start">
                            <div className="bg-green-100 p-2 rounded-lg mr-3">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-500">Reviewed</p>
                              <p className="text-gray-900 font-semibold">{formatDate(selectedRequest.reviewedAt)}</p>
                            </div>
                          </div>
                        )}

                        {selectedRequest.reviewedBy && (
                          <div className="flex items-start">
                            <div className="bg-purple-100 p-2 rounded-lg mr-3">
                              <User className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-500">Reviewed By</p>
                              <p className="text-gray-900 font-semibold">
                                {selectedRequest.reviewedBy.firstName} {selectedRequest.reviewedBy.lastName}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Action Buttons */}
            {selectedRequest.status === 'pending' && (
              <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/95 border-t border-gray-200 px-8 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Ready to take action on this request?</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => openActionModal('approve', selectedRequest._id)}
                      className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                    >
                      <Check className="h-4 w-4" />
                      Approve Request
                    </button>
                    <button
                      onClick={() => openActionModal('resubmit', selectedRequest._id)}
                      className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Request Resubmission
                    </button>
                    <button
                      onClick={() => openActionModal('reject', selectedRequest._id)}
                      className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                    >
                      <X className="h-4 w-4" />
                      Reject Request
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Close button for non-pending requests */}
            {selectedRequest.status !== 'pending' && (
              <div className="border-t border-gray-200 px-8 py-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {actionModal.action === 'approve' && 'Approve Request'}
              {actionModal.action === 'reject' && 'Reject Request'}
              {actionModal.action === 'resubmit' && 'Request Resubmission'}
            </h3>

            {(actionModal.action === 'reject' || actionModal.action === 'resubmit') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionData.reason}
                  onChange={(e) => setActionData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  placeholder={`Explain why you are ${actionModal.action === 'reject' ? 'rejecting' : 'requesting resubmission of'} this request...`}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={actionData.notes}
                onChange={(e) => setActionData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeActionModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`px-4 py-2 rounded-md text-white ${
                  actionModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  actionModal.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
