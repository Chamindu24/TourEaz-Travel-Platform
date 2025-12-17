import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Plus,
  FileText,
  Image as ImageIcon,
  TrendingUp,
  Package,
  Calendar,
  User,
  Building,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import CategoryApprovalModal from '../Components/CategoryApprovalModal';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-800',
    gradient: 'from-yellow-400 to-amber-500',
    icon: Clock
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    gradient: 'from-green-400 to-emerald-500',
    icon: CheckCircle
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    gradient: 'from-red-400 to-rose-500',
    icon: XCircle
  },
  'resubmission-required': {
    label: 'Resubmission Required',
    color: 'bg-orange-100 text-orange-800',
    gradient: 'from-orange-400 to-amber-600',
    icon: AlertCircle
  }
};

const CATEGORY_LABELS = {
  'tour-packages': 'Tour Packages',
  'excursions': 'Excursions',
  'accommodation': 'Accommodation',
  'transportation': 'Transportation'
};

export default function MyApprovalRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/category-approvals/my-requests');
      setRequests(response.data);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleNewRequestSuccess = () => {
    setIsNewRequestModalOpen(false);
    fetchRequests();
  };

  const statusCounts = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    resubmission: requests.filter(r => r.status === 'resubmission-required').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-teal-200 border-t-teal-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-black bg-clip-text text-transparent mb-2">My Approval Requests</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                Track and manage your category approval requests
              </p>
            </div>
            <button
              onClick={() => setIsNewRequestModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-md hover:bg-white hover:text-black hover:border-teal-500 border-2 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              <Plus className="h-5 w-5" />
              New Request
            </button>
          </div>


        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
            <div className="bg-gradient-to-br from-teal-100 to-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Approval Requests Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Submit your first category approval request to start offering services and grow your business
            </p>
            <button
              onClick={() => setIsNewRequestModalOpen(true)}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              Submit Your First Request
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-teal-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-teal-600" />
                        Category
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-teal-600" />
                        Status
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-teal-600" />
                        Submitted
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-teal-600" />
                        Documents
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {requests.map((request, index) => {
                    const statusConfig = STATUS_CONFIG[request.status];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr key={request._id} className="hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-blue-50/50 transition-all duration-200">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {CATEGORY_LABELS[request.category]}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.color} shadow-sm`}>
                            <StatusIcon className="h-4 w-4 mr-1.5" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(request.submittedAt)}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-100 px-3 py-1.5 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700">
                                {request.documents?.length || 0}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">file{request.documents?.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => viewDetails(request._id)}
                            className="flex items-center gap-2 px-4 py-2  text-teal-500 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200  font-semibold"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
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
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">

            {/* Header */}
            <div className="sticky top-0 bg-teal-50 text-gray-800 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-wider">Request Details</h2>
                  <p className="text-gray-700 text-sm mt-1">
                    Complete information and documentation review
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-teal-500 hover:gray-500 transition-colors duration-200 p-1 hover:bg-white/10 rounded-lg"
                >
                  <XCircle className="h-7 w-7" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-8">
              <div className="space-y-8">

                {/* Meta Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-5 w-5 text-purple-400" />
                      <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider">Category</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {CATEGORY_LABELS[selectedRequest.category]}
                    </p>
                  </div>

                  <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-indigo-400" />
                      <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Status</p>
                    </div>
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold ${STATUS_CONFIG[selectedRequest.status].color} shadow-sm`}>
                      {STATUS_CONFIG[selectedRequest.status].label}
                    </span>
                  </div>

                  <div className="bg-teal-50/50 border border-teal-700 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-5 w-5 text-teal-400" />
                      <p className="text-xs font-semibold text-teal-500 uppercase tracking-wider">Submitted</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{formatDate(selectedRequest.submittedAt)}</p>
                  </div>
                </div>

                {/* Company Info */}
                {(selectedRequest.companyName || selectedRequest.businessRegistration) && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Building className="h-5 w-5 text-gray-600" />
                      <h3 className="text-base font-bold text-gray-900">
                        Company Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedRequest.companyName && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Company Name</p>
                          <p className="font-semibold text-gray-900">
                            {selectedRequest.companyName}
                          </p>
                        </div>
                      )}

                      {selectedRequest.businessRegistration && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Registration Number</p>
                          <p className="font-semibold text-gray-900">
                            {selectedRequest.businessRegistration}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-6">
                  {selectedRequest.categoryDescription && (
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-amber-600" />
                        <h4 className="text-base font-bold text-gray-900">Service Description</h4>
                      </div>
                      <p className="text-gray-800 leading-relaxed">
                        {selectedRequest.categoryDescription}
                      </p>
                    </div>
                  )}

                  {selectedRequest.experience && (
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <User className="h-5 w-5 text-emerald-600" />
                        <h4 className="text-base font-bold text-gray-900">Experience & Qualifications</h4>
                      </div>
                      <p className="text-gray-800 leading-relaxed">
                        {selectedRequest.experience}
                      </p>
                    </div>
                  )}
                </div>

                {/* Documents */}
                {selectedRequest.documents?.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <h3 className="text-base font-bold text-gray-900">
                        Uploaded Documents
                      </h3>
                      <span className="ml-auto bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                        {selectedRequest.documents.length} file{selectedRequest.documents.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedRequest.documents.map((doc, index) => {
                        const isImage =
                          doc.type === 'image' || /\.(jpg|jpeg|png|webp)$/i.test(doc.url);

                        return (
                          <div
                            key={index}
                            className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-teal-300 transition-all duration-200 hover:shadow-md"
                          >
                            {/* Preview */}
                            <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                              {isImage ? (
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block h-full">
                                  <img
                                    src={doc.url}
                                    alt={doc.name}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                                </a>
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center p-4">
                                  <FileText className="h-12 w-12 text-gray-400" />
                                  <p className="text-sm mt-3 px-2 text-center text-gray-600 line-clamp-2">
                                    {doc.name}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isImage ? (
                                    <ImageIcon className="h-4 w-4 text-teal-600" />
                                  ) : (
                                    <FileText className="h-4 w-4 text-gray-500" />
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

                {/* Admin Feedback */}
                {selectedRequest.rejectionReason && (
                  <div className="bg-gradient-to-br from-red-50 to-red-100/50 border-l-4 border-red-500 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <h4 className="text-base font-bold text-gray-900">Rejection Reason</h4>
                    </div>
                    <p className="text-gray-800 leading-relaxed">
                      {selectedRequest.rejectionReason}
                    </p>
                  </div>
                )}

                {selectedRequest.adminNotes && (
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border-l-4 border-teal-500 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-5 w-5 text-teal-600" />
                      <h4 className="text-base font-bold text-gray-900">Admin Notes</h4>
                    </div>
                    <p className="text-gray-800 leading-relaxed">
                      {selectedRequest.adminNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/95 border-t border-gray-200 px-8 py-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl bg-teal-500 text-white hover:bg-white hover:text-black border-2 hover:border-teal-500 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      <CategoryApprovalModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        existingRequests={requests}
        onSuccess={handleNewRequestSuccess}
      />

    </div>
  );
}
