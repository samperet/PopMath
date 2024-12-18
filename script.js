// Get elements
const splashDiv = document.getElementById('splash');
const enterBtn = document.getElementById('enter-btn');
const mainContainer = document.getElementById('main-container');
const settingsIcon = document.getElementById('settings-icon');
const settingsDiv = document.getElementById('settings');
const settingsOkBtn = document.getElementById('settings-ok-btn'); 
const quizDiv = document.getElementById('quiz');
const questionDiv = document.getElementById('question');
const choicesDiv = document.getElementById('choices');
const scoreSpan = document.getElementById('score');
const correctSound = document.getElementById('correct-sound');
const incorrectSound = document.getElementById('incorrect-sound');

// Progress elements
const progressContainer = document.getElementById('progress-container');
const nyanCat = document.getElementById('nyan-cat');
const rainbowFill = document.getElementById('rainbow-fill');
const goalValueSpan = document.getElementById('goal-value');

// Default settings
let low = 1,
    high = 5,
    score = 0;
let questionTypes = ['multiplication']; // Testing only multiplication initially
let currentQuestion;
let includeNegatives = false;
let goal = 1; // Test with a small goal so we quickly see the animation

// Nyan Cat references
let nyanImgElement = null;
let nyanAudioElement = null;
let nyanAnimationFrameId = null;
let gameFinished = false;

// Event Listeners
enterBtn.addEventListener('click', enterApp);
settingsIcon.addEventListener('click', toggleSettings);
settingsOkBtn.addEventListener('click', closeSettings);

function enterApp() {
    splashDiv.classList.add('hidden');
    mainContainer.classList.remove('hidden');
    updateSettings();
    resetGame();
    generateQuestion();
}

function toggleSettings() {
    settingsDiv.classList.toggle('hidden');
}

function closeSettings() {
    updateSettings();
    settingsDiv.classList.add('hidden');
}

function updateSettings() {
    // Normally you'd handle URL params and input fields here,
    // but for now let's keep it simple for testing:
    goalValueSpan.textContent = goal;
    progressContainer.classList.remove('hidden');
    updateProgressBar();
}

function resetGameOnBackgroundTap(event) {
    // If finished, stop animation and reset:
    if (gameFinished) {
        endNyanCatAnimation();
        resetGame();
        generateQuestion();
        return;
    }

    // If not finished, reset only if tapped outside main elements
    if (
        !event.target.classList.contains('choice-btn') &&
        event.target !== settingsIcon &&
        event.target !== enterBtn &&
        !settingsDiv.contains(event.target) &&
        !mainContainer.contains(event.target)
    ) {
        resetGame();
        generateQuestion();
    }
}

document.addEventListener('click', resetGameOnBackgroundTap);
document.addEventListener('touchstart', resetGameOnBackgroundTap);

function resetGame() {
    if (nyanImgElement) {
        document.body.removeChild(nyanImgElement);
        nyanImgElement = null;
    }
    if (nyanAudioElement) {
        document.body.removeChild(nyanAudioElement);
        nyanAudioElement = null;
    }
    if (nyanAnimationFrameId) {
        cancelAnimationFrame(nyanAnimationFrameId);
        nyanAnimationFrameId = null;
    }
    score = 0;
    scoreSpan.textContent = score;
    updateProgressBar();
    gameFinished = false;
}

function generateQuestion() {
    choicesDiv.innerHTML = '';

    let num1 = getRandomInt(low, high, includeNegatives);
    let num2 = getRandomInt(low, high, includeNegatives);
    let operation = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let questionText, correctAnswer;

    switch (operation) {
        case 'addition':
            questionText = `${num1} + ${num2}`;
            correctAnswer = num1 + num2;
            break;
        case 'subtraction':
            questionText = `${num1} - ${num2}`;
            correctAnswer = num1 - num2;
            break;
        case 'multiplication':
            questionText = `${num1} × ${num2}`;
            correctAnswer = num1 * num2;
            break;
        case 'division':
            if (num2 === 0) num2 = 1;
            // Create a float and round it
            correctAnswer = Math.round((num1 / num2) * 100) / 100;
            questionText = `${num1} ÷ ${num2}`;
            break;
    }

    currentQuestion = { questionText, correctAnswer };
    questionDiv.textContent = questionText;

    let choices = generateChoices(correctAnswer);
    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.textContent = choice;
        btn.classList.add('choice-btn');
        btn.addEventListener('click', selectAnswer);
        choicesDiv.appendChild(btn);
    });
}

function selectAnswer(e) {
    let selected = e.target.textContent;
    // Convert both sides to number if possible (handles floats and integers)
    let selectedVal = parseFloat(selected);
    let correctVal = parseFloat(currentQuestion.correctAnswer);

    if (selectedVal === correctVal) {
        score++;
        scoreSpan.textContent = score;
        correctSound.play();
        e.target.style.backgroundColor = '#c9e5c9'; 

        // Try confetti but don't break if not available
        try {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            });
        } catch (err) {
            console.log('Confetti not available:', err);
        }

        updateProgressBar();

        if (score >= goal) {
            console.log("Goal reached! Starting Nyan Cat animation.");
            animateNyanCat();
        } else {
            setTimeout(generateQuestion, 500);
        }
    } else {
        incorrectSound.play();
        e.target.style.backgroundColor = '#e38c7f'; 
        e.target.disabled = true;
    }
}

function getRandomInt(min, max, includeNegatives) {
    let value = Math.floor(Math.random() * (max - min + 1) + min);
    return includeNegatives && Math.random() < 0.5 ? -value : value;
}

function generateChoices(correctAnswer) {
    let choices = [correctAnswer];
    while (choices.length < 3) {
        let offset = Math.floor(Math.random() * 10 - 5);
        // If correctAnswer is a float, create another float
        let wrongAnswer;
        if (Number.isInteger(correctAnswer)) {
            wrongAnswer = correctAnswer + offset;
        } else {
            // For floats, create a float offset
            wrongAnswer = Math.round((correctAnswer + (offset / 10)) * 100) / 100;
        }
        if (!choices.includes(wrongAnswer)) choices.push(wrongAnswer);
    }
    return choices.sort(() => Math.random() - 0.5);
}

function updateProgressBar() {
    let progressPercentage = (score / goal) * 100;
    if (progressPercentage > 100) progressPercentage = 100;
    nyanCat.style.left = `calc(${progressPercentage}% - 30px)`;
    rainbowFill.style.width = `${progressPercentage}%`;
}

function animateNyanCat() {
    const nyanImg = document.createElement('img');
    nyanImg.src = 'https://github.com/samperet/PopMath/blob/main/Nyan%20Cat.gif?raw=true';
    nyanImg.style.position = 'fixed';
    nyanImg.style.left = '0px';
    nyanImg.style.top = '100px';
    nyanImg.style.width = '150px';
    nyanImg.style.zIndex = '1000';
    document.body.appendChild(nyanImg);

    const audio = document.createElement('audio');
    audio.src = 'https://archive.org/download/nyannyannyan/NyanCatoriginal.mp3';
    audio.autoplay = true;
    audio.loop = true;
    document.body.appendChild(audio);

    nyanImgElement = nyanImg;
    nyanAudioElement = audio;
    gameFinished = true;

    let direction = 1; 
    let pos = 0; 
    const catWidth = 150;
    const speed = 2; 

    nyanImg.style.transform = 'scaleX(1)';

    function step() {
        pos += speed * direction;
        nyanImg.style.left = `${pos}px`;

        const time = performance.now();
        nyanImg.style.top = `${100 + 50 * Math.sin(time / 500)}px`;

        if (pos >= window.innerWidth - catWidth && direction === 1) {
            direction = -1;
            nyanImg.style.transform = 'scaleX(-1)';
        } else if (pos <= 0 && direction === -1) {
            direction = 1;
            nyanImg.style.transform = 'scaleX(1)';
        }

        nyanAnimationFrameId = requestAnimationFrame(step);
    }

    nyanAnimationFrameId = requestAnimationFrame(step);
}

function endNyanCatAnimation() {
    if (nyanAnimationFrameId) {
        cancelAnimationFrame(nyanAnimationFrameId);
        nyanAnimationFrameId = null;
    }

    if (nyanImgElement) {
        document.body.removeChild(nyanImgElement);
        nyanImgElement = null;
    }
    if (nyanAudioElement) {
        document.body.removeChild(nyanAudioElement);
        nyanAudioElement = null;
    }
}
