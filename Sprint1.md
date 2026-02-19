
# 🚀 Sprint 1 Report – RideX


**Sprint Focus:** Authentication & Basic System Setup

---

# 👤 Team Members

* **Backend Developer:** Anish Mannem
* **Frontend Developer:** Kanakavalli Muraharisetty

---

# 📌 Sprint 1 Goal

The goal of Sprint 1 was to:

* Implement **User Registration**
* Implement **User Login**
* Set up basic **frontend routing**
* Establish **backend API structure**
* Connect frontend and backend for authentication
* Ensure users are redirected correctly after login

---

# 📝 User Stories

## 1️⃣ New User Registration

**As a new user**,
I want to create an account using my basic details
So that I can access RideX features.

### Acceptance Criteria:

* User can enter name, email, and password
* Proper validation for missing/invalid fields
* Success message after registration
* Redirect to login page after successful registration

---

## 2️⃣ Returning User Login

**As a returning user**,
I want to log in using my email and password
So that I can access my account quickly.

### Acceptance Criteria:

* Login validates user credentials
* Clear error message for wrong credentials
* Redirect to dashboard/home after successful login
* Session/token stored properly

---

## 3️⃣ Session Persistence

**As a logged-in user**,
I want to stay logged in even after refreshing the page
So that I don’t need to log in repeatedly.

---

# 🔧 Issues Planned to Address

## 🔹 Backend (Anish)

1. Setup Express backend server
2. Create user model
3. Implement registration API
4. Implement login API
5. Password hashing
6. JWT token generation
7. API error handling
8. Connect backend to database
9. Test APIs via command line (Postman / VSCode terminal)

---

## 🔹 Frontend (Kanakavalli)

1. Setup React + Vite project
2. Create Login Page UI
3. Create Registration Page UI
4. Setup routing using React Router
5. Connect frontend to backend APIs
6. Handle form validation
7. Store authentication token
8. Redirect user after login
9. Basic dashboard/home page after login

---

# ✅ Successfully Completed Tasks

## 🔹 Backend – Anish

* Express server setup completed
* User model created
* Registration API implemented
* Login API implemented
* Password hashing using bcrypt
* JWT token generation implemented
* Proper error handling for invalid login
* Database connected successfully
* APIs tested successfully via command line

### Backend Files Implemented:

* `server.js`
* `routes/auth.js`
* `controllers/authController.js`
* `models/User.js`
* `middleware/authMiddleware.js`
* `.env`
* `config/db.js`

---

## 🔹 Frontend – Kanakavalli

* React + Vite setup completed
* Login page designed
* Registration page designed
* Routing implemented
* API integration completed
* Token storage handled
* Successful redirect after login
* Basic Home/Dashboard page created

### Frontend Files Implemented:

* `App.jsx`
* `main.jsx`
* `pages/Login.jsx`
* `pages/Register.jsx`
* `pages/Home.jsx`
* `services/api.js`
* `components/AuthForm.jsx`

---


# 🎯 Sprint 1 Outcome

✔ Fully working authentication flow
✔ Frontend and backend successfully integrated
✔ Users can register, login, and be redirected properly
✔ Project structure established for future development

---

# 📂 Demo Resources

Backend and frontend demo videos available in Youtube:
(
Frontend: https://youtu.be/FT0pl3Au7zU
Backend: https://youtu.be/Abl4yf8sf5Q
)

---

---


