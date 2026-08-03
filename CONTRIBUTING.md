# Contributing to Student Resource Sharing Platform

Thank you for considering contributing to the Student Resource Sharing Platform! We welcome contributions from developers of all skill levels to make this platform better for students and educators worldwide.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or higher) & npm
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas connection URI)
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (v3.19.0 or higher)

### Local Setup

#### 1. Backend Setup
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your environment variables in .env (MongoDB URI, JWT Secret, Port)

# Start the development API server
npm run dev
```
The backend API server will run at `http://localhost:5000/api/v1`.

#### 2. Frontend (Flutter) Setup
```bash
# Navigate to the Flutter app directory
cd flutter_app

# Fetch Flutter dependencies
flutter pub get

# Run on Web (Chrome)
flutter run -d chrome

# Run on Desktop (Windows)
flutter run -d windows

# Run on Mobile (Android Emulator / Connected Device)
flutter run -d android
```

---

## 🛠 Project Structure

```
├── flutter_app/               # Cross-Platform Flutter App (Mobile, Web, Desktop)
│   ├── lib/
│   │   ├── config/            # API Endpoints, App Theme & Constants
│   │   ├── models/            # Data Models (User, Course, Resource, etc.)
│   │   ├── providers/         # State Management (Provider / Riverpod)
│   │   ├── services/          # REST API Services
│   │   ├── views/             # Screen Views (Dashboard, Courses, Assignments, etc.)
│   │   └── widgets/           # Reusable UI Widgets & Responsive Layouts
│   └── pubspec.yaml           # Flutter Dependencies
├── controllers/               # Express Controllers
├── models/                    # Mongoose Data Models
├── routes/                    # Express API Routes
├── app.js                     # Express Application Core
└── server.js                  # Server Entry Point
```

---

## 📜 Development Guidelines

### Code Style & Formatting
- **Node.js**: Follow standard JavaScript ES6+ conventions. Use `camelCase` for variables/functions and `PascalCase` for classes/models.
- **Flutter / Dart**: Follow standard Dart guidelines (`flutter format .` and `flutter analyze`). Use `snake_case` for filenames and `PascalCase` for widget classes.

### Submitting a Pull Request (PR)
1. **Fork** the repository and create a new feature branch (`git checkout -b feature/amazing-feature`).
2. Make your changes and write clear, concise commit messages.
3. Verify that `flutter analyze` passes without errors in `flutter_app/`.
4. Push to your branch (`git push origin feature/amazing-feature`).
5. Open a **Pull Request** targeting the `main` branch with a detailed explanation of your changes.

---

## 💬 Community & Support
If you encounter bugs, have feature requests, or need help getting started, please open an issue on GitHub.
