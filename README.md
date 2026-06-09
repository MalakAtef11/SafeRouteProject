# SafeRoute: Smart City Incident Reporting System

SafeRoute is a smart web-based incident reporting system designed to help citizens report urban issues and public safety problems such as road damage, traffic accidents, water problems, electricity failures, potholes, and other infrastructure-related incidents.

The system provides a centralized platform that connects citizens with responsible authorities. It supports report submission, AI-based report analysis, report assignment, status tracking, notifications, and administrative management.

---

## Project Overview

SafeRoute aims to improve the process of reporting and managing city-related incidents by replacing traditional and unstructured reporting methods with a digital, organized, and intelligent system.

Users can submit reports with descriptions, locations, images, and audio files. The system analyzes submitted reports using AI to generate summaries, classify the report, estimate confidence, and suggest the responsible sector.

Authorities and administrators can review reports, assign them to teams, update report status, add internal notes, and notify users about report progress.

---

## Main Features

* User registration and secure login
* Role-based access control
* Incident report submission
* Location-based reporting
* Image and audio attachment support
* AI-based report analysis
* Report classification and summarization
* Report assignment to sectors or teams
* Report status tracking
* Notifications for report updates
* Internal notes for authorities and teams
* Report status history tracking
* Admin/authority dashboard
* API testing using Swagger

---

## User Roles

The system supports multiple user roles:

### Citizen / User

* Register and log in
* Submit reports
* Attach media files
* Track report status
* Receive notifications

### Authority / Admin

* View submitted reports
* Review AI analysis results
* Assign reports to teams
* Update report status
* Manage reports and users

### Field Team

* View assigned reports
* Update progress
* Add internal notes
* Participate in report resolution

---

## Technologies Used

### Frontend

* React.js
* Axios
* HTML
* CSS
* JavaScript

### Backend

* ASP.NET Core Web API (.NET 8)
* Entity Framework Core
* RESTful APIs
* Swagger

### Database

* SQL Server
* Entity Framework Core Code First
* EF Core Migrations

### AI Integration

* AI service for report analysis, summarization, classification, and confidence score generation

---

## Database Main Entities

The system database includes the following main entities:

* Users
* UserSessions
* Reports
* ReportAttachments
* Sectors
* Teams
* TeamMembers
* ReportSectors
* ReportAssignments
* ReportStatuses
* ReportPriorities
* ReportStatusHistory
* Notifications
* InternalNotes

---

## System Architecture

SafeRoute follows a three-tier architecture:

1. Presentation Layer
   The frontend is developed using React.js and provides the user interface.

2. Application Layer
   The backend is developed using ASP.NET Core Web API and handles business logic, authentication, report management, AI integration, and API communication.

3. Data Layer
   SQL Server is used to store system data, and Entity Framework Core is used for database operations and migrations.

---

## Project Structure

```text
SafeRoute
├── Backend
│   ├── Controllers
│   ├── Models
│   ├── Data
│   ├── Services
│   ├── Migrations
│   ├── wwwroot
│   └── Program.cs
│
├── Frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── assets
│   │   ├── services
│   │   └── App.jsx
│   ├── public
│   └── package.json
│
└── README.md
```

---

## Backend Setup

1. Open the backend project in Visual Studio.
2. Configure the database connection string in `appsettings.json`.
3. Run EF Core migrations if needed.
4. Start the backend server.

Backend URLs:

```text
https://localhost:7232
http://localhost:5029
```

Swagger URL:

```text
https://localhost:7232/swagger
```

---

## Frontend Setup

1. Open the frontend project in Visual Studio Code.
2. Install dependencies:

```bash
npm install
```

3. Start the React development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## API Testing

Swagger was used to test backend API endpoints during development.

Examples of tested APIs:

* User login
* User registration
* Create report
* Get reports
* Update report status
* Assign report
* Get notifications
* Mark notification as read
* AI report analysis

---

## Testing

The system was tested using:

* Functional testing
* API testing
* Integration testing
* Database testing
* User interface testing

Main tested features include:

* User authentication
* Report submission
* Media upload
* AI analysis
* Report assignment
* Status updates
* Notifications
* Internal notes
* Database relationships

---

## Future Work

Future improvements may include:

* Mobile application development
* Real-time notifications using SignalR
* Advanced AI analysis
* Interactive map integration
* Government system integration
* Live field team tracking
* Advanced analytics dashboard
* Arabic and English multilingual support
* Cloud deployment

---

## Project Type

This project was developed as a graduation project for the Software Engineering Department.

---

## Author

Malak Atef
Software Engineering Student
Al-Zaytoonah University of Jordan
Faculty of Science and Information Technology

