// games.js
document.addEventListener('DOMContentLoaded', function() {
    const gameModal = document.getElementById('game-modal');
    const gameContainer = document.getElementById('game-container');
    const playBtns = document.querySelectorAll('.play-btn');

    playBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
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
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please login to play games!');
            return;
        }

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

        document.getElementById('spin-btn').addEventListener('click', () => {
            const bet = parseInt(document.getElementById('slots-bet').value) || 10;
            if (bet < 10) {
                alert('Minimum bet is 10 credits!');
                return;
            }
            deductCredits(bet);
            spinSlots(bet);
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
            reel1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            reel2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            reel3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            spins++;
            if (spins > 20) {
                clearInterval(spinInterval);
                const final1 = symbols[Math.floor(Math.random() * symbols.length)];
                const final2 = symbols[Math.floor(Math.random() * symbols.length)];
                const final3 = symbols[Math.floor(Math.random() * symbols.length)];
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

        document.getElementById('roll-btn').addEventListener('click', () => {
            const bet = parseInt(document.getElementById('dice-bet').value) || 10;
            const choice = document.getElementById('dice-choice').value;
            if (bet < 10) {
                alert('Minimum bet is 10 credits!');
                return;
            }
            deductCredits(bet);
            rollDice(bet, choice);
        });
    }

    function rollDice(bet, choice) {
        const die1 = document.getElementById('die1');
        const die2 = document.getElementById('die2');
        const result = document.getElementById('dice-result');

        const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        let rolls = 0;
        const rollInterval = setInterval(() => {
            die1.textContent = diceFaces[Math.floor(Math.random() * 6)];
            die2.textContent = diceFaces[Math.floor(Math.random() * 6)];
            rolls++;
            if (rolls > 10) {
                clearInterval(rollInterval);
                const final1 = Math.floor(Math.random() * 6) + 1;
                const final2 = Math.floor(Math.random() * 6) + 1;
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

        document.getElementById('spin-wheel-btn').addEventListener('click', () => {
            const betType = document.getElementById('roulette-bet-type').value.toLowerCase();
            const bet = parseInt(document.getElementById('roulette-bet').value) || 10;
            if (bet < 10) {
                alert('Minimum bet is 10 credits!');
                return;
            }
            deductCredits(bet);
            spinRoulette(bet, betType);
        });
    }

    function spinRoulette(bet, betType) {
        const wheel = document.getElementById('wheel');
        const result = document.getElementById('roulette-result');

        let spins = 0;
        const spinInterval = setInterval(() => {
            wheel.textContent = Math.floor(Math.random() * 37);
            spins++;
            if (spins > 30) {
                clearInterval(spinInterval);
                const winningNumber = Math.floor(Math.random() * 37);
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

        document.getElementById('start-crash-btn').addEventListener('click', () => {
            betAmount = parseInt(document.getElementById('crash-bet').value) || 10;
            if (betAmount < 10) {
                alert('Minimum bet is 10 credits!');
                return;
            }
            deductCredits(betAmount);
            startCrash();
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

            const crashPoint = Math.random() * 10 + 1; // Random crash between 1x and 11x

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

        document.getElementById('flip-btn').addEventListener('click', () => {
            const bet = parseInt(document.getElementById('coin-bet').value) || 10;
            const choice = document.getElementById('coin-choice').value;
            if (bet < 10) {
                alert('Minimum bet is 10 credits!');
                return;
            }
            deductCredits(bet);
            flipCoin(bet, choice);
        });
    }

    function flipCoin(bet, choice) {
        const coin = document.getElementById('coin');
        const result = document.getElementById('coin-result');

        let flips = 0;
        const flipInterval = setInterval(() => {
            coin.textContent = Math.random() > 0.5 ? '🪙' : '💰';
            flips++;
            if (flips > 10) {
                clearInterval(flipInterval);
                const outcome = Math.random() > 0.5 ? 'heads' : 'tails';
                coin.textContent = outcome === 'heads' ? '🪙' : '💰';

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
            <h3>📦 Lootbox</h3>
            <div class="lootbox-container">
                <div class="lootbox" id="lootbox">📦</div>
            </div>
            <button id="open-lootbox-btn" class="btn">Open Lootbox (Cost: 100 credits)</button>
            <p id="lootbox-result"></p>
        `;

        document.getElementById('open-lootbox-btn').addEventListener('click', () => {
            deductCredits(100);
            openLootbox();
        });
    }

    function openLootbox() {
        const lootbox = document.getElementById('lootbox');
        const result = document.getElementById('lootbox-result');

        lootbox.textContent = '🎁';
        setTimeout(() => {
            const rewards = ['💎 Rare Skin', '⭐ Common Skin', '🎨 Epic Skin', '🏆 Legendary Skin', '💰 500 Credits', '🎲 Bonus Game'];
            const reward = rewards[Math.floor(Math.random() * rewards.length)];
            lootbox.textContent = reward.split(' ')[0]; // Show emoji
            result.textContent = `You got: ${reward}!`;

            if (reward.includes('Credits')) {
                addCredits(500);
            }
            updateGamesPlayed();
        }, 1000);
    }

    function deductCredits(amount) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (users[userIndex].balance >= amount) {
            users[userIndex].balance -= amount;
            localStorage.setItem('users', JSON.stringify(users));
        } else {
            alert('Not enough credits!');
            throw new Error('Insufficient funds');
        }
    }

    function addCredits(amount) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        users[userIndex].balance += amount;
        localStorage.setItem('users', JSON.stringify(users));
    }

    function updateGamesPlayed() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        users[userIndex].gamesPlayed += 1;
        localStorage.setItem('users', JSON.stringify(users));
    }
});
