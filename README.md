<div align="center">

# 🔧 FixIt Local

### Find trusted local pros. Book in minutes. Get it fixed.

A home services booking platform built with **Django** that connects customers with verified local plumbers, electricians, cleaners and more.

![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![PyCharm](https://img.shields.io/badge/PyCharm-000000?style=for-the-badge&logo=pycharm&logoColor=white)

**COMP-8347 · Internet Applications and Distributed Systems · Group 9 · University of Windsor**

[About](#-about) · [Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Team](#-team)

</div>

---

## 📖 About

Finding a reliable tradesperson is harder than it should be. Reviews are scattered across different sites, booking means endless phone calls, and prices are rarely clear upfront. Newcomers and students, who have no local network to ask, feel this the most.

**FixIt Local** brings everything into one place:

| 👤 Customers | 🛠️ Service Providers | 🛡️ Admins |
|---|---|---|
| Search, compare and book local pros | Free profile, services and pricing | Verify providers |
| Upload photos of the problem | Manage time slots and bookings | Manage categories |
| Track bookings and leave reviews | Showcase past work | Moderate reviews |

---

## ✨ Features

### Core Features
- 🔐 **Authentication**: sign up, login, logout and **forgot password** recovery
- 👥 **Guest vs registered access**: guests can browse and search; booking, reviews and uploads require login
- 🔎 **Search bar + drop-down**: keyword search with a predefined category drop-down
- 🕘 **User History**: cookies and sessions track visits per day, recently viewed providers and past searches
- 📤 **File uploads**: profile photos, problem photos and ID / licence documents
- 📅 **Booking system**: book available time slots with live status tracking
- ⭐ **Reviews and favourites**: rate completed jobs and save favourite providers
- 🧩 **Class-based views**: `ListView` and `DetailView` for the index and provider pages
- 🗂️ **JSON fixtures**: initial categories, providers and services loaded from fixtures
- 🎨 **Bootstrap UI**: responsive design with a shared navbar and footer

### Extra Features
- ⚡ Urgent same-day booking with an "Available Now" badge
- ✅ Verified provider badges
- 📸 Photo reviews (before / after)
- 📊 Provider dashboard with jobs, ratings and upcoming bookings
- 📧 Email notifications on booking updates
- 💰 Price estimator before booking

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Django |
| Frontend | Django Templates, HTML, CSS, Bootstrap 5 |
| Database | SQLite with JSON fixtures |
| Images | Pillow (`ImageField`) |
| IDE | PyCharm |
| Version Control | Git and GitHub |

---

## 🗃️ Data Model

| Model | Purpose |
|---|---|
| `CustomerProfile` | Extra details for customer accounts |
| `ProviderProfile` | Provider bio, service area, ID document, verification |
| `ServiceCategory` | Plumbing, electrical, cleaning and more |
| `Service` | A provider's service with price and duration |
| `TimeSlot` | Provider availability |
| `Booking` | Links a customer, service and time slot; tracks status |
| `Review` | Rating, comment and photo for a completed booking |
| `Favourite` | A customer's saved providers |
| `UserHistory` | Visits per day, recently viewed, past searches |
| `ContactMessage` | Messages sent from the Contact Us page |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Git
- PyCharm (recommended)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/pruthvi4344/fixit-local.git
cd fixit-local

# 2. Create and activate a virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Apply migrations
python manage.py migrate

# 5. Load initial data from fixtures
python manage.py loaddata fixtures/initial_data.json

# 6. Create an admin account
python manage.py createsuperuser

# 7. Run the development server
python manage.py runserver
```

Then open **http://127.0.0.1:8000/** in your browser.

> 💡 During development, password reset emails are printed to the terminal using Django's console email backend.

---

## 📁 Project Structure

```
fixit-local/
├── fixitlocal/          # Project settings and root URLs
├── accounts/            # Sign up, login, profiles, password reset
├── services/            # Categories, services, search, provider pages
├── bookings/            # Time slots and bookings
├── reviews/             # Reviews, favourites, uploads
├── history/             # User History (cookies and sessions)
├── pages/               # About, Contact, Team pages
├── templates/           # Base template, navbar, footer
├── static/              # CSS, JS, images
├── media/               # Uploaded files
├── fixtures/            # JSON initial data
├── requirements.txt
└── manage.py
```

---

## 📸 Screenshots

| Home & Search | Provider Profile | Booking |
|---|---|---|
| _coming soon_ | _coming soon_ | _coming soon_ |

---

## 👥 Team

| Member | Role | Responsibilities |
|---|---|---|
| **Pruthviraj Rathod** | Listings & Data | Categories, services, class-based views, fixtures |
| **Mohd Haris Mashhood** | Accounts & Auth | Sign up, login / logout, forgot password, profiles |
| **Deep Mistry** | Bookings | Time slots, booking flow, status tracking |
| **Devarsh Patel** | Uploads & Reviews | Photo / ID uploads, reviews, favourites |
| **Yashkumar Prajapati** | Search, History & Pages | Search with drop-down, User History, contact page |

---

## 🗺️ Roadmap

- [x] Project proposal
- [ ] Models and JSON fixtures
- [ ] Authentication and password reset
- [ ] Search and User History
- [ ] Booking system and uploads
- [ ] Reviews and favourites
- [ ] Bootstrap UI, footer and extra pages
- [ ] Final testing and live demo

---

<div align="center">

Made with ❤️ by **Group 9** · University of Windsor · Fall 2026

</div>
