# 💰 Expense Tracker App

A full-stack expense tracking application built with React and Node.js that helps users manage their personal finances by tracking income and expenses with detailed analytics and reporting.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.1.1-blue.svg)

## ✨ Features

### 🔐 Authentication & Security
- **Secure User Registration & Login** with JWT authentication
- **Email Verification** system for new accounts
- **Password Reset** functionality with OTP verification
- **Rate Limiting** and security middleware protection
- **Data Sanitization** and XSS protection

### 📊 Financial Management
- **Income Tracking** - Add and categorize multiple income sources
- **Expense Management** - Categorize and track all your expenses
- **Visual Analytics** - Interactive charts and graphs using Recharts
- **Dashboard Overview** - Real-time financial insights and summaries
- **Recent Transactions** - Quick view of your latest financial activities
- **30-Day Analysis** - Detailed spending patterns over the last month

### 🎨 User Experience
- **Modern UI** - Clean and responsive design with Tailwind CSS
- **Icon-based Categories** - Visual categorization with emoji support
- **Real-time Updates** - Instant feedback with toast notifications
- **Mobile Responsive** - Works seamlessly on all devices
- **Profile Management** - User profiles with image upload support

## 📸 Screenshots

*Screenshots and demo will be added soon to showcase the application interface and features.*

### Key Application Views:
- 🔐 **Authentication Pages** - Login, Register, Email Verification
- 📊 **Dashboard** - Financial overview with charts and analytics
- 💰 **Income Management** - Add and track income sources
- 💸 **Expense Tracking** - Categorize and monitor expenses
- 📱 **Responsive Design** - Mobile and desktop views

## 🛠️ Technology Stack

### Frontend (Client)
- **React 19** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router Dom** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Recharts** - Responsive chart library for data visualization
- **Axios** - HTTP client for API communication
- **React Hot Toast** - Beautiful toast notifications
- **Lucide React** - Modern icon library
- **Moment.js** - Date manipulation and formatting

### Backend (Server)
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling library
- **JWT** - JSON Web Token for authentication
- **bcryptjs** - Password hashing and encryption
- **Nodemailer** - Email sending functionality
- **Multer** - File upload handling
- **PDFKit** - PDF generation capabilities
- **Cluster** - Multi-process architecture for scalability

### Security & Performance
- **Helmet** - Security headers middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API request limiting
- **Data Sanitization** - MongoDB and XSS protection
- **Compression** - Response compression
- **Morgan** - HTTP request logging

## 🏗️ Architecture

The application follows a modern full-stack architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  Express API    │────│   MongoDB       │
│   (Port 5173)   │    │  (Port 8000)    │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Backend Architecture
- **Cluster-based** - Utilizes all CPU cores for optimal performance
- **RESTful API** - Clean and organized API endpoints
- **Middleware Stack** - Security, logging, and data processing layers
- **Database Models** - User, Income, and Expense collections

### Frontend Architecture
- **Component-based** - Reusable and maintainable React components
- **Context API** - Global state management for user authentication
- **Protected Routes** - Route guards for authenticated pages
- **Responsive Design** - Mobile-first approach with Tailwind CSS

## 📁 Project Structure

```
Expense-Tracker-App/
├── client/                    # React frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Cards/       # Card components
│   │   │   ├── Dashboard/   # Dashboard-specific components
│   │   │   └── layouts/     # Layout components
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   │   ├── Auth/        # Authentication pages
│   │   │   ├── Dashboard/   # Dashboard pages
│   │   │   └── forgot-password/ # Password reset pages
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # Application entry point
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── server/                   # Node.js backend application
│   ├── config/              # Configuration files
│   │   ├── db.js           # Database connection
│   │   └── env.js          # Environment validation
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/             # Database models
│   │   ├── User.js         # User model
│   │   ├── Income.js       # Income model
│   │   └── Expenses.js     # Expense model
│   ├── routes/             # API routes
│   │   ├── authRoute.js    # Authentication routes
│   │   ├── incomeRoute.js  # Income management routes
│   │   ├── expenseRoute.js # Expense management routes
│   │   └── dashboardRoute.js # Dashboard data routes
│   ├── limits/             # Rate limiting configuration
│   ├── app.js              # Server entry point
│   └── package.json        # Backend dependencies
├── LICENSE                  # MIT license
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **MongoDB** database (local or cloud instance)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/syedomer17/Expense-Tracker-App.git
   cd Expense-Tracker-App
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Environment Configuration

1. **Copy the example environment file:**
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your actual configuration:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database
MONGO_URL=mongodb://localhost:27017/expense-tracker
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/expense-tracker

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters

# Client URL
CLIENT_URL=http://localhost:5173

# Email Configuration (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Important Security Notes:**
- Generate a strong JWT_SECRET (minimum 32 characters)
- Use app-specific passwords for Gmail (enable 2FA first)
- Never commit the `.env` file to version control
- The `.env.example` file is provided as a template

### Database Setup

1. **Local MongoDB:**
   ```bash
   # Install MongoDB locally or use MongoDB Compass
   # Start MongoDB service
   sudo systemctl start mongod  # Linux
   brew services start mongodb-community  # macOS
   ```

2. **MongoDB Atlas (Cloud):**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Get connection string and update `MONGO_URL` in `.env`

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd server
   npm run dev  # Development mode with nodemon
   # or
   npm start    # Production mode
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/register     # User registration
POST /api/v1/auth/login        # User login
POST /api/v1/auth/logout       # User logout
POST /api/v1/auth/verify-otp   # Email verification
```

### Income Management
```
GET    /api/v1/income          # Get all income entries
POST   /api/v1/income          # Create new income entry
PUT    /api/v1/income/:id      # Update income entry
DELETE /api/v1/income/:id      # Delete income entry
```

### Expense Management
```
GET    /api/v1/expense         # Get all expense entries
POST   /api/v1/expense         # Create new expense entry
PUT    /api/v1/expense/:id     # Update expense entry
DELETE /api/v1/expense/:id     # Delete expense entry
```

### Dashboard & Analytics
```
GET /api/v1/dashboard/get-data # Get dashboard analytics
```

### Password Reset
```
POST /api/v1/forgot-password/request # Request password reset
POST /api/v1/forgot-password/verify  # Verify OTP
POST /api/v1/forgot-password/reset   # Reset password
```

## 🎯 Usage

### Getting Started
1. **Register** a new account with your email
2. **Verify** your email using the OTP sent to your inbox
3. **Login** to access your personal dashboard

### Managing Income
1. Navigate to the **Income** page
2. Click **"Add Income"** button
3. Fill in the income details:
   - Source (e.g., Salary, Freelance, Investments)
   - Amount
   - Date
   - Icon/Category
4. Save to track your income

### Managing Expenses
1. Go to the **Expense** page
2. Click **"Add Expense"** button
3. Enter expense information:
   - Category (e.g., Food, Transportation, Entertainment)
   - Amount
   - Date
   - Icon/Category
4. Save to record your expense

### Dashboard Analytics
- View **total income** and **total expenses**
- Analyze **recent transactions**
- Check **30-day spending patterns**
- Monitor **financial trends** with interactive charts

## 🔧 Development

### Available Scripts

**Backend (server directory):**
```bash
npm start         # Start production server
npm run dev       # Start development server with nodemon
```

**Frontend (client directory):**
```bash
npm run dev       # Start Vite development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Code Style & Quality
- **ESLint** configuration for code consistency
- **Prettier** recommended for code formatting
- Follow **React hooks** patterns and best practices
- Use **functional components** over class components

### Known Development Notes
- Some ESLint warnings exist in the current codebase (non-blocking)
- The build process generates large chunks; code splitting can be implemented for optimization
- Frontend build works correctly despite lint warnings

## 🤝 Contributing

We welcome contributions to improve the Expense Tracker App! Here's how you can contribute:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Write clear, concise commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style
- Test your changes thoroughly

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Verify connection string in .env
MONGO_URL=mongodb://localhost:27017/expense-tracker
```

**JWT Authentication Issues:**
```bash
# Ensure JWT_SECRET is properly set and sufficiently long
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
```

**CORS Errors:**
```bash
# Verify CLIENT_URL matches your frontend URL
CLIENT_URL=http://localhost:5173
```

**Email Functionality:**
```bash
# For Gmail, use app-specific passwords
# Enable 2FA and generate app password
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Syed Omar**
- GitHub: [@syedomer17](https://github.com/syedomer17)

## 🙏 Acknowledgments

- **React Team** for the amazing frontend library
- **Express.js** community for the robust backend framework
- **MongoDB** for the flexible database solution
- **Tailwind CSS** for the utility-first styling approach
- **All contributors** who help improve this project

---

⭐ **Star this repository** if you found it helpful!

🐛 **Found a bug?** Please open an issue with details.

💡 **Have a feature idea?** We'd love to hear about it!

---

*Built with ❤️ using React and Node.js*
