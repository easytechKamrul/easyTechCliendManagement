# Deployment Guide

## Final deployment setup used for this project

This application is designed for a split deployment architecture:

- Frontend: Vercel
- Backend: Render
- Domain and DNS: Hostinger
- Hosting plan: Vercel + Render Hobby plan

## Architecture overview

```text
Browser / Admin User
        |
        v
Frontend (Vercel)
        |
        | HTTPS API calls
        v
Backend (Render)
        |
        | MongoDB queries
        v
MongoDB Atlas / MongoDB instance
        |
        v
Firebase Auth / Firebase Admin checks
        |
        v
WhatsApp Cloud API (optional)
```

---

## 1. Frontend deployment on Vercel

### Steps
1. Push the repository to GitHub.
2. Open Vercel and import the project.
3. If using a monorepo, set the project root to the frontend folder.
4. Framework preset: Vite.
5. Build command:

```bash
npm run build
```

6. Output directory:

```bash
dist
```

### Custom domain setup

- Add the domain in Vercel.
- Configure DNS in Hostinger to point to the Vercel target.
- Enable SSL after verification.

---

## 2. Backend deployment on Render

### Steps
1. Go to Render and create a new Web Service.
2. Connect the GitHub repo.
3. Set the root directory to backend if needed.
4. Build command:

```bash
npm install
npm run build
```

5. Start command:

```bash
npm start
```

### Backend environment values on Render
the deployed backend here:

```text
https://your-backend.onrender.com/api/health
```

Expected output:

```json
{
  "ok": true
}
```

---

## 3. Hostinger domain configuration

### Recommended pattern

```text
Frontend: https://app.yourdomain.com
Backend: https://api.yourdomain.com
```

### DNS guidance
- Create a CNAME or A record for the frontend subdomain.
- Point it to the Vercel domain target.
- Create another subdomain such as api for the Render backend.
- Verify SSL and make sure the custom domains are active.

---

## 4. CORS and API URL configuration

This is required when frontend and backend live on different domains.

### Frontend
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Backend
```env
CORS_ORIGIN=https://app.yourdomain.com
```

This prevents browser cross-origin errors and allows secure API communication.

---

## 5. Production checklist

Before going live, confirm the following:

- [ ] Firebase project is connected to the correct app
- [ ] VITE_ADMIN_EMAILS is set correctly
- [ ] ADMIN_EMAILS is set correctly on the backend
- [ ] MongoDB database is reachable from Render
- [ ] JWT_SECRET is valid and secure
- [ ] CORS_ORIGIN matches the frontend domain
- [ ] VITE_API_URL matches the deployed backend API
- [ ] Render app starts successfully
- [ ] Vercel build completes without errors
- [ ] Frontend login works in production
- [ ] CRUD actions succeed against the live database
- [ ] WhatsApp integration works only if configured
- [ ] SSL is active for the final domain

---

## 6. Troubleshooting

### Frontend cannot call the API
- Verify VITE_API_URL is correct.
- Make sure CORS_ORIGIN is configured in the backend.

### Login fails
- Confirm the admin email appears in both VITE_ADMIN_EMAILS and ADMIN_EMAILS.
- Check whether the Firebase project is correct.

### Backend not starting
- Check that MONGO_URI is valid.
- Ensure FIREBASE_PRIVATE_KEY is correctly escaped.
- Verify the Render environment variables are all added.

### WhatsApp not sending
- Confirm Meta token and phone number ID are valid.
- Check that the WhatsApp template is approved.
- Ensure the client phone field includes the correct country code.

---

## 7. Recommended final deployment pattern

For this project, a practical and low-cost production setup is:

- Frontend on Vercel
- Backend on Render
- Domain via Hostinger
- Hobby plan for both services

This is a good setup for small business operations and easy future maintenance.

## Related docs

- [README.md](README.md)
- [API.md](API.md)
