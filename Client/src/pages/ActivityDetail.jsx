import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import activitiesAPI from '../services/activitiesAPI';

// Import all the activity detail components
import ActivityImageGallery from '../Components/activity-detail/ActivityImageGallery';
import ActivityInfo from '../Components/activity-detail/ActivityInfo';
import ActivityTabs from '../Components/activity-detail/ActivityTabs';
import BookingForm from '../Components/activity-detail/BookingForm';
import RelatedActivities from '../Components/activity-detail/RelatedActivities';

const ActivityDetail = () => {
    const { id } = useParams();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedActivities, setRelatedActivities] = useState([]);

    useEffect(() => {
        // Always scroll to top when id changes
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

        // Fetch activity from the actual database API
        const fetchActivity = async () => {
            setLoading(true);
            try {
                // Get the activity by its ID
                const activityResponse = await activitiesAPI.getById(id);
                console.log('Activity response:', activityResponse);
                
                // Handle different possible response structures
                const foundActivity = activityResponse?.data?.data || activityResponse?.data;
                console.log('Found activity:', foundActivity);
                
                if (foundActivity) {
                    setActivity(foundActivity);
                    
                    // Fetch all activities to find related ones (same type or location)
                    const allActivitiesResponse = await activitiesAPI.getAll();
                    const allActivities = allActivitiesResponse?.data?.data || allActivitiesResponse?.data || [];
                    console.log('All activities:', allActivities);
                    
                    // Find related activities (same type or location)
                    const related = allActivities
                        .filter(act => 
                            act?._id !== foundActivity._id && 
                            (act?.type === foundActivity.type || act?.location === foundActivity.location)
                        )
                        .slice(0, 4); // Limit to 3 related activities
                    
                    setRelatedActivities(related);
                } else {
                    console.log('No activity found in response');
                }
            } catch (error) {
                console.error('Error fetching activity details:', error);
                console.error('Error response:', error.response);
                // Activity not found or error will be handled in the UI
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchActivity();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-white">
                {/* Only one loading spinner, styled to match the rest of the app */}
                <div
                    className="animate-spin rounded-full h-16 w-16 border-4 border-lapis_lazuli-500 border-t-indigo_dye-500 border-b-ash_gray-500 border-r-platinum-500 bg-platinum-500 shadow-lg"
                    style={{
                        borderTopColor: '#0A435C', // indigo_dye 2
                        borderBottomColor: '#B7C5C7', // ash_gray
                        borderLeftColor: '#005E84', // lapis_lazuli
                        borderRightColor: '#E7E9E5', // platinum
                        backgroundColor: '#E7E9E5', // platinum
                    }}
                ></div>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-white">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <h2 className="text-xl font-bold mb-2">Activity Not Found</h2>
                    <p>Sorry, we couldn't find the activity you're looking for.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white px-20">
            {/* Hero Image Gallery */}
            <ActivityImageGallery activity={activity} />
            
            <div className="container mx-auto px-4 py-8">
                
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Details Tabs */}
                    <div className="lg:col-span-2 ">
                        <ActivityTabs activity={activity} />
                    </div>
                    
                    {/* Right Column - Booking Form */}
                    <div>
                        <BookingForm activity={activity} />
                    </div>
                </div>
                
                {/* Related Activities */}
                <div className="mt-16 ">
                    <RelatedActivities activities={relatedActivities} />
                </div>
            </div>
        </div>
    );
};

export default ActivityDetail;
