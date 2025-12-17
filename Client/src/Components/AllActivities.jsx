import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import ActivityForm from '../pages/admin/ActivityForm';

const AllActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'edit'
  const [editingActivityId, setEditingActivityId] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/activities/my-activities');
      setActivities(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter activities based on search term and filter
  const filteredActivities = (activities || []).filter(activity => {
    const matchesSearch = (activity?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity?.location && activity.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'featured') return matchesSearch && activity?.featured;
    if (filter === 'active') return matchesSearch && activity?.status === 'active';
    if (filter === 'inactive') return matchesSearch && activity?.status === 'inactive';
    
    return matchesSearch && activity?.type === filter;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await axios.delete(`/activities/${id}`);
        setActivities(activities.filter(activity => activity._id !== id));
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleEdit = (id) => {
    setEditingActivityId(id);
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setEditingActivityId(null);
    fetchActivities(); // Refresh the list
  };

  const handleView = (id) => {
    navigate(`/activities/${id}`);
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button 
          onClick={fetchActivities}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If in edit mode, show the ActivityForm
  if (viewMode === 'edit' && editingActivityId) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none mb-4"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Activities List
          </button>
        </div>
        <ActivityForm 
          isStandalone={true} 
          activityId={editingActivityId}
          onSuccess={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Activities</h2>
        
        {/* Filters and Search */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 mb-6">
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <label htmlFor="search" className="sr-only">Search Activities</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2.5 text-base border-gray-300 rounded-lg"
                placeholder="Search activities by name or location"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="filter" className="sr-only">Filter</label>
            <select
              id="filter"
              className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Activities</option>
              <option value="featured">Featured Only</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option disabled>───────────</option>
              <option value="water-sports">Water Sports</option>
              <option value="cruises">Cruises</option>
              <option value="island-tours">Island Tours</option>
              <option value="diving">Diving</option>
              <option value="cultural">Cultural</option>
              <option value="adventure">Adventure</option>
              <option value="wellness">Wellness</option>
              <option value="renewal-wedding">Renewal Wedding</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity, index) => (
                    <tr key={activity._id} className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 mr-3">
                            <img 
                              className="h-12 w-12 rounded-md object-cover shadow-sm border border-gray-200" 
                              src={activity.image} 
                              alt={activity.title} 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/48?text=NA';
                              }}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center flex-wrap">
                              {activity.title}
                              {activity.featured && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 mr-1"></span>
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {activity.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
                          ${activity.type === 'water-sports' ? 'bg-blue-100 text-blue-800 border border-blue-200' : ''}
                          ${activity.type === 'cruises' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : ''}
                          ${activity.type === 'island-tours' ? 'bg-green-100 text-green-800 border border-green-200' : ''}
                          ${activity.type === 'diving' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' : ''}
                          ${activity.type === 'cultural' ? 'bg-purple-100 text-purple-800 border border-purple-200' : ''}
                          ${activity.type === 'adventure' ? 'bg-orange-100 text-orange-800 border border-orange-200' : ''}
                          ${activity.type === 'wellness' ? 'bg-pink-100 text-pink-800 border border-pink-200' : ''}
                          ${activity.type === 'renewal-wedding' ? 'bg-rose-100 text-rose-800 border border-rose-200' : ''}
                        `}>
                          {activity.type?.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${activity.price}<span className="text-xs text-gray-500">/person</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                          activity.status === 'active' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                            activity.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                          }`}></span>
                          {activity.status ? activity.status.charAt(0).toUpperCase() + activity.status.slice(1) : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleView(activity._id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="View"
                        >
                          <Eye className="h-5 w-5 inline" />
                        </button>
                        <button
                          onClick={() => handleEdit(activity._id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(activity._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p>No activities found. {searchTerm && 'Try a different search term.'}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Activity count */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              Showing {filteredActivities.length} of {activities.length} activities
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllActivities;
