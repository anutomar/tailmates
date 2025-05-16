// This is owner-profile.js

const petNameInput = document.getElementById('petName');
const petBreedInput = document.getElementById('petBreed');
const petDetailsInput = document.getElementById('petDetails');
const petProfileForm = document.getElementById('petProfileForm');
const toastPetName = document.getElementById('toastPetName');
const toastPetBreed = document.getElementById('toastPetBreed');
const toastPetDetails = document.getElementById('toastPetDetails');
const toastHireCaretaker = document.getElementById('toastHireCaretaker');
const toastCareType = document.getElementById('toastCareType');
const toastProfilePic = document.getElementById('toastProfilePic');

// Function to capitalize the first letter of each word in a string
function capitalizeWords(str) {
    return str.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });
}

// Add event listeners to capitalize inputs
petNameInput.addEventListener('input', function () {
    petNameInput.value = capitalizeWords(petNameInput.value);
});

petBreedInput.addEventListener('input', function () {
    petBreedInput.value = capitalizeWords(petBreedInput.value);
});

petDetailsInput.addEventListener('input', function () {
    petDetailsInput.value = capitalizeWords(petDetailsInput.value);
});

// Validate inputs for allowed characters
function validateInput(event) {
    const allowedPattern = /^[A-Za-z\s'\-]*$/;
    if (!allowedPattern.test(event.key)) {
        event.preventDefault();
    }
}

// Validate Allergies field: Allow only whitespace, comma, apostrophe, and hyphen
function validateAllergiesInput(event) {
    const allowedPattern = /^[A-Za-z\s,'\-\b]*$/;
    if (!allowedPattern.test(event.key)) {
        event.preventDefault();
    }
}

petNameInput.addEventListener('keypress', validateInput);
petBreedInput.addEventListener('keypress', validateInput);
petDetailsInput.addEventListener('keypress', validateAllergiesInput); // Validate Allergies input

// Handle form submission
petProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    let hasError = false;

    // Hide all toast messages initially
    [toastPetName, toastPetBreed, toastPetDetails, toastHireCaretaker, toastCareType, toastProfilePic].forEach(toast => {
        toast.style.display = 'none';
    });

    const petNameValue = petProfileForm.petName.value;
    const petBreedValue = petProfileForm.petBreed.value;

    // Validate pet name, breed, and other fields
    if (!/^[A-Za-z\s'\-]+$/.test(petNameValue)) {
        toastPetName.textContent = 'Pet\'s name can only contain letters, spaces, apostrophes, and hyphens.';
        toastPetName.style.display = 'block';
        hasError = true;
    }

    if (!/^[A-Za-z\s'\-]+$/.test(petBreedValue)) {
        toastPetBreed.textContent = 'Enter the Pet\'s breed.';
        toastPetBreed.style.display = 'block';
        hasError = true;
    }

    if (!petProfileForm.petDetails.value) {
        toastPetDetails.textContent = 'Pet\'s allergies/preferences are required.';
        toastPetDetails.style.display = 'block';
        hasError = true;
    }

    if (!petProfileForm.hireCaretaker.value) {
        toastHireCaretaker.textContent = '*Required field.';
        toastHireCaretaker.style.display = 'block';
        hasError = true;
    }

    if (!petProfileForm.careType.value) {
        toastCareType.textContent = 'Preferred care type required.';
        toastCareType.style.display = 'block';
        hasError = true;
    }

    if (!petProfileForm.profilePic.value) {
        toastProfilePic.textContent = 'Profile picture required.';
        toastProfilePic.style.display = 'block';
        hasError = true;
    }

    if (!hasError) {
        // Build FormData manually so we can control value conversion
        const formData = new FormData();

        formData.append('petName', petProfileForm.petName.value);
        formData.append('petBreed', petProfileForm.petBreed.value);
        formData.append('petDetails', petProfileForm.petDetails.value);

        // Convert hireCaretaker to integer
        const hireCaretakerValue = petProfileForm.hireCaretaker.value === 'yes' ? 1 : 0;
        formData.append('hireCaretaker', hireCaretakerValue);

        formData.append('careType', petProfileForm.careType.value);
        formData.append('petBio', petProfileForm.petBio.value);

        // Append the profile picture
        formData.append('profilePic', petProfileForm.profilePic.files[0]);

        try {
            const response = await fetch('http://localhost:3000/api/pet-profile', {
                method: 'POST',
                body: formData,
                credentials: 'include'  // Ensure session cookie is sent with request
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);  // Show success message
                petProfileForm.reset();  // Reset the form
            } else {
                alert(result.message);  // Show error message
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error saving pet profile.');
        }
    }

    // Hide toast messages after timeout
    setTimeout(() => {
        [toastPetName, toastPetBreed, toastPetDetails, toastHireCaretaker, toastCareType, toastProfilePic].forEach(toast => {
            toast.style.display = 'none';
        });
    }, 4000);
});
