import React, { useState } from 'react';

const ActivityTabs = ({ activity }) => {
    // Use googleMapLink from the activity prop (fetched from the database)
    const [activeTab, setActiveTab] = useState('description');
      // Use included and requirements from the database or fallback to defaults
    const inclusions = activity.included && activity.included.length > 0 ? 
        activity.included : 
        [
            "Professional English-speaking guide",
            "Hotel pickup and drop-off",
            "All equipment needed for the activity",
            "Bottled water and refreshments",
            "Safety briefing",
            "Insurance"
        ];
    
    const requirements = activity.requirements && activity.requirements.length > 0 ? 
        activity.requirements : 
        [
            "Minimum age: 8 years",
            "Good physical condition",
            "Swimwear and towel",
            "Sunscreen and sunglasses",
            "Comfortable clothing"
        ];
    
    // --- Check if Google Map Link is available ---
    // Assumes a 'googleMapLink' field exists in the activity data
    const hasGoogleMapLink = activity.googleMapLink && activity.googleMapLink.trim() !== '';

    return (
        <div className="bg-white/50  rounded-md shadow-md overflow-hidden">
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-300 rounded-t-lg overflow-hidden">
            {['description', 'inclusions', 'requirements', 'location'].map((tab) => (
                <button
                key={tab}
                className={`flex-1 text-sm font-medium px-4 py-3 transition-colors duration-300
                    ${
                    activeTab === tab
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-600'
                    }`}
                onClick={() => setActiveTab(tab)}
                >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            ))}
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'description' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-lapis_lazuli-500">About This Activity</h3>
                        <p className="text-indigo_dye-400 leading-relaxed">
                            {activity.description}
                        </p>
                        <p className="text-indigo_dye-400 leading-relaxed">
                            Experience the beauty of the Maldives with this amazing {activity.type.replace('-', ' ')} activity. 
                            Perfect for travelers looking to make unforgettable memories in one of the world's most beautiful destinations.
                        </p>
                        <p className="text-indigo_dye-400 leading-relaxed">
                            Our experienced guides will ensure your safety and enjoyment throughout the {activity.duration}-hour experience.
                            Don't forget to bring your camera to capture the stunning vistas and magical moments!
                        </p>
                    </div>
                )}
                
                {activeTab === 'inclusions' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-lapis_lazuli-500">What's Included</h3>
                        <ul className="space-y-2">
                            {inclusions.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <svg className="h-5 w-5 text-ash_gray-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span className="text-indigo_dye-400">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {activeTab === 'requirements' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-lapis_lazuli-500">Requirements</h3>
                        <ul className="space-y-2">
                            {requirements.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <svg className="h-5 w-5 text-lapis_lazuli-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span className="text-indigo_dye-400">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {activeTab === 'location' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-lapis_lazuli-500">Activity Location</h3>
                        <p className="text-indigo_dye-400 mb-4">
                            This activity takes place in {activity.location || 'the specified location'}, known for its stunning beaches and crystal clear waters.
                        </p>
                        {/* Google Map Embed */}
                        {hasGoogleMapLink ? (
                            <div className="border border-ash_gray-300 rounded-lg overflow-hidden">
                                <iframe
                                    src={activity.googleMapLink}
                                    width="100%"
                                    height="400"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`Map of ${activity.location || 'Activity Location'}`}
                                ></iframe>
                            </div>
                        ) : (
                            <div className="border border-ash_gray-300 rounded-lg h-96 overflow-hidden relative bg-platinum-600 flex items-center justify-center">
                                <p className="text-ash_gray-400 text-center p-4">
                                    A Google Map link for this location has not been provided.
                                    {activity.location && (
                                        <span className="block mt-2">Location: {activity.location}</span>
                                    )}
                                </p>
                            </div>
                        )}
                        <div className="mt-4">
                            <h4 className="font-medium text-lapis_lazuli-500 mb-2">Meeting Point</h4>
                            <p className="text-indigo_dye-400">You'll meet our guide at the main lobby of your resort or a designated pickup point. Exact meeting instructions will be provided after booking.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityTabs;
