# User Management API

A simple RESTful API server built with Node.js and MySQL for managing user records.

## Overview

This project provides a web server that allows for CRUD (Create, Read, Update, Delete) operations on user data. The server connects to a MySQL database to store and retrieve user information.

## Features

- RESTful API for user management
- MySQL database integration
- CRUD operations:
  - Create new users
  - Retrieve user listings
  - Update existing user information
  - Delete users
- Serves static HTML pages

## Technical Stack

- **Backend**: Node.js
- **Database**: MySQL
- **HTTP Server**: Node.js built-in HTTP module
- **Environment Management**: dotenv for configuration

## API Endpoints

| Method | Endpoint    | Description                           |
| ------ | ----------- | ------------------------------------- |
| GET    | `/`         | Serves the main page (restFront.html) |
| GET    | `/about`    | Serves the about page                 |
| GET    | `/users`    | Returns a list of all users           |
| POST   | `/user`     | Creates a new user                    |
| PUT    | `/user/:id` | Updates a user by ID                  |
| DELETE | `/user/:id` | Deletes a user by ID                  |

## Database Schema

The application uses a MySQL table with the following structure:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    birth DATE,
    gojail DATE,
    outjail DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_DATABASE=your_database_name
   ```
4. Run the server:
   ```
   node server.js
   ```
5. The server will start on port 8082

## Usage

### Creating a User

Send a POST request to `/user` with a JSON body:

```json
{
  "name": "User Name",
  "birth": "YYYY-MM-DD",
  "gojail": "YYYY-MM-DD",
  "outjail": "YYYY-MM-DD"
}
```

### Updating a User

Send a PUT request to `/user/:id` with a JSON body containing the fields to update.

### Getting All Users

Send a GET request to `/users`.

### Deleting a User

Send a DELETE request to `/user/:id`.
