# Virtual Campus - Student Resource Sharing Platform 🎓

[![Flutter](https://img.shields.io/badge/Flutter-Cross--Platform-02569B?logo=flutter)](https://flutter.dev)
[![Node.js](https://img.shields.io/badge/Node.js-v16%2B-339933?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-REST_API-000000?logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)](https://www.mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, full-stack, open-source educational resource sharing platform. Designed to enable students and instructors to share study resources, manage courses, track assignments, participate in discussion forums, and view announcements seamlessly across **Web, Mobile (iOS & Android), and Desktop (Windows, macOS, Linux)** using a unified Flutter client and Express/MongoDB REST backend.

---

## ✨ Features

- **🎓 Course Catalog & Enrollment**: Browse available courses, view course codes, instructor info, and enroll.
- **📚 Resource Library**: Upload, filter, search, and download past questions, lecture slides, textbooks, and lab manuals.
- **📝 Assignment Tracker**: View deadlines, submit coursework, track completion status, and review grades.
- **💬 Discussion Forum**: Interactive forum with upvoting, categorization (Homework, Study Groups, Projects), and discussion threads.
- **📢 Announcements & Notices**: Campus-wide and course-specific announcements.
- **🌗 Dark & Light Themes**: Modern glassmorphism UI supporting responsive light and dark themes.
- **📱 Single Unified Codebase**: Runs everywhere — Web, Mobile, and Desktop!

---

## 🛠 System Architecture

```
                               ┌───────────────────────────┐
                               │     Flutter Frontend      │
                               │  (Mobile, Web, Desktop)   │
                               └─────────────┬─────────────┘
                                             │ HTTP REST / JWT
                                             ▼
                               ┌───────────────────────────┐
                               │   Express.js API Server   │
                               │        (/api/v1/...)      │
                               └─────────────┬─────────────┘
                                             │ Mongoose ORM
                                             ▼
                               ┌───────────────────────────┐
                               │      MongoDB Database     │
                               └───────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas cloud URI)
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (v3.19+)

### 1. Backend Setup
```bash
# Install Node.js dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start the Express API server
npm run dev
```
The REST API server will run at `http://localhost:5000/api/v1`.

### 2. Frontend Setup (Flutter)
```bash
# Navigate to the Flutter app directory
cd flutter_app

# Fetch packages
flutter pub get

# Run on Web (Chrome)
flutter run -d chrome

# Run on Windows Desktop
flutter run -d windows

# Run on Android Emulator
flutter run -d android
```

---

## 📁 Repository Structure

```
├── flutter_app/             # Modern Flutter Cross-Platform Client
│   ├── lib/
│   │   ├── config/          # API Endpoints & Theme tokens
│   │   ├── models/          # Dart Data Models (User, Course, Resource, etc.)
│   │   ├── providers/       # State Management (AuthProvider, DataProvider, ThemeProvider)
│   │   ├── services/        # HTTP API Service & JWT handling
│   │   ├── views/           # Screen Views (Dashboard, Courses, Assignments, etc.)
│   │   └── widgets/         # Responsive Layouts & Custom Components
│   └── pubspec.yaml         # Flutter Dependencies
├── controllers/             # Express API Controllers
├── models/                  # Mongoose Schemas (User, Course, Resource, etc.)
├── routes/                  # Express REST Routes
├── static/                  # Legacy static assets (preserved intact)
├── index.html               # Legacy web page (preserved intact)
├── app.js                   # Express application setup
└── server.js                # Server entrypoint
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, development workflow, and submitting pull requests.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
