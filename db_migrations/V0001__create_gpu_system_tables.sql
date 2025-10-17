CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE queue (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    username VARCHAR(100) NOT NULL,
    gpu_name VARCHAR(50) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
    position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gpu_devices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'maintenance')),
    current_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO gpu_devices (name, model, status) VALUES 
    ('GPU-001', 'NVIDIA RTX 4090', 'idle'),
    ('GPU-002', 'NVIDIA RTX 4090', 'idle'),
    ('GPU-003', 'NVIDIA RTX 4080', 'idle'),
    ('GPU-004', 'NVIDIA RTX 4080', 'idle');

CREATE INDEX idx_queue_status ON queue(status);
CREATE INDEX idx_queue_user_id ON queue(user_id);
CREATE INDEX idx_users_role ON users(role);