// Constants for LocalStorage keys
const USERS_KEY = "users"; // Key to store all users
const CURRENT_USER_KEY = "currentUser"; // Key to store the logged-in user

// Utility function to get users from LocalStorage
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

// Utility function to save users to LocalStorage
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Register a new user
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase(); // Normalize email to lowercase
    const password = document.getElementById('password').value.trim();
    const btcAddress = document.getElementById('btcAddress').value.trim();

    const users = getUsers();

    // Check if user already exists
    if (users.some(user => user.email === email)) {
        alert('User already exists! Please log in.');
        return;
    }

    // Add new user
    users.push({ email, password, btcAddress, balance: 0 });
    saveUsers(users);

    alert('Registration successful! Please log in.');
    document.getElementById('registerForm').reset();
});

// Login a user
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim().toLowerCase(); // Normalize email to lowercase
    const password = document.getElementById('loginPassword').value.trim();

    const users = getUsers();
    console.log("Login Attempt:", { email, password }); // Debugging
    console.log("Registered Users:", users); // Debugging

    const user = users.find(user => user.email === email && user.password === password);
    console.log("Matching User Found:", user); // Debugging

    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        alert('Login successful! Redirecting to the homepage...');
        window.location.href = 'home.html';
    } else {
        alert('Invalid credentials. Please try again.');
    }
});

// Protect the home page (home.html)
if (window.location.pathname.includes('home.html')) {
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

    if (!currentUser) {
        alert('You are not logged in!');
        window.location.href = 'index.html';
    } else {
        document.getElementById('userBalance').textContent = `${currentUser.balance} BTC`;

        // Logout functionality
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem(CURRENT_USER_KEY);
            alert('You have logged out.');
            window.location.href = 'index.html';
        });

        // Simulate mining
        setInterval(() => {
            const users = getUsers();
            const userIndex = users.findIndex(user => user.email === currentUser.email);
            if (userIndex > -1) {
                users[userIndex].balance += 0.1; // Increment balance by 0.1 BTC/hour
                saveUsers(users);
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex])); // Update currentUser
                document.getElementById('userBalance').textContent = `${users[userIndex].balance} BTC`;
            }
        }, 3600000); // 1-hour interval
    }
}

// Handle withdrawals
document.getElementById('withdrawBtn')?.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    const amount = parseFloat(prompt('Enter withdrawal amount (BTC):'));

    if (amount <= 0 || isNaN(amount)) {
        alert('Invalid amount entered.');
        return;
    }

    if (currentUser.balance >= amount) {
        currentUser.balance -= amount;
        alert(`Withdrawal of ${amount} BTC successful! Funds sent to your BTC address.`);
        const users = getUsers();
        const userIndex = users.findIndex(user => user.email === currentUser.email);
        if (userIndex > -1) {
            users[userIndex].balance = currentUser.balance;
            saveUsers(users);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
            document.getElementById('userBalance').textContent = `${currentUser.balance} BTC`;
        }
    } else {
        alert('Insufficient balance.');
    }
});
