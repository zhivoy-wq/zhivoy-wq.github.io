// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Existing code...

    // Smooth scrolling for navigation links (if on same page)
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const hero = document.querySelector('.hero');
        const scrollPosition = window.pageYOffset;
        hero.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
    });

    // Animate features on scroll
    const features = document.querySelectorAll('.feature');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    features.forEach(feature => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(30px)';
        feature.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(feature);
    });

    // Typing effect for hero text
    const heroText = document.querySelector('.hero h2');
    const text = heroText.textContent;
    heroText.textContent = '';
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            heroText.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    };
    typeWriter();

    // Random sparkle effect
    setInterval(() => {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'absolute';
        sparkle.style.width = '2px';
        sparkle.style.height = '2px';
        sparkle.style.background = '#ffd700';
        sparkle.style.borderRadius = '50%';
        sparkle.style.left = Math.random() * 100 + 'vw';
        sparkle.style.top = Math.random() * 100 + 'vh';
        sparkle.style.animation = 'sparkle 1s linear';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }, 200);

    // Add sparkle animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sparkle {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0); }
        }
    `;
    document.head.appendChild(style);

    // Authentication logic
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeBtns = document.querySelectorAll('.close');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Show modals
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'block';
    });

    // Close modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });

    // Switch between modals
    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    });

    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });

    // Handle registration
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(user => user.email === email)) {
            alert('User already exists!');
            return;
        }

        // Register user
        let balance = 1000;
        if (username === 'admin' && password === 'adminpass') {
            balance = 999999;
        } else if (username === 'admin') {
            alert('Invalid admin credentials!');
            return;
        }
        users.push({ email, username, password, balance, gamesPlayed: 0 });
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify({ email, username }));

        alert(`Registration successful! You start with ${balance} credits.`);
        registerModal.style.display = 'none';
        updateUI();
    });

    // Handle login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify({ email: user.email, username: user.username }));
            alert('Login successful!');
            loginModal.style.display = 'none';
            updateUI();
        } else {
            alert('Invalid credentials!');
        }
    });

    // Update UI based on login status
    function updateUI() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === currentUser.email);
            const balance = user ? user.balance : 0;
            document.getElementById('auth-buttons').innerHTML = `
                <span>Welcome, ${currentUser.username}!</span>
                <span>Balance: ${balance} credits</span>
                <button id="logout-btn" class="btn-small">Logout</button>
            `;
            if (currentUser.username === 'admin') {
                document.getElementById('auth-buttons').innerHTML += `<a href="admin.html" class="btn-small">Admin</a>`;
            }
            document.getElementById('logout-btn').addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                updateUI();
            });
        } else {
            document.getElementById('auth-buttons').innerHTML = `
                <button id="login-btn" class="btn-small">Login</button>
                <button id="register-btn" class="btn-small">Register</button>
            `;
            // Reattach event listeners
            document.getElementById('login-btn').addEventListener('click', () => {
                loginModal.style.display = 'block';
            });
            document.getElementById('register-btn').addEventListener('click', () => {
                registerModal.style.display = 'block';
            });
        }
    }

    // Initialize UI
    updateUI();
});
