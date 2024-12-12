// Variables for demonstration
let score = 0;
let goal = 10; // Set your desired goal

// References to progress bar elements
const nyanCat = document.getElementById('nyan-cat');
const rainbowFill = document.getElementById('rainbow-fill');

let celebrationTriggered = false; // ensures Nyan Cat celebration only happens once

function correctAnswer() {
    // This function simulates getting a correct answer
    score++;
    updateProgressBar();
}

function updateProgressBar() {
    if (goal && goal > 0) {
        let progressPercentage = (score / goal) * 100;
        progressPercentage = Math.min(progressPercentage, 100);

        if (nyanCat) {
            nyanCat.style.left = `${progressPercentage}%`;
        }
        if (rainbowFill) {
            rainbowFill.style.width = `${progressPercentage}%`;
        }

        // Check if goal has been reached or exceeded
        if (score >= goal && !celebrationTriggered) {
            celebrationTriggered = true;
            showGoalVideo();
        }
    }
}

function showGoalVideo() {
    const nyanAudio = new Audio('https://raw.githubusercontent.com/samperet/PopMath/87865aed60c127caa36179ed6005a8c4d241e8d9/Nyan%20Cat.mp3');
    const nyanContainer = document.createElement('div');
    nyanContainer.id = 'nyan-celebration';
    Object.assign(nyanContainer.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '1000',
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.5)'
    });

    const nyanCatImg = document.createElement('img');
    nyanCatImg.src = 'https://raw.githubusercontent.com/samperet/PopMath/87865aed60c127caa36179ed6005a8c4d241e8d9/Nyan%20Cat.gif';
    Object.assign(nyanCatImg.style, {
        position: 'absolute',
        width: '200px',
        height: 'auto'
    });

    nyanContainer.appendChild(nyanCatImg);
    document.body.appendChild(nyanContainer);

    // Animate Nyan Cat across the screen
    let startPosition = 0;
    const animateCat = () => {
        if (startPosition < window.innerWidth) {
            startPosition += 5; // Speed of animation
            nyanCatImg.style.left = `${startPosition}px`;
            requestAnimationFrame(animateCat);
        }
    };
    animateCat();

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    Object.assign(closeBtn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '1001'
    });

    closeBtn.addEventListener('click', () => {
        nyanAudio.pause();
        nyanAudio.currentTime = 0;
        nyanContainer.remove();
        closeBtn.remove();
        resetGame();
    });

    document.body.appendChild(closeBtn);

    nyanAudio.play();
}

function resetGame() {
    // Reset variables
    score = 0;
    celebrationTriggered = false;
    // Reset progress bar UI
    if (nyanCat) {
        nyanCat.style.left = '0%';
    }
    if (rainbowFill) {
        rainbowFill.style.width = '0%';
    }
    // Any other game reset logic goes here
}
