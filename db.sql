-- SQL Script for creating the database schema for a Smart Bus Tracking System
-- Version 5: Reverted to Separate Profiles Model with User Accounts

-- Drop the database if it exists to start fresh
DROP DATABASE IF EXISTS smart_bus_tracking;
CREATE DATABASE smart_bus_tracking CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
USE smart_bus_tracking;

-- =============================================
-- SECTION 1: SECURITY TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS `roles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(20) UNIQUE NOT NULL
);

-- Insert the 4 required roles
INSERT INTO `roles` (name) VALUES ('ROLE_STUDENT'), ('ROLE_DRIVER'), ('ROLE_ADMIN'), ('ROLE_SCHOOL');

CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(255) UNIQUE NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `account_non_locked` BOOLEAN NOT NULL DEFAULT TRUE,
     `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `user_roles` (
    `user_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,
    PRIMARY KEY (`user_id`, `role_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
);

-- =============================================
-- SECTION 2: SYSTEM SETUP & PEOPLE MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_phone VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    school_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS buses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    primary_driver_id INT NULL COMMENT 'The main driver assigned to this bus. Can be NULL.',
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    model VARCHAR(100),
    capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (primary_driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS guardians (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stop_name VARCHAR(255) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    school_id INT NOT NULL,
    guardian_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    grade_level VARCHAR(50),
    pickup_stop_id INT,
    dropoff_stop_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE,
    FOREIGN KEY (pickup_stop_id) REFERENCES stops(id) ON DELETE SET NULL,
    FOREIGN KEY (dropoff_stop_id) REFERENCES stops(id) ON DELETE SET NULL
);

-- =============================================
-- SECTION 3: ROUTES & TRIPS
-- =============================================

CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    route_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS route_stops (
    route_id INT NOT NULL,
    stop_id INT NOT NULL,
    stop_order INT NOT NULL COMMENT 'The sequence number of the stop on the route (1, 2, 3...)',
    PRIMARY KEY (route_id, stop_id),
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    bus_id INT NOT NULL,
    driver_id INT NOT NULL,
    trip_date DATE NOT NULL,
    direction ENUM('to_school', 'from_school') NOT NULL,
    planned_start_time TIME NOT NULL,
    planned_end_time TIME,
    actual_start_time DATETIME,
    actual_end_time DATETIME,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

-- =============================================
-- SECTION 4: TRACKING & ATTENDANCE
-- =============================================

CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    student_id INT NOT NULL,
    stop_id INT NOT NULL,
    status ENUM('boarded', 'alighted', 'absent') NOT NULL,
    timestamp DATETIME NOT NULL,
    notes TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS live_tracking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2) COMMENT 'Speed in km/h',
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    INDEX idx_trip_timestamp (trip_id, timestamp)
);

-- =============================================
-- SECTION 5: SAMPLE DATA INSERTION
-- The bcrypt hash for '12345678' is '$2a$10$3zZ2Y.z7.eN5bJzK.v1cI.2I8.kL5I.3H8.gD9.hJ.aL4.qL3.mG'
-- =============================================

-- 1. Create User accounts for login
INSERT INTO `users` (id, username, email, password) VALUES
(1, 'admin@smartbus.com', 'admin@smartbus.com', '$2a$10$YrCP/3TM6Gfx0sOhCQ2V..8aihMHExTJpsDWoEdc029EwFdiZ5RXC'),
(2, 'school.isv@smartbus.com', 'school.isv@smartbus.com', '$2a$10$YrCP/3TM6Gfx0sOhCQ2V..8aihMHExTJpsDWoEdc029EwFdiZ5RXC'),
(3, 'driver.an@example.com', 'driver.an@example.com', '$2a$10$YrCP/3TM6Gfx0sOhCQ2V..8aihMHExTJpsDWoEdc029EwFdiZ5RXC'),
(4, 'driver.binh@example.com', 'driver.binh@example.com', '$2a$10$YrCP/3TM6Gfx0sOhCQ2V..8aihMHExTJpsDWoEdc029EwFdiZ5RXC'),
(5, 'student.minh@example.com', 'student.minh@example.com', '$2a$10$YrCP/3TM6Gfx0sOhCQ2V..8aihMHExTJpsDWoEdc029EwFdiZ5RXC'),
(6, 'student.han@example.com', 'student.han@example.com', '$2a$10$YrCP/3TM6Gfx0sOhCQ2V..8aihMHExTJpsDWoEdc029EwFdiZ5RXC');

-- 2. Assign Roles to Users
INSERT INTO `user_roles` (user_id, role_id) VALUES
(1, 3), -- admin@smartbus.com has ROLE_ADMIN
(2, 4), -- school.isv@smartbus.com has ROLE_SCHOOL
(3, 2), -- driver.an@example.com has ROLE_DRIVER
(4, 2), -- driver.binh@example.com has ROLE_DRIVER
(5, 1), -- student.minh@example.com has ROLE_STUDENT
(6, 1); -- student.han@example.com has ROLE_STUDENT

-- 3. Create School profile and link to its user account
INSERT INTO schools (id, user_id, name, address, contact_phone, email) VALUES
(1, 2, 'Trường Quốc Tế SmartBus Việt Nam', '123 Đường ABC, Quận 1, TP. Hồ Chí Minh', '02812345678', 'school.isv@smartbus.com');

-- 4. Create Driver profiles and link to their user accounts
INSERT INTO drivers (id, user_id, school_id, full_name, phone_number, license_number, email) VALUES
(1, 3, 1, 'Nguyễn Văn An', '0901111111', 'D123456', 'driver.an@example.com'),
(2, 4, 1, 'Trần Thị Bình', '0902222222', 'D789012', 'driver.binh@example.com');

-- 5. Create Buses and assign primary drivers
INSERT INTO buses (id, school_id, primary_driver_id, license_plate, model, capacity) VALUES
(1, 1, 1, '51B-111.11', 'Ford Transit', 16),
(2, 1, 2, '51B-222.22', 'Hyundai Solati', 16);

-- 6. Create Guardians (no user account)
INSERT INTO guardians (id, full_name, phone_number, address) VALUES
(1, 'Lê Văn Cường', '0913333333', '10 Tôn Đức Thắng, Quận 1'),
(2, 'Phạm Thị Duyên', '0914444444', '50 Nguyễn Huệ, Quận 1');

-- 7. Create Stops
INSERT INTO stops (id, stop_name, address, latitude, longitude) VALUES
(1, 'Nhà thờ Đức Bà', '01 Công xã Paris, Bến Nghé, Quận 1', 10.7798, 106.6991),
(2, 'Chợ Bến Thành', 'Đ. Lê Lợi, Phường Bến Thành, Quận 1', 10.7725, 106.6983),
(3, 'Dinh Độc Lập', '135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1', 10.7770, 106.6952);

-- 8. Create Student profiles and link to their user accounts
INSERT INTO students (id, user_id, school_id, guardian_id, full_name, email, grade_level, pickup_stop_id, dropoff_stop_id) VALUES
(1, 5, 1, 1, 'Lê Hoàng Minh', 'student.minh@example.com', 'Lớp 3', 1, 3), -- Đón ở Nhà thờ, trả ở Dinh
(2, 6, 1, 2, 'Phạm Ngọc Hân', 'student.han@example.com', 'Lớp 5', 2, 3); -- Đón ở Chợ Bến Thành, trả ở Dinh

-- 9. Create a Route and define its stops
INSERT INTO routes (id, school_id, route_name, description) VALUES
(1, 1, 'Tuyến Sáng Trung Tâm Quận 1', 'Tuyến xe đón học sinh khu vực trung tâm Q1 buổi sáng.');

INSERT INTO route_stops (route_id, stop_id, stop_order) VALUES
(1, 1, 1), -- Stop 1: Nhà thờ
(1, 2, 2), -- Stop 2: Chợ Bến Thành
(1, 3, 3); -- Stop 3: Dinh (đích đến)

-- 10. Create a Trip for today
INSERT INTO trips (id, route_id, bus_id, driver_id, trip_date, direction, planned_start_time, status, actual_start_time) VALUES
(1, 1, 1, 1, CURDATE(), 'to_school', '07:00:00', 'in_progress', NOW());

-- 11. Simulate some trip activity
-- Student Minh (student_id=1) boards the bus
INSERT INTO attendance (trip_id, student_id, stop_id, status, timestamp) VALUES
(1, 1, 1, 'boarded', NOW());

-- Some live tracking data
INSERT INTO live_tracking (trip_id, latitude, longitude, speed, timestamp) VALUES
(1, 10.7798, 106.6991, 0.0, NOW()), -- At the first stop
(1, 10.7775, 106.6988, 25.5, DATE_ADD(NOW(), INTERVAL 1 MINUTE)); -- Moving towards the next stop

ALTER DATABASE smart_bus_tracking   CHARACTER SET utf8mb4   COLLATE utf8mb4_unicode_ci
