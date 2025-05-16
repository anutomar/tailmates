//  This is user-signup.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("signupForm");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");
    const pawIcon = document.getElementById("pawIcon");
    const strengthMeter = document.getElementById("strengthMeter");
    const strengthText = document.getElementById("strengthText");

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&^])[A-Za-z\d@$!%*?#&^]{8,}$/;
    const nameRegex = /^[A-Za-z]+(?:[-'][A-Za-z]+)*$/;

    // Real-time capitalization and cleaning for name fields
    function liveCapitalizeNameInput(inputElement) {
        inputElement.addEventListener("input", () => {
            let raw = inputElement.value;
            raw = raw.replace(/[^a-zA-Z'-]/g, ""); // allow only letters, apostrophes, hyphens

            const capitalized = raw
                .split(/([-'])/)
                .map(part => /^[-']$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join("");

            inputElement.value = capitalized;
        });
    }

    const firstNameInput = form.firstName;
    const lastNameInput = form.lastName;
    liveCapitalizeNameInput(firstNameInput);
    liveCapitalizeNameInput(lastNameInput);

    function triggerWiggle(element) {
        element.classList.remove('animate-wiggle');
        void element.offsetWidth; // Force reflow to restart animation
        element.classList.add('animate-wiggle');
    }

    passwordInput.addEventListener("input", () => {
        evaluatePasswordStrength(passwordInput.value);
        checkConfirmPassword();
    });

    confirmPasswordInput.addEventListener("input", () => {
        checkConfirmPassword();
    });

    // Phone Number Validation
    const phoneNumberInput = document.querySelector("input[name='phoneNumber']");
    const phoneError = document.getElementById('phoneError');

    // Function to show toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Restrict input to only numbers in real-time
    phoneNumberInput.addEventListener('input', (event) => {
        // Remove non-numeric characters
        event.target.value = event.target.value.replace(/\D/g, '');
    });

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const firstName = form.firstName.value.trim();
        const lastName = form.lastName.value.trim();
        const email = form.email.value.trim();
        const city = form.city.value.trim();
        const zipCode = form.zipcode.value.trim();
        const phoneNumber = phoneNumberInput.value.trim();
        const password = form.password.value.trim();
        const confirmPassword = form.confirmPassword.value.trim();
        const role = form.role.value; // Get the role value (Pet Owner or Caretaker)
        const countryCode = form.countryCode.value;  // Capture the selected country code from the dropdown

        let isValid = true;

        // Clear previous error messages
        document.getElementById('firstNameError').classList.add('hidden');
        document.getElementById('lastNameError').classList.add('hidden');
        document.getElementById('emailError').classList.add('hidden');
        document.getElementById('cityError').classList.add('hidden');
        document.getElementById('zipCodeError').classList.add('hidden');
        passwordError.classList.add('hidden');
        confirmPasswordError.classList.add('hidden');
        phoneError.classList.add('hidden');

        // Validation logic
        if (!firstName || !nameRegex.test(firstName)) {
            isValid = false;
            const firstNameErr = document.getElementById('firstNameError');
            firstNameErr.textContent = "Enter a valid first name (letters, apostrophes, hyphens).";
            firstNameErr.classList.remove('hidden');
        }

        if (!lastName || !nameRegex.test(lastName)) {
            isValid = false;
            const lastNameErr = document.getElementById('lastNameError');
            lastNameErr.textContent = "Enter a valid last name (letters, apostrophes, hyphens).";
            lastNameErr.classList.remove('hidden');
        }

        if (!email) {
            isValid = false;
            document.getElementById('emailError').classList.remove('hidden');
        }

        if (!city) {
            isValid = false;
            document.getElementById('cityError').classList.remove('hidden');
        }

        if (!zipCode) {
            isValid = false;
            document.getElementById('zipCodeError').classList.remove('hidden');
        }

        if (!phoneNumber) {
            isValid = false;
            showToast("Phone number is required.");
            phoneError.classList.remove('hidden');
        }

        if (!strongPasswordRegex.test(password)) {
            isValid = false;
            passwordError.classList.remove('hidden');
            triggerWiggle(pawIcon); //  Wiggle the paw if password is invalid
        }

        if (password !== confirmPassword) {
            isValid = false;
            confirmPasswordError.classList.remove('hidden');
            confirmPasswordError.textContent = "Passwords do not match.";
            triggerWiggle(pawIcon); //  Wiggle the paw if passwords do not match
        }

        if (isValid) {
            try {
                const response = await fetch('http://localhost:3000/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ firstName, lastName, email, countryCode, phoneNumber, password, city, zipCode, role }),
                    credentials: 'include', // Ensure the session is maintained
                });

                const result = await response.json();
                if (response.ok) {
                    console.log(result.message);

                    // Redirect based on the selected role
                    if (role === "Pet Owner") {
                        window.location.href = "owner-profile.html"; // Redirect to the owner profile
                    } else if (role === "Caretaker") {
                        window.location.href = "caretaker-profile.html"; // Redirect to the caretaker profile
                    }

                } else {
                    console.error(result.message);
                    // Show error message
                }
            } catch (error) {
                console.error('Error:', error);
                // Handle fetch error
            }
        }
    });


    function evaluatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[@$!%*?#&^]/.test(password)) strength++;

        updateStrengthMeter(strength);
    }

    function updateStrengthMeter(score) {
        strengthMeter.className = "strength-meter";
        strengthText.className = "text-sm font-medium";

        switch (score) {
            case 0:
                strengthText.textContent = "None";
                strengthText.style.color = "#888";
                break;
            case 1:
            case 2:
                strengthMeter.classList.add("strength-weak");
                strengthText.textContent = "Weak";
                strengthText.style.color = "#e74c3c";
                break;
            case 3:
                strengthMeter.classList.add("strength-medium");
                strengthText.textContent = "Medium";
                strengthText.style.color = "#f39c12";
                break;
            case 4:
                strengthMeter.classList.add("strength-strong");
                strengthText.textContent = "Strong";
                strengthText.style.color = "#2ecc71";
                break;
            default:
                strengthMeter.classList.add("strength-very-strong");
                strengthText.textContent = "Very Strong";
                strengthText.style.color = "#228b22";
        }
    }

    function checkConfirmPassword() {
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (confirmPassword !== password) {
            confirmPasswordError.classList.remove('hidden');
            confirmPasswordError.textContent = "Passwords do not match.";
            triggerWiggle(pawIcon); // 🐾 Wiggle the paw if passwords do not match
        } else {
            confirmPasswordError.classList.add('hidden');
        }
    }
});
