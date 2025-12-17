import React from 'react';

const ActivityInfo = ({ activity }) => {
    return (
        <div className="text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-display drop-shadow-lg">{activity.title}</h1>
                    {/* Review section removed as requested */}
                    <div className="flex items-center text-white/90">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="drop-shadow">{activity.location}</span>
                    </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg border border-white/30">
                    <div className="text-white mb-2">
                        <span className="font-medium">Duration:</span> {activity.duration} hour{activity.duration !== 1 ? 's' : ''}
                    </div>
                    <div className="text-white">
                        <span className="font-medium">Type:</span> {activity.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityInfo;
