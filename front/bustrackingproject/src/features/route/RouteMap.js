import React, { useEffect, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import axios from 'axios';

const RouteMap = ({ stops, apiKey }) => {
    const mapElement = useRef();
    // CHUYỂN SANG USESTATE: Để khi map khởi tạo xong, React sẽ tự re-render và vẽ marker
    const [map, setMap] = useState(null);
    // Dùng useRef để quản lý danh sách marker đã vẽ -> Xóa cho dễ
    const markersRef = useRef([]);

    // 1. Khởi tạo Bản đồ (Chạy 1 lần)
    useEffect(() => {
        const defaultCenter = [106.6952, 10.7770]; 

        let mapInstance = tt.map({
            key: apiKey,
            container: mapElement.current,
            center: defaultCenter,
            zoom: 13
        });

        mapInstance.addControl(new tt.NavigationControl());

        // Khi map load xong style thì mới set vào state để sử dụng
        mapInstance.on('load', () => {
            setMap(mapInstance);
        });

        return () => mapInstance.remove();
    }, [apiKey]);

    // 2. Vẽ Marker & Route (Chạy khi Map sẵn sàng HOẶC danh sách Stops thay đổi)
    useEffect(() => {
        if (!map) return; // Nếu map chưa load xong thì thoát, chờ lần render sau

        // --- BƯỚC A: Xóa sạch Marker & Route cũ ---
        // Xóa marker từ array ref (An toàn hơn xóa DOM)
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Xóa layer đường đi cũ
        if (map.getLayer('route')) {
            map.removeLayer('route');
            map.removeSource('route');
        }

        // --- BƯỚC B: Kiểm tra dữ liệu ---
        if (!stops || stops.length === 0) return;

        const validStops = stops.filter(s => {
            const lat = Number(s.latitude);
            const lng = Number(s.longitude);
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
        });

        if (validStops.length === 0) return;

        // --- BƯỚC C: Vẽ Marker mới ---
        const bounds = new tt.LngLatBounds();

        validStops.forEach((stop, index) => {
            // Tạo HTML Element cho Marker số thứ tự
            const element = document.createElement('div');
            element.className = 'marker-number';
            element.style.backgroundColor = index === 0 ? '#28a745' : (index === validStops.length - 1 ? '#dc3545' : '#007bff');
            element.style.width = '32px';
            element.style.height = '32px';
            element.style.borderRadius = '50%';
            element.style.color = 'white';
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.style.justifyContent = 'center';
            element.style.fontWeight = 'bold';
            element.style.border = '2px solid white';
            element.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
            element.innerText = index + 1;

            const lat = Number(stop.latitude);
            const lng = Number(stop.longitude);

            const marker = new tt.Marker({ element: element })
                .setLngLat([lng, lat])
                .addTo(map);
            
            // Lưu marker vào ref để quản lý xóa sau này
            markersRef.current.push(marker);
            
            // Mở rộng vùng nhìn để bao trọn marker này
            bounds.extend([lng, lat]);
        });

        // Zoom bản đồ để thấy tất cả marker
        if (validStops.length === 1) {
            map.flyTo({ center: [Number(validStops[0].longitude), Number(validStops[0].latitude)], zoom: 14 });
        } else {
            map.fitBounds(bounds, { padding: 80 });
        }

        // --- BƯỚC D: Vẽ đường nối (Nếu có >= 2 điểm) ---
        if (validStops.length >= 2) {
            drawRoute(map, validStops, apiKey);
        }

    }, [map, stops, apiKey]); // Dependency quan trọng: map

    return (
        <div ref={mapElement} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
    );
};

// Tách hàm drawRoute ra ngoài component hoặc để bên trong đều được
const drawRoute = async (map, validStops, apiKey) => {
    const locations = validStops
        .map(stop => `${stop.latitude},${stop.longitude}`)
        .join(':');

    try {
        const response = await axios.get(`https://api.tomtom.com/routing/1/calculateRoute/${locations}/json`, {
            params: {
                key: apiKey,
                routeType: 'fastest',
                traffic: false
            }
        });

        if (response.data.routes && response.data.routes.length > 0) {
            const geoJson = response.data.routes[0].legs.reduce((acc, leg) => {
                leg.points.forEach(point => {
                    acc.push([point.longitude, point.latitude]);
                });
                return acc;
            }, []);

            map.addSource('route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: geoJson
                    }
                }
            });

            map.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#007bff',
                    'line-width': 6,
                    'line-opacity': 0.8
                }
            });
        }
    } catch (error) {
        console.error("Routing Error:", error);
    }
};

export default RouteMap;
