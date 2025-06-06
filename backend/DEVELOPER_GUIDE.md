# Backend Developer Guide

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Database Management](#database-management)
- [Code Style & Standards](#code-style--standards)
- [Architecture & Design Patterns](#architecture--design-patterns)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Treeckle backend is a Django REST API that provides comprehensive functionality for:

- **User Authentication & Authorization**: JWT-based auth with role-based access control
- **Facility Management**: Venue creation, categorization, and booking workflows
- **Event Management**: Event creation, publishing, and RSVP handling
- **Organization Multi-tenancy**: Support for multiple residential colleges
- **Email Notifications**: Automated email system for bookings and events
- **Content Delivery**: File upload and management with ImageKit integration

## 🛠️ Technology Stack

### Core Framework

- **Django**: Web framework
- **Django REST Framework**: REST API framework
- **PostgreSQL**: Primary database (production)
- **SQLite**: Development database (local)

### Authentication & Security

- **Django REST Framework SimpleJWT**: JWT token authentication
- **Django CORS Headers**: Cross-origin resource sharing
- **Django Argon2**: Password hashing

### External Services

- **ImageKit.io**: Image processing and CDN
- **Django Anymail** with SendinBlue: Email service
- **Gunicorn**: WSGI HTTP server for production

### Development Tools

- **Black**: Code formatting
- **Ruff**: Fast Python linter
- **DRF Spectacular**: OpenAPI schema generation
- **Django Jazzmin**: Enhanced admin interface

## 📁 Project Structure

```
backend/
├── treeckle/                    # Main Django project
│   ├── manage.py               # Django management script
│   ├── treeckle/               # Project settings and configuration
│   │   ├── settings.py         # Django settings
│   │   ├── urls.py            # Main URL configuration
│   │   ├── wsgi.py            # WSGI configuration
│   │   └── fixtures/          # Seed data for development
│   ├── authentication/        # JWT authentication app
│   │   ├── models.py          # Auth models (Google, Facebook, OpenID, Password)
│   │   ├── views.py           # Login endpoints
│   │   ├── serializers.py     # Auth data serializers
│   │   └── logic.py           # Authentication business logic
│   ├── users/                 # User management app
│   │   ├── models.py          # User, Organization, Role models
│   │   ├── views.py           # User CRUD operations
│   │   ├── permission_middlewares.py  # Role-based access control
│   │   └── logic.py           # User business logic
│   ├── organizations/         # Organization management
│   │   ├── models.py          # Organization model
│   │   └── admin.py           # Admin interface
│   ├── venues/                # Venue and booking management
│   │   ├── models.py          # Venue, VenueCategory, BookingNotificationSubscription
│   │   ├── views.py           # Venue CRUD and notification endpoints
│   │   ├── logic.py           # Venue business logic
│   │   ├── middlewares.py     # Venue permission checks
│   │   └── serializers.py     # Venue data serializers
│   ├── bookings/              # Booking management
│   │   ├── models.py          # Booking model with status workflow
│   │   ├── views.py           # Booking CRUD and status management
│   │   ├── logic.py           # Booking business logic
│   │   ├── middlewares.py     # Booking permission checks
│   │   └── serializers.py     # Booking data serializers
│   ├── events/                # Event management
│   │   ├── models.py          # Event, EventCategory, EventSignUp models
│   │   ├── views/             # Event endpoints split by functionality
│   │   │   ├── event.py       # Event CRUD operations
│   │   │   └── sign_up.py     # Event sign-up management
│   │   ├── logic/             # Event business logic
│   │   ├── middlewares.py     # Event permission checks
│   │   └── serializers.py     # Event data serializers
│   ├── comments/              # Comment system
│   ├── email_service/         # Email notification service
│   ├── content_delivery_service/  # File upload and management
│   ├── nusmods/              # NUSMods integration
│   └── templates/            # Django templates
├── requirements.txt          # Python dependencies
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Local development docker setup
├── Makefile                 # Development commands
├── .env.backend.local       # Local environment variables
└── entrypoint.sh            # Docker entrypoint script
```

## 🚀 Development Setup

### 1. Prerequisites

Ensure you have the following installed:

- [Python 3.9+](https://www.python.org/downloads/)
- [Docker](https://docs.docker.com/desktop/) (for database and full-stack testing)
- [Git](https://git-scm.com/)

### 2. Clone and Navigate

```bash
git clone https://github.com/CAPTxTreeckle/Treeckle-3.0.git
cd Treeckle-3.0/backend
```

### 3. Virtual Environment Setup

**For macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

**For Windows:**

```bash
py -m venv venv

# Command Prompt
venv\Scripts\activate.bat

# PowerShell
venv\Scripts\Activate.ps1
```

### 4. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Database Setup

```bash
# Apply migrations
make migrate

# Create superuser (optional)
python treeckle/manage.py createsuperuser

# Load seed data
make seed
```

### 6. Run Development Server

```bash
make runserver
# or
python treeckle/manage.py runserver
```

The API will be available at `http://localhost:8000`

## 🔄 Development Workflow

### Using Docker (Recommended)

For a complete development environment with PostgreSQL:

```bash
# Build and start all services
make docker-up

# View logs
docker-compose logs -f backend

# Stop services
make docker-down

# Restart services
make docker-restart
```

### Code Quality

Before committing any changes:

```bash
# Format code
make format

# Run linting
make lint

# Run tests (when available)
python treeckle/manage.py test
```

### Database Operations

```bash
# Create new migrations after model changes
make makemigrations

# Apply migrations
make migrate

# Reset database (development only)
python treeckle/manage.py flush
make seed
```

## 📚 API Documentation

### Accessing Documentation

- **Swagger UI**: http://localhost:8000/api/swagger/ (Interactive API documentation)
- **ReDoc**: http://localhost:8000/api/redoc/ (Alternative documentation format)
- **OpenAPI Schema**: http://localhost:8000/api/schema/ (Raw JSON schema)

## 🗄️ Database Management

### Models Overview

#### Core Models

**User Model** (`users/models.py`)

```python
class User(AbstractUser):
    name = CharField(max_length=255)
    email = EmailField(unique=True)
    organization = ForeignKey(Organization)
    role = CharField(choices=Role.choices)
    profile_image = ForeignKey(ProfileImage)
```

**Organization Model** (`organizations/models.py`)

```python
class Organization(TimestampedModel):
    name = CharField(max_length=255, unique=True)
```

**Venue Model** (`venues/models.py`)

```python
class Venue(TimestampedModel):
    organization = ForeignKey(Organization)
    name = CharField(max_length=255)
    category = ForeignKey(VenueCategory)
    capacity = PositiveIntegerField()
    ic_name = CharField(max_length=255)
    ic_email = EmailField()
    ic_contact_number = CharField(max_length=50)
    form_field_data = JSONField()  # Custom booking form fields
```

**Booking Model** (`bookings/models.py`)

```python
class Booking(TimestampedModel):
    title = CharField(max_length=255)
    booker = ForeignKey(User)
    venue = ForeignKey(Venue)
    start_date_time = DateTimeField()
    end_date_time = DateTimeField()
    status = CharField(choices=BookingStatus.choices)
    form_response_data = JSONField()  # User responses to custom form
```

### Migrations

```bash
# After making model changes
python treeckle/manage.py makemigrations

# Apply migrations
python treeckle/manage.py migrate

# Check migration status
python treeckle/manage.py showmigrations

# Rollback migration (if needed)
python treeckle/manage.py migrate app_name migration_name
```

### Data Fixtures

Load development data:

```bash
python treeckle/manage.py loaddata treeckle/treeckle/fixtures/seed_data.json
```

This creates:

- **Admin account**: admin@capt.com / admin@capt.com
- **Resident accounts**: resident1@capt.com through resident5@capt.com / resident1 through resident5
- Sample venues and categories
- Sample events and bookings

## 🎨 Code Style & Standards

### Code Formatting

The project uses **Black** for code formatting:

```bash
# Format all Python files
make format

# Format specific file
black path/to/file.py
```

### Linting

The project uses **Ruff** for fast linting:

```bash
# Run linter
make lint

# Auto-fix issues where possible
ruff check . --fix
```

### Coding Standards

#### 1. **Naming Conventions**

- Use `snake_case` for variables, functions, and file names
- Use `PascalCase` for class names
- Use `UPPER_CASE` for constants
- Use descriptive names for variables and functions

#### 2. **Import Organization**

```python
# Standard library imports
import os
from datetime import datetime

# Third-party imports
from django.db import models
from rest_framework import status

# Local imports
from .models import Venue
from users.models import User
```

#### 3. **String Formatting**

- Use double quotes for strings
- Use f-strings for string interpolation

```python
name = "John Doe"
message = f"Hello, {name}!"
```

#### 4. **Documentation**

- Add docstrings to all classes and functions
- Use type hints where appropriate

```python
def create_booking(
    user: User,
    venue: Venue,
    start_time: datetime
) -> Booking:
    """
    Create a new booking for the given user and venue.

    Args:
        user: The user making the booking
        venue: The venue being booked
        start_time: The booking start time

    Returns:
        The created booking instance

    Raises:
        ValidationError: If booking conflicts with existing booking
    """
    # Implementation here
```

#### 5. **Error Handling**

- Use specific exception types
- Provide meaningful error messages

```python
from treeckle.common.exceptions import BadRequest, Conflict

def update_booking_status(booking_id: int, status: str) -> Booking:
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        raise NotFound(detail="Booking not found", code="booking_not_found")

    if status not in BookingStatus.values:
        raise BadRequest(detail="Invalid status", code="invalid_status")
```

## 🏗️ Architecture & Design Patterns

### 1. **App Structure Pattern**

Each Django app follows a consistent structure:

```
app_name/
├── models.py          # Data models
├── views.py           # API endpoints
├── serializers.py     # Data serialization/validation
├── logic.py           # Business logic (separate from views)
├── middlewares.py     # Permission checks and decorators
├── urls.py            # URL routing
├── admin.py           # Django admin configuration
└── migrations/        # Database migrations
```

### 2. **Separation of Concerns**

- **Views**: Handle HTTP requests/responses, authentication, permission checking
- **Logic**: Contain business logic, data processing, complex queries
- **Serializers**: Handle data validation and serialization
- **Models**: Define data structure and simple model methods
- **Middlewares**: Handle cross-cutting concerns like permissions

### 3. **Permission System**

Role-based access control using decorators:

```python
from users.permission_middlewares import check_access
from users.models import Role

@check_access(Role.ADMIN)
def admin_only_view(request, requester: User):
    # Only accessible by admins
    pass

@check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
def multi_role_view(request, requester: User):
    # Accessible by multiple roles
    pass
```

### 4. **Error Handling Pattern**

Consistent error responses using custom exception classes:

```python
from treeckle.common.exceptions import BadRequest, NotFound, Conflict

# In views.py
def create_venue(request):
    try:
        venue = create_venue_logic(validated_data)
    except IntegrityError:
        raise Conflict(
            detail="Venue already exists",
            code="venue_exists"
        )
```

### 5. **Data Transformation Pattern**

Consistent JSON serialization using `*_to_json` functions:

```python
def venue_to_json(venue: Venue, full_details: bool = False) -> dict:
    data = {
        "id": venue.id,
        "name": venue.name,
        "category": venue.category.name,
        # ... basic fields
    }

    if full_details:
        data.update({
            "form_field_data": venue.form_field_data,
            "ic_name": venue.ic_name,
            # ... additional fields
        })

    return data
```

### 6. **Query Optimization**

Use `select_related` and `prefetch_related` for efficient queries:

```python
def get_bookings_with_related_data():
    return Booking.objects.select_related(
        'booker__organization',
        'venue__category'
    ).prefetch_related(
        'venue__booking_notification_subscriptions'
    )
```

## 🔧 Troubleshooting

### Common Issues

#### 1. **Database Connection Issues**

```bash
# Check database status
python treeckle/manage.py dbshell

# Reset database (development only)
python treeckle/manage.py flush --noinput
python treeckle/manage.py migrate
python treeckle/manage.py loaddata treeckle/treeckle/fixtures/seed_data.json
```

#### 2. **Migration Conflicts**

```bash
# Check migration status
python treeckle/manage.py showmigrations

# Resolve conflicts by rolling back and reapplying
python treeckle/manage.py migrate app_name 0001  # Roll back to specific migration
python treeckle/manage.py migrate  # Reapply migrations
```

#### 3. **Permission Denied Errors**

Check if the user has the correct role and organization:

```python
# In Django shell
python treeckle/manage.py shell

>>> from users.models import User
>>> user = User.objects.get(email="user@example.com")
>>> print(f"Role: {user.role}, Organization: {user.organization}")
```

#### 4. **Docker Issues**

```bash
# Clean up Docker containers and volumes
make docker-down
docker system prune -a
docker volume prune

# Rebuild from scratch
make docker-up
```

#### 5. **Static Files Issues**

```bash
# Collect static files
python treeckle/manage.py collectstatic --noinput

# Check static files configuration in settings.py
```

### Debug Mode

Enable debug logging in `settings.py`:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

### Getting Help

1. Check the [Django documentation](https://docs.djangoproject.com/)
2. Check the [Django REST Framework documentation](https://www.django-rest-framework.org/)
3. Review existing code patterns in the codebase

---

**Happy coding! 🎉**
