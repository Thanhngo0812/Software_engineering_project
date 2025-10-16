import React from 'react';
import '../assets/style/LoadingSpinner.css'; // File CSS cho animation

const LoadingSpinner = ({ isLoading }) => {
  // Nếu không loading thì không hiển thị gì cả
  if (!isLoading) {
    return null;
  }

  return (
    <div className="spinner-overlay">
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;