confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
});
generateQuestion(); // Automatically advance
    } else {
        e.target.style.backgroundColor = '#ffccbc'; // Mark incorrect
        e.target.disabled = true; // Disable the wrong button
        incorrectSound.play();
    }
}

function generateChoices(correctAnswer) {
    let choices = [correctAnswer];
    while (choices.length < 3) {
        let wrongAnswer = generateMisconception(correctAnswer);
        if (!choices.includes(wrongAnswer) && (!(!includeNegatives && wrongAnswer < 0))) {
            choices.push(wrongAnswer);
        }
    }
    return shuffleArray(choices);
}

function generateMisconception(correctAnswer) {
    let errorMargin = getRandomInt(1, 5, false);
    let wrongAnswer = parseFloat(correctAnswer) + errorMargin * (Math.random() < 0.5 ? -1 : 1);
    return Number.isInteger(correctAnswer) ? wrongAnswer : parseFloat(wrongAnswer.toFixed(2));
}

function getRandomInt(min, max, includeNegatives) {
    let value = Math.floor(Math.random() * (max - min + 1) + min);
    return includeNegatives && Math.random() < 0.5 ? -value : value;
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

window.onload = function () {
    if (mainContainer.classList.contains('hidden')) {
        updateSettings();
    }
};

function updateProgressBar() {
    if (goal && goal > 0) {
        let progressPercentage = (score / goal) * 100;
        progressPercentage = Math.min(progressPercentage, 100);

        nyanCat.style.left = `calc(${progressPercentage}% - 30px)`;
        rainbowFill.style.width = `${progressPercentage}%`;
    }
}

function showGoalVideo() {
    const nyanAudio = new Audio('https://raw.githubusercontent.com/samperet/PopMath/87865aed60c127caa36179ed6005a8c4d241e8d9/Nyan%20Cat.mp3');
    const nyanContainer = document.createElement('div');
    nyanContainer.id = 'nyan-celebration';
    nyanContainer.style.position = 'fixed';
    nyanContainer.style.top = '0';
    nyanContainer.style.left = '0';
    nyanContainer.style.width = '100vw';
    nyanContainer.style.height = '100vh';
    nyanContainer.style.zIndex = '1000';
    nyanContainer.style.pointerEvents = 'none';
    nyanContainer.style.overflow = 'hidden';
    nyanContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';

    const nyanCatImg = document.createElement('img');
    nyanCatImg.src = 'https://raw.githubusercontent.com/samperet/PopMath/87865aed60c127caa36179ed6005a8c4d241e8d9/Nyan%20Cat.gif';
    nyanCatImg.style.position = 'absolute';
    nyanCatImg.style.width = '200px';
    nyanCatImg.style.height = 'auto';

    nyanContainer.appendChild(nyanCatImg);
    document.body.appendChild(nyanContainer);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.position = 'fixed';
    closeBtn.style.bottom = '20px';
    closeBtn.style.right = '20px';
    closeBtn.style.zIndex = '1001';
    
    closeBtn.addEventListener('click', () => {
        nyanAudio.pause();
        nyanAudio.currentTime = 0;
        nyanContainer.remove();
        closeBtn.remove();
        resetGame();
    });

    document.body.appendChild(closeBtn);
}
