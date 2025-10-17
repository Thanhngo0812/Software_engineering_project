import React, { useState, useEffect } from 'react';

const MainContent = () => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [licensePlate, setLicensePlate] = useState('');
    const [capacity, setCapacity] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
  
    const handleSave = () => {
      if (licensePlate && capacity) {
        console.log('Bus created:', { licensePlate, capacity });
        setLicensePlate('');
        setCapacity('');
        setShowCreateForm(false);
      }
    };
  
    const handleCancel = () => {
      setLicensePlate('');
      setCapacity('');
      setShowCreateForm(false);
    };
  
    return (
      <main className="content">
        <div className="content-header">
          <div className="content-title">
            <i className="fa-solid fa-bus"></i>
            <h2>Buses</h2>
          </div>
          <div className="content-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowCreateForm(true)}
            >
              CREATE <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
  
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search by license plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
  
        {showCreateForm && (
          <div className="create-form">
            <h3>Create New Bus</h3>
            <div className="form-inputs">
              <input 
                type="text" 
                placeholder="License Plate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
              />
              <input 
                type="number" 
                placeholder="Capacity"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        )}
      </main>
    );
  };

  export default MainContent;