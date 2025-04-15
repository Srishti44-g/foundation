document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;

    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        body.classList.toggle('nav-open');
        hamburger.setAttribute('aria-expanded', 
            hamburger.classList.contains('active'));
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        body.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger?.addEventListener('click', toggleMenu);

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !e.target.closest('.nav-menu') && 
            !e.target.closest('.hamburger')) {
            closeMenu();
        }
    });
});

// Navigation elements
const navOverlay = document.querySelector('.nav-overlay');
const nav = document.querySelector('.main-nav');
const sections = document.querySelectorAll('section[id]');

// Add shadow to nav on scroll
window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 0 ? '0 2px 10px rgba(0,0,0,0.1)' : 'none';
});

// Active link highlight on scroll
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        const link = document.querySelector(`.nav-links a[href*=${sectionId}]`);
        if (link) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });
});

// Generic form handler for all forms
function initializeFormHandler(formConfig) {
    const { formId, successMessage, submittingText } = formConfig;
    const formElement = document.querySelector(`#${formId}`);

    if (!formElement) return;

    function resetFormCompletely(form) {
        // Reset the form fields
        form.reset();
        
        // Clear any validation states
        form.querySelectorAll('.is-valid, .is-invalid').forEach(element => {
            element.classList.remove('is-valid', 'is-invalid');
        });
        
        // Reset any custom input states
        form.querySelectorAll('input, textarea').forEach(element => {
            element.value = '';
            element.style.borderColor = '';
            element.nextElementSibling?.classList.remove('active');
        });
        
        // Reset select elements to default
        form.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        // Clear any error messages
        form.querySelectorAll('.error-message').forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });
    }

    formElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const status = form.querySelector('#formStatus');
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerText;

        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner"></span> ${submittingText || 'Submitting...'}`;
        
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form)
            });

            if (response.ok) {
                // Success feedback
                status.className = 'form-status success';
                status.innerHTML = `<i class="fas fa-check-circle"></i> ${successMessage}`;
                
                // Complete form reset
                resetFormCompletely(form);

                // Animate success message
                status.style.opacity = '1';
                status.style.transform = 'translateY(0)';
                
                setTimeout(() => {
                    status.style.opacity = '0';
                    status.style.transform = 'translateY(-10px)';
                }, 3000);
            } else {
                // Error feedback
                status.className = 'form-status error';
                status.innerHTML = `<i class="fas fa-exclamation-circle"></i> Submission failed. Please try again.`;
            }
        } catch (error) {
            console.error(`${formId} submission error:`, error);
            status.className = 'form-status error';
            status.innerHTML = `<i class="fas fa-exclamation-circle"></i> An error occurred. Please try again.`;
        } finally {
            submitButton.disabled = false;
            submitButton.innerText = originalText;
            status.style.display = 'block';
        }
    });
}

// Initialize all forms when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const forms = [
        {
            formId: 'contactForm',
            successMessage: 'Thank you! Your message has been sent successfully.',
            submittingText: 'Sending message...'
        },
        {
            formId: 'volunteerForm',
            successMessage: 'Thank you for volunteering! We will contact you soon.',
            submittingText: 'Submitting application...'
        },
        {
            formId: 'visitForm',
            successMessage: 'Visit scheduled successfully! We look forward to meeting you.',
            submittingText: 'Scheduling visit...'
        }
    ];

    forms.forEach(formConfig => initializeFormHandler(formConfig));
});

// Language switching functionality
function changeLanguage(langCode) {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
        
        // Update button states
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === langCode);
        });
        
        // Save preference
        localStorage.setItem('preferred_language', langCode);
    }
}

// Apply saved language preference on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang) {
        setTimeout(() => changeLanguage(savedLang), 1000);
    }
});

// Wait for Google Translate to initialize
document.addEventListener('DOMContentLoaded', function() {
    let checkCount = 0;
    const maxChecks = 10;
    
    const initTranslation = setInterval(() => {
        if (checkCount >= maxChecks) {
            clearInterval(initTranslation);
            console.error('Google Translate failed to load');
            return;
        }
        
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            clearInterval(initTranslation);
            // Initialize translation
            const savedLang = localStorage.getItem('preferred_language') || 'en';
            changeLanguage(savedLang);
        }
        checkCount++;
    }, 1000);
});

// Error handling
window.addEventListener('error', function(e) {
    if (e.filename && e.filename.includes('translate')) {
        console.error('Translation error:', e);
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.style.opacity = '0.5';
            btn.disabled = true;
        });
    }
});