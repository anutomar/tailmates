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