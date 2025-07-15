document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.querySelector('.memory-game');
    const movesCounterElement = document.getElementById('moves-counter');
    const timerElement = document.getElementById('time-elapsed');
    const starRatingElement = document.getElementById('star-rating');
    const modal = document.getElementById('game-over-modal');
    const restartButton = document.getElementById('restart-game-btn');
    const finalMovesElement = document.getElementById('final-moves');
    const finalTimeElement = document.getElementById('final-time');
    const modalStarRatingElement = document.getElementById('modal-star-rating');

    // Define the card symbols and the game configuration
    const cardSymbols = ['❤️', '💪', '🌙', '🤦‍♂️', '😡', '😏', '💀', '📊'];
    const cardsArray = [...cardSymbols, ...cardSymbols, ...cardSymbols, ...cardSymbols]; // 16 cards (4x4 grid)

    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let matchesFound = 0;
    let timerInterval;
    let currentStars = 3;

    // Define thresholds for star rating (adjust as needed for game difficulty)
    const STAR_THRESHOLD_2 = 20; // 2 stars if moves >= 20
    const STAR_THRESHOLD_1 = 30; // 1 star if moves >= 30

    // --- Game Setup and Initialization ---

    function shuffleCards(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[i]] = [array[i], array[i]];
        }
    }

    function createCards() {
        shuffleCards(cardsArray);
        gameBoard.innerHTML = '';
        cardsArray.forEach((symbol, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memory-card');
            cardElement.dataset.framework = symbol;
            cardElement.innerHTML = `
                <div class="front-face">${symbol}</div>
                <div class="back-face"></div>
            `;
            cardElement.addEventListener('click', flipCard);
            gameBoard.appendChild(cardElement);
        });
    }

    function resetGame() {
        // Reset game state
        moves = 0;
        matchesFound = 0;
        currentStars = 3;
        movesCounterElement.textContent = 0;
        timerElement.textContent = 0;
        resetBoard();
        
        // Reset stars display
        updateStarRating(3);
        
        // Stop and clear timer
        clearInterval(timerInterval);
        timerInterval = null;

        // Hide modal and recreate cards
        modal.style.display = 'none';
        createCards();
    }

    // --- Game Logic (Flip, Match, Unflip) ---

    function flipCard() {
        if (lockBoard || this === firstCard) return;

        // Start the timer on the first move
        if (!timerInterval && moves === 0) {
            startTimer();
        }

        this.classList.add('flip');
        
        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        updateMovesCounter();
        checkForMatch();
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
        
        if (isMatch) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        matchesFound++;
        
        // Check for game completion
        if (matchesFound * 2 === cardsArray.length) {
            endGame();
        }
        resetBoard();
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    // --- Scoring and Timing ---

    function updateMovesCounter() {
        moves++;
        movesCounterElement.textContent = moves;
        
        // Update star rating based on moves
        if (moves >= STAR_THRESHOLD_1 && currentStars > 1) {
            updateStarRating(1);
        } else if (moves >= STAR_THRESHOLD_2 && currentStars > 2) {
            updateStarRating(2);
        }
    }

    function startTimer() {
        const startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            timerElement.textContent = elapsedTime;
        }, 1000);
    }

    // --- Star Rating Implementation ---

    function updateStarRating(rating) {
        currentStars = rating;
        const stars = starRatingElement.querySelectorAll('.fa-star');
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('empty');
            } else {
                star.classList.add('empty');
            }
        });
    }

    // --- Game Over Modal ---

    function endGame() {
        clearInterval(timerInterval);
        
        // Update modal content
        finalMovesElement.textContent = moves;
        finalTimeElement.textContent = timerElement.textContent;
        
        // Display stars in the modal
        modalStarRatingElement.innerHTML = '';
        for (let i = 0; i < currentStars; i++) {
            modalStarRatingElement.innerHTML += '<i class="fas fa-star"></i>';
        }

        // Show the modal
        modal.style.display = 'flex';
    }

    // Event listener for restart button in the modal
    restartButton.addEventListener('click', resetGame);

    // Initial setup
    resetGame();
});