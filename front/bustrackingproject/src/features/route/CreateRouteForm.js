import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faTrash, faPlus, faLock } from '@fortawesome/free-solid-svg-icons';

import LoadingSpinner from '../../components/LoadingSpinner';
import RouteMap from '../route/RouteMap'; // Import Map Component
import { useApiRoute, useFetchAllStops } from './api/useRouteApi';
import '../stop/css/CreateStopForm.css'; 
import '../route/CreateRouteFrom.css'; 

const CreateRouteForm = () => {
    const apiKey = process.env.REACT_APP_TOMTOM_API_KEY; 
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const { createRoute, updateRoute, getRouteById, isLoading, error } = useApiRoute();
    const allStops = useFetchAllStops(); 

    const [routeName, setRouteName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedStops, setSelectedStops] = useState([]);
    const [stopToSelect, setStopToSelect] = useState('');
    const [isRouteInUse, setIsRouteInUse] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            const fetchRouteDetail = async () => {
                try {
                    const data = await getRouteById(id);
                    setRouteName(data.routeName);
                    setDescription(data.description);
                    if (data.routeStops) {
                        const sortedStops = data.routeStops
                            .sort((a, b) => a.stopOrder - b.stopOrder)
                            .map(item => item.stop); 
                        setSelectedStops(sortedStops);
                    }
                    if (data.inUse || (data.activeTripCount && data.activeTripCount > 0)) {
                        setIsRouteInUse(true);
                        toast.warning("This route is locked due to active trips.", { autoClose: 3000 });
                    }
                } catch (err) {
                    navigate('/school/route');
                }
            };
            fetchRouteDetail();
        }
    }, [id]);

    const handleAddStop = () => {
        if (isRouteInUse) return;
        if (!stopToSelect) return;
        
        const exists = selectedStops.find(s => s.id === parseInt(stopToSelect));
        if (exists) {
            toast.warning('Stop already added!');
            return;
        }

        const stopObj = allStops.find(s => s.id === parseInt(stopToSelect));
        if (stopObj) {
            setSelectedStops([...selectedStops, stopObj]);
            setStopToSelect('');
        }
    };

    const handleRemoveStop = (index) => {
        if (isRouteInUse) return;
        const newList = [...selectedStops];
        newList.splice(index, 1);
        setSelectedStops(newList);
    };

    const moveStop = (index, direction) => {
        if (isRouteInUse) return;
        const newList = [...selectedStops];
        if (direction === 'up' && index > 0) {
            [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
        } else if (direction === 'down' && index < newList.length - 1) {
            [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
        }
        setSelectedStops(newList);
    };

    const handleSave = async () => {
        if (isRouteInUse) return toast.error("Route is locked.");
        if (!routeName) return toast.error('Route name is required');
        if (selectedStops.length < 2) toast.warning('Route needs at least 2 stops.');

        const routeStopsData = selectedStops.map((stop, index) => ({
            stopId: stop.id,
            stopOrder: index + 1
        }));

        const payload = {
            routeName,
            description,
            routeStops: routeStopsData 
        };

        try {
            if (isEditMode) {
                await updateRoute(id, payload);
                navigate('/school/route', { replace: true, state: { message: 'Route updated!' } });
            } else {
                await createRoute(payload);
                navigate('/school/route', { replace: true, state: { message: 'Route created!' } });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        }
    };

    return (
        // SỬA CLASS Ở ĐÂY: Đổi thành create-route-wrapper
        <div className="create-route-wrapper"> 
            <LoadingSpinner isLoading={isLoading} />
            
            <div className="create-route-layout">
                {/* LEFT: Info */}
                <div className="route-info-panel">
                    <h2>{isEditMode ? 'Edit Route' : 'Create Route'}</h2>
                    {isRouteInUse && <div className="locked-alert"><FontAwesomeIcon icon={faLock} /> Locked</div>}

                    <div className="form-group-stop">
                        <label>Route Name *</label>
                        <input
                            type="text"
                            value={routeName}
                            onChange={(e) => setRouteName(e.target.value)}
                            disabled={isRouteInUse}
                        />
                    </div>
                    <div className="form-group-stop">
                        <label>Description</label>
                        <textarea
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isRouteInUse}
                        />
                    </div>
                    
                    <div className="button-group" style={{marginTop: 'auto', display: 'flex', gap: '10px'}}>
                        <button className="btn btn-secondary-stop" onClick={() => navigate('/school/route')}>CANCEL</button>
                        {!isRouteInUse && <button className="btn btn-primary-stop" onClick={handleSave}>SAVE</button>}
                    </div>
                </div>

                {/* RIGHT: Map & List */}
                <div className="route-right-panel">
                    {/* 1. MAP SECTION */}
                    <div className="route-map-container">
                        <RouteMap stops={selectedStops} apiKey={apiKey} />
                    </div>

                    {/* 2. STOP LIST SECTION */}
                    <div className="route-stops-manager">
                        <div className="stop-selector-compact">
                            {!isRouteInUse && (
                                <>
                                    <select 
                                        value={stopToSelect} 
                                        onChange={(e) => setStopToSelect(e.target.value)}
                                        className="stop-dropdown"
                                    >
                                        <option value="">-- Select Stop to Add --</option>
                                        {allStops.map(stop => (
                                            <option key={stop.id} value={stop.id}>{stop.name} - {stop.address}</option>
                                        ))}
                                    </select>
                                    <button className="btn-add-icon" onClick={handleAddStop}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="selected-stops-list-compact">
                            {selectedStops.map((stop, index) => (
                                <div key={`${stop.id}-${index}`} className={`stop-row ${isRouteInUse?'disabled':''}`}>
                                    <div className="stop-badge" style={{
                                        backgroundColor: index === 0 ? '#28a745' : (index === selectedStops.length - 1 ? '#dc3545' : '#007bff')
                                    }}>{index + 1}</div>
                                    <div className="stop-text">
                                        <b>{stop.name}</b>
                                        <span>{stop.address}</span>
                                    </div>
                                    {!isRouteInUse && (
                                        <div className="stop-tools">
                                            <button onClick={() => moveStop(index, 'up')} disabled={index===0}><FontAwesomeIcon icon={faArrowUp}/></button>
                                            <button onClick={() => moveStop(index, 'down')} disabled={index===selectedStops.length-1}><FontAwesomeIcon icon={faArrowDown}/></button>
                                            <button onClick={() => handleRemoveStop(index)} className="del"><FontAwesomeIcon icon={faTrash}/></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                             {selectedStops.length === 0 && <p className="empty-hint">Add stops to see route map</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRouteForm;