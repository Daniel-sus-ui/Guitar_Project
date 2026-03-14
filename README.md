# Fullstack Template

## Установка

cd server

npm install

cd ../client

npm install

cd ..

npm run dev

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/client --> npm run build

server/server.js = 
const path = require("path");
app.use(express.static(path.join(__dirname, "../client/build")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

npm run server

---

Local development (new instructions):

1) Backend

 - Copy `server/.env.example` to `server/.env` and set `STRIPE_SECRET`, `JWT_SECRET`, `ADMIN_PASSWORD` and `SITE_URL`.
 - Install server deps: `cd server && npm install`
 - Seed sample lesson (place sample media files under `server/media` matching names in `server/init_seed.js` or edit the seed): `node init_seed.js`
 - Start server: `npm run dev` (from repo root or `cd server && npm run dev`)

2) Frontend

 - Install: `cd client && npm install`
 - Run dev: `npm start`

3) Payment flow

 - Use Stripe test keys in `server/.env`.
 - Add local media (mp4) files to `server/media/` for protected streaming and `server/public/previews/` for preview videos.

Notes:

- This project serves protected lesson videos via `/api/stream/:video?token=...` which validates a JWT access token generated after payment.
- For production, replace local streaming with S3 presigned URLs and secure storage; set S3 env vars in `.env`.
# Guitar_Project
