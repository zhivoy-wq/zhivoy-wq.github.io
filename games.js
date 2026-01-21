// games.js
document.addEventListener('DOMContentLoaded', function() {
    const gameModal = document.getElementById('game-modal');
    const gameContainer = document.getElementById('game-container');
    const playBtns = document.querySelectorAll('.play-btn');

    playBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const user = firebase.auth().currentUser;
            if (!user) {
                alert('Please login to play games!');
                return;
            }
            const game = btn.getAttribute('data-game');
            loadGame(game);
            gameModal.style.display = 'block';
        });
    });

    document.querySelector('.close').addEventListener('click', () => {
        gameModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == gameModal) {
            gameModal.style.display = 'none';
        }
    });

    function loadGame(game) {
        gameContainer.innerHTML = '';
        switch(game) {
            case 'slots':
                loadSlots();
                break;
            case 'dice':
                loadDice();
                break;
            case 'roulette':
                loadRoulette();
                break;
            case 'crash':
                loadCrash();
                break;
            case 'coinflip':
                loadCoinflip();
                break;
            case 'lootbox':
                loadLootbox();
                break;
        }
    }

    function loadSlots() {
        gameContainer.innerHTML = `
            <h3>🎰 Slots</h3>
            <div class="slots-container">
                <div class="reel" id="reel1">🍒</div>
                <div class="reel" id="reel2">🍋</div>
                <div class="reel" id="reel3">🍇</div>
            </div>
            <input type="number" id="slots-bet" placeholder="Bet amount" min="10" max="1000">
            <button id="spin-btn" class="btn">Spin (Cost: 10 credits)</button>
            <p id="slots-result"></p>
        `;

        document.getElementById('spin-btn').addEventListener('click', async () => {
            const bet = parseInt(document.getElementById('slots-bet').value) || 10;
            if (bet < 10) {
                alert('Minimum bet is 10 credits!');
                return;
            }
            try {
                await deductCredits(bet);
                spinSlots(bet);
            } catch (err) {
                alert(err.message);
            }
        });
    }

    function spinSlots(bet) {
        const symbols = ['🍒', '🍋', '🍇', '🍊', '⭐', '💎'];
        const reel1 = document.getElementById('reel1');
        const reel2 = document.getElementById('reel2');
        const reel3 = document.getElementById('reel3');
        const result = document.getElementById('slots-result');

        let spins = 0;
        const spinInterval = setInterval(() => {
            reel1.textContent = symbols[getSecureRandom(0, symbols.length - 1)];
            reel2.textContent = symbols[getSecureRandom(0, symbols.length - 1)];
            reel3.textContent = symbols[getSecureRandom(0, symbols.length - 1)];
            spins++;
            if (spins > 20) {
                clearInterval(spinInterval);
                const final1 = symbols[getSecureRandom(0, symbols.length - 1)];
                const final2 = symbols[getSecureRandom(0, symbols.length - 1)];
                const final3 = symbols[getSecureRandom(0, symbols.length - 1)];
                reel1.textContent = final1;
                reel2.textContent = final2;
                reel3.textContent = final3;

                let winnings = 0;
                if (final1 === final2 && final2 === final3) {
                    winnings = bet * 10; // Jackpot
                    result.textContent = `JACKPOT! You won ${winnings} credits!`;
                } else if (final1 === final2 || final2 === final3 || final1 === final3) {
                    winnings = bet * 2;
                    result.textContent = `Two of a kind! You won ${winnings} credits!`;
                } else {
                    result.textContent = `No win this time. Better luck next spin!`;
                }

                if (winnings > 0) {
                    addCredits(winnings);
                }
                updateGamesPlayed();
            }
        }, 100);
    }

    function loadDice() {
        gameContainer.innerHTML = `
            <h3>🎲 Dice</h3>
            <p>Guess if the roll will be over or under 7.</p>
            <div class="dice-container">
                <div class="die" id="die1">⚀</div>
                <div class="die" id="die2">⚀</div>
            </div>
            <select id="dice-choice">
                <option value="over">Over 7</option>
                <option value="under">Under 7</option>
            </select>
            <input type="number" id="dice-bet" placeholder="Bet amount" min="10" max="1000">
            <button id="roll-btn" class="btn">Roll Dice (Cost: 10 credits)</button>
            <p id="dice-result"></p>
        `;

        document.getElementById('roll-btn').addEventListener('click', async () => {
            const bet = parseInt(document.getElementById('dice-bet').value) || 10;
            const choice = document.getElementById('dice-choice').value;
            if (bet < 10) {
                alert('Minimum bet is 10 credits!');
                return;
            }
            try {
                await deductCredits(bet);
                rollDice(bet, choice);
            } catch (err) {
                alert(err.message);
            }
        });
    }

    function rollDice(bet, choice) {
        const die1 = document.getElementById('die1');
        const die2 = document.getElementById('die2');
        const result = document.getElementById('dice-result');

        const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        let rolls = 0;
        const rollInterval = setInterval(() => {
            die1.textContent = diceFaces[getSecureRandom(0, 5)];
            die2.textContent = diceFaces[getSecureRandom(0, 5)];
            rolls++;
            if (rolls > 10) {
                clearInterval(rollInterval);
                const final1 = getSecureRandom(1, 6);
                const final2 = getSecureRandom(1, 6);
                const sum = final1 + final2;
                die1.textContent = diceFaces[final1 - 1];
                die2.textContent = diceFaces[final2 - 1];

                let win = false;
                if ((choice === 'over' && sum > 7) || (choice === 'under' && sum < 7)) {
                    win = true;
                }

                if (win) {
                    const winnings = bet * 2;
                    result.textContent = `You rolled ${sum}. You win ${winnings} credits!`;
                    addCredits(winnings);
                } else {
                    result.textContent = `You rolled ${sum}. You lose!`;
                }
                updateGamesPlayed();
            }
        }, 200);
    }

    function loadRoulette() {
        gameContainer.innerHTML = `
            <h3>🎡 Roulette</h3>
            <div class="roulette-wheel">
                <div class="wheel" id="wheel">0</div>
            </div>
            <p>Bet on a number (0-36) or color.</p>
            <input type="text" id="roulette-bet-type" placeholder="Number or 'red'/'black'">
            <input type="number" id="roulette-bet" placeholder="Bet amount" min="10" max="1000">
            <button id="spin-wheel-btn" class="btn">Spin Wheel (Cost: 10 credits)</button>
            <p id="roulette-result"></p>
        `;

        document.getElementById('spin-wheel-btn').addEventListener('click', async () => {
            const betType = document.getElementById('roulette-bet-type').value.toLowerCase();
            const bet = parseInt(document.getElementById('roulette-bet').value) || 10;
            if (bet < 10) {
                alert('Minimum bet is 10 credits!');
                return;
            }
            try {
                await deductCredits(bet);
                spinRoulette(bet, betType);
            } catch (err) {
                alert(err.message);
            }
        });
    }

    function spinRoulette(bet, betType) {
        const wheel = document.getElementById('wheel');
        const result = document.getElementById('roulette-result');

        let spins = 0;
        const spinInterval = setInterval(() => {
            wheel.textContent = getSecureRandom(0, 36);
            spins++;
            if (spins > 30) {
                clearInterval(spinInterval);
                const winningNumber = getSecureRandom(0, 36);
                wheel.textContent = winningNumber;

                let win = false;
                if (!isNaN(betType) && parseInt(betType) === winningNumber) {
                    win = true; // Exact number match
                } else if (betType === 'red' && [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(winningNumber)) {
                    win = true;
                } else if (betType === 'black' && [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35].includes(winningNumber)) {
                    win = true;
                }

                if (win) {
                    const winnings = bet * (isNaN(betType) ? 2 : 35); // 35x for number, 2x for color
                    result.textContent = `The ball landed on ${winningNumber}. You win ${winnings} credits!`;
                    addCredits(winnings);
                } else {
                    result.textContent = `The ball landed on ${winningNumber}. You lose!`;
                }
                updateGamesPlayed();
            }
        }, 100);
    }

    function loadCrash() {
        gameContainer.innerHTML = `
            <h3>💥 Crash</h3>
            <div class="crash-container">
                <div class="multiplier" id="multiplier">1.00x</div>
                <button id="cash-out-btn" class="btn" disabled>Cash Out</button>
            </div>
            <input type="number" id="crash-bet" placeholder="Bet amount" min="10" max="1000">
            <button id="start-crash-btn" class="btn">Start Game (Cost: 10 credits)</button>
            <p id="crash-result"></p>
        `;

        let gameRunning = false;
        let currentMultiplier = 1.00;
        let betAmount = 0;

        document.getElementById('start-crash-btn').addEventListener('click', async () => {
            betAmount = parseInt(document.getElementById('crash-bet').value) || 10;
            if (betAmount < 10) {
                alert('Minimum bet is 10 credits!');
                return;
            }
            try {
                await deductCredits(betAmount);
                startCrash();
            } catch (err) {
                alert(err.message);
            }
        });

        document.getElementById('cash-out-btn').addEventListener('click', () => {
            if (gameRunning) {
                const winnings = Math.floor(betAmount * currentMultiplier);
                addCredits(winnings);
                document.getElementById('crash-result').textContent = `Cashed out at ${currentMultiplier.toFixed(2)}x! You won ${winnings} credits!`;
                gameRunning = false;
                document.getElementById('cash-out-btn').disabled = true;
                updateGamesPlayed();
            }
        });

        function startCrash() {
            gameRunning = true;
            currentMultiplier = 1.00;
            document.getElementById('multiplier').textContent = '1.00x';
            document.getElementById('cash-out-btn').disabled = false;
            document.getElementById('crash-result').textContent = '';

            const crashPoint = getSecureRandomFloat(1, 11); // Random crash between 1x and 11x

            const gameInterval = setInterval(() => {
                currentMultiplier += 0.01;
                document.getElementById('multiplier').textContent = currentMultiplier.toFixed(2) + 'x';

                if (currentMultiplier >= crashPoint) {
                    clearInterval(gameInterval);
                    gameRunning = false;
                    document.getElementById('cash-out-btn').disabled = true;
                    document.getElementById('crash-result').textContent = `Crashed at ${currentMultiplier.toFixed(2)}x! You lose!`;
                    updateGamesPlayed();
                }
            }, 100);
        }
    }

    function loadCoinflip() {
        gameContainer.innerHTML = `
            <h3>🪙 Coinflip</h3>
            <div class="coin-container">
                <div class="coin" id="coin">🪙</div>
            </div>
            <select id="coin-choice">
                <option value="heads">Heads</option>
                <option value="tails">Tails</option>
            </select>
            <input type="number" id="coin-bet" placeholder="Bet amount" min="10" max="1000">
            <button id="flip-btn" class="btn">Flip Coin (Cost: 10 credits)</button>
            <p id="coin-result"></p>
        `;

        document.getElementById('flip-btn').addEventListener('click', async () => {
            const bet = parseInt(document.getElementById('coin-bet').value) || 10;
            const choice = document.getElementById('coin-choice').value;
            if (bet < 10) {
                alert('Minimum bet is 10 credits!');
                return;
            }
            try {
                await deductCredits(bet);
                flipCoin(bet, choice);
            } catch (err) {
                alert(err.message);
            }
        });
    }

    function flipCoin(bet, choice) {
        const coin = document.getElementById('coin');
        const result = document.getElementById('coin-result');

        let flips = 0;
        const flipInterval = setInterval(() => {
            coin.textContent = getSecureRandom(0, 1) === 0 ? 'Heads' : 'Tails'; // Temporary display
            flips++;
            if (flips > 10) {
                clearInterval(flipInterval);
                const outcome = getSecureRandom(0, 1) === 0 ? 'heads' : 'tails';
                coin.textContent = outcome.charAt(0).toUpperCase() + outcome.slice(1);

                if (outcome === choice) {
                    const winnings = bet * 2;
                    result.textContent = `It's ${outcome}! You win ${winnings} credits!`;
                    addCredits(winnings);
                } else {
                    result.textContent = `It's ${outcome}! You lose!`;
                }
                updateGamesPlayed();
            }
        }, 200);
    }

    function loadLootbox() {
        gameContainer.innerHTML = `
            <h3>📦 Lootboxes</h3>
            <p>Open a mystery box for rewards!</p>
            <button id="open-lootbox-btn" class="btn">Open Lootbox (Cost: 100 credits)</button>
            <p id="lootbox-result"></p>
        `;

        document.getElementById('open-lootbox-btn').addEventListener('click', async () => {
            const cost = 100;
            try {
                await deductCredits(cost);
                openLootbox();
            } catch (err) {
                alert(err.message);
            }
        });
    }

    async function openLootbox() {
        const result = document.getElementById('lootbox-result');
        // Example rewards (store in DB for real)
        const rewards = ['Common Skin (50)', 'Rare Skin (500)', 'Epic Skin (1000)', 'Legendary Skin (5000)'];
        const reward = rewards[getSecureRandom(0, rewards.length - 1)];

        // Add to inventory
        const user = firebase.auth().currentUser;
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        await userRef.update({
            inventory: firebase.firestore.FieldValue.arrayUnion({ name: reward.split(' (')[0], value: parseInt(reward.match(/\d+/)[0]) })
        });

        result.textContent = `You got: ${reward}!`;
        updateGamesPlayed();
    }

    // Firebase balance functions
    async function deductCredits(amount) {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('Not logged in');
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        await firebase.firestore().runTransaction(async (transaction) => {
            const doc = await transaction.get(userRef);
            if (!doc.exists) throw new Error('User not found');
            const currentBalance = doc.data().balance;
            if (currentBalance < amount) throw new Error('Insufficient funds');
            transaction.update(userRef, { balance: currentBalance - amount });
        });
    }

    async function addCredits(amount) {
        const user = firebase.auth().currentUser;
        if (!user) return;
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        await userRef.update({ balance: firebase.firestore.FieldValue.increment(amount) });
    }

    async function updateGamesPlayed() {
        const user = firebase.auth().currentUser;
        if (!user) return;
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        await userRef.update({ gamesPlayed: firebase.firestore.FieldValue.increment(1) });
    }

    // Secure random (better than Math.random)
    function getSecureRandom(min, max) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return Math.floor((array[0] / 0xFFFFFFFF) * (max - min + 1)) + min;
    }

    function getSecureRandomFloat(min, max) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return (array[0] / 0xFFFFFFFF) * (max - min) + min;
    }
});
