import React from 'react';

const CustomMarkerIcon = ({ color = 'red' }) => {
    return (
        <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            style={{
                cursor: 'pointer',
                // Drop shadow to make the pin stand out
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
        >
            <path
                fill={color} // The color is controlled by the 'fill' attribute
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            />
            {/* Optional: Add a white circle inside for contrast */}
            <circle cx="12" cy="9.5" r="1.5" fill="white" />
        </svg>
    );
};

export default CustomMarkerIcon;