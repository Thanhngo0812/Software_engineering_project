import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios'; 
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { toast } from 'react-toastify'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faExclamationTriangle, faArrowLeft, faUserCheck, faUserSlash, faBus } from '@fortawesome/free-solid-svg-icons';

import { useParentTracking } from './useParentTracking';
import LoadingSpinner from '../../components/LoadingSpinner';
import './ParentTracking.css';

const TRACKING_URL = 'http://localhost:8082';
// --- THÊM URL NOTIFICATION SERVICE ---
const NOTIFICATION_URL = 'http://localhost:8089'; 

const ParentTrackingPage = () => {
    const { studentId } = useParams(); 
    const apiKey = process.env.REACT_APP_TOMTOM_API_KEY;
    
    const { tripData, currentLocation, loading, error } = useParentTracking(studentId);
    const [studentStatus, setStudentStatus] = useState('WAITING'); 

    const mapElement = useRef(null);
    const mapInstance = useRef(null);
    const busMarker = useRef(null);

    // 1. MAP & ROUTE (Giữ nguyên logic cũ)
    useEffect(() => {
        if (!tripData || !mapElement.current || mapInstance.current) return;
        // ... (Code khởi tạo map giữ nguyên) ...
        const map = tt.map({
            key: apiKey, container: mapElement.current, center: [106.6952, 10.7770], zoom: 13
        });
        map.addControl(new tt.NavigationControl());
        mapInstance.current = map;

        const bounds = new tt.LngLatBounds();
        if (tripData.routeStops) {
            tripData.routeStops.forEach((stop, index) => {
                const el = document.createElement('div');
                el.className = 'stop-marker-parent';
                el.innerText = index + 1;
                if(stop.latitude && stop.longitude) {
                    new tt.Marker({ element: el }).setLngLat([stop.longitude, stop.latitude]).addTo(map);
                    bounds.extend([stop.longitude, stop.latitude]);
                }
            });
            if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 50 });

            const locations = tripData.routeStops.filter(s => s.latitude && s.longitude).map(s => `${s.latitude},${s.longitude}`).join(':');
            if (locations.split(':').length >= 2) {
                axios.get(`https://api.tomtom.com/routing/1/calculateRoute/${locations}/json`, { params: { key: apiKey, routeType: 'fastest', traffic: false } }).then(res => {
                    if (res.data.routes && res.data.routes.length > 0) {
                        const geoJson = res.data.routes[0].legs.reduce((acc, leg) => {
                            leg.points.forEach(p => acc.push([p.longitude, p.latitude]));
                            return acc;
                        }, []);
                        map.on('load', () => {
                             map.addSource('route-source', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: geoJson } } });
                             map.addLayer({ id: 'route-line', type: 'line', source: 'route-source', paint: { 'line-color': '#3498db', 'line-width': 5, 'line-opacity': 0.7 } });
                        });
                    }
                });
            }
        }
        const busEl = document.createElement('div');
        busEl.className = 'bus-marker-parent';
        busEl.innerHTML = '🚌';
        busMarker.current = new tt.Marker({ element: busEl }).setLngLat([106.6952, 10.7770]).addTo(map);
    }, [tripData, apiKey]);

    // 2. UPDATE LOCATION (Giữ nguyên logic cũ)
    useEffect(() => {
        if (!currentLocation || !mapInstance.current || !busMarker.current) return;
        const { latitude, longitude } = currentLocation;
        if(latitude && longitude) {
            busMarker.current.setLngLat([longitude, latitude]);
            mapInstance.current.panTo([longitude, latitude], { duration: 1000 });
        }
    }, [currentLocation]);

    // 3. POLLING NOTIFICATION (Cập nhật URL mới)
    useEffect(() => {
        if (!studentId) return;

        const checkStatus = async () => {
            try {
                // --- GỌI SANG NOTIFICATION SERVICE (8083) ---
                const res = await axios.get(`${NOTIFICATION_URL}/api/v1/notifications/student/${studentId}/status`);
                const newStatus = res.data.status;
                
                setStudentStatus(prevStatus => {
                    if (prevStatus !== newStatus) {
                        notifyStatusChange(newStatus);
                    }
                    return newStatus;
                });
            } catch (e) { /* ignore */ }
        };

        const interval = setInterval(checkStatus, 3000); // Check mỗi 3s
        return () => clearInterval(interval);
    }, [studentId]);

    const notifyStatusChange = (status) => {
        if (status === 'BOARDED') {
            toast.success(
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <FontAwesomeIcon icon={faBus} size="lg" />
                    <div><strong>Đã lên xe!</strong><br/>Học sinh đã lên xe an toàn.</div>
                </div>, { autoClose: 5000 }
            );
        } else if (status === 'ALIGHTED') {
            toast.info(
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <FontAwesomeIcon icon={faUserCheck} size="lg" />
                    <div><strong>Đã xuống xe!</strong><br/>Học sinh đã đến nơi trả.</div>
                </div>, { autoClose: false }
            );
        } else if (status === 'ABSENT') {
            toast.error(
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <FontAwesomeIcon icon={faUserSlash} size="lg" />
                    <div><strong>Vắng mặt!</strong><br/>Học sinh được đánh dấu vắng.</div>
                </div>
            );
        }
    };

    // ... (Render UI giữ nguyên) ...
    if (loading) return <LoadingSpinner isLoading={true} />;
    if (error) return <div className="parent-error-screen"><div className="error-card"><FontAwesomeIcon icon={faExclamationTriangle} size="3x" color="#f39c12" /><h3>Chưa tìm thấy chuyến xe</h3><p>{error}</p><Link to="/parent" className="btn-back-home"><FontAwesomeIcon icon={faArrowLeft} /> Quay lại trang chủ</Link></div></div>;

    return (
        <div className="parent-screen">
            <div className="parent-header">
                <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                    <div>
                        <h3>Học sinh ID: {studentId}</h3>
                        <span className={`status-tag ${studentStatus}`}>{studentStatus}</span>
                    </div>
                    <Link to="/parent" style={{textDecoration:'none', color:'#007bff', fontSize:'14px'}}>Đổi HS</Link>
                </div>
                {currentLocation ? (
                    <div className="live-status">
                        <span className="live-dot"></span> Xe đang di chuyển
                        <span className="speed-info"><FontAwesomeIcon icon={faTachometerAlt} /> {Math.round(currentLocation.speed || 0)} km/h</span>
                    </div>
                ) : (
                    <div className="live-status" style={{color:'gray'}}>Đang chờ tín hiệu GPS...</div>
                )}
            </div>
            <div ref={mapElement} className="parent-map"></div>
            <div className="parent-footer">
                <div className="driver-info-card">
                    <div className="driver-img">👨‍✈️</div>
                    <div className="driver-text">
                        <h4>Tài xế đang lái xe</h4>
                        <p>Đang trên đường đến trạm tiếp theo</p>
                    </div>
                    <button className="btn-call">GỌI</button>
                </div>
            </div>
        </div>
    );
};

export default ParentTrackingPage;