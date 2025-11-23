import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faBan, faUnlock, faBus, faExclamationCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import './DriverPage.css';
import useDriverApi from './useDriverApi';
import LoadingSpinner from '../../components/LoadingSpinner';
const DriverPage = () => {
    const { 
        drivers, loading, error, 
        updateDriver, toggleStatus, 
        fetchAvailableBuses, assignBus, unassignBus 
    } = useDriverApi();

    const [searchQuery, setSearchQuery] = useState('');
    
    // State Modal Edit Driver
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [editForm, setEditForm] = useState({ fullName: '', phoneNumber: '' });

    // State Modal Assign Bus
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assigningDriver, setAssigningDriver] = useState(null);
    const [availableBuses, setAvailableBuses] = useState([]);
    const [selectedBusId, setSelectedBusId] = useState('');

    useEffect(() => {
        if (error) {
            toast.error("Failed to load drivers.");
        }
    }, [error]);

    const filteredDrivers = drivers.filter(d => 
        (d.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.phoneNumber || "").includes(searchQuery)
    );

    // --- HANDLERS: EDIT DRIVER ---
    const handleOpenEdit = (driver) => {
        setEditingDriver(driver);
        setEditForm({ fullName: driver.fullName, phoneNumber: driver.phoneNumber });
        setIsEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editForm.fullName || !editForm.phoneNumber) return toast.warning("Required fields missing");
        if (!/^\d{10}$/.test(editForm.phoneNumber)) return toast.warning("Phone must be 10 digits");

        const res = await updateDriver(editingDriver.id, editForm);
        if (res.success) {
            toast.success("Updated successfully");
            setIsEditOpen(false);
        } else {
            toast.error(res.message);
        }
    };

    // --- HANDLERS: ASSIGN / UNASSIGN BUS ---
    
    // 1. Mở Modal Gán Xe
    const handleOpenAssign = async (driver) => {
        setAssigningDriver(driver);
        // Gọi API lấy danh sách xe rảnh
        const buses = await fetchAvailableBuses();
        setAvailableBuses(buses);
        setSelectedBusId(''); // Reset selection
        setIsAssignOpen(true);
    };

    // 2. Lưu Gán Xe
    const handleSaveAssign = async () => {
        if (!selectedBusId) return toast.warning("Please select a bus");
        
        const res = await assignBus(assigningDriver.id, selectedBusId);
        if (res.success) {
            toast.success(`Assigned bus to ${assigningDriver.fullName}`);
            setIsAssignOpen(false);
        } else {
            toast.error(res.message);
        }
    };

    // 3. Hủy Gán Xe (Unassign)
    const handleUnassign = (driver) => {
        Swal.fire({
            title: 'Unassign Bus?',
            text: `Remove bus ${driver.assignedBusLicense} from ${driver.fullName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, Unassign'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await unassignBus(driver.id);
                if (res.success) {
                    toast.success("Bus unassigned successfully");
                } else {
                    toast.error(res.message);
                }
            }
        });
    };

    // --- HANDLER: LOCK / UNLOCK ---
    const handleToggleLock = (driver) => {
        const action = driver.active ? "Lock" : "Unlock";
        Swal.fire({
            title: `Confirm ${action}?`,
            text: driver.active ? "Driver will lose access." : "Driver will regain access.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: driver.active ? '#d33' : '#28a745',
            confirmButtonText: `Yes, ${action}`
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await toggleStatus(driver.id);
                if (res.success) {
                    toast.success(`Driver ${action}ed`);
                } else {
                    toast.error(res.message);
                }
            }
        });
    };

    return (
        <div className="driver-main-content">
            <LoadingSpinner isLoading={loading} />
            <div className="content-header">
                <h2><span role="img" aria-label="icon">👮‍♂️</span> Drivers Management</h2>
            </div>

            <div className="content-body">
                <input
                    type="text"
                    placeholder="Search..."
                    className="search-bar"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <table className="driver-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name / Phone</th>
                            <th>Email</th>
                            <th className="text-center">Bus</th>
                            <th className="text-center">Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDrivers.map(driver => (
                            <tr key={driver.id}>
                                <td data-label="ID">{driver.id}</td>
                                <td data-label="Name">
                                    <div style={{fontWeight:'bold'}}>{driver.fullName || "N/A"}</div>
                                    <div style={{fontSize:'12px', color:'#777'}}>{driver.phoneNumber}</div>
                                </td>
                                <td data-label="Email">{driver.email}</td>
                                <td data-label="Bus" className="text-center">
                                    {driver.assignedBusId ? (
                                        <div className="assigned-bus-wrapper">
                                            <span className="bus-badge assigned">{driver.assignedBusLicense}</span>
                                            {/* Nút X nhỏ để hủy gán xe nhanh */}
                                            <button 
                                                className="btn-unassign-mini" 
                                                title="Unassign Bus"
                                                onClick={() => handleUnassign(driver)}
                                            >
                                                <FontAwesomeIcon icon={faTimesCircle} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="bus-badge no-bus">No Bus</span>
                                    )}
                                </td>
                                <td data-label="Status" className="text-center">
                                    <span className={`status-badge-driver ${driver.active ? 'active' : 'locked'}`}>
                                        {driver.active ? 'Active' : 'Locked'}
                                    </span>
                                </td>
                                <td data-label="Actions" className="actions-cell">
                                    <button className="icon-button" title="Edit" onClick={() => handleOpenEdit(driver)}>
                                        <FontAwesomeIcon icon={faPenToSquare} />
                                    </button>
                                    
                                    {/* Chỉ hiện nút Gán xe nếu chưa có xe */}
                                    {!driver.assignedBusId && (
                                        <button className="icon-button" title="Assign Bus" onClick={() => handleOpenAssign(driver)}>
                                            <FontAwesomeIcon icon={faBus} />
                                        </button>
                                    )}

                                    <button 
                                        className="icon-button" 
                                        title={driver.active ? "Lock" : "Unlock"}
                                        onClick={() => handleToggleLock(driver)}
                                        style={{ color: driver.active ? '#dc3545' : '#28a745' }}
                                    >
                                        <FontAwesomeIcon icon={driver.active ? faBan : faUnlock} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL EDIT DRIVER */}
            {isEditOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">Edit Driver</div>
                        <div className="form-group-stop">
                            <label>Full Name</label>
                            <input type="text" value={editForm.fullName} onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} style={{width:'100%', padding:'8px', marginBottom:'10px'}} />
                        </div>
                        <div className="form-group-stop">
                            <label>Phone Number</label>
                            <input type="text" value={editForm.phoneNumber} onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})} style={{width:'100%', padding:'8px'}} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setIsEditOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSaveEdit}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ASSIGN BUS */}
            {isAssignOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">Assign Bus</div>
                        <p style={{marginBottom: '15px', color:'#666'}}>
                            Select a bus for driver <b>{assigningDriver?.fullName}</b>:
                        </p>
                        
                        <div className="form-group-stop">
                            <label>Available Buses</label>
                            <select 
                                style={{width:'100%', padding:'10px', borderRadius:'4px', border:'1px solid #ccc'}}
                                value={selectedBusId}
                                onChange={(e) => setSelectedBusId(e.target.value)}
                            >
                                <option value="">-- Select a bus --</option>
                                {availableBuses.map(bus => (
                                    <option key={bus.id} value={bus.id}>
                                        {bus.licensePlate} ({bus.capacity} seats) - {bus.model || 'Unknown Model'}
                                    </option>
                                ))}
                            </select>
                            {availableBuses.length === 0 && (
                                <small style={{color:'red', display:'block', marginTop:'5px'}}>
                                    No available buses found. Please add more buses or unassign existing ones.
                                </small>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setIsAssignOpen(false)}>Cancel</button>
                            <button 
                                className="btn-save" 
                                onClick={handleSaveAssign}
                                disabled={!selectedBusId}
                                style={{opacity: !selectedBusId ? 0.6 : 1}}
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverPage;