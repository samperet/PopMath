let score = 0; // Ensure this is defined somewhere in your code
let goal = 10; // Example goal
let nyanCat = document.getElementById('nyan-cat'); // Adjust element IDs as needed
let rainbowFill = document.getElementById('rainbow-fill');
let celebrationTriggered = false; // To ensure the celebration is only triggered once

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
        resetGame(); // Ensure this function exists and resets score/game as desired
    });

    document.body.appendChild(closeBtn);

    nyanAudio.play();
}
