# Visitor Pass Management System - Frontend

A modern, production-ready React frontend for the Visitor Pass Management System.

## 🚀 Features

- **Authentication**: Secure login/register with JWT
- **Dashboard**: Real-time statistics and charts
- **Visitor Management**: Add, edit, delete, and search visitors
- **Pass Management**: Generate and manage visitor passes with QR codes
- **QR Scanner**: Scan passes for check-in/check-out
- **Check Logs**: Track all visitor activities
- **Responsive Design**: Works perfectly on all devices
- **Modern UI**: Glassmorphism, gradients, and smooth animations

## 🛠️ Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Axios** - API requests
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Charts and graphs
- **html5-qrcode** - QR code scanning
- **qrcode.react** - QR code generation

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:3000`

## 🚀 Getting Started

### Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```bash
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🏗️ Project Structure

```
client/
├── src/
│   ├── api/
│   │   └── axios.js              # API configuration
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx        # Main layout wrapper
│   │   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   │   └── Navbar.jsx        # Top navbar
│   │   └── ui/
│   │       ├── StatsCard.jsx     # Statistics card component
│   │       ├── DataTable.jsx     # Reusable table component
│   │       └── Modal.jsx         # Modal dialog component
│   ├── context/
│   │   └── AuthContext.jsx       # Authentication context
│   ├── pages/
│   │   ├── Login.jsx             # Login page
│   │   ├── Register.jsx          # Registration page
│   │   ├── Dashboard.jsx         # Dashboard with stats
│   │   ├── Visitors.jsx          # Visitor management
│   │   ├── Passes.jsx            # Pass management
│   │   ├── CheckLogs.jsx         # Check-in/out logs
│   │   └── QRScanner.jsx         # QR code scanner
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Design Features

### Glassmorphism Login/Register
- Gradient animated backgrounds
- Glass effect cards with blur
- Smooth animations and transitions

### Modern Dashboard
- Real-time statistics cards
- Interactive charts (Line & Bar)
- Recent activity feed
- Responsive grid layout

### Professional Tables
- Search and filter functionality
- Sortable columns
- Action buttons (Edit, Delete, View)
- Status badges

### QR Code Integration
- Real-time QR scanning
- QR code generation for passes
- Manual code entry fallback

## 🔐 Authentication

The app uses JWT tokens stored in localStorage. Protected routes automatically redirect to login if not authenticated.

### User Roles
- **Admin**: Full access
- **Security**: Check-in/out, view logs
- **Employee**: Create visitors, view passes

## 🌐 API Integration

All API calls go through the Axios instance with:
- Automatic token injection
- Error handling
- Request/response interceptors
- Base URL configuration

### API Endpoints Used
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/visitors/all
POST   /api/visitors/createVisitor
DELETE /api/visitors/:id
GET    /api/pass
POST   /api/checklog/checkin
GET    /api/checklog
```

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Manual Hosting
1. Build the project: `npm run build`
2. Upload the `dist/` folder to any static hosting service

## 🎯 Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

For production, update to your production API URL.

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎨 Color Scheme

```css
Primary: #0ea5e9 (Sky Blue)
Success: #10b981 (Green)
Warning: #f59e0b (Amber)
Danger: #ef4444 (Red)
```

## 📝 License

MIT

## 👤 Author

Created for Visitor Pass Management System

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📧 Support

For issues and questions, please open an issue in the repository.
