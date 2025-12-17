import React, { useState, useEffect, Fragment } from 'react';
import AllTours from '../Components/AllTours';
import AddTour from '../Components/AddTour';
import TourInquiries from '../Components/TourInquiries';
import TourBookingManagement from './TourBookingManagement';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Tab } from '@headlessui/react';
import {
  MapPinIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

function useDeviceType() {
  const [deviceType, setDeviceType] = useState({
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024,
  });

  useEffect(() => {
    const handleResize = () => {
      setDeviceType({
        isMobile: window.innerWidth <= 768,
        isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
        isDesktop: window.innerWidth > 1024,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
}

const TourManagement = () => {
  const [activeTab, setActiveTab] = useState('all-tours');
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useDeviceType();

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 shadow-2xl">
        {/* Header */}
        <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tour Management</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your tours, add new destinations, and handle inquiries</p>
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <button
              onClick={() => handleTabChange('add-tour')}
              className="inline-flex items-center px-4 py-2  border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 border-2 hover:border-teal-500 duration-300"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Tour
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('all-tours')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'all-tours'
                  ? 'border-teal-500 text-teal-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Tours
            </button>
            <button
              onClick={() => handleTabChange('booking-management')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'booking-management'
                  ? 'border-teal-500 text-teal-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tour Bookings
            </button>
            <button
              onClick={() => handleTabChange('inquiries')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'inquiries'
                  ? 'border-teal-500 text-teal-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tour Inquiries
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {activeTab === 'all-tours' && <AllTours />}
            {activeTab === 'add-tour' && <AddTour />}
            {activeTab === 'booking-management' && <TourBookingManagement />}
            {activeTab === 'inquiries' && <TourInquiries />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourManagement;