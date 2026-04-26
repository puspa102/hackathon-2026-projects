# Arogya - Post-Discharge Patient Care Platform

## Team Members

- Team Name: Arogya Squad
- GitHub: [Team Repository](https://github.com/your-team-name)

## Problem Statement

After hospital discharge, patients often struggle with:

- **Lack of continuity of care**: No structured follow-up mechanism
- **Medication non-compliance**: Patients forget dosages and timings
- **Early complication detection failure**: Warning signs go unnoticed until they become emergencies
- **Limited access to doctors**: Patients can't easily connect with their discharge doctors
- **Poor health tracking**: No centralized system to monitor recovery progress
- **Information loss**: Critical discharge instructions are often misunderstood or forgotten

This leads to:

- 30% readmission rate within 30 days
- Preventable complications
- Patient anxiety and confusion
- Healthcare system strain

## Solution

**Arogya** (meaning "Health" in Sanskrit) is an AI-powered post-discharge care platform that:

1. **Smart Health Check-ins**: Patients perform daily symptom assessments that are automatically risk-classified
2. **Intelligent Alerts**: AI detects warning signs and escalates to doctors in real-time
3. **Medication Management**: Automated reminders with dosage tracking
4. **Doctor Communication**: Direct chat with discharge doctors
5. **Discharge Report Analysis**: Automatic extraction of key information from discharge documents
6. **Risk Stratification**: ML-based models classify patients as normal/warning/emergency based on symptoms

### Key Features

- ✅ User authentication (Patient/Doctor roles)
- ✅ Daily health check-ins with risk assessment
- ✅ Real-time alerts for critical conditions
- ✅ Medication schedule management with reminders
- ✅ Direct doctor-patient chat interface
- ✅ Discharge report document processing (PDF/Images)
- ✅ Doctor availability and nearby doctor finder
- ✅ Alert system for emergency conditions

## Tech Stack

### Backend

- **Framework**: Django 6.0.4 + Django REST Framework 3.17.1
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Real-time**: Django Channels 4.3.2 with Daphne
- **File Storage**: Cloudinary (django-cloudinary-storage)
- **Document Processing**: OpenCV, Pillow for image/PDF handling
- **Deployment**: Gunicorn, WhiteNoise
- **Utilities**: python-dotenv, dj-database-url, requests

### Frontend

- **Framework**: React Native with Expo 54.0.33
- **Navigation**: Expo Router 6.0.23
- **UI Components**: React Native with custom components
- **Build Target**: iOS, Android, Web
- **Development**: TypeScript, ESLint

### DevOps & Tools

- **CORS**: django-cors-headers
- **CSS Framework**: Django Tailwind
- **Environment Management**: python-decouple, python-dotenv

## Architecture

```
Arogya/
├── Backend (Django REST API)
│   ├── accounts/          # User authentication & profiles
│   ├── checkins/          # Daily health assessments
│   ├── alerts/            # Alert management & notifications
│   ├── doctors/           # Doctor profiles & discovery
│   ├── chat/              # Real-time messaging
│   ├── medicines/         # Medication tracking
│   ├── reports/           # Discharge report processing
│   └── Arogya/            # Project configuration
└── Frontend (React Native)
    ├── app/               # App routing
    ├── components/        # Reusable UI components
    ├── screens/           # App screens
    ├── services/          # API services
    ├── hooks/             # Custom React hooks
    └── constants/         # App constants
```

## Setup Instructions

### Backend Setup

#### Prerequisites

- Python 3.10+
- pip/venv
- PostgreSQL (for production)

#### Installation

1. **Clone and navigate to backend**:

```bash
cd projects/Arogya/src/backend
```

2. **Create and activate virtual environment**:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. **Install dependencies**:

```bash
pip install -r requirements.txt
```

4. **Create `.env` file**:

```bash
cd Arogya
cat > .env << EOF
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EOF
```

5. **Run migrations**:

```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Create superuser**:

```bash
python manage.py createsuperuser
```

7. **Run development server**:

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

### Frontend Setup

#### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`

#### Installation

1. **Navigate to frontend directory**:

```bash
cd projects/Arogya/src/frontend
```

2. **Install dependencies**:

```bash
npm install
# or
yarn install
```

3. **Create `.env` file**:

```bash
cat > .env << EOF
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_DOCTOR_API_URL=http://localhost:8000/doctors
EOF
```

4. **Start development server**:

```bash
npm start
# or
yarn start
```

5. **Run on specific platform**:

```bash
npm run android   # For Android
npm run ios       # For iOS
npm run web       # For Web
```

## API Endpoints

### Authentication

- `POST /accounts/register/` - Register new user
- `POST /accounts/login/` - User login

### Check-ins

- `GET/POST /checkins/` - List and create health check-ins

### Doctors

- `GET /doctors/` - List all available doctors
- `GET /doctors/nearby/` - Find nearby doctors

### Chat

- `GET/POST /chat/` - Send and receive messages
- `POST /chat/send/` - Send new chat message

### Reports

- `POST /reports/upload/` - Upload discharge report
- `GET /reports/` - List user's reports
- `GET/DELETE /reports/<id>/` - View or delete specific report

### Medicines

- `GET/POST /medicines/` - Manage medications (if endpoints are added)

## Data Sources

- **Patient Health Data**: Self-reported symptom assessments
- **Discharge Reports**: User-uploaded medical documents (PDFs/Images)
- **Doctor Information**: Pre-populated database of medical professionals
- **Medication Data**: User input for prescribed medications

## Limitations & Bias Considerations

1. **Self-Reported Data**: Depends on patient accuracy and honesty
2. **Language Barrier**: Currently English-only; needs localization
3. **Digital Divide**: Requires smartphone access
4. **Demographic Bias**: Disease patterns may vary by region/ethnicity
5. **Cultural Differences**: Medical advice must be culturally sensitive
6. **Limited Context**: Risk assessment based only on reported symptoms

## Security Considerations

- ✅ JWT authentication for API access
- ✅ CORS protection with whitelisting
- ✅ HTTPS enforced in production
- ✅ Secure file upload with Cloudinary
- ✅ SQL injection prevention via ORM
- ✅ CSRF protection enabled
- ⚠️ TODO: Rate limiting on API endpoints
- ⚠️ TODO: Two-factor authentication
- ⚠️ TODO: End-to-end encryption for messages

## Deployment

### Backend Deployment (Heroku/Railway/AWS)

```bash
# Set environment variables
export DATABASE_URL=postgresql://...
export CLOUDINARY_CLOUD_NAME=...
export SECRET_KEY=...

# Deploy
git push heroku main
```

### Frontend Deployment (Expo)

```bash
npm run build
expo publish
```

## Development Workflow

1. Create feature branch: `git checkout -b feature/description`
2. Make changes and commit frequently: `git commit -m "feat: description"`
3. Push to remote: `git push origin feature/description`
4. Create Pull Request

## Known Issues & TODOs

- [ ] Location-based doctor filtering needs implementation
- [ ] Real-time alerts need WebSocket setup
- [ ] Medicine reminders need background job queue (Celery)
- [ ] Discharge report OCR needs ML model integration
- [ ] Rate limiting needed on API
- [ ] SMS/Email notifications needed
- [ ] Admin dashboard for doctors
- [ ] Patient compliance analytics

## Support

For issues and questions:

- Open a GitHub issue
- Contact: hackathon@caredevi.com
- Slack: #hackathon-help-support

## License

MIT License - See LICENSE file for details

---

**Built for CareDevi AI Innovation Hackathon 2026**
