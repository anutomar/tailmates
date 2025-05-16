const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const passwordError = document.getElementById("passwordError");
const pawIcon = document.getElementById("pawIcon");

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&^])[A-Za-z\d@$!%*?#&^]{8,}$/;

loginForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent default form submission

    const email = loginForm.email.value.trim();
    const password = passwordInput.value;

    // Validate password strength
    const isValidPassword = strongPasswordRegex.test(password);

    if (!isValidPassword) {
        passwordError.classList.remove("hidden");
        pawIcon.classList.add("animate-wiggle");
        passwordInput.classList.add("border-red-400");

        setTimeout(() => {
            pawIcon.classList.remove("animate-wiggle");
            passwordInput.classList.remove("border-red-400");
        }, 600);
        return;
    }

    passwordError.classList.add("hidden");

    // Send login request to backend
    fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.message === "Login successful") {
                alert("✅ Login successful!");
                // You can redirect or do something here
                // window.location.href = "/dashboard.html";
            } else {
                alert("❌ " + data.message); // Invalid email or password
            }
        })
        .catch((err) => {
            console.error("Login error:", err);
            alert("Something went wrong. Please try again later.");
        });
});

// Hide error on input
passwordInput.addEventListener("input", function () {
    passwordError.classList.add("hidden");
    passwordInput.classList.remove("border-red-400");
    pawIcon.classList.remove("animate-wiggle");
});


//  Loader Control Script 
window.addEventListener('load', () => {
    try {
        const loader = document.getElementById('loader');
        const mainContent = document.getElementById('mainContent');

        loader.classList.add('fade-out');

        loader.addEventListener('animationend', () => {
            loader.style.display = 'none';
            mainContent.classList.remove('hidden');
        });
    } catch (error) {
        console.error('An error occurred during page rendering:', error);
        const loader = document.getElementById('loader');
        loader.innerHTML += `<p style="color:#735240; margin-top: 1rem; font-size: 1.2rem;">Oops! Something went wrong while loading the page.</p>`;
    }
});
