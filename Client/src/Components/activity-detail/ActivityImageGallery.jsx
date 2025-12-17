import React, { useState } from 'react';
import ActivityInfo from './ActivityInfo';

// This is a simplified image gallery. In a real app, you'd use a library like react-image-gallery
const ActivityImageGallery = ({ activity }) => {
    // For simplicity, we're creating a mock gallery with the main image and 4 additional images
    const [mainImage, setMainImage] = useState(activity.image);
      // Use gallery images from the database or generate placeholder images
    let images = [activity.image];
    
    // Add gallery images if they exist in the database
    if (activity.galleryImages && activity.galleryImages.length > 0) {
        images = [activity.image, ...activity.galleryImages];
    } else {
        // Fallback to placeholder images if no gallery images exist
        images = [
            activity.image,
            `https://source.unsplash.com/random/800x600?maldives,${activity.type},1`,
            `https://source.unsplash.com/random/800x600?maldives,${activity.type},2`,
            `https://source.unsplash.com/random/800x600?maldives,${activity.type},3`,
            `https://source.unsplash.com/random/800x600?maldives,${activity.type},4`
        ];
    }

    return (
        <div className=" mt-4 p-1 rounded-xl">
            <div className="container mx-auto">
            
            {/* Main Image */}
            <div className="relative h-96 md:h-[520px] overflow-hidden rounded-2xl shadow-xl group">
                
                <img
                src={mainImage}
                alt={activity.title}
                className="w-full h-full object-cover  transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />


                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur-md">
                {images.indexOf(mainImage) + 1} / {images.length}
                </div>

                {/* Activity Info Overlay - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <ActivityInfo activity={activity} />
                </div>

            </div>

            {/* Thumbnails */}
            <div className="mt-4 backdrop-blur-md bg-white/60 p-4 rounded-2xl shadow-sm">
            <div className="flex gap-4 overflow-x-auto py-2 hide-scrollbar">

                {images.map((img, index) => {
                const isActive = mainImage === img;

                return (
                    <button
                    key={index}
                    onClick={() => setMainImage(img)}
                    className={`relative flex-none w-28 h-20 rounded-xl overflow-hidden
                        transition-all duration-300 ease-out
                        ${
                        isActive
                            ? 'ring-4 ring-teal-500 scale-105 shadow-lg'
                            : 'hover:scale-105 hover:shadow-md'
                        }
                    `}
                    >
                    {/* Image */}
                    <img
                        src={img}
                        alt={`${activity.title} thumbnail ${index + 1}`}
                        className={`w-full h-full object-cover transition-all duration-300
                        ${isActive ? 'brightness-110' : 'brightness-90 hover:brightness-100'}
                        `}
                        loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 transition-opacity duration-300
                        ${isActive ? 'bg-gradient-to-t from-black/30 to-transparent' : 'bg-black/10'}
                    `} />

                    {/* Active Indicator */}
                    {isActive && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-teal-400 shadow-md" />
                    )}
                    </button>
                );
                })}

            </div>
            </div>


            </div>

        </div>
    );
};

export default ActivityImageGallery;
