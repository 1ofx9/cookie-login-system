// Utilities and Helpers

function getCookie(name) {
	const nameEQ = `${name}=`;
	const ca = document.cookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === " ") c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

function setCookie(name, value, days) {
	const date = new Date();
	date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
	const expires = `expires=${date.toUTCString()}`;
	// Removed path=/ to correctly scope cookies
	document.cookie = `${name}=${value};${expires};SameSite=Lax`;
}

function getUsers() {
	const usersRaw = getCookie("app_users");
	return usersRaw ? JSON.parse(usersRaw) : [];
}

function isValidEmail(email) {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

// Page Protection and Redirects

const activeUser = getCookie("active_user");
const path = window.location.pathname;
const currentPage = path.split("/").pop();
const isAtHome = currentPage === "" || currentPage === "index.html";

// Redirect away from login/signup if already logged in
if (activeUser && (isAtHome || currentPage === "signup.html")) {
	window.location.href = "./profile.html";
}
// Redirect away from profile if not logged in
else if (!activeUser && currentPage === "profile.html") {
	window.location.href = "./index.html";
}

// Main Stuff

document.addEventListener("DOMContentLoaded", () => {
	const loginForm = document.getElementById("login-form");
	const signupForm = document.getElementById("signup-form");
	const toast = document.getElementById("toast");

	// Password Visibility Toggle
	document.querySelectorAll(".password-toggle").forEach((button) => {
		button.addEventListener("click", () => {
			const input = button.parentElement.querySelector("input");
			const type = input.type === "password" ? "text" : "password";
			input.type = type;

			const eyeIcon =
				type === "password"
					? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>'
					: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
			button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${eyeIcon}</svg>`;
		});
	});

	// Login Form Handler
	if (loginForm) {
		const idInput = document.getElementById("identifier");
		const passwordInput = document.getElementById("password");

		loginForm.addEventListener("submit", (e) => {
			e.preventDefault();
			if (validateForm(loginForm)) {
				const idValue = idInput.value;
				const users = getUsers();
				const user = users.find(
					(u) => u.email === idValue || u.username === idValue,
				);

				if (user) {
					if (user.password === passwordInput.value) {
						showToast("Successfully logged in!");
						setCookie("active_user", JSON.stringify(user), 1);
						setTimeout(() => (window.location.href = "./profile.html"), 750);
					} else {
						showError("password", "Invalid password");
					}
				} else {
					showError("identifier", "Account not found");
				}
			}
		});
	}

	// Sign-up Form Handler
	if (signupForm) {
		signupForm.addEventListener("submit", (e) => {
			e.preventDefault();
			if (validateForm(signupForm)) {
				const name = document.getElementById("name").value;
				const username = document.getElementById("username").value;
				const email = document.getElementById("email").value;
				const password = document.getElementById("password").value;

				const users = getUsers();

				if (users.some((u) => u.email === email || u.username === username)) {
					showError("email", "Email or Username already exists");
					return;
				}

				users.push({ name, username, email, password });
				setCookie("app_users", JSON.stringify(users), 1);

				showToast("Account created successfully!");
				setTimeout(() => (window.location.href = "./index.html"), 750);
			}
		});
	}

	// Profile Content Handler
	const dashboardContent = document.getElementById("dashboard-content");
	if (dashboardContent && activeUser) {
		const user = JSON.parse(activeUser);
		document.getElementById("user-name").textContent = user.name;
		document.getElementById("user-uname").textContent = user.username;
		document.getElementById("user-email").textContent = user.email;

		document.getElementById("logout-btn").addEventListener("click", () => {
			setCookie("active_user", "", -1);
			window.location.href = "./index.html";
		});
	}

	// Validation and UI Feedback

	function validateForm(form) {
		let isValid = true;
		resetErrors(form);

		const inputs = form.querySelectorAll("input");

		inputs.forEach((input) => {
			const val = input.value.trim();
			const id = input.id;

			if (!val) {
				showError(id, `${capitalize(id)} is required`);
				isValid = false;
			} else if (input.type === "email" && !isValidEmail(val)) {
				showError(id, "Invalid email format");
				isValid = false;
			} else if (id === "username" && val.length < 6) {
				showError(id, "Username must be at least 6 characters");
				isValid = false;
			} else if (id === "password" && val.length < 8) {
				if (form.id === "signup-form") {
					showError(id, "Must be at least 8 characters");
				} else {
					showError(id, "Invalid password");
				}
				isValid = false;
			} else if (id === "confirm-password") {
				const pass = form.querySelector("#password").value;
				if (val !== pass) {
					showError(id, "Passwords do not match");
					isValid = false;
				}
			}
		});

		return isValid;
	}

	function showError(fieldId, message) {
		const errorDiv = document.getElementById(`${fieldId}-error`);
		const input = document.getElementById(fieldId);
		if (errorDiv) errorDiv.textContent = message;
		if (input) input.classList.add("error");
	}

	function resetErrors(form) {
		const inputs = form.querySelectorAll("input");
		inputs.forEach((input) => {
			input.classList.remove("error");
			const errorDiv = document.getElementById(`${input.id}-error`);
			if (errorDiv) errorDiv.textContent = "";
		});
	}

	function showToast(message) {
		if (!toast) return;
		toast.textContent = message;
		toast.classList.add("show");
		setTimeout(() => {
			toast.classList.remove("show");
		}, 3000);
	}
});
// Author: Subash Praveen Github: 1ofx9
