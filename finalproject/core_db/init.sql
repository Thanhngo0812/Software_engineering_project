-- =============================================
-- SMART BUS TRACKING SYSTEM - POSTGRESQL VERSION
-- =============================================

-- 1. DROP & CREATE DATABASE (Chạy riêng khối này nếu dùng GUI Tool)
-- PostgreSQL không hỗ trợ IF EXISTS trong CREATE DATABASE, nên ta dùng cách này để an toàn

-- =============================================
-- 2. CONNECT TO DATABASE (Chỉ chạy được trong psql command line)
-- Nếu dùng DBeaver/pgAdmin, hãy chọn database 'smart_bus_tracking' thủ công rồi chạy từ đoạn dưới đây
-- =============================================
-- \c smart_bus_tracking

-- =============================================
-- 3. SCHEMA & TABLES SETUP
-- =============================================

-- Utility Function for Auto-Update Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';

-- SECTION 1: SECURITY TABLES
CREATE TABLE roles (
                       id BIGSERIAL PRIMARY KEY,
                       name VARCHAR(20) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES ('ROLE_STUDENT'), ('ROLE_DRIVER'), ('ROLE_ADMIN'), ('ROLE_SCHOOL');

CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       username VARCHAR(255) UNIQUE NOT NULL,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       enabled BOOLEAN NOT NULL DEFAULT TRUE,
                       account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
                            user_id BIGINT NOT NULL,
                            role_id BIGINT NOT NULL,
                            PRIMARY KEY (user_id, role_id),
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- SECTION 2: SYSTEM SETUP & PEOPLE MANAGEMENT
CREATE TABLE schools (
                         id SERIAL PRIMARY KEY,
                         user_id BIGINT UNIQUE NOT NULL,
                         name VARCHAR(255) NOT NULL,
                         address TEXT,
                         contact_phone VARCHAR(20),
                         email VARCHAR(255) UNIQUE NOT NULL,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TRIGGER update_schools_modtime BEFORE UPDATE ON schools FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE drivers (
                         id SERIAL PRIMARY KEY,
                         user_id BIGINT UNIQUE NOT NULL,
                         school_id INT NOT NULL,
                         full_name VARCHAR(255) NOT NULL,
                         phone_number VARCHAR(20) UNIQUE NOT NULL,
                         email VARCHAR(255) UNIQUE NOT NULL,
                         license_number VARCHAR(50) UNIQUE NOT NULL,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                         FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);
CREATE TRIGGER update_drivers_modtime BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE buses (
                       id SERIAL PRIMARY KEY,
                       school_id INT NOT NULL,
                       primary_driver_id INT NULL,
                       license_plate VARCHAR(20) NOT NULL UNIQUE,
                       model VARCHAR(100),
                       capacity INT NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
                       FOREIGN KEY (primary_driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);
CREATE TRIGGER update_buses_modtime BEFORE UPDATE ON buses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE guardians (
                           id SERIAL PRIMARY KEY,
                           full_name VARCHAR(255) NOT NULL,
                           phone_number VARCHAR(20) UNIQUE NOT NULL,
                           address TEXT,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER update_guardians_modtime BEFORE UPDATE ON guardians FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE stops (
                       id SERIAL PRIMARY KEY,
                       stop_name VARCHAR(255) UNIQUE NOT NULL,
                       address TEXT NOT NULL,
                       latitude DECIMAL(10, 8) NOT NULL,
                       longitude DECIMAL(11, 8) NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER update_stops_modtime BEFORE UPDATE ON stops FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE students (
                          id SERIAL PRIMARY KEY,
                          user_id BIGINT UNIQUE NOT NULL,
                          school_id INT NOT NULL,
                          guardian_id INT NOT NULL,
                          full_name VARCHAR(255) NOT NULL,
                          email VARCHAR(255) UNIQUE NOT NULL,
                          grade_level VARCHAR(50),
                          pickup_stop_id INT,
                          dropoff_stop_id INT,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                          FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
                          FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE,
                          FOREIGN KEY (pickup_stop_id) REFERENCES stops(id) ON DELETE SET NULL,
                          FOREIGN KEY (dropoff_stop_id) REFERENCES stops(id) ON DELETE SET NULL
);
CREATE TRIGGER update_students_modtime BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- SECTION 3: ROUTES & TRIPS
CREATE TABLE routes (
                        id SERIAL PRIMARY KEY,
                        school_id INT NOT NULL,
                        route_name VARCHAR(255) NOT NULL,
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);
CREATE TRIGGER update_routes_modtime BEFORE UPDATE ON routes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE route_stops (
                             route_id INT NOT NULL,
                             stop_id INT NOT NULL,
                             stop_order INT NOT NULL,
                             PRIMARY KEY (route_id, stop_id),
                             FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
                             FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE
);

-- Enum Types
CREATE TYPE trip_direction_enum AS ENUM ('to_school', 'from_school');
CREATE TYPE trip_status_enum AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

CREATE TABLE trips (
                       id SERIAL PRIMARY KEY,
                       route_id INT NOT NULL,
                       bus_id INT NOT NULL,
                       driver_id INT NOT NULL,
                       trip_date DATE NOT NULL,
                       direction trip_direction_enum NOT NULL,
                       planned_start_time TIME NOT NULL,
                       planned_end_time TIME,
                       actual_start_time TIMESTAMP,
                       actual_end_time TIMESTAMP,
                       status trip_status_enum NOT NULL DEFAULT 'scheduled',
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
                       FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
                       FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);
CREATE TRIGGER update_trips_modtime BEFORE UPDATE ON trips FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- SECTION 4: TRACKING & ATTENDANCE
CREATE TYPE attendance_status_enum AS ENUM ('boarded', 'alighted', 'absent');

CREATE TABLE attendance (
                            id SERIAL PRIMARY KEY,
                            trip_id INT NOT NULL,
                            student_id INT NOT NULL,
                            stop_id INT NOT NULL,
                            status attendance_status_enum NOT NULL,
                            timestamp TIMESTAMP NOT NULL,
                            notes TEXT,
                            FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
                            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                            FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE
);

CREATE TABLE live_tracking (
                               id BIGSERIAL PRIMARY KEY,
                               trip_id INT NOT NULL,
                               latitude DECIMAL(10, 8) NOT NULL,
                               longitude DECIMAL(11, 8) NOT NULL,
                               speed DECIMAL(5, 2),
                               timestamp TIMESTAMP NOT NULL,
                               FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);
CREATE INDEX idx_trip_timestamp ON live_tracking (trip_id, timestamp);

-- SECTION 5: SAMPLE DATA
-- Users
INSERT INTO users (id, username, email, password) VALUES
                                                      (1, 'admin@smartbus.com', 'admin@smartbus.com', '$2a$10$YrCP/3TM6Gfx0sOhCQ2V..8aihMHExTJpsDWoEdc029EwFdiZ5RXC'),
                                                      (2, 'school.isv@smartbus.com', 'school.isv@smartbus.com', '$2a$10$YrCP/3TM6Gfx0sOhCQ2V..8aihMHExTJpsDWoEdc029EwFdiZ5RXC'),
                                                      (3, 'driver.an@example.com', 'driver.an@example.com', '$2a$10$YrCP/3TM6Gfx0sOhCQ2V..8aihMHExTJpsDWoEdc029EwFdiZ5RXC'),
                                                      (4, 'driver.binh@example.com', 'driver.binh@example.com', '$2a$10$YrCP/3TM6Gfx0sOhCQ2V..8aihMHExTJpsDWoEdc029EwFdiZ5RXC'),
                                                      (5, 'student.minh@example.com', 'student.minh@example.com', '$2a$10$YrCP/3TM6Gfx0sOhCQ2V..8aihMHExTJpsDWoEdc029EwFdiZ5RXC'),
                                                      (6, 'student.han@example.com', 'student.han@example.com', '$2a$10$YrCP/3TM6Gfx0sOhCQ2V..8aihMHExTJpsDWoEdc029EwFdiZ5RXC');
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- User Roles
INSERT INTO user_roles (user_id, role_id) VALUES (1, 3), (2, 4), (3, 2), (4, 2), (5, 1), (6, 1);

-- Schools
INSERT INTO schools (id, user_id, name, address, contact_phone, email) VALUES
    (1, 2, 'Trường Quốc Tế SmartBus Việt Nam', '123 Đường ABC, Quận 1, TP. Hồ Chí Minh', '02812345678', 'school.isv@smartbus.com');
SELECT setval('schools_id_seq', (SELECT MAX(id) FROM schools));

-- Drivers
INSERT INTO drivers (id, user_id, school_id, full_name, phone_number, license_number, email) VALUES
                                                                                                 (1, 3, 1, 'Nguyễn Văn An', '0901111111', 'D123456', 'driver.an@example.com'),
                                                                                                 (2, 4, 1, 'Trần Thị Bình', '0902222222', 'D789012', 'driver.binh@example.com');
SELECT setval('drivers_id_seq', (SELECT MAX(id) FROM drivers));

-- Buses
INSERT INTO buses (id, school_id, primary_driver_id, license_plate, model, capacity) VALUES
                                                                                         (1, 1, 1, '51B-111.11', 'Ford Transit', 16),
                                                                                         (2, 1, 2, '51B-222.22', 'Hyundai Solati', 16);
SELECT setval('buses_id_seq', (SELECT MAX(id) FROM buses));

-- Guardians
INSERT INTO guardians (id, full_name, phone_number, address) VALUES
                                                                 (1, 'Lê Văn Cường', '0913333333', '10 Tôn Đức Thắng, Quận 1'),
                                                                 (2, 'Phạm Thị Duyên', '0914444444', '50 Nguyễn Huệ, Quận 1');
SELECT setval('guardians_id_seq', (SELECT MAX(id) FROM guardians));

-- Stops
INSERT INTO stops (id, stop_name, address, latitude, longitude) VALUES
                                                                    (1, 'Nhà thờ Đức Bà', '01 Công xã Paris, Bến Nghé, Quận 1', 10.7798, 106.6991),
                                                                    (2, 'Chợ Bến Thành', 'Đ. Lê Lợi, Phường Bến Thành, Quận 1', 10.7725, 106.6983),
                                                                    (3, 'Dinh Độc Lập', '135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1', 10.7770, 106.6952);
SELECT setval('stops_id_seq', (SELECT MAX(id) FROM stops));

-- Students
INSERT INTO students (id, user_id, school_id, guardian_id, full_name, email, grade_level, pickup_stop_id, dropoff_stop_id) VALUES
                                                                                                                               (1, 5, 1, 1, 'Lê Hoàng Minh', 'student.minh@example.com', 'Lớp 3', 1, 3),
                                                                                                                               (2, 6, 1, 2, 'Phạm Ngọc Hân', 'student.han@example.com', 'Lớp 5', 2, 3);
SELECT setval('students_id_seq', (SELECT MAX(id) FROM students));

-- Routes
INSERT INTO routes (id, school_id, route_name, description) VALUES
    (1, 1, 'Tuyến Sáng Trung Tâm Quận 1', 'Tuyến xe đón học sinh khu vực trung tâm Q1 buổi sáng.');
SELECT setval('routes_id_seq', (SELECT MAX(id) FROM routes));

INSERT INTO route_stops (route_id, stop_id, stop_order) VALUES (1, 1, 1), (1, 2, 2), (1, 3, 3);

-- Trips
INSERT INTO trips (id, route_id, bus_id, driver_id, trip_date, direction, planned_start_time, status, actual_start_time) VALUES
    (1, 1, 1, 1, CURRENT_DATE, 'to_school', '07:00:00', 'in_progress', NOW());
SELECT setval('trips_id_seq', (SELECT MAX(id) FROM trips));

-- Attendance
INSERT INTO attendance (trip_id, student_id, stop_id, status, timestamp) VALUES
    (1, 1, 1, 'boarded', NOW());
SELECT setval('attendance_id_seq', (SELECT MAX(id) FROM attendance));

-- Live Tracking
INSERT INTO live_tracking (trip_id, latitude, longitude, speed, timestamp) VALUES
                                                                               (1, 10.7798, 106.6991, 0.0, NOW()),
                                                                               (1, 10.7775, 106.6988, 25.5, NOW() + interval '1 minute');