# API Documentation

## Project summary

This document lists the backend endpoints exposed by the Easy Tech Solution application and the expected request/response shapes.

## Base URL

### Local
```text
https://easytech-backend.onrender.com/api
```

### Production
```text
https://your-backend.onrender.com/api
```

## Authentication

Most protected routes require a JWT in the request header:

```http
Authorization: Bearer <token>
```

The token is issued after:
- Firebase Google login at /api/auth/firebase
- Admin username/password login at /api/auth/login

---

## 1. Health check

### GET /api/health

Returns a basic server health status.

#### Response
```json
{
  "ok": true
}
```

#### Status codes
- 200 OK

---

## 2. Authentication routes

### POST /api/auth/login

Admin username/password login.

#### Request body
```json
{
  "userId": "admin",
  "password": "password123"
}
```

#### Success response
```json
{
  "token": "jwt-token-here",
  "userId": "admin"
}
```

#### Errors
- 400 Bad Request: missing userId or password
- 401 Unauthorized: invalid credentials

---

### POST /api/auth/firebase

Authenticate using a Firebase Google ID token.

#### Request body
```json
{
  "idToken": "firebase-id-token"
}
```

#### Success response
```json
{
  "token": "jwt-token-here",
  "userId": "admin@example.com"
}
```

#### Errors
- 400 Bad Request: missing idToken
- 403 Forbidden: email is not in ADMIN_EMAILS
- 401 Unauthorized: invalid Firebase token

---

### GET /api/auth/me

Returns the current admin identity.

#### Authorization
Required.

#### Success response
```json
{
  "userId": "admin@example.com"
}
```

#### Errors
- 401 Unauthorized: invalid or missing token

---

## 3. Entry routes

All entry routes require authentication.

### GET /api/entries

Returns all entries sorted newest first.

#### Response example
```json
[
  {
    "_id": "64e8f2...",
    "date": "2026-09-23",
    "client": "John Smith",
    "service": "Website Design",
    "status": "Progress",
    "deal": 1500,
    "advance": 500,
    "payments": [
      {
        "date": "2026-09-20",
        "amount": 250
      }
    ],
    "commission": 100,
    "reference": "REF-101",
    "email": "john@example.com",
    "phone": "+8801700000000",
    "notes": "Follow up on final files",
    "startedDate": "2026-09-01",
    "createdAt": "2026-09-23T12:00:00.000Z",
    "updatedAt": "2026-09-23T12:00:00.000Z"
  }
]
```

---

### POST /api/entries

Create a new client entry.

#### Request body
```json
{
  "date": "2026-09-23",
  "client": "John Smith",
  "service": "Website Design",
  "status": "Progress",
  "deal": 1500,
  "advance": 500,
  "payments": [
    {
      "date": "2026-09-20",
      "amount": 250
    }
  ],
  "commission": 100,
  "reference": "REF-101",
  "email": "john@example.com",
  "phone": "+8801700000000",
  "notes": "Follow up on final files"
}
```

#### Success response
Returns the saved entry object.

#### Errors
- 400 Bad Request: missing client name or invalid status

---

### PUT /api/entries/:id

Update an existing entry.

#### Example payload
```json
{
  "status": "Complete",
  "deal": 2000,
  "service": "Full Website Package"
}
```

#### Success response
Returns the updated entry object.

#### Errors
- 404 Not Found: entry not found
- 400 Bad Request: invalid payload or status

---

### DELETE /api/entries/:id

Delete an entry.

#### Success response
```json
{
  "message": "Deleted",
  "id": "64e8f2..."
}
```

#### Errors
- 404 Not Found: entry not found

---

### POST /api/entries/:id/payments

Add a payment to a specific entry.

#### Request body
```json
{
  "date": "2026-09-25",
  "amount": 300
}
```

#### Success response
Returns the updated entry object with the added payment.

#### Errors
- 400 Bad Request: missing or invalid amount
- 404 Not Found: entry not found

---

## Supported statuses

```text
Pending
Progress
Complete
```

The backend automatically recalculates status based on the deal and payment total.

---

## Troubleshooting

### 401 Unauthorized on protected routes
- Check the JWT is included in the Authorization header.
- Confirm the token is not expired.
- Verify the backend is validating Firebase tokens correctly.

### 403 Forbidden on Firebase login
- Ensure the user email exists in ADMIN_EMAILS.
- Confirm Firebase email verification is enabled.

### Invalid status error
- Use one of the supported values: Pending, Progress, Complete.

---

## Notes

- Firebase authentication is handled in the frontend and verified again by the backend.
- WhatsApp notifications are triggered when entries are created, updated, or paid.
- All routes under /api/entries are protected and require a valid admin token.

## Related docs

- [README.md](README.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
