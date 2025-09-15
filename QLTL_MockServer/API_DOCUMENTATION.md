# API Documentation cho Dự án Quản lý Tài liệu (QLTL)

Đây là tài liệu mô tả các API endpoints cần thiết để cung cấp dữ liệu cho ứng dụng frontend.

## Cấu trúc chung

-   **Base URL**: `/api`
-   **Định dạng dữ liệu**: JSON
-   **Xác thực**: Sử dụng JWT (JSON Web Tokens). Mọi request cần có header `Authorization: Bearer <token>`, trừ các endpoint login/register.

---

## 1. Xác thực (Authentication)

### `POST /api/auth/login`

Đăng nhập người dùng.

-   **Request Body**:
    ```json
    {
      "username": "user@example.com",
      "password": "password123"
    }
    ```
-   **Response (200 OK)**:
    ```json
    {
      "token": "your_jwt_token",
      "user": {
        "id": 1,
        "name": "Văn A",
        "email": "user@example.com",
        "role": "admin"
      }
    }
    ```
-   **Response (401 Unauthorized)**: Sai thông tin đăng nhập.

### `POST /api/auth/logout`

Đăng xuất người dùng.

-   **Response (200 OK)**:
    ```json
    {
      "message": "Logged out successfully"
    }
    ```

### `GET /api/auth/me`

Lấy thông tin người dùng đang đăng nhập.

-   **Response (200 OK)**:
    ```json
    {
      "id": 1,
      "name": "Văn A",
      "email": "user@example.com",
      "role": "admin"
    }
    ```

---

## 2. Người dùng (Users)

### `GET /api/users`

Lấy danh sách tất cả người dùng.

-   **Query Parameters**:
    -   `page` (number): Số trang.
    -   `limit` (number): Số lượng item trên mỗi trang.
    -   `search` (string): Tìm kiếm theo tên hoặc email.
-   **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": 1,
          "name": "Văn A",
          "email": "user@example.com",
          "role": "admin",
          "createdAt": "2023-10-27T10:00:00Z"
        },
        {
          "id": 2,
          "name": "Thị B",
          "email": "user2@example.com",
          "role": "editor",
          "createdAt": "2023-10-27T11:00:00Z"
        }
      ],
      "pagination": {
        "total": 2,
        "page": 1,
        "limit": 10
      }
    }
    ```

### `GET /api/users/{id}`

Lấy thông tin chi tiết của một người dùng.

-   **Response (200 OK)**:
    ```json
    {
      "id": 1,
      "name": "Văn A",
      "email": "user@example.com",
      "role": "admin",
      "createdAt": "2023-10-27T10:00:00Z"
    }
    ```

### `POST /api/users`

Tạo người dùng mới.

-   **Request Body**:
    ```json
    {
      "name": "Văn C",
      "email": "user3@example.com",
      "password": "newpassword",
      "role": "viewer"
    }
    ```
-   **Response (201 Created)**: Trả về thông tin người dùng vừa tạo.

### `PUT /api/users/{id}`

Cập nhật thông tin người dùng.

-   **Request Body**:
    ```json
    {
      "name": "Văn C Updated",
      "role": "editor"
    }
    ```
-   **Response (200 OK)**: Trả về thông tin người dùng vừa cập nhật.

### `DELETE /api/users/{id}`

Xóa người dùng.

-   **Response (204 No Content)**.

---

## 3. Vai trò & Phân quyền (Roles & Permissions)

### `GET /api/roles`

Lấy danh sách tất cả các vai trò.

-   **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": 1,
          "name": "Admin",
          "description": "Quản trị viên hệ thống"
        },
        {
          "id": 2,
          "name": "Editor",
          "description": "Biên tập viên có quyền chỉnh sửa tài liệu"
        }
      ]
    }
    ```

### `POST /api/roles`

Tạo một vai trò mới.

-   **Request Body**:
    ```json
    {
      "name": "Viewer",
      "description": "Người chỉ có quyền xem"
    }
    ```
-   **Response (201 Created)**: Trả về thông tin vai trò vừa tạo.

### `PUT /api/roles/{id}`

Cập nhật thông tin vai trò.

-   **Request Body**:
    ```json
    {
      "name": "Tên vai trò mới",
      "description": "Mô tả mới"
    }
    ```
-   **Response (200 OK)**: Trả về thông tin vai trò vừa cập nhật.

### `DELETE /api/roles/{id}`

Xóa một vai trò.

-   **Response (204 No Content)**.

### `GET /api/permissions`

Lấy danh sách tất cả các quyền có trong hệ thống.

-   **Response (200 OK)**:
    ```json
    {
      "data": [
        { "id": "doc:create", "name": "Tạo tài liệu" },
        { "id": "doc:read", "name": "Xem tài liệu" },
        { "id": "doc:update", "name": "Cập nhật tài liệu" },
        { "id": "doc:delete", "name": "Xóa tài liệu" },
        { "id": "user:manage", "name": "Quản lý người dùng" },
        { "id": "role:manage", "name": "Quản lý vai trò & phân quyền" }
      ]
    }
    ```

### `GET /api/roles/{id}/permissions`

Lấy danh sách các quyền đã được gán cho một vai trò cụ thể.

-   **Response (200 OK)**:
    ```json
    {
      "data": [
        { "id": "doc:read", "name": "Xem tài liệu" }
      ]
    }
    ```

### `PUT /api/roles/{id}/permissions`

Cập nhật danh sách quyền cho một vai trò.

-   **Request Body**:
    ```json
    {
      "permissions": ["doc:read", "doc:create"]
    }
    ```
-   **Response (200 OK)**:
    ```json
    {
      "message": "Permissions updated successfully"
    }
    ```

---

## 4. Tài liệu (Documents)

### `GET /api/documents`

Lấy danh sách tài liệu.

-   **Query Parameters**:
    -   `status` (string): Lọc theo trạng thái (`pending`, `approved`, `rejected`).
    -   `folderId` (number): Lọc tài liệu trong một thư mục cụ thể.
    -   `search` (string): Tìm kiếm theo tên tài liệu.
    -   `page` (number): Trang hiện tại.
    -   `limit` (number): Số lượng trên mỗi trang.
-   **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": 101,
          "name": "Báo cáo quý 1",
          "status": "approved",
          "uploader": { "name": "Văn A" },
          "handler": { "name": "Thị B" },
          "uploadedAt": "2023-10-26T14:00:00Z",
          "deadline": "2023-11-26T14:00:00Z",
          "folderId": 1
        }
      ],
      "pagination": {
        "total": 1,
        "page": 1,
        "limit": 10
      }
    }
    ```

### `GET /api/documents/recent`

Lấy các tài liệu được tải lên gần đây.

-   **Response (200 OK)**:
    ```json
    [
      {
        "id": 101,
        "name": "Báo cáo quý 1",
        "uploader": "Văn A",
        "uploadedAt": "2023-10-26T14:00:00Z"
      }
    ]
    ```

### `GET /api/documents/{id}`

Lấy chi tiết một tài liệu.

-   **Response (200 OK)**:
    ```json
    {
      "id": 101,
      "name": "Báo cáo quý 1",
      "description": "Chi tiết báo cáo kinh doanh quý 1 năm 2023.",
      "status": "approved",
      "fileUrl": "https://example.com/files/bao-cao-q1.pdf",
      "uploader": { "id": 1, "name": "Văn A" },
      "handler": { "id": 2, "name": "Thị B" },
      "uploadedAt": "2023-10-26T14:00:00Z",
      "deadline": "2023-11-26T14:00:00Z",
      "folderId": 1,
      "history": [
        { "action": "Uploaded", "user": "Văn A", "timestamp": "2023-10-26T14:00:00Z" },
        { "action": "Approved", "user": "Admin", "timestamp": "2023-10-27T09:00:00Z" }
      ]
    }
    ```

### `POST /api/documents`

Tải lên một tài liệu mới. Request này nên là `multipart/form-data`.

-   **Form Data**:
    -   `file`: file tài liệu.
    -   `name`: Tên tài liệu.
    -   `description`: Mô tả.
    -   `folderId`: ID của thư mục.
    -   `handlerId`: ID của người xử lý.
    -   `deadline`: Hạn xử lý (ISO 8601 format string).
-   **Response (201 Created)**: Trả về thông tin tài liệu vừa tạo.

### `PUT /api/documents/{id}`

Cập nhật thông tin của tài liệu.

-   **Request Body**:
    ```json
    {
      "name": "Báo cáo quý 1 (Final)",
      "description": "Bản cuối cùng của báo cáo.",
      "handlerId": 2,
      "deadline": "2023-12-01T17:00:00Z"
    }
    ```
-   **Response (200 OK)**: Trả về thông tin tài liệu vừa cập nhật.

### `DELETE /api/documents/{id}`

Xóa một tài liệu.

-   **Response (204 No Content)**.

### `POST /api/documents/{id}/status`

Thay đổi trạng thái tài liệu (ví dụ: phê duyệt, từ chối).

-   **Request Body**:
    ```json
    {
      "status": "approved", // or "rejected"
      "comment": "Tài liệu hợp lệ."
    }
    ```
-   **Response (200 OK)**:
    ```json
    {
      "message": "Document status updated successfully"
    }
    ```

---

## 5. Thư mục (Folders)

### `GET /api/folders`

Lấy danh sách tất cả thư mục (có thể là cấu trúc cây).

-   **Response (200 OK)**:
    ```json
    [
      {
        "id": 1,
        "name": "Tài liệu kinh doanh",
        "children": [
          {
            "id": 3,
            "name": "Năm 2023",
            "children": []
          }
        ]
      },
      {
        "id": 2,
        "name": "Tài liệu kỹ thuật",
        "children": []
      }
    ]
    ```

### `POST /api/folders`

Tạo một thư mục mới.

-   **Request Body**:
    ```json
    {
      "name": "Thư mục mới",
      "parentId": 1 // ID của thư mục cha, null nếu là thư mục gốc
    }
    ```
-   **Response (201 Created)**: Trả về thông tin thư mục vừa tạo.

### `PUT /api/folders/{id}`

Đổi tên hoặc di chuyển thư mục.

-   **Request Body**:
    ```json
    {
      "name": "Tên mới",
      "parentId": 2
    }
    ```
-   **Response (200 OK)**: Trả về thông tin thư mục vừa cập nhật.

### `DELETE /api/folders/{id}`

Xóa một thư mục (có thể yêu cầu thư mục phải rỗng).

-   **Response (204 No Content)**.

---

## 6. Tác vụ của tôi (My Tasks)

### `GET /api/tasks`

Lấy danh sách các tài liệu đang chờ người dùng hiện tại xử lý (phê duyệt/từ chối).

-   **Response (200 OK)**:
    ```json
    [
      {
        "id": 102,
        "name": "Hợp đồng ABC",
        "status": "pending",
        "uploader": { "name": "Thị B" },
        "uploadedAt": "2023-10-27T11:30:00Z"
      }
    ]
    ```

---

## 7. Thống kê (Dashboard/Stats)

### `GET /api/stats`

Lấy dữ liệu thống kê cho dashboard.

-   **Response (200 OK)**:
    ```json
    {
      "totalDocuments": 150,
      "pendingDocuments": 12,
      "approvedDocuments": 130,
      "rejectedDocuments": 8,
      "totalUsers": 25
    }
    ```

### `GET /api/reports`

Lấy dữ liệu cho trang báo cáo (có thể phức tạp hơn `stats`).

-   **Query Parameters**:
    -   `startDate` (date).
    -   `endDate` (date).
    -   `type` (string): `byUser`, `byFolder`, ...
-   **Response (200 OK)**: Dữ liệu báo cáo tùy theo type.
