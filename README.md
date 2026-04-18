# Cookie Login System

A lightweight authentication system built with vanilla HTML, CSS, and JavaScript to demonstrate session persistence using browser cookies.

> This project is for educational purposes. Storing user credentials directly in cookies on the client-side is **insecure** and should never be done in production. Always use server-side authentication and secure session management.

### Features
- Login and Signup functionality.
- User profile page (protected route).
- Cookie-based authentication persistence.
- Form validation and error handling.
- Responsive design.

### How it Works
- **Signup**: User data is stored in a cookie named `app_users`.
- **Login**: Validates credentials against stored data and sets an `active_user` session cookie.
- **Session**: The system checks for the `active_user` cookie to handle redirects and protect the profile page.
- **Logout**: Clears the session cookie and redirects to the login page.

