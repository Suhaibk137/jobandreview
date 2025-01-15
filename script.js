// script.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('feedbackForm');
    const starRating = document.getElementById('starRating');
    const stars = starRating.getElementsByClassName('fa-star');
    const satisfactionRating = document.getElementById('satisfactionRating');
    const successMessage = document.getElementById('successMessage');

    // Check if feedback was already submitted
    if (localStorage.getItem('feedbackSubmitted') === 'true') {
        form.innerHTML = `
            <div class="already-submitted">
                You have already submitted feedback. Thank you for your response!
                <div class="job-assistance">
                    <p>Looking for career growth? 🚀</p>
                    <a href="http://www.eliteresumes.co" target="_blank" class="job-link">Check out Our Job Assistance Program</a>
                </div>
            </div>`;
        return;
    }

    // Google Sheet submission URL
    const scriptURL = 'https://script.google.com/macros/s/AKfycbzEOxCH9Z2AQMUDJskSj2SCeHJIb4n5RPJg9cPH-ZggR94lBB643_sGcFw3htVtvbZI/exec';

    // Star Rating Functionality
    starRating.addEventListener('click', function(e) {
        if (e.target.classList.contains('fa-star')) {
            const rating = e.target.getAttribute('data-rating');
            satisfactionRating.value = rating;
            
            // Update stars visual
            Array.from(stars).forEach(star => {
                const starRating = parseInt(star.getAttribute('data-rating'));
                if (starRating <= parseInt(rating)) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });

            document.getElementById('ratingError').textContent = '';
        }
    });

    // Form Validation and Submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check if already submitted
        if (localStorage.getItem('feedbackSubmitted') === 'true') {
            alert('You have already submitted feedback. Thank you!');
            return;
        }
        
        // Reset error messages
        clearErrors();
        
        // Validate required fields
        let isValid = true;
        
        // Name validation
        const name = document.getElementById('name');
        if (!name.value.trim()) {
            showError('nameError', 'Name is required');
            isValid = false;
        }
        
        // HR validation
        const hr = document.getElementById('hr');
        if (!hr.value) {
            showError('hrError', 'Please select an HR representative');
            isValid = false;
        }
        
        // Star rating validation
        if (!satisfactionRating.value) {
            showError('ratingError', 'Please provide a satisfaction rating');
            isValid = false;
        }
        
        if (isValid) {
            // Set current date
            const now = new Date();
            const formattedDate = now.toLocaleString();
            document.getElementById('submissionDate').value = formattedDate;

            // Create FormData object
            const formData = new FormData(form);

            // Show loading spinner
            const loadingSpinner = document.getElementById('loadingSpinner');
            form.style.display = 'none';
            loadingSpinner.classList.remove('hidden');

            // Submit to Google Sheets
            fetch(scriptURL, { method: 'POST', body: formData })
                .then(response => response.text())
                .then(text => {
                    let response;
                    try {
                        response = JSON.parse(text);
                    } catch (e) {
                        // If response isn't JSON, treat as success for backward compatibility
                        response = { status: 'success' };
                    }

                    if (response.status === 'error') {
                        throw new Error(response.message || 'Submission failed');
                    }
                    
                    console.log('Success!', response);
                    
                    // Mark as submitted in localStorage
                    localStorage.setItem('feedbackSubmitted', 'true');
                    
                    // Hide loading spinner and show success message
                    loadingSpinner.classList.add('hidden');
                    successMessage.classList.remove('hidden');
                    
                    // Reset form
                    form.reset();
                    Array.from(stars).forEach(star => star.classList.remove('active'));
                    satisfactionRating.value = '';
                    
                    // Replace form with submitted message
                    setTimeout(() => {
                        form.innerHTML = `
                            <div class="already-submitted">
                                You have already submitted feedback. Thank you for your response!
                                <div class="job-assistance">
                                    <p>Looking for career growth? 🚀</p>
                                    <a href="http://www.eliteresumes.co" target="_blank" class="job-link">Check out Our Job Assistance Program</a>
                                </div>
                            </div>`;
                        successMessage.classList.add('hidden');
                    }, 3000);
                })
                .catch(error => {
                    console.error('Error!', error.message);
                    // Hide loading spinner and show form again
                    loadingSpinner.classList.add('hidden');
                    form.style.display = 'block';
                    alert(error.message || 'There was an error submitting the form. Please try again.');
                });
        }
    });

    // Helper functions
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
    }

    function clearErrors() {
        const errorElements = document.getElementsByClassName('error-message');
        Array.from(errorElements).forEach(element => {
            element.textContent = '';
        });
    }
});
