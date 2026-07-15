# Frontend & Backend Integration Plan

This document provides a comprehensive integration plan to connect the mobile application to the **EnviroScore-Map** backend. It outlines the API architecture, configuration rules, authentication mechanisms, and detailed endpoint documentation.

---

## 📱 Mobile Integration Overview

When connecting a mobile application (e.g., React Native, Expo, Flutter, or native Android/iOS) to a local development backend server, standard configuration rules apply:

### 1. Base URL Configuration
*   **Android Emulator**: `localhost` refers to the emulator itself. To connect to your host machine's backend, use:
    ```
    http://10.0.2.2:5000
    ```
*   **iOS Simulator**: Can access the host machine's localhost directly:
    ```
    http://localhost:5000
    ```
*   **Physical Devices**: The mobile device and the computer must be on the same Wi-Fi network. Use the computer's local IP address (e.g., `192.168.1.X`):
    ```
    http://192.168.1.X:5000
    ```

### 2. Authentication Protocol
All protected endpoints require a JSON Web Token (JWT).
*   **Header Format**:
    ```http
    Authorization: Bearer <your_jwt_token_here>
    ```
*   **Token Storage**: In React Native/Expo, store this token securely using `SecureStore` (Expo) or `EncryptedSharedPreferences`/`Keychain` (native) to persist user sessions across app restarts.

---

## 🔐 1. Authentication Endpoints (`/api/auth`)

### 📋 User Schema Context
```typescript
interface IUser {
  name: string;
  email: string;
  password?: string; // Optional for Google Sign-In
  role: 'viewer' | 'analyst' | 'admin';
  googleId?: string;
}
```

### 📌 User Registration
*   **URL**: `/api/auth/register`
*   **Method**: `POST`
*   **Headers**: `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "name": "John Doe",
      "email": "johndoe@example.com",
      "password": "SecurePassword123",
      "role": "viewer" 
    }
    ```
    > [!NOTE]
    > * `username` can be sent in place of `name` (the backend falls back automatically).
    > * Registering with the email `admin@enviroscoremap.com` automatically grants the `admin` role. Other emails default to `viewer` (or the role provided).
*   **Success Response (201 Created)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "64b0f38b2d1c6a2348a12345",
        "name": "John Doe",
        "email": "johndoe@example.com",
        "role": "viewer"
      }
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request`: `{ "message": "User identity already exists." }`
    *   `400 Bad Request`: `{ "message": "Username/Name is required." }`
    *   `500 Server Error`: `{ "message": "Internal validation process failed.", "error": "..." }`

---

### 📌 User Login
*   **URL**: `/api/auth/login`
*   **Method**: `POST`
*   **Headers**: `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "email": "johndoe@example.com",
      "password": "SecurePassword123"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "64b0f38b2d1c6a2348a12345",
        "name": "John Doe",
        "email": "johndoe@example.com",
        "role": "viewer"
      }
    }
    ```
*   **Error Responses**:
    *   `401 Unauthorized`: `{ "message": "Invalid server authentication credentials." }`
    *   `500 Server Error`: `{ "message": "Authentication runtime error.", "error": "..." }`

---

### 📌 Google Authentication Login
*   **URL**: `/api/auth/google-login`
*   **Method**: `POST`
*   **Headers**: `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "accessToken": "GOOGLE_OAUTH_ACCESS_TOKEN",
      "role": "viewer"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "64b0f38b2d1c6a2348a12345",
        "name": "Google User Name",
        "email": "googleuser@gmail.com",
        "role": "viewer"
      }
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request`: `{ "message": "Access token is missing" }`
    *   `401 Unauthorized`: `{ "message": "Token client ID mismatch. Security violation." }`
    *   `401 Unauthorized`: `{ "message": "Authentication handshake processing failed with external Identity services" }`

---

### 📌 Fetch All Registered Users (Admin / Reference Tool)
*   **URL**: `/api/auth/users`
*   **Method**: `GET`
*   **Success Response (200 OK)**:
    ```json
    [
      {
        "_id": "64b0f38b2d1c6a2348a12345",
        "name": "John Doe",
        "email": "johndoe@example.com",
        "role": "viewer",
        "createdAt": "2026-07-15T11:15:00.000Z",
        "updatedAt": "2026-07-15T11:15:00.000Z"
      }
    ]
    ```

---

## 📊 2. District Scores & Calculation Endpoints (`/api/calculate`)

These endpoints store, retrieve, and evaluate environmental quality index scores for different geographical districts in Sri Lanka.

### 📋 District Score Schema Context
```typescript
interface IDistrictScore {
  district: string;       // Name of the District (e.g. "Colombo")
  districtId: string;     // Unique normalized lowercase key (e.g. "colombo")
  province: string;
  lat: number;
  lng: number;
  score: number;          // Environmental index (0 to 100)
  zone: "Green" | "Yellow" | "Red";
  moisture: number;
  temp: string;
  humidity: number;
  problemNote: string;
  inputs: {
    canopy: number;
    rainfall: number;
    industrial: "low" | "medium" | "high";
  };
  createdBy: string;      // User Reference ID
}
```

### 📌 Save/Update District Score (Protected)
*   **URL**: `/api/calculate/save`
*   **Method**: `POST`
*   **Headers**: 
    *   `Content-Type: application/json`
    *   `Authorization: Bearer <JWT_TOKEN>`
*   **Request Body**:
    ```json
    {
      "district": "Colombo",
      "districtId": "colombo",
      "province": "Western",
      "lat": 6.9271,
      "lng": 79.8612,
      "score": 78.5,
      "zone": "Yellow",
      "moisture": 58,
      "temp": "31",
      "humidity": 82,
      "problemNote": "High industrial air concentration",
      "inputs": {
        "canopy": 40,
        "rainfall": 1200,
        "industrial": "high"
      }
    }
    ```
*   **Success Responses**:
    *   **201 Created** (New Entry saved):
        ```json
        {
          "message": "Score saved.",
          "data": {
            "_id": "64b0f9c22d1c6a2348a67890",
            "district": "Colombo",
            "districtId": "colombo",
            "province": "Western",
            "lat": 6.9271,
            "lng": 79.8612,
            "score": 78.5,
            "zone": "Yellow",
            "moisture": 58,
            "temp": "31",
            "humidity": 82,
            "problemNote": "High industrial air concentration",
            "inputs": {
              "canopy": 40,
              "rainfall": 1200,
              "industrial": "high"
            },
            "createdBy": "64b0f38b2d1c6a2348a12345",
            "updatedAt": "2026-07-15T11:20:00.000Z",
            "createdAt": "2026-07-15T11:20:00.000Z"
          }
        }
        ```
    *   **200 OK** (If entry already exists for the logged-in user, updates automatically):
        ```json
        {
          "message": "Score updated.",
          "data": { ... }
        }
        ```
*   **Error Responses**:
    *   `400 Bad Request`: `{ "message": "districtId and score are required." }`
    *   `401 Unauthorized`: `{ "message": "No token provided. Access denied." }`
    *   `500 Server Error`: `{ "message": "Server error saving score." }`

---

### 📌 Get All Scores (Public)
Used to populate maps, tables, and dashboards with recorded scores.
*   **URL**: `/api/calculate/all`
*   **Method**: `GET`
*   **Success Response (200 OK)**:
    ```json
    [
      {
        "_id": "64b0f9c22d1c6a2348a67890",
        "district": "Colombo",
        "districtId": "colombo",
        "province": "Western",
        "lat": 6.9271,
        "lng": 79.8612,
        "score": 78.5,
        "zone": "Yellow",
        "moisture": 58,
        "temp": "31",
        "humidity": 82,
        "problemNote": "High industrial air concentration",
        "inputs": {
          "canopy": 40,
          "rainfall": 1200,
          "industrial": "high"
        },
        "createdBy": "64b0f38b2d1c6a2348a12345"
      }
    ]
    ```

---

### 📌 Get Score by District ID (Public)
*   **URL**: `/api/calculate/:districtId`
*   **Method**: `GET`
*   **URL Params**: `:districtId` (e.g., `colombo`, `gampaha`, `kandy`)
*   **Success Response (200 OK)**:
    ```json
    {
      "_id": "64b0f9c22d1c6a2348a67890",
      "district": "Colombo",
      "districtId": "colombo",
      "province": "Western",
      "lat": 6.9271,
      "lng": 79.8612,
      "score": 78.5,
      "zone": "Yellow",
      "moisture": 58,
      "temp": "31",
      "humidity": 82,
      "problemNote": "High industrial air concentration",
      "inputs": {
        "canopy": 40,
        "rainfall": 1200,
        "industrial": "high"
      },
      "createdBy": "64b0f38b2d1c6a2348a12345"
    }
    ```
*   **Error Responses**:
    *   `404 Not Found`: `{ "message": "No score found for this district." }`
    *   `500 Server Error`: `{ "message": "Server error." }`

---

### 📌 Delete Score by District ID (Protected)
*   **URL**: `/api/calculate/:districtId`
*   **Method**: `DELETE`
*   **Headers**:
    *   `Authorization: Bearer <JWT_TOKEN>`
*   **URL Params**: `:districtId` (e.g., `colombo`)
*   **Success Response (200 OK)**:
    ```json
    {
      "message": "Score deleted."
    }
    ```
*   **Error Responses**:
    *   `401 Unauthorized`: `{ "message": "No token provided. Access denied." }`
    *   `500 Server Error`: `{ "message": "Server error." }`

---

## 🌤️ 3. Weather & AI Diagnostic Endpoints (`/api/weather`)

These endpoints connect to OpenWeatherMap to fetch live coordinates data, then forward details to the **Groq AI model** (`llama-3.3-70b-versatile`) to generate agricultural diagnostics.

### 📋 Weather Analysis Schema Context
```typescript
interface IWeatherAnalysis {
  district: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  aiAnalysis: string; // Dynamic AI agricultural advice response
  createdAt: Date;
}
```

### 📌 Fetch & Analyze District Weather (Protected)
Fetches recent live data. If a request was processed within the **last 30 minutes** for that district, it returns the cached result to preserve API limits. Otherwise, it polls OpenWeatherMap + Groq AI and caches the new output.
*   **URL**: `/api/weather/analyze/:districtName`
*   **Method**: `GET`
*   **Headers**:
    *   `Authorization: Bearer <JWT_TOKEN>`
*   **URL Params**: `:districtName` (e.g., `Colombo`, `Galle`, `Jaffna`)
*   **Success Response (200 OK)**:
    ```json
    {
      "_id": "64b105d12d1c6a2348a90123",
      "district": "colombo",
      "temperature": 29.8,
      "humidity": 76,
      "windSpeed": 3.6,
      "condition": "broken clouds",
      "aiAnalysis": "Colombo's warm temperature (29.8°C) and high humidity (76%) favor tropical plant growth, but drainage is critical to prevent root fungal issues. Wind speeds are moderate, posing no immediate mechanical threat to crops.",
      "createdAt": "2026-07-15T11:25:00.000Z"
    }
    ```
*   **Error Responses**:
    *   `400 Bad Request`: `{ "message": "District name parameter is required." }`
    *   `401 Unauthorized`: `{ "message": "No token provided. Access denied." }`
    *   `500 Server Error`: `{ "message": "Failed generating weather ecosystem diagnostic", "error": "..." }`

---

## 🛠️ Verification & Testing Tips for Frontend Integration

### 1. Verification of Token Authentication
When implementing login or registration flows in your mobile application, write a helper function to verify token extraction and storage:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fetching weather with Authorization Header
const getWeatherData = async (districtName) => {
  try {
    const token = await AsyncStorage.getItem('user_token');
    const response = await fetch(`http://10.0.2.2:5000/api/weather/analyze/${districtName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Connection failed:", error);
  }
};
```

### 2. Testing via Postman / Insomnia
Verify the backend connection locally by hitting:
*   `GET` `http://localhost:5000/api/health` -> should return `200 OK` indicating the backend server is active.
