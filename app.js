// Constants for localStorage keys
const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";
const MINING_STATUS_KEY = "miningStatus";
const MINING_END_TIME_KEY = "miningEndTime";

// Utility functions
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Protect the home page
if (window.location.pathname.includes('home.html')) {
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

    if (!currentUser) {
        alert('You are not logged in!');
        window.location.href = 'index.html';
    } else {
        // Display user balance
        document.getElementById('userBalance').textContent = `${currentUser.balance} BTC`;

        // Logout functionality
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem(CURRENT_USER_KEY);
            alert('You have logged out.');
            window.location.href = 'index.html';
        });

        // Handle start mining functionality
        const startMiningBtn = document.getElementById('startMiningBtn');
        const miningStatus = JSON.parse(localStorage.getItem(MINING_STATUS_KEY));
        const miningEndTime = JSON.parse(localStorage.getItem(MINING_END_TIME_KEY));

        if (miningStatus && Date.now() < miningEndTime) {
            startMiningBtn.textContent = "Mining in Progress...";
            startMiningBtn.disabled = true;
            startMining(miningEndTime - Date.now()); // Continue remaining time
        } else {
            localStorage.removeItem(MINING_STATUS_KEY);
            localStorage.removeItem(MINING_END_TIME_KEY);
            startMiningBtn.textContent = "Start Mining";
            startMiningBtn.disabled = false;
        }

        startMiningBtn.addEventListener('click', () => {
            const endTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            localStorage.setItem(MINING_STATUS_KEY, true);
            localStorage.setItem(MINING_END_TIME_KEY, endTime);
            startMiningBtn.textContent = "Mining in Progress...";
            startMiningBtn.disabled = true;
            startMining(endTime - Date.now()); // Start mining for 24 hours
            displayHashKeys(); // Start displaying hash keys when mining begins
        });

        // Handle withdrawal functionality
        document.getElementById('withdrawBtn').addEventListener('click', () => {
            const amount = parseFloat(prompt("Enter withdrawal amount (BTC):"));

            if (isNaN(amount) || amount <= 0) {
                alert('Please enter a valid amount.');
                return;
            }

            if (currentUser.balance >= amount) {
                currentUser.balance -= amount; // Deduct the amount from user's balance
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
                alert('Insufficient balance!');
            }
        });
    }
}

// Start mining function with tiered rewards based on user index
function startMining(duration) {
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    const users = getUsers();

    // First user gets 0.1 BTC/hour
    const baseBTC = 0.1; // 0.1 BTC per hour for the first user
    const secondsInAnHour = 3600; // 1 hour = 3600 seconds
    const btcPerSecondForFirstUser = baseBTC / secondsInAnHour; // Calculate BTC per second for the first user

    const currentUserIndex = users.findIndex(user => user.email === currentUser.email);
    let btcPerSecond = btcPerSecondForFirstUser; // Start with the first user’s reward

    // Reduce BTC reward by 10% for each subsequent user
    for (let i = 1; i < currentUserIndex; i++) {
        btcPerSecond *= 0.9; // Each subsequent user gets 90% of the previous user's BTC per second
    }

    // Set the interval to add BTC every second
    const miningInterval = setInterval(() => {
        const userIndex = users.findIndex(user => user.email === currentUser.email);

        if (userIndex > -1) {
            users[userIndex].balance += btcPerSecond; // Add small fraction of BTC every second
            saveUsers(users);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex])); // Update current user
            document.getElementById('userBalance').textContent = `${users[userIndex].balance.toFixed(6)} BTC`;
        }
    }, 1000); // 1 second interval to add BTC

    // Stop mining after 24 hours
    setTimeout(() => {
        clearInterval(miningInterval);
        localStorage.removeItem(MINING_STATUS_KEY);
        localStorage.removeItem(MINING_END_TIME_KEY);
        alert("Mining session ended. Please click 'Start Mining' to continue.");
        document.getElementById('startMiningBtn').textContent = "Start Mining";
        document.getElementById('startMiningBtn').disabled = false;
    }, duration);
}

// Simulate mining hash keys and display them
function displayHashKeys() {
    const hashContainer = document.createElement('div');
    hashContainer.id = 'hashContainer';
    document.body.appendChild(hashContainer);

    const hashDisplay = document.createElement('p');
    hashDisplay.id = 'hashDisplay';
    hashContainer.appendChild(hashDisplay);

    // Generate random hash-like strings
    const hashInterval = setInterval(() => {
        const randomHash = generateRandomHash();
        document.getElementById('hashDisplay').textContent = `Mining: ${randomHash}`;

    }, 500); // Update every 0.5 seconds

    // Stop generating hashes after 24 hours
    setTimeout(() => {
        clearInterval(hashInterval);
        hashContainer.remove(); // Remove the hash display after mining stops
    }, 24 * 60 * 60 * 1000); // Stop after 24 hours
}

// Generate a random hash string that looks like a real mining hash
function generateRandomHash() {
    const characters = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
        hash += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return hash;
}
