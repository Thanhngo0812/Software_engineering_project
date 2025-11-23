import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faPlay, faCheck, faBan, faBus, faMap } from '@fortawesome/free-solid-svg-icons';

import './TripPage.css';
import useTripApi from './useTripApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import RouteMap from '../route/RouteMap';

const TripPage = () => {
    const { trips, routes, drivers, loading, fetchTrips, fetchAttributes, fetchRouteDetails, createTrip, updateTrip, changeStatus } = useTripApi();
    const apiKey = process.env.REACT_APP_TOMTOM_API_KEY;

    const today = new Date().toISOString().split('T')[0];
    const [filterDate, setFilterDate] = useState(today);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentTripId, setCurrentTripId] = useState(null);
    
    // --- STATE MỚI: Lưu danh sách trạm gốc (chưa đảo) ---
    const [rawRouteStops, setRawRouteStops] = useState([]);
    // State hiển thị trên map (đã đảo theo hướng)
    const [previewStops, setPreviewStops] = useState([]);
    
    const [formData, setFormData] = useState({
        routeId: '',
        driverId: '',
        tripDate: today,
        direction: 'to_school',
        plannedStartTime: '07:00',
        plannedEndTime: '08:00' // Giá trị mặc định
    });

    useEffect(() => {
        fetchTrips(filterDate);
    }, [filterDate, fetchTrips]);

    useEffect(() => {
        if (isModalOpen) {
            fetchAttributes();
        }
    }, [isModalOpen]);

    // --- LOGIC MỚI: Tự động đảo chiều Map khi đổi Direction ---
    useEffect(() => {
        if (rawRouteStops.length === 0) {
            setPreviewStops([]);
            return;
        }

        // Copy mảng để không ảnh hưởng mảng gốc
        let stopsToShow = [...rawRouteStops];

        // Nếu là chiều về (FROM_SCHOOL), đảo ngược danh sách
        if (formData.direction === 'from_school') {
            stopsToShow.reverse();
        }

        setPreviewStops(stopsToShow);
    }, [formData.direction, rawRouteStops]);
    // ----------------------------------------------------------

    const selectedDriver = drivers.find(d => d.id === parseInt(formData.driverId));

    const handleRouteSelect = async (e) => {
        const routeId = e.target.value;
        setFormData({...formData, routeId});
        
        if (routeId) {
            const routeData = await fetchRouteDetails(routeId);
            if (routeData && routeData.routeStops) {
                const stops = routeData.routeStops
                    .sort((a, b) => a.stopOrder - b.stopOrder)
                    .map(rs => rs.stop);
                setRawRouteStops(stops);
            }
        } else {
            setRawRouteStops([]);
        }
    };

    const handleOpenCreate = () => {
        setIsEditMode(false);
        setFormData({
            routeId: '', driverId: '',
            tripDate: filterDate,
            direction: 'to_school', 
            plannedStartTime: '07:00', 
            plannedEndTime: '08:00'
        });
        setRawRouteStops([]); 
        setIsModalOpen(true);
    };

    const handleOpenEdit = async (trip) => {
        if (trip.status === 'in_progress' || trip.status === 'completed') {
            return toast.warning("Cannot edit ongoing or completed trips.");
        }
        setIsEditMode(true);
        setCurrentTripId(trip.id);
        setFormData({
            routeId: trip.routeId,
            driverId: trip.driverId,
            tripDate: trip.tripDate,
            direction: trip.direction,
            plannedStartTime: trip.plannedStartTime,
            plannedEndTime: trip.plannedEndTime || '' // Load giờ kết thúc cũ
        });
        
        const routeData = await fetchRouteDetails(trip.routeId);
        if (routeData && routeData.routeStops) {
            const stops = routeData.routeStops
                .sort((a, b) => a.stopOrder - b.stopOrder)
                .map(rs => rs.stop);
            setRawRouteStops(stops);
        }
        
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.routeId || !formData.driverId) {
            return toast.warning("Please fill in all required fields.");
        }
        // Validate logic thời gian đơn giản
        if (formData.plannedEndTime && formData.plannedStartTime >= formData.plannedEndTime) {
             return toast.warning("End time must be after Start time");
        }
  // --- VALIDATE: KHÔNG TẠO TRIP QUÁ KHỨ ---
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        // Lấy giờ hiện tại format HH:MM
        const currentTimeStr = now.toTimeString().slice(0, 5);

        // 1. Check ngày quá khứ
        if (formData.tripDate < todayStr) {
             return toast.warning("Cannot schedule trips for past dates.");
        }

        // 2. Check giờ quá khứ (nếu là hôm nay)
        if (formData.tripDate === todayStr && formData.plannedStartTime < currentTimeStr) {
             return toast.warning(`Start time cannot be earlier than current time (${currentTimeStr}).`);
        }
        let res;
        if (isEditMode) {
            res = await updateTrip(currentTripId, formData);
        } else {
            res = await createTrip(formData);
        }

        if (res.success) {
            toast.success(isEditMode ? "Trip updated!" : "Trip created!");
            setIsModalOpen(false);
            fetchTrips(filterDate);
        } else {
            toast.error(res.message);
        }
    };

    const handleStatusChange = (id, newStatus) => {
        Swal.fire({
            title: `Mark as ${newStatus}?`,
            text: "This will update the trip status.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Proceed'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await changeStatus(id, newStatus);
                if (res.success) {
                    toast.success("Status updated");
                    fetchTrips(filterDate);
                } else {
                    toast.error(res.message);
                }
            }
        });
    };

    const renderStatusBadge = (status) => {
        let colorClass = 'locked'; 
        if (status === 'scheduled') colorClass = 'assigned'; 
        if (status === 'in_progress') colorClass = 'active'; 
        if (status === 'cancelled') colorClass = 'no-bus'; 
        return <span className={`status-badge-driver ${colorClass}`}>{status}</span>;
    };

    return (
        <div className="driver-main-content">
            <LoadingSpinner isLoading={loading} />

            <div className="content-header">
                <h2><span role="img" aria-label="icon">📅</span> Trips Schedule</h2>
                <div style={{display: 'flex', gap: '10px'}}>
                    <input 
                        type="date" 
                        className="search-bar" 
                        style={{width: 'auto', margin: 0}}
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                    <button className="create-button" onClick={handleOpenCreate}>
                        + New Trip
                    </button>
                </div>
            </div>

            <div className="content-body">
                <table className="driver-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Route</th>
                            <th>Direction</th>
                            <th>Bus / Driver</th>
                            <th className="text-center">Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.map(trip => (
                            <tr key={trip.id}>
                                <td data-label="Time">
                                    <div style={{fontWeight:'bold', fontSize:'15px'}}>
                                        {trip.plannedStartTime} - <span style={{color:'#888'}}>{trip.plannedEndTime || '?'}</span>
                                    </div>
                                    <div style={{fontSize:'12px', color:'#666'}}>{trip.tripDate}</div>
                                </td>
                                <td data-label="Route">
                                    <div style={{fontWeight:'600'}}>{trip.routeName}</div>
                                </td>
                                <td data-label="Direction">
                                    {trip.direction === 'to_school' ? 
                                        <span style={{color:'#e67e22'}}>To School 🏫</span> : 
                                        <span style={{color:'#2980b9'}}>Home 🏠</span>
                                    }
                                </td>
                                <td data-label="Bus/Driver">
                                    <div>Bus: <b>{trip.busLicensePlate}</b></div>
                                    <div style={{fontSize:'12px'}}>Dr: {trip.driverName}</div>
                                </td>
                                <td data-label="Status" className="text-center">
                                    {renderStatusBadge(trip.status)}
                                </td>
                                <td data-label="Actions" className="actions-cell">
                                    {trip.status === 'scheduled' && (
                                        <button className="icon-button" title="Edit" onClick={() => handleOpenEdit(trip)}>
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                    )}
                                    {trip.status === 'scheduled' && (
                                        <button className="icon-button" title="Start Trip" onClick={() => handleStatusChange(trip.id, 'in_progress')} style={{color:'green'}}>
                                            <FontAwesomeIcon icon={faPlay} />
                                        </button>
                                    )}
                                    {trip.status === 'in_progress' && (
                                        <button className="icon-button" title="Complete" onClick={() => handleStatusChange(trip.id, 'completed')} style={{color:'blue'}}>
                                            <FontAwesomeIcon icon={faCheck} />
                                        </button>
                                    )}
                                    {trip.status === 'scheduled' && (
                                        <button className="icon-button" title="Cancel" onClick={() => handleStatusChange(trip.id, 'cancelled')} style={{color:'red'}}>
                                            <FontAwesomeIcon icon={faBan} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {trips.length === 0 && <tr><td colSpan="6" className="text-center" style={{padding:'20px'}}>No trips found for this date.</td></tr>}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content trip-modal-wide">
                        <div className="modal-header">{isEditMode ? 'Edit Trip' : 'Schedule New Trip'}</div>
                        
                        <div className="trip-form-layout">
                            <div className="trip-form-side">
                                
                                {/* CẬP NHẬT: Input Ngày */}
                                <div className="form-group-stop">
                                    <label>Date</label>
                                    <input 
                                        type="date" 
                                        value={formData.tripDate} 
                                        onChange={(e) => setFormData({...formData, tripDate: e.target.value})} 
                                        style={{width: '100%', padding:'8px'}} 
                                    />
                                </div>

                                {/* CẬP NHẬT: Input Giờ (Start & End) */}
                                <div className="form-group-stop">
                                    <label>Time (Start - End)</label>
                                    <div style={{display:'flex', gap:'10px', alignItems: 'center'}}>
                                        <input 
                                            type="time" 
                                            value={formData.plannedStartTime} 
                                            onChange={(e) => setFormData({...formData, plannedStartTime: e.target.value})} 
                                            style={{flex:1, padding:'8px'}} 
                                            title="Start Time"
                                        />
                                        <span style={{color:'#666', fontWeight:'bold'}}>to</span>
                                        <input 
                                            type="time" 
                                            value={formData.plannedEndTime} 
                                            onChange={(e) => setFormData({...formData, plannedEndTime: e.target.value})} 
                                            style={{flex:1, padding:'8px'}} 
                                            title="End Time"
                                        />
                                    </div>
                                </div>

                                <div className="form-group-stop">
                                    <label>Direction</label>
                                    <select value={formData.direction} onChange={(e) => setFormData({...formData, direction: e.target.value})} style={{width:'100%', padding:'8px'}}>
                                        <option value="to_school">To School (Home → School)</option>
                                        <option value="from_school">From School (School → Home)</option>
                                    </select>
                                </div>

                                <div className="form-group-stop">
                                    <label>Route</label>
                                    <select value={formData.routeId} onChange={handleRouteSelect} style={{width:'100%', padding:'8px'}}>
                                        <option value="">-- Select Route --</option>
                                        {routes.map(r => <option key={r.id} value={r.id}>{r.routeName}</option>)}
                                    </select>
                                </div>

                                <div className="form-group-stop">
                                    <label>Driver</label>
                                    <select value={formData.driverId} onChange={(e) => setFormData({...formData, driverId: e.target.value})} style={{width:'100%', padding:'8px'}}>
                                        <option value="">-- Select Driver --</option>
                                        {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                                    </select>
                                </div>

                                <div className="form-group-stop">
                                    <label>Assigned Bus</label>
                                    <div style={{padding:'10px', backgroundColor:'#f0f0f0', borderRadius:'4px', border: '1px solid #ccc'}}>
                                        {selectedDriver ? (
                                            selectedDriver.assignedBusId ? (
                                                <span style={{color: '#8e44ad', fontWeight: 'bold'}}>
                                                    <FontAwesomeIcon icon={faBus} /> {selectedDriver.assignedBusLicense}
                                                </span>
                                            ) : (
                                                <span style={{color: 'red'}}>Driver has no bus! Cannot create trip.</span>
                                            )
                                        ) : (
                                            <span style={{color:'#999'}}>Select a driver to see bus</span>
                                        )}
                                    </div>
                                </div>

                                <div className="modal-actions" style={{marginTop: 'auto'}}>
                                    <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button 
                                        className="btn-save" 
                                        onClick={handleSubmit}
                                        disabled={!selectedDriver || !selectedDriver.assignedBusId}
                                        style={{opacity: (!selectedDriver || !selectedDriver.assignedBusId) ? 0.6 : 1}}
                                    >
                                        Save Trip
                                    </button>
                                </div>
                            </div>

                            {/* Cột Map */}
                            <div className="trip-map-side">
                                <div style={{width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd'}}>
                                    <RouteMap stops={previewStops} apiKey={apiKey} />
                                </div>
                                {previewStops.length === 0 && (
                                    <div className="map-placeholder">Select a route to view map</div>
                                )}
                                {previewStops.length > 0 && (
                                    <div style={{
                                        position: 'absolute', top: '10px', left: '10px', 
                                        background: 'rgba(255,255,255,0.9)', padding: '5px 10px', 
                                        borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}>
                                        Direction: {formData.direction === 'to_school' ? 'Home → School' : 'School → Home'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripPage;