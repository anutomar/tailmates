// This is caretaker-profile.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("caretakerProfileForm");
    const availabilityRadioButtons = document.getElementsByName("available");
    const availabilityToast = document.getElementById("toastCaretakerAvailability");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Check availability
        let availability;
        for (const radioButton of availabilityRadioButtons) {
            if (radioButton.checked) {
                // Send 1 for "yes" (available), 0 for "no" (not available)
                availability = radioButton.value === 'yes' ? 1 : 0;
                break;
            }
        }


        // Show toast if availability is not selected
        if (!availability) {
            availabilityToast.style.display = "block";
            availabilityToast.textContent = "Please select your availability status.";
            setTimeout(() => {
                availabilityToast.style.display = "none";
            }, 3000);
            return;
        }

        // Collect other form data
        const experience = form.experience.value;
        const careType = form.careType.value;
        const services = [];
        const petTypes = [];
        const bio = form.caretakerBio.value;
        const charges = form.charges.value;
        const profilePic = document.getElementById("profilePic").files[0];

        // Handle services and petTypes checkboxes
        form.querySelectorAll('input[name="services"]:checked').forEach((checkbox) => {
            services.push(checkbox.value);
        });
        form.querySelectorAll('input[name="petTypes"]:checked').forEach((checkbox) => {
            petTypes.push(checkbox.value);
        });

        // Prepare FormData
        const formData = new FormData();
        formData.append("availability", availability);
        formData.append("experience", experience);
        formData.append("careType", careType);
        formData.append("services", JSON.stringify(services));
        formData.append("petTypes", JSON.stringify(petTypes));
        formData.append("bio", bio);
        formData.append("charges", charges);
        if (profilePic) {
            formData.append("profilePic", profilePic);
        }

        // Show loader
        document.getElementById("loader").style.display = "block";

        try {
            const response = await fetch('http://localhost:3000/api/caretaker-profile', {
                method: 'POST',
                body: formData // Do not set Content-Type manually when using FormData
            });

            const result = await response.json();

            if (response.status === 201) {
                alert("Caretaker profile saved successfully!");
            } else {
                alert("Failed to save caretaker profile. Please try again.");
            }
        } catch (err) {
            console.error("Error saving caretaker profile:", err);
            alert("Error saving profile. Please try again.");
        } finally {
            // Hide loader and reset form
            document.getElementById("loader").style.display = "none";
            form.reset();
        }
    });
});
