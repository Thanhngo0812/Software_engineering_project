import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBus, faTrash, faPlus, faPenToSquare } from '@fortawesome/free-solid-svg-icons';

import '../driver/DriverPage.css'; 
import useBusApi from './useBusApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const BusPage = () => {
    const { buses, loading, createBus, updateBus, deleteBus } = useBusApi();
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentBusId, setCurrentBusId] = useState(null);

    const [formData, setFormData] = useState({
        licensePlate: '',
        model: '',
        capacity: 16
    });

    const filteredBuses = buses.filter(b => 
        (b.licensePlate || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.model || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- HANDLERS ---

    const handleOpenCreate = () => {
        setIsEditMode(false);
        setFormData({ licensePlate: '', model: '', capacity: 16 });
        setIsModalOpen(true);
    };

    // Logic mở form sửa: CHẶN NẾU CÓ TÀI XẾ
    const handleOpenEdit = (bus) => {
        if (bus.primaryDriverId) {
            return toast.warning(`Cannot edit. Bus is assigned to ${bus.primaryDriverName}. Unassign first!`);
        }
        setIsEditMode(true);
        setCurrentBusId(bus.id);
        setFormData({
            licensePlate: bus.licensePlate,
            model: bus.model,
            capacity: bus.capacity
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.licensePlate || !formData.capacity) {
            return toast.warning("License Plate and Capacity are required");
        }

        let res;
        if (isEditMode) {
            res = await updateBus(currentBusId, formData);
        } else {
            res = await createBus(formData);
        }

        if (res.success) {
            toast.success(isEditMode ? "Bus updated successfully" : "Bus created successfully");
            setIsModalOpen(false);
        } else {
            toast.error(res.message);
        }
    };

    const handleDelete = (bus) => {
        if (bus.primaryDriverId) {
            return Swal.fire({
                icon: 'error',
                title: 'Cannot Delete',
                text: `This bus is currently assigned to driver: ${bus.primaryDriverName}. Please unassign first.`
            });
        }

        Swal.fire({
            title: 'Delete this Bus?',
            text: `License: ${bus.licensePlate}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, Delete'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await deleteBus(bus.id);
                if (res.success) {
                    toast.success("Bus deleted");
                } else {
                    toast.error(res.message);
                }
            }
        });
    };

    return (
        <div className="driver-main-content">
            <LoadingSpinner isLoading={loading} />
            
            {/* HEADER */}
            <div className="content-header">
                <h2><span role="img" aria-label="icon">🚌</span> Fleet Management</h2>
                <button className="create-button" onClick={handleOpenCreate}>
                    <FontAwesomeIcon icon={faPlus} style={{marginRight:'5px'}}/> New Bus
                </button>
            </div>

            {/* BODY */}
            <div className="content-body">
                <input
                    type="text"
                    placeholder="Search bus by plate or model..."
                    className="search-bar"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <table className="driver-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>License Plate</th>
                            <th>Model</th>
                            <th className="text-center">Capacity</th>
                            <th className="text-center">Assigned Driver</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBuses.map(bus => (
                            <tr key={bus.id}>
                                <td data-label="ID">{bus.id}</td>
                                <td data-label="License">
                                    <span style={{fontWeight:'bold', color:'#2c3e50'}}>{bus.licensePlate}</span>
                                </td>
                                <td data-label="Model">{bus.model || "-"}</td>
                                <td data-label="Capacity" className="text-center">
                                    <span style={{background:'#eef2f7', padding:'4px 8px', borderRadius:'4px', fontSize:'12px', fontWeight:'bold'}}>
                                        {bus.capacity} seats
                                    </span>
                                </td>
                                <td data-label="Driver" className="text-center">
                                    {bus.primaryDriverId ? (
                                        <span className="bus-badge assigned" style={{background:'#27ae60'}}>
                                            {bus.primaryDriverName}
                                        </span>
                                    ) : (
                                        <span className="bus-badge no-bus" style={{background:'#95a5a6'}}>
                                            Free
                                        </span>
                                    )}
                                </td>
                                <td data-label="Actions" className="actions-cell">
                                    {/* Nút Sửa - Disabled và nhạt màu nếu có tài xế */}
                                    <button 
                                        className="icon-button" 
                                        title={bus.primaryDriverId ? "Cannot edit assigned bus" : "Edit"}
                                        onClick={() => handleOpenEdit(bus)}
                                        style={{color: bus.primaryDriverId ? '#ccc' : '#6c757d', cursor: bus.primaryDriverId ? 'not-allowed' : 'pointer'}}
                                    >
                                        <FontAwesomeIcon icon={faPenToSquare} />
                                    </button>

                                    <button 
                                        className="icon-button" 
                                        title="Delete" 
                                        onClick={() => handleDelete(bus)}
                                        style={{color: bus.primaryDriverId ? '#ccc' : '#dc3545', cursor: bus.primaryDriverId ? 'not-allowed' : 'pointer'}}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredBuses.length === 0 && (
                             <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No buses found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL CREATE / EDIT */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">{isEditMode ? 'Edit Bus' : 'Add New Bus'}</div>
                        
                        <div className="form-group-stop">
                            <label>License Plate *</label>
                            <input 
                                type="text" 
                                placeholder="e.g. 51B-123.45"
                                value={formData.licensePlate}
                                onChange={(e) => setFormData({...formData, licensePlate: e.target.value})} 
                                style={{width:'100%', padding:'8px'}}
                            />
                        </div>

                        <div className="form-group-stop">
                            <label>Model</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Hyundai Solati"
                                value={formData.model}
                                onChange={(e) => setFormData({...formData, model: e.target.value})} 
                                style={{width:'100%', padding:'8px'}}
                            />
                        </div>

                        <div className="form-group-stop">
                            <label>Capacity (Seats) *</label>
                            <input 
                                type="number" 
                                min="1"
                                value={formData.capacity}
                                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} 
                                style={{width:'100%', padding:'8px'}}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSubmit}>
                                {isEditMode ? 'Save Changes' : 'Create Bus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusPage;