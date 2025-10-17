// src/MapPicker.js
// Thêm 'memo' vào dòng import
import React, { useRef, useEffect, useCallback, memo } from 'react'; 
import { createRoot } from 'react-dom/client';
import tt from '@tomtom-international/web-sdk-maps';
import { services } from '@tomtom-international/web-sdk-services';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import CustomMarkerIcon from './components/CustomMarkerIcon';

const MapPicker = ({ apiKey, initialPosition,inputPosition, onPositionChange }) => {
    const mapElement = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const reverseGeocode = useCallback(async (position) => {
        try {
            const response = await services.reverseGeocode({
                key: apiKey,
                position: position,
            });
            const address = response.addresses[0]?.address.freeformAddress || 'Address not found';
            onPositionChange(position, address);
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            onPositionChange(position, 'Could not fetch address');
        }
    }, [apiKey, onPositionChange]); // onPositionChange giờ đã ổn định

    // useEffect này chỉ chạy một lần duy nhất để khởi tạo bản đồ
    useEffect(() => {
        if (mapElement.current && !mapRef.current) {
            const map = tt.map({
                key: apiKey,
                container: mapElement.current,
                center: [initialPosition.lng, initialPosition.lat],
                zoom: 15,
            });
            //icon marker
            const markerElement = document.createElement('div');
            const root = createRoot(markerElement);
            root.render(<CustomMarkerIcon color="red" />);
            //marker init
            const marker = new tt.Marker({element: markerElement, anchor: 'bottom',  draggable: true })
                .setLngLat([initialPosition.lng, initialPosition.lat])
                .addTo(map);

            marker.on('dragend', () => {
                const newPosition = marker.getLngLat();
                reverseGeocode(newPosition);
            });

            map.on('click', (e) => {
                const newPosition = e.lngLat;
                marker.setLngLat(newPosition);
                reverseGeocode(newPosition);
            });

            mapRef.current = map;
            markerRef.current = marker;
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    // Chỉ phụ thuộc vào các giá trị không đổi sau lần render đầu tiên
    }, [apiKey, reverseGeocode,inputPosition]);

    return <div ref={mapElement} style={{ width: '100%', height: '100%' }} />;
};

// Bọc component trong React.memo trước khi export
export default memo(MapPicker);