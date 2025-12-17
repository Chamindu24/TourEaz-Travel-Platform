import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'tour-packages', label: 'Tour Packages' },
  { value: 'excursions', label: 'Excursions' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'transportation', label: 'Transportation' }
];

export default function CategoryApprovalModal({ 
  isOpen, 
  onClose, 
  preSelectedCategory = null,
  existingRequests = [],
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    category: preSelectedCategory || '',
    companyName: '',
    businessRegistration: '',
    categoryDescription: '',
    experience: '',
    documents: []
  });

  // Update category when preSelectedCategory changes
  useEffect(() => {
    if (preSelectedCategory) {
      setFormData(prev => ({
        ...prev,
        category: preSelectedCategory
      }));
    }
  }, [preSelectedCategory]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        category: preSelectedCategory || '',
        companyName: '',
        businessRegistration: '',
        categoryDescription: '',
        experience: '',
        documents: []
      });
      setError('');
      setSuccess('');
    }
  }, [isOpen, preSelectedCategory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const uploadedFiles = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileFormData = new FormData();
        fileFormData.append('file', file);
        
        const response = await axios.post('/upload', fileFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              ((i + progressEvent.loaded / progressEvent.total) / files.length) * 100
            );
            setUploadProgress(percentCompleted);
          }
        });

        const fileType = file.type.startsWith('image/') ? 'image' : 'document';
        const fileSize = (file.size / 1024).toFixed(2); // KB
        
        uploadedFiles.push({
          name: file.name,
          url: response.data.url,
          type: fileType,
          size: fileSize,
          uploadedAt: new Date()
        });
      }
      
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...uploadedFiles]
      }));
      
      setUploadProgress(100);

    } catch (err) {
      console.error('File upload error:', err);
      setError(err.response?.data?.error || err.response?.data?.msg || 'Failed to upload files');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.category) {
      setError('Please select a category');
      setLoading(false);
      return;
    }

    if (formData.documents.length === 0) {
      setError('Please upload at least one document or image');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/category-approvals/create', formData);
      
      setSuccess(response.data.msg || 'Approval request submitted successfully!');
      
      // Reset form
      setFormData({
        category: preSelectedCategory || '',
        companyName: '',
        businessRegistration: '',
        categoryDescription: '',
        experience: '',
        documents: []
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.msg || 'Failed to submit approval request');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryStatus = (category) => {
    const request = existingRequests.find(r => r.category === category);
    return request?.status || null;
  };

  const isCategoryDisabled = (category) => {
    const status = getCategoryStatus(category);
    return status === 'pending' || status === 'approved';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-md shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideUp">
        <div className="sticky top-0 bg-teal-500 border-teal-800 px-6 py-5 flex items-center justify-between rounded-t-md">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Request Category Approval
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-red-500 hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="bg-teal-50 border-l-4 border-teal-600 p-4 mb-6 rounded-r-lg">
            <p className="text-teal-200 text-sm font-medium">
              📋 Submit your documents and business information for admin review to unlock this service category
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg flex items-start animate-slideDown">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-r-lg flex items-start animate-slideDown">
              <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="group">
              <label htmlFor="category" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <span className="bg-teal-900 text-teal-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">1</span>
                Service Category <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={!!preSelectedCategory}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 group-hover:border-gray-400"
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => {
                  const status = getCategoryStatus(cat.value);
                  const disabled = isCategoryDisabled(cat.value);
                  
                  return (
                    <option 
                      key={cat.value} 
                      value={cat.value}
                      disabled={disabled}
                    >
                      {cat.label}
                      {status === 'pending' && ' (⏳ Pending Approval)'}
                      {status === 'approved' && ' (✅ Already Approved)'}
                      {status === 'resubmission-required' && ' (🔄 Resubmission Required)'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Company Info Section */}
            <div className="bg-gradient-to-br from-gray-50 to-teal-50 p-5 rounded-xl border border-gray-200">
              <h3 className="flex items-center text-sm font-semibold text-gray-700 mb-4">
                <span className="bg-teal-900 text-teal-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">2</span>
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200 focus:outline-none "
                    placeholder="e.g., ABC Travel Agency"
                  />
                </div>

                {/* Business Registration */}
                <div>
                  <label htmlFor="businessRegistration" className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    id="businessRegistration"
                    name="businessRegistration"
                    value={formData.businessRegistration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200 focus:outline-none "
                    placeholder="e.g., REG-2024-12345"
                  />
                </div>
              </div>
            </div>

            {/* Service Details Section */}
            <div>
              <label htmlFor="categoryDescription" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <span className="bg-teal-900 text-teal-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">3</span>
                Service Description
              </label>
              <textarea
                id="categoryDescription"
                name="categoryDescription"
                value={formData.categoryDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200 resize-none focus:outline-none "
                placeholder="Describe the services you will offer in this category. Be specific about what makes your offerings unique..."
              />
              <p className="text-xs text-gray-500 mt-1">💡 Tip: Include details about your service quality, unique features, and target customers</p>
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <span className="bg-teal-900 text-teal-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">4</span>
                Your Experience & Qualifications
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200 resize-none focus:outline-none"
                placeholder="Share your expertise, years in business, certifications, notable achievements..."
              />
              <p className="text-xs text-gray-500 mt-1">💡 Highlight your track record and industry experience</p>
            </div>

            {/* File Upload */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <span className="bg-teal-900 text-teal-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">5</span>
                Supporting Documents <span className="text-red-500 ml-1">*</span>
              </label>
              
              <div className="mt-2 relative">
                <label className={`flex flex-col items-center justify-center w-full h-40 border-3 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                  uploading 
                    ? 'bg-teal-50 border-teal-400 cursor-wait' 
                    : 'bg-gradient-to-br from-gray-50 to-teal-50 border-gray-300 hover:border-teal-400 hover:bg-teal-50'
                }`}>
                  <div className="flex flex-col items-center justify-center py-6 px-4">
                    <div className={`p-3 rounded-full mb-3 transition-all ${uploading ? 'bg-teal-800' : 'bg-teal-900'}`}>
                      <Upload className={`w-8 h-8 ${uploading ? 'text-teal-700 animate-pulse' : 'text-teal-600'}`} />
                    </div>
                    <p className="mb-2 text-sm text-gray-700">
                      <span className="font-bold text-teal-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="bg-white px-2 py-1 rounded border">📄 PDF</span>
                      <span className="bg-white px-2 py-1 rounded border">📎 DOC</span>
                      <span className="bg-white px-2 py-1 rounded border">🖼️ Images</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Maximum file size: 20MB per file</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,image/*"
                    disabled={uploading}
                  />
                </label>

                {uploading && (
                  <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
                    <div className="relative">
                      <div className="h-16 w-16 border-4 border-teal-200 rounded-full"></div>
                      <div className="h-16 w-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm font-semibold text-teal-700">Uploading files...</p>
                      <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{uploadProgress}% Complete</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview */}
              {formData.documents.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    📎 Uploaded Files ({formData.documents.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.documents.map((doc, i) => (
                      <div key={i} className="relative group animate-slideDown">
                        {doc.type === 'image' ? (
                          <div className="relative border-2 border-gray-200 rounded-xl overflow-hidden hover:border-teal-400 transition-all duration-200">
                            <img src={doc.url} alt={doc.name} className="h-44 w-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                              <p className="text-white text-xs font-medium truncate">🖼️ {doc.name}</p>
                              <p className="text-white/80 text-xs">{doc.size} KB</p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-44 flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl hover:border-red-400 transition-all duration-200">
                            <div className="bg-red-100 p-3 rounded-full mb-2">
                              <FileText className="h-8 w-8 text-red-600" />
                            </div>
                            <p className="text-xs font-medium px-3 text-center text-gray-700 mb-1">📄 {doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.size} KB</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeDocument(i)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transform hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                <p className="text-xs text-yellow-800">
                  <strong>📌 Required Documents:</strong> Business license, tax registration, insurance certificates, portfolio samples, or any relevant certifications
                </p>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-3 border-2 bg-white text-black rounded-md font-semibold hover:bg-teal-500 hover:text-white border-teal-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-8 py-3 bg-teal-500 text-white rounded-md font-semibold hover:bg-white hover:text-black hover:border-teal-500 border-2 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
