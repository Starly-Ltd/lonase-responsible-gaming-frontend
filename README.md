# Lonase Responsible Gaming - Frontend

Mobile-responsive React application for responsible gaming controls.

## Features

-   📱 Mobile-first responsive design
-   🔐 OTP authentication (mobile number only)
-   🎮 7 different control types
-   ✅ Form validation
-   🔄 Real-time status updates
-   📊 Webhook delivery history

## Tech Stack

-   React 18
-   React Router v6
-   Tailwind CSS
-   Axios
-   React Hook Form
-   Vite

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp env.example .env

# Edit .env and set your API URL
VITE_API_BASE_URL=http://localhost/api/v1
```

### 3. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

Build output will be in `dist/` directory.

## Project Structure

```
src/
├── main.jsx                 # Entry point
├── App.jsx                  # Main app with routing
├── index.css                # Global styles
├── api/
│   └── rgApi.js            # API client
├── context/
│   └── AuthContext.jsx     # Auth state management
├── components/
│   ├── Auth/
│   │   ├── OtpLogin.jsx
│   │   └── ProtectedRoute.jsx
│   └── ResponsibleGaming/
│       ├── SetLimits.jsx
│       ├── MyLimits.jsx
│       ├── History.jsx
│       └── Layout.jsx
└── pages/
    ├── LoginPage.jsx
    ├── SetLimitsPage.jsx
    ├── MyLimitsPage.jsx
    └── HistoryPage.jsx
```

## Available Routes

-   `/` - Login page (OTP authentication)
-   `/set-limits` - Set/update responsible gaming controls
-   `/my-limits` - View current controls and status
-   `/history` - View webhook delivery history

## Responsive Breakpoints

-   Mobile: < 640px
-   Tablet: 640px - 1024px
-   Desktop: > 1024px

## API Integration

The app connects to the Lonase backend API:

### Public Endpoints

-   `POST /api/v1/auth/send-otp` - Request OTP
-   `POST /api/v1/auth/verify-otp` - Verify OTP & get token

### Protected Endpoints (Require Auth Token)

-   `POST /api/v1/responsible-gaming/set-limits` - Set controls
-   `GET /api/v1/responsible-gaming/my-limits` - Get current controls
-   `GET /api/v1/responsible-gaming/history` - Get webhook history
-   `DELETE /api/v1/responsible-gaming/clear-limits` - Clear all controls
-   `POST /api/v1/responsible-gaming/logout` - Revoke token

## Development

### Prerequisites

-   Node.js 18+
-   npm or yarn

### Scripts

-   `npm run dev` - Start development server
-   `npm run build` - Build for production
-   `npm run preview` - Preview production build
-   `npm run lint` - Run ESLint

## Deployment

### Deploy to Static Hosting (Netlify, Vercel, etc.)

1. Build the app:

```bash
npm run build
```

2. Deploy the `dist/` directory

3. Configure environment variables in your hosting platform:

```
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

### Deploy with Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend-server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Browser Support

-   Chrome (last 2 versions)
-   Firefox (last 2 versions)
-   Safari (last 2 versions)
-   Edge (last 2 versions)
-   Mobile browsers (iOS Safari, Chrome Mobile)

## License

Proprietary - Lonase

## Support

For backend API documentation, see the main project's `REACT_INTEGRATION_GUIDE.md`.
