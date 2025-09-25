# Text Submission Full-Stack Application

[![CI Pipeline](https://github.com/lioprogramista1111-png/TestingApp/actions/workflows/ci.yml/badge.svg)](https://github.com/lioprogramista1111-png/TestingApp/actions/workflows/ci.yml)

A full-stack web application built with Angular frontend, .NET Core backend, and SQL Server database for submitting and storing text data.

## Project Structure

```
TestingApp/
├── backend/
│   └── TextSubmissionAPI/          # .NET Core Web API
│       ├── Controllers/            # API Controllers
│       ├── Data/                   # Entity Framework DbContext
│       ├── Models/                 # Data Models
│       └── Migrations/             # Database Migrations
└── frontend/
    └── text-submission-app/        # Angular Application
        └── src/
            └── app/
                ├── components/     # Angular Components
                └── services/       # HTTP Services
```

## Technologies Used

### Frontend
- **Angular 20.3.1** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **Reactive Forms** - Form handling with validation
- **CSS3** - Styling and responsive design

### Backend
- **.NET 9.0** - Web API framework
- **Entity Framework Core 9.0** - ORM for database operations
- **SQL Server LocalDB** - Database storage
- **ASP.NET Core** - Web hosting and middleware

### Database
- **SQL Server LocalDB** - Local development database
- **Entity Framework Migrations** - Database schema management

## Features

- ✅ Single page application with clean, professional UI
- ✅ Text input form with validation (required, max 1000 characters)
- ✅ Real-time character count display
- ✅ Form validation with error messages
- ✅ HTTP communication between frontend and backend
- ✅ CORS configuration for cross-origin requests
- ✅ Entity Framework with SQL Server integration
- ✅ Proper error handling and user feedback
- ✅ Responsive design
- ✅ **Comprehensive testing suite with 100% code coverage**
- ✅ **Unit tests for all components and services**
- ✅ **HTTP mocking and integration testing**

## Prerequisites

Before running this application, ensure you have the following installed:

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [Angular CLI](https://angular.io/cli): `npm install -g @angular/cli`
- [SQL Server LocalDB](https://docs.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb)

## Setup Instructions

### 1. Clone and Navigate to Project
```bash
cd TestingApp
```

### 2. Backend Setup (.NET Core API)

```bash
# Navigate to backend directory
cd backend/TextSubmissionAPI

# Restore NuGet packages
dotnet restore

# Create and apply database migrations
dotnet ef database update

# Run the API (will start on https://localhost:7014)
dotnet run --launch-profile https
```

The backend API will be available at:
- HTTPS: `https://localhost:7014`
- HTTP: `http://localhost:5010`

### 3. Frontend Setup (Angular)

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend/text-submission-app

# Install npm packages
npm install

# Start the development server
ng serve
```

The frontend application will be available at: `http://localhost:4200`

## 🚀 CI/CD Pipeline

This project uses **GitHub Actions** for automated CI/CD pipeline with testing, building, and deployment.

### CI Pipeline Features
- ✅ **Automated Testing**: Runs all 89 tests (49 frontend + 40 backend)
- ✅ **Parallel Execution**: Frontend and backend tests run simultaneously
- ✅ **Build Verification**: Ensures production builds work correctly
- ✅ **Artifact Storage**: Saves build outputs for deployment
- ✅ **Status Checks**: Prevents merging broken code

### CD Pipeline Features
- ✅ **Staging Deployment**: Automatic deployment to staging environment
- ✅ **Production Deployment**: Manual approval required for production
- ✅ **Smoke Testing**: Automated health checks after deployment
- ✅ **Rollback Capability**: Quick recovery from failed deployments
- ✅ **Environment Protection**: Approval gates and deployment restrictions

### Pipeline Jobs
1. **Frontend Tests**: Angular/Jasmine tests with ChromeHeadless
2. **Backend Tests**: .NET/xUnit tests with in-memory database
3. **Build Verification**: Production build validation
4. **Deploy Staging**: Automatic deployment to staging (main branch only)
5. **Deploy Production**: Manual approval deployment to production
6. **CI Summary**: Overall pipeline status report

### Deployment Options
- **Azure Cloud**: Azure Static Web Apps + Azure App Service
- **Docker**: Local development with Docker Compose
- **Manual**: Traditional deployment methods

### Viewing Results
- **CI/CD Status**: Check the **Actions** tab in GitHub repository
- **Deployments**: View deployment history in **Environments** tab
- **Status Badge**: Green ✅ badge indicates passing pipeline

## 🧪 Testing

This project includes a comprehensive testing suite with **89 total tests** providing excellent coverage.

### Frontend Testing

```bash
# Navigate to frontend directory
cd frontend/text-submission-app

# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests once (CI mode)
npm run test:ci
```

### Test Coverage Status
```
✅ Statements   : 100% ( 29/29 )
✅ Branches     : 100% ( 1/1 )
✅ Functions    : 100% ( 8/8 )
✅ Lines        : 100% ( 28/28 )
```

### What's Tested
- **Service Tests**: HTTP communication, error handling, request/response validation
- **Component Tests**: Form validation, user interactions, loading states
- **Integration Tests**: Component-service communication, end-to-end workflows

### Testing Framework
- **Jasmine**: Testing framework for behavior-driven development
- **Karma**: Test runner for executing tests in browsers
- **Angular Testing Utilities**: Angular-specific testing helpers
- **HttpClientTestingModule**: HTTP request mocking

For detailed testing documentation, see: [`frontend/text-submission-app/TESTING.md`](frontend/text-submission-app/TESTING.md)

## API Endpoints

### Text Submission Controller

- **GET** `/api/TextSubmission` - Retrieve all text submissions
- **GET** `/api/TextSubmission/{id}` - Retrieve a specific text submission
- **POST** `/api/TextSubmission` - Submit new text data

#### POST Request Example
```json
{
  "text": "Your text content here"
}
```

#### Response Example
```json
{
  "id": 1,
  "text": "Your text content here",
  "createdAt": "2025-09-16T22:30:00.000Z"
}
```

## Database Schema

### TextSubmissions Table
- `Id` (int, Primary Key, Identity)
- `Text` (nvarchar(1000), Required)
- `CreatedAt` (datetime2, Required)

## Configuration

### Backend Configuration
- **Connection String**: Located in `appsettings.json`
- **CORS Policy**: Configured to allow requests from `http://localhost:4200`
- **Database**: SQL Server LocalDB with database name `TextSubmissionDB`

### Frontend Configuration
- **API Base URL**: `https://localhost:7014/api/TextSubmission`
- **Development Server**: `http://localhost:4200`

## Usage

1. Start both the backend API and frontend application following the setup instructions
2. Open your browser and navigate to `http://localhost:4200`
3. Enter text in the input field (up to 1000 characters)
4. Click the "Submit" button to send the data to the backend
5. The application will display a success message upon successful submission
6. Data is automatically saved to the SQL Server database

## Development Notes

- The application uses Angular's reactive forms for form handling and validation
- CORS is configured to allow communication between the Angular frontend and .NET backend
- Entity Framework Code First approach is used for database management
- The application includes proper error handling for both frontend and backend
- CSS styling provides a clean, professional appearance with responsive design

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend CORS policy includes the frontend URL
2. **Database Connection**: Verify SQL Server LocalDB is installed and running
3. **Port Conflicts**: Check that ports 4200, 5010, and 7014 are available
4. **SSL Certificate**: The backend uses a development SSL certificate

### Logs
- Backend logs are displayed in the console where `dotnet run` was executed
- Frontend logs are available in the browser's developer console
- Database operations are logged by Entity Framework

## License

This project is for demonstration purposes.
