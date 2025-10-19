import React, { useRef, useEffect, memo } from 'react';
import { createRoot } from 'react-dom/client';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import CustomMarkerIcon from './components/CustomMarkerIcon'; // Dùng lại icon marker đỏ

const StaticMap = ({ apiKey, center }) => {
    const mapElement = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (mapElement.current && !mapRef.current && center) {
            // Khởi tạo bản đồ
            const map = tt.map({
                key: apiKey,
                container: mapElement.current,
                center: [center.lng, center.lat],
                zoom: 15,
                // Tắt tất cả tương tác
                interactive: false,
            });

            // Tạo icon
            const markerElement = document.createElement('div');
            const root = createRoot(markerElement);
            root.render(<CustomMarkerIcon color="red" />);

            // Thêm marker vào bản đồ
            new tt.Marker({
                element: markerElement,
                anchor: 'bottom',
            })
                .setLngLat([center.lng, center.lat])
                .addTo(map);
            
            // Thêm nút điều khiển zoom (tùy chọn, giống trong hình)
            map.addControl(new tt.NavigationControl(), 'top-right');

            mapRef.current = map;
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [apiKey, center]); // Chỉ chạy khi center hoặc key thay đổi

    return <div ref={mapElement} style={{ width: '100%', height: '100%' }} />;
};

export default memo(StaticMap);