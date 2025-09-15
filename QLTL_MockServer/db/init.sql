-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS task_messages, task_history, task_documents, task_approvers, tasks, document_history, role_permissions, documents, users, folders, roles, permissions CASCADE;

-- Permissions Table
CREATE TABLE permissions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Role-Permissions Join Table
CREATE TABLE role_permissions (
    roleId INT REFERENCES roles(id) ON DELETE CASCADE,
    permissionId VARCHAR(50) REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (roleId, permissionId)
);

-- Folders Table
CREATE TABLE folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parentId INT REFERENCES folders(id) ON DELETE SET NULL
);

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE SET NULL,
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- Documents Table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    fileUrl VARCHAR(255) NOT NULL,
    uploaderId INT REFERENCES users(id) ON DELETE SET NULL,
    uploadedAt TIMESTAMPTZ DEFAULT NOW(),
    folderId INT REFERENCES folders(id) ON DELETE SET NULL
);

-- Document History Table
CREATE TABLE document_history (
    id SERIAL PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    "user" VARCHAR(255), -- Changed from user to "user" to avoid keyword conflict
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    comment TEXT,
    documentId INT REFERENCES documents(id) ON DELETE CASCADE
);

-- Tasks Tables
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    assigneeId INT REFERENCES users(id) ON DELETE SET NULL,
    dueDate TIMESTAMPTZ,
    createdBy INT REFERENCES users(id) ON DELETE SET NULL,
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_approvers (
    taskId INT REFERENCES tasks(id) ON DELETE CASCADE,
    approverId INT REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (taskId, approverId)
);

CREATE TABLE task_documents (
    taskId INT REFERENCES tasks(id) ON DELETE CASCADE,
    documentId INT REFERENCES documents(id) ON DELETE CASCADE,
    PRIMARY KEY (taskId, documentId)
);

CREATE TABLE task_history (
    id SERIAL PRIMARY KEY,
    taskId INT REFERENCES tasks(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    actorId INT REFERENCES users(id) ON DELETE SET NULL,
    comment TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_messages (
    id SERIAL PRIMARY KEY,
    taskId INT REFERENCES tasks(id) ON DELETE CASCADE,
    senderId INT REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    sentAt TIMESTAMPTZ DEFAULT NOW()
);
