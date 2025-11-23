-- Tạo bảng lưu lịch sử vị trí
CREATE TABLE IF NOT EXISTS location_history (
    id BIGSERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION DEFAULT 0,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo index để truy vấn lịch sử chuyến đi nhanh hơn
-- (Quan trọng vì bảng này sẽ phình to rất nhanh)
CREATE INDEX IF NOT EXISTS idx_location_trip_time ON location_history(trip_id, timestamp);

-- (Tùy chọn) Nếu sau này bạn muốn dùng PostGIS để query địa lý xịn hơn
-- CREATE EXTENSION IF NOT EXISTS postgis;