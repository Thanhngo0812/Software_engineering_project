import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendarAlt, faMapMarkerAlt, faBus, faRoad } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../../components/LoadingSpinner';
import RouteMap from './RouteMap'; // Tái sử dụng Map xịn
import { useApiRoute } from './api/useRouteApi';
// import './css/CreateRouteForm.css'; // Tái sử dụng layout 2 cột
 import './RouteDetail.css';    

const RouteDetail = () => {
    const apiKey = process.env.REACT_APP_TOMTOM_API_KEY;
    const { id } = useParams();
    const navigate = useNavigate();
    const { getRouteById, isLoading } = useApiRoute();

    const [route, setRoute] = useState(null);
    const [stops, setStops] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getRouteById(id);
                setRoute(data);
                
                // Xử lý danh sách stops để hiển thị
                if (data.routeStops) {
                    const sorted = data.routeStops
                        .sort((a, b) => a.stopOrder - b.stopOrder)
                        .map(item => item.stop);
                    setStops(sorted);
                }
            } catch (err) {
                navigate('/school/route'); // Nếu lỗi ID thì quay về list
            }
        };
        fetchData();
    }, [id]);

    if (!route) return <LoadingSpinner isLoading={true} />;

    return (
        <div className="create-route-wrapper"> {/* Tái sử dụng wrapper full màn hình */}
            <LoadingSpinner isLoading={isLoading} />

            {/* Header riêng của trang Detail */}
            <div className="detail-header">
                <button className="btn-back" onClick={() => navigate('/school/route')}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to List
                </button>
                <div className="detail-actions">
                    <Link to={`/school/route/edit/${id}`} className="btn-edit-link">
                        Edit this Route
                    </Link>
                </div>
            </div>

            <div className="create-route-layout">
                {/* CỘT TRÁI: Thông tin chi tiết */}
                <div className="route-info-panel detail-view-panel">
                    <div className="detail-title-block">
                        <h1>{route.routeName}</h1>
                        <span className={`status-badge ${route.inUse ? 'active' : 'draft'}`}>
                            {route.inUse ? 'Active / In Use' : 'Draft / Idle'}
                        </span>
                    </div>

                    <div className="detail-section">
                        <label>Description</label>
                        <p className="detail-text">
                            {route.description || "No description provided."}
                        </p>
                    </div>

                    <div className="detail-stats">
                        <div className="stat-item">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="icon" />
                            <div>
                                <strong>{stops.length}</strong>
                                <span>Total Stops</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
                            <div>
                                <strong>{new Date(route.createdAt).toLocaleDateString()}</strong>
                                <span>Created Date</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Danh sách dạng text đơn giản */}
                    <div className="simple-timeline">
                        <h3><FontAwesomeIcon icon={faRoad} /> Sequence</h3>
                        <ul>
                            {stops.map((stop, idx) => (
                                <li key={idx}>
                                    <span className="dot"></span>
                                    <span className="name">{stop.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* CỘT PHẢI: Bản đồ & Danh sách chi tiết */}
                <div className="route-right-panel">
                    {/* 1. MAP (To hơn một chút so với trang Edit) */}
                    <div className="route-map-container" style={{flex: 2}}> 
                        <RouteMap stops={stops} apiKey={apiKey} />
                    </div>

                    {/* 2. LIST (Read-only) */}
                    <div className="route-stops-manager" style={{flex: 1}}>
                        <h4 style={{margin: '0 0 10px 5px', color: '#555'}}>Route Path</h4>
                        <div className="selected-stops-list-compact">
                            {stops.map((stop, index) => (
                                <div key={index} className="stop-row readonly">
                                    <div className="stop-badge" style={{
                                        backgroundColor: index === 0 ? '#28a745' : (index === stops.length - 1 ? '#dc3545' : '#007bff')
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div className="stop-text">
                                        <b>{stop.name}</b>
                                        <span>{stop.address}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteDetail;