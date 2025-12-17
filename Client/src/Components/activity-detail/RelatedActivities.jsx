import React from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityCard from '../ActivityCard';

const RelatedActivities = ({ activities }) => {
    const navigate = useNavigate();

    console.log('RelatedActivities - received activities:', activities);

    if (!activities || activities.length === 0) {
        console.log('No related activities to display');
        return (
            <div>
                <h2 className="text-2xl font-bold text-lapis_lazuli-500 mb-6 font-display">You May Like</h2>
                <p className="text-gray-500">No related activities available at the moment.</p>
            </div>
        );
    }

    // Limit to 3 activities
    const displayActivities = activities.slice(0, 3);
    console.log('Displaying activities:', displayActivities);

    return (
        <div>
            <h2 className="text-2xl font-bold text-lapis_lazuli-500 mb-6 font-display">You May Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayActivities.map(activity => (
                    <div key={activity._id} onClick={() => navigate(`/activities/${activity._id}`)}>
                        <ActivityCard activity={activity} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelatedActivities;
