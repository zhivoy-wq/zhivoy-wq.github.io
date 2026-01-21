// script.js
document.addEventListener('DOMContentLoaded', function() {
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

    // Firebase Initialization
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    };
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

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
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        try {
            // Validate input
            if (!email || !username || !password) throw new Error('All fields required');
            if (password.length < 6) throw new Error('Password must be at least 6 characters');

            // Check if username exists (global)
            const usernameQuery = await db.collection('users').where('username', '==', username).get();
            if (!usernameQuery.empty) {
                alert('Username already taken!');
                return;
            }

            // Create user
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            let balance = 1000;
            let isAdmin = false;
            if (username === 'admin' && password === 'adminpass') {  // Temp; remove after first admin creation
                isAdmin = true;
                balance = 999999;
            } else if (username === 'admin') {
                alert('Invalid admin credentials!');
                return;
            }

            // Store in DB
            await db.collection('users').doc(user.uid).set({
                email,
                username,
                balance,
                gamesPlayed: 0,
                inventory: [],
                isAdmin
            });

            alert(`Registration successful! You start with ${balance} credits.`);
            registerModal.style.display = 'none';
        } catch (error) {
            alert(error.message);
        }
    });

    // Handle login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            alert('Login successful!');
            loginModal.style.display = 'none';
        } catch (error) {
            alert(error.message);
        }
    });

    // Show inventory
    async function showInventory() {
        const user = auth.currentUser;
        if (!user) return;
        const userDoc = await db.collection('users').doc(user.uid).get();
        const inventory = userDoc.data().inventory || [];
        let msg = `Inventory:\n`;
        if (inventory.length) {
            inventory.forEach(item => msg += `- ${item.name} (${item.value})\n`);
        } else {
            msg += 'Empty';
        }
        alert(msg);
    }

    // Update UI based on login status
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (!userDoc.exists) return;
            const userData = userDoc.data();
            document.getElementById('auth-buttons').innerHTML = `
                <span>Welcome, ${userData.username}!</span>
                <span>Balance: ${userData.balance} credits</span>
                <button id="inventory-btn" class="btn-small">Inventory</button>
                <button id="logout-btn" class="btn-small">Logout</button>
            `;
            if (userData.isAdmin) {
                document.getElementById('auth-buttons').innerHTML += `<a href="admin.html" class="btn-small">Admin</a>`;
            }
            document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());
            document.getElementById('inventory-btn').addEventListener('click', showInventory);
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
    });
});
