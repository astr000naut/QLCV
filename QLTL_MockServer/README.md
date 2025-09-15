# QLTL Mock Server

This is a mock API server for the Document Management Project (QLTL), built with Express.js. It provides a complete set of endpoints with mock data, as specified in the API documentation.

## Features

-   Full CRUD operations for Users, Documents, and Folders.
-   JWT-based authentication.
-   Pagination, searching, and filtering for lists.
-   Simulated file uploads.
-   Endpoints for dashboard statistics and tasks.
-   Realistic mock data generated with `@faker-js/faker`.

## Prerequisites

-   [Node.js](https://nodejs.org/) (v14 or later recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Installation

1.  Clone the repository or download the source code.
2.  Navigate to the project directory:
    ```bash
    cd QLTL_MockServer
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

## Running the Server

To start the server in development mode (with automatic restarts on file changes), run:

```bash
npm start
```

The server will be running on `http://localhost:3000`.

## API Usage

-   **Base URL**: `http://localhost:3000/api`
-   **Authentication**: Most endpoints require a JWT token.
    1.  Send a `POST` request to `/api/auth/login` with `username` and `password` to get a token. A test user is available:
        -   **Username**: `user@example.com`
        -   **Password**: `password123`
    2.  Include the token in the `Authorization` header for subsequent requests: `Authorization: Bearer <your_jwt_token>`.

Refer to the original API documentation for detailed information on each endpoint.
