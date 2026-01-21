// admin.js
document.addEventListener('DOMContentLoaded', function() {
    const auth = firebase.auth();
    const db = firebase.firestore();

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location = 'index.html';
            return;
        }
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.data().isAdmin) {
            window.location = 'index.html';
            return;
        }

        // Attach listeners
        document.getElementById('view-users-btn').addEventListener('click', viewUsers);
        document.getElementById('view-house-inventory-btn').addEventListener('click', viewHouseInventory);
        document.getElementById('manage-shop-btn').addEventListener('click', manageShop);
        document.getElementById('adjust-payouts-btn').addEventListener('click', adjustPayouts);
        document.getElementById('adjust-chances-btn').addEventListener('click', adjustChances);
        document.getElementById('view-lootboxes-btn').addEventListener('click', viewLootboxes);
        document.getElementById('create-lootbox-btn').addEventListener('click', createLootbox);
        document.getElementById('reset-data-btn').addEventListener('click', resetData);
        document.getElementById('export-data-btn').addEventListener('click', exportData);

        updateGameStats();
    });

    async function viewUsers() {
        const usersSnapshot = await db.collection('users').get();
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = '<h4>All Users:</h4><table><tr><th>Username</th><th>Email</th><th>Balance</th><th>Games</th><th>Actions</th></tr>';
        usersSnapshot.forEach(doc => {
            const user = doc.data();
            usersList.innerHTML += `
                <tr>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.balance}</td>
                    <td>${user.gamesPlayed || 0}</td>
                    <td>
                        <button onclick="adjustBalance('${doc.id}', 100)">+100</button>
                        <button onclick="adjustBalance('${doc.id}', -100)">-100</button>
                        <button onclick="viewUserInventory('${doc.id}')">View Inv</button>
                    </td>
                </tr>
            `;
        });
        usersList.innerHTML += '</table>';
    }

    async function adjustBalance(uid, amount) {
        const userRef = db.collection('users').doc(uid);
        await userRef.update({ balance: firebase.firestore.FieldValue.increment(amount) });
        viewUsers();
        updateGameStats();
    }

    async function updateGameStats() {
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        const totalBalance = usersSnapshot.docs.reduce((sum, doc) => sum + doc.data().balance, 0);
        const totalGames = usersSnapshot.docs.reduce((sum, doc) => sum + (doc.data().gamesPlayed || 0), 0);

        document.getElementById('game-stats').innerHTML = `
            <p>Total Users: ${totalUsers}</p>
            <p>Total Credits in Circulation: ${totalBalance}</p>
            <p>Total Games Played: ${totalGames}</p>
        `;
    }

    async function resetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
            // Delete all users (careful in prod!)
            const usersSnapshot = await db.collection('users').get();
            usersSnapshot.forEach(doc => doc.ref.delete());
            alert('All data reset!');
            location.reload();
        }
    }

    async function viewUserInventory(uid) {
        const userDoc = await db.collection('users').doc(uid).get();
        const user = userDoc.data();
        const inventory = user.inventory || [];
        alert(`Inventory for ${user.username}:\n${inventory.length ? inventory.map(item => item.name).join('\n') : 'Empty'}`);
    }

    async function viewHouseInventory() {
        // Assume houseInventory in DB; add if needed
        const houseDoc = await db.collection('house').doc('inventory').get();
        const inventory = houseDoc.data()?.items || [];
        const inventoryList = document.getElementById('inventory-list');
        inventoryList.innerHTML = '<h4>House Inventory:</h4>';
        if (inventory.length) {
            inventory.forEach(item => {
                inventoryList.innerHTML += `<div>${item.name} (Value: ${item.value})</div>`;
            });
        } else {
            inventoryList.innerHTML += '<p>Empty</p>';
        }
    }

    // Implement other functions similarly (manageShop, adjustPayouts, etc.) using DB
    // For example:
    async function manageShop() {
        // Fetch skins from DB, etc.
        alert('Manage shop functionality - implement with DB queries');
    }

    // ... Add remaining functions like adjustPayouts, viewLootboxes, etc., adapting to Firestore.
});
