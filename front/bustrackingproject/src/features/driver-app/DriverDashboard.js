import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; 
import tt from '@tomtom-international/web-sdk-maps';
import { useParams, Link } from 'react-router-dom';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faCheckCircle, faSignOutAlt, faUserSlash, faWalking, faBus, faFlagCheckered, faBan } from '@fortawesome/free-solid-svg-icons';

import { useDriverApp } from './useDriverApp';
import { calculateDistance, interpolatePoints, expandRoutePath } from './utils/GeoUtils';
import './css/DriverApp.css';

const DriverDashboard = () => {
    const apiKey = process.env.REACT_APP_TOMTOM_API_KEY;
    const { getMyTrips, startTrip, completeTrip, getTripRoute, sendLocationUpdate, getStudentManifest, markStudentAttendance } = useDriverApp();
const navigate = useNavigate();

    const { driverId } = useParams(); 


    const [trips, setTrips] = useState([]);
    const [activeTrip, setActiveTrip] = useState(null);
    const [stops, setStops] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [nextStopIndex, setNextStopIndex] = useState(0); 
    const [isSimulating, setIsSimulating] = useState(false);
    const [isMoving, setIsMoving] = useState(false); 
    
    const [showManifest, setShowManifest] = useState(false);
    const [currentManifest, setCurrentManifest] = useState(null);
    const [checkedStudents, setCheckedStudents] = useState({}); 

    const mapElement = useRef(null);
    const mapInstance = useRef(null);
    const busMarkerRef = useRef(null);
    const stopMarkersRef = useRef([]); 
    const simulationRef = useRef(null);

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        const data = await getMyTrips(driverId);
        setTrips(data);
    };
    
    useEffect(() => {
        if (activeTrip && mapElement.current && !mapInstance.current) {
            const map = tt.map({
                key: apiKey,
                container: mapElement.current,
                center: [106.6952, 10.7770],
                zoom: 14,
            });
            map.addControl(new tt.NavigationControl());
            mapInstance.current = map;

            const busEl = document.createElement('div');
            busEl.className = 'driver-bus-marker';
            busEl.innerHTML = '🚌';
            
            busMarkerRef.current = new tt.Marker({ element: busEl })
                .setLngLat([106.6952, 10.7770])
                .addTo(map);
        }
        
        return () => {
            if (!activeTrip && mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [activeTrip, apiKey]);

    useEffect(() => {
        const map = mapInstance.current;
        if (!map || stops.length === 0) return;

        stopMarkersRef.current.forEach(m => m.remove());
        stopMarkersRef.current = [];

        if (map.getLayer('route-line')) {
            map.removeLayer('route-line');
            map.removeSource('route-source');
        }

        const bounds = new tt.LngLatBounds();
        let hasValidStops = false;

        stops.forEach((stopWrapper, index) => {
            const stop = stopWrapper.stop || stopWrapper;
            if (!stop.latitude || !stop.longitude || isNaN(Number(stop.latitude))) return;

            hasValidStops = true;
            const element = document.createElement('div');
            element.style.backgroundColor = index === 0 ? '#2ecc71' : (index === stops.length - 1 ? '#e74c3c' : '#3498db');
            element.style.width = '24px';
            element.style.height = '24px';
            element.style.borderRadius = '50%';
            element.style.border = '3px solid white';
            element.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            element.style.color = 'white';
            element.style.fontSize = '12px';
            element.style.fontWeight = 'bold';
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.style.justifyContent = 'center';
            element.innerText = index + 1;

            const marker = new tt.Marker({ element })
                .setLngLat([Number(stop.longitude), Number(stop.latitude)])
                .addTo(map);
            stopMarkersRef.current.push(marker);
            bounds.extend([Number(stop.longitude), Number(stop.latitude)]);
        });

        if (hasValidStops) {
            map.fitBounds(bounds, { padding: 80 });

            const locations = stops
                .map(s => (s.stop||s))
                .filter(s => s.latitude && s.longitude)
                .map(s => `${s.latitude},${s.longitude}`)
                .join(':');

            if (locations.split(':').length >= 2) {
                axios.get(`https://api.tomtom.com/routing/1/calculateRoute/${locations}/json`, {
                    params: { key: apiKey, routeType: 'fastest', traffic: false }
                }).then(res => {
                    if (res.data.routes && res.data.routes.length > 0) {
                        const geoJson = res.data.routes[0].legs.reduce((acc, leg) => {
                            leg.points.forEach(p => acc.push([p.longitude, p.latitude]));
                            return acc;
                        }, []);
                        
                        if (map.getSource('route-source')) {
                            map.removeLayer('route-line');
                            map.removeSource('route-source');
                        }
                        map.addSource('route-source', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: geoJson } } });
                        map.addLayer({ id: 'route-line', type: 'line', source: 'route-source', paint: { 'line-color': '#3498db', 'line-width': 6, 'line-opacity': 0.7 } });
                    }
                }).catch(e => console.error(e));
            }
        }
    }, [stops]);

    const handleStartTrip = async (trip) => {
        const routeStops = await getTripRoute(trip.id);
        if (!routeStops || routeStops.length === 0) return toast.error("Route error: No stops found");
        
        const validStops = routeStops.filter(s => s.stop && s.stop.latitude && s.stop.longitude);
        if (validStops.length === 0) return toast.error("Stops have no coordinates.");

        const res = await startTrip(trip.id);
        if (res.success) {
            toast.success("Trip Started! Driving from Depot...");
            setActiveTrip(trip);
            setStops(validStops); 
            setNextStopIndex(0); // Bắt đầu chạy đến trạm đầu tiên (Index 0)
            
            const startStop = validStops[0].stop;
            
            // --- LOGIC MỚI: TẠO "BÃI XE" XA XA MỘT CHÚT ---
            // Random offset khoảng 0.015 - 0.025 độ (~1.5 - 3km)
            const offsetLat = (Math.random() * 0.010) + 0.015; 
            const offsetLng = (Math.random() * 0.010) + 0.015;
            
            // Random hướng (Đông/Tây/Nam/Bắc) để bãi xe không cố định
            const latDir = Math.random() > 0.5 ? 1 : -1;
            const lngDir = Math.random() > 0.5 ? 1 : -1;

            const depotLat = Number(startStop.latitude) + (offsetLat * latDir);
            const depotLng = Number(startStop.longitude) + (offsetLng * lngDir);

            // Đặt xe tại Bãi xe
            updateBusPosition(depotLat, depotLng);
            
            if(mapInstance.current) {
                mapInstance.current.flyTo({ center: [depotLng, depotLat], zoom: 14 });
                toast.info("Bus is at the Depot. Press DRIVE to start pickup.");
            }
        } else {
            toast.error("Failed to start: " + res.message);
        }
    };

    const toggleSimulation = () => {
        if (isMoving) {
            clearInterval(simulationRef.current);
            setIsMoving(false);
        } else {
            if (!stops || stops.length < 1) return toast.warning("Need valid stops"); // Sửa check length < 1
            setIsSimulating(true);
            setIsMoving(true);
            runSimulationLeg(nextStopIndex);
        }
    };

    const runSimulationLeg = async (targetIndexOverride = null) => {
        const indexToUse = targetIndexOverride !== null ? targetIndexOverride : nextStopIndex;
        if (indexToUse >= stops.length) return;

        const targetStop = stops[indexToUse].stop;
        
        if (!currentLocation || !targetStop.latitude || !targetStop.longitude) {
            setIsMoving(false);
            return;
        }

        let path = [];
        try {
            const origin = `${currentLocation.lat},${currentLocation.lng}`;
            const dest = `${targetStop.latitude},${targetStop.longitude}`;
            
            const res = await axios.get(`https://api.tomtom.com/routing/1/calculateRoute/${origin}:${dest}/json`, {
                params: { key: apiKey, routeType: 'fastest', traffic: false }
            });

            if (res.data.routes && res.data.routes.length > 0) {
                const routePoints = res.data.routes[0].legs[0].points;
                // Tăng độ mịn để xe chạy mượt hơn trên quãng đường dài
                path = expandRoutePath(routePoints, 3); 
            }
        } catch (err) {
            console.warn("Routing API error, falling back to linear interpolation", err);
            path = interpolatePoints(currentLocation, targetStop, 100);
        }

        if (path.length === 0) return;

        let step = 0;
        simulationRef.current = setInterval(() => {
            if (step >= path.length) {
                clearInterval(simulationRef.current);
                setIsMoving(false);
                updateBusPosition(targetStop.latitude, targetStop.longitude);
                handleArriveAtStop(targetStop, indexToUse);
                return;
            }
            const p = path[step];
            if (p && !isNaN(p.latitude) && !isNaN(p.longitude)) {
                updateBusPosition(p.latitude, p.longitude);
            }
            step++;
        }, 50);
    };

    const updateBusPosition = (lat, lng) => {
        const numLat = Number(lat);
        const numLng = Number(lng);
        if (isNaN(numLat) || isNaN(numLng)) return;

        setCurrentLocation({ lat: numLat, lng: numLng, latitude: numLat, longitude: numLng });
        
        if (mapInstance.current && busMarkerRef.current) {
            busMarkerRef.current.setLngLat([numLng, numLat]);
        }
        if (activeTrip && activeTrip.id) {
            sendLocationUpdate(activeTrip.id, numLat, numLng, 40.5); 
        }
    };

    const handleArriveAtStop = async (stop, index) => {
        if (simulationRef.current) clearInterval(simulationRef.current);
        setIsMoving(false);

        toast.info(`Arrived at ${stop.name}`);
        
        const manifest = await getStudentManifest(activeTrip.id, stop.id);
        if (manifest) {
            setCurrentManifest(manifest);
            setCheckedStudents({});
            setShowManifest(true);
        } else {
            setTimeout(() => handleContinueTrip(), 2000);
        }
    };

    const handleAttendance = async (studentId, status) => {
        const res = await markStudentAttendance(activeTrip.id, studentId, status, currentLocation.lat, currentLocation.lng);
        if (res.success) {
            setCheckedStudents(prev => ({ ...prev, [studentId]: status }));
        } else {
            toast.error("Failed to mark attendance");
        }
    };

    const handleContinueTrip = () => {
        setShowManifest(false);
        const nextIndex = nextStopIndex + 1;
        setNextStopIndex(nextIndex);
        
        if (nextIndex < stops.length) {
            setIsMoving(true);
            setTimeout(() => runSimulationLeg(nextIndex), 500); 
        } else {
            toast.success("Reached final stop!");
            setIsSimulating(false);
            setIsMoving(false);
        }
    };

     const handleFinishTrips = async () => {
        if (simulationRef.current) clearInterval(simulationRef.current);
        setIsSimulating(false);
        setIsMoving(false);

        const title = 'Finish Trip?';
        const text =  "Complete this trip successfully?";
        const confirmBtnColor = '#28a745';
        const confirmBtnText =  'Yes, Finish';
                const apiRes = await completeTrip(activeTrip.id);
                
                if (apiRes.success) {
                    toast.success("finish!!")
                   window.location.reload();
                    
                } else {
                    toast.error("Failed to update trip status: " + apiRes.message);
                }
            
      
    };
    const handleFinishTrip = async (isCancel = false) => {
        if (simulationRef.current) clearInterval(simulationRef.current);
        setIsSimulating(false);
        setIsMoving(false);

        const title = isCancel ? 'Stop Trip Early?' : 'Finish Trip?';
        const text = isCancel 
            ? "You haven't reached the final stop. End trip now?" 
            : "Complete this trip successfully?";
        const confirmBtnColor = isCancel ? '#d33' : '#28a745';
        const confirmBtnText = isCancel ? 'Yes, Stop Now' : 'Yes, Finish';

        Swal.fire({
            title: title,
            text: text,
            icon: isCancel ? 'warning' : 'success',
            showCancelButton: true,
            confirmButtonColor: confirmBtnColor,
            confirmButtonText: confirmBtnText
        }).then(async (res) => {
            if (res.isConfirmed) {
                const apiRes = await completeTrip(activeTrip.id);
                
                if (apiRes.success) {
                    Swal.fire("Completed!", "Trip status has been updated.", "success").then(() => {
                        window.location.reload();
                    });
                } else {
                    toast.error("Failed to update trip status: " + apiRes.message);
                }
            }
        });
    };

    if (!activeTrip) {
        return (
            <div className="driver-screen">
                <div className="driver-header">
                    <div className="driver-avatar">👨‍✈️</div>
                    <div><h2>Driver App (Demo)</h2></div>
                </div>
                <div className="trip-list">
                    {trips.map(trip => (
                        <div key={trip.id} className="trip-card-mobile">
                            <div className="trip-time">{trip.plannedStartTime}</div>
                            <div className="trip-route">
                                <h3>{trip.routeName}</h3>
                                <span>{trip.direction}</span>
                            </div>
                            <button className="btn-start-trip" onClick={() => handleStartTrip(trip)}>
                                <FontAwesomeIcon icon={faPlay} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const nextStopName = nextStopIndex < stops.length ? stops[nextStopIndex].stop.name : "Destination Reached";
    const isLastStop = nextStopIndex >= stops.length;

    return (
        <div className="driver-screen driving-mode">
            <div className="driving-header">
                <div className="next-stop-box">
                    <small>NEXT STOP</small>
                    <div className="stop-name-large">{nextStopName}</div>
                </div>
                {!isLastStop && (
                    <button className={`btn-sim ${isMoving ? 'active' : ''}`} onClick={toggleSimulation}>
                        <FontAwesomeIcon icon={isMoving ? faStop : faPlay} />
                        <span>{isMoving ? ' PAUSE' : ' DRIVE'}</span>
                    </button>
                )}
            </div>

            <div ref={mapElement} className="driver-map"></div>

            <div className="driving-footer">
                <button className="btn-emergency">SOS</button>
                
                {isLastStop ? (
                     <button className="btn-finish-trip btn-complete" onClick={() => handleFinishTrips()}>
                        <FontAwesomeIcon icon={faFlagCheckered} /> COMPLETE TRIP
                     </button>
                ) : (
                    <button className="btn-finish-trip btn-stop-early" onClick={() => handleFinishTrip(true)}>
                        <FontAwesomeIcon icon={faBan} /> STOP TRIP
                    </button>
                )}
            </div>

            {showManifest && currentManifest && (
                <div className="manifest-overlay">
                    <div className="manifest-card">
                        <div className="manifest-header">
                            <div className="stop-icon-wrapper">🚏</div>
                            <div style={{flex:1}}>
                                <h3>{currentManifest.stopName}</h3>
                                <div className="badge-count">
                                    {currentManifest.students?.length} Students
                                </div>
                            </div>
                        </div>
                        
                        <div className="student-check-list">
                            {currentManifest.students && currentManifest.students.length > 0 ? (
                                currentManifest.students.map(stu => {
                                    const status = checkedStudents[stu.studentId] || stu.status;
                                    const isChecked = status === 'BOARDED' || status === 'ALIGHTED';
                                    const isAbsent = status === 'ABSENT';

                                    return (
                                        <div key={stu.studentId} className={`student-check-item ${isChecked ? 'checked' : ''} ${isAbsent ? 'absent' : ''}`}>
                                            <div className="stu-info">
                                                <div className="stu-name">{stu.studentName}</div>
                                                <div className="stu-id">id: {stu.studentId}</div>
                                                <div className="stu-name">Parent phone: {stu.parentPhone}</div>
                                            </div>
                                            <div className="check-actions">
                                                <button 
                                                    className={`btn-action btn-absent ${isAbsent ? 'active' : ''}`}
                                                    onClick={() => handleAttendance(stu.studentId, 'ABSENT')}
                                                >
                                                    <FontAwesomeIcon icon={faUserSlash} />
                                                </button>
                                                <button 
                                                    className={`btn-action btn-present ${isChecked ? 'active' : ''}`}
                                                    onClick={() => handleAttendance(stu.studentId, currentManifest.action === 'DROP_OFF' ? 'ALIGHTED' : 'BOARDED')}
                                                >
                                                    <FontAwesomeIcon icon={currentManifest.action === 'DROP_OFF' ? faWalking : faBus} />
                                                    {currentManifest.action === 'DROP_OFF' ? ' Drop' : ' Pick'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="empty-state-manifest">
                                    <p>No students at this stop.</p>
                                </div>
                            )}
                        </div>
                        
                        <button className="btn-continue" onClick={handleContinueTrip}>
                            DONE & CONTINUE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;