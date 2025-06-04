# Treeckle 3.0

[![Build Status](https://app.travis-ci.com/CAPTxTreeckle/Treeckle-3.0.svg?branch=master)](https://app.travis-ci.com/CAPTxTreeckle/Treeckle-3.0)

<p align="center">
  <img src="./assets/treeckle-title-bottom-transparent.png" alt="Treeckle" width="400"/>
</p>

Website: <https://treeckle.com/>

_**Currently in production**_

Treeckle is a student life app for the Residential Colleges of NUS, intended to be a platform for the efficient booking of facilties, and the creation and management of events.

For usage/contribution, please contact [@JermyTan](https://github.com/JermyTan)

## Contributions Guidelines

### Commits/PR

- Use squash and merge
- PR by issue/feature
- Use github issues

### Backend

- Use venv
- [Style](https://google.github.io/styleguide/pyguide.html)
- Use snake_case, 4 spaces indentations and CONSTANT_VARIABLE
- Use list comphension
- Include constant file
- Use double quotes for strings

### Frontend

- Only use yarn (no npm)
- Typescript only in src file
- Component files use tsx, utils function files use ts
- Define constants instead of magic string
- Use enums
- Declare API response type

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React + TypeScript + Vite + Semantic UI React + Redux Toolkit
- **Backend**: Django + Django REST Framework + PostgreSQL
- **Infrastructure**: Docker + Nginx reverse proxy
- **Authentication**: JWT tokens with Google/Facebook OAuth support

### Project Structure

```
treeckle-3.0/
├── frontend/          # React TypeScript application
├── backend/           # Django REST API
├── app-reverse-proxy/ # Nginx reverse proxy configuration
├── core-reverse-proxy/# Core nginx configuration
└── assets/            # Project assets and branding
```

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/desktop/) and Docker Compose
- [Node.js](https://nodejs.org/) 16+ (for local frontend development)
- [Python](https://python.org/) 3.9+ (for local backend development)

### Development Setup

See the detailed developer guides:

- [Frontend Development Guide](./frontend/DEVELOPER_GUIDE.md)
- [Backend Development Guide](./backend/DEVELOPER_GUIDE.md)
