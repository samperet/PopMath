// Get elements
const splashDiv = document.getElementById('splash');
const enterBtn = document.getElementById('enter-btn');
const mainContainer = document.getElementById('main-container');
const settingsIcon = document.getElementById('settings-icon');
const settingsDiv = document.getElementById('settings');
const settingsOkBtn = document.getElementById('settings-ok-btn'); // New OK button
const quizDiv = document.getElementById('quiz');
const nextBtn = document.getElementById('next-btn');
const questionDiv = document.getElementById('question');
const choicesDiv = document.getElementById('choices');
const scoreSpan = document.getElementById('score');
const correctSound = document.getElementById('correct-sound');
const incorrectSound = document.getElementById('incorrect-sound');

// New elements for progress bar
const progressContainer = document.getElementById('progress-container');
const nyanCat = document.getElementById('nyan-cat');
const rainbowFill = document.getElementById('rainbow-fill');
const goalValueSpan = document.getElementById('goal-value');

let low = 1,
    high = 10,
    score = 0;
let questionTypes = ['multiplication']; // Only multiplication by default
let currentQuestion;
let includeNegatives = false;
let goal = 10; // Default goal is 10

// To keep track of the animated cat and audio, so we can remove them on reset
let nyanImgElement = null;
let nyanAudioElement = null;

// Flag to indicate if the game has finished (nyan cat animation playing)
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
    const urlParams = new URLSearchParams(window.location.search);

    // Low Number
    if (urlParams.has('low')) {
        low = parseInt(urlParams.get('low'));
        document.getElementById('low').value = low;
    } else {
        low = parseInt(document.getElementById('low').value);
    }

    // High Number
    if (urlParams.has('high')) {
        high = parseInt(urlParams.get('high'));
        document.getElementById('high').value = high;
    } else {
        high = parseInt(document.getElementById('high').value);
    }

    // Include Negatives
    if (urlParams.has('negatives')) {
        includeNegatives = urlParams.get('negatives') === 'true';
        document.getElementById('negatives').checked = includeNegatives;
    } else {
        includeNegatives = document.getElementById('negatives').checked;
    }

    // Question Types
    questionTypes = [];
    ['addition', 'subtraction', 'multiplication', 'division'].forEach(type => {
        if (document.getElementById(type).checked) questionTypes.push(type);
    });

    if (questionTypes.length === 0) {
        alert('Please select at least one question type.');
        settingsDiv.classList.remove('hidden');
        return;
    }

    // Goal
    let userGoal = parseInt(document.getElementById('goal').value) || 10;
    if (userGoal > 0) {
        goal = userGoal;
        progressContainer.classList.remove('hidden');
        goalValueSpan.textContent = goal;
        updateProgressBar();
    } else {
        progressContainer.classList.add('hidden');
    }
}


function resetGameOnBackgroundTap(event) {
    // If the game is finished (nyan cat playing), a tap ends the animation and resets.
    if (gameFinished) {
        endNyanCatAnimation();
        resetGame();
        generateQuestion();
        return;
    }

    // If the game is not finished, check if we tapped outside the main elements
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

// Add both click and touchstart listeners
document.addEventListener('click', resetGameOnBackgroundTap);
document.addEventListener('touchstart', resetGameOnBackgroundTap);

function resetGame() {
    // Remove nyan cat and audio if present
    if (nyanImgElement) {
        document.body.removeChild(nyanImgElement);
        nyanImgElement = null;
    }
    if (nyanAudioElement) {
        document.body.removeChild(nyanAudioElement);
        nyanAudioElement = null;
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
            questionText = `${num1} ÷ ${num2}`;
            correctAnswer = (num1 / num2).toFixed(2);
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
    if (e.target.textContent == currentQuestion.correctAnswer) {
        score++;
        scoreSpan.textContent = score;
        correctSound.play();

        // Light green for correct
        e.target.style.backgroundColor = '#c9e5c9'; 

        // Confetti effect
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
        });

        updateProgressBar();

        if (score >= goal) {
            animateNyanCat();
        } else {
            setTimeout(generateQuestion, 500); // Slight delay to show effect
        }
    } else {
        incorrectSound.play();

        // Light red for wrong
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
        let wrongAnswer = correctAnswer + Math.floor(Math.random() * 10 - 5);
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
    nyanImg.src = 'Nyan Cat.gif';
    nyanImg.style.position = 'absolute';
    nyanImg.style.width = '150px';
    nyanImg.style.zIndex = '1000';
    document.body.appendChild(nyanImg);

    const audio = document.createElement('audio');
    audio.src = 'https://archive.org/download/nyannyannyan/NyanCatoriginal.mp3';
    audio.autoplay = true;
    audio.loop = true;
    document.body.appendChild(audio);

    // Store references so we can remove them on reset
    nyanImgElement = nyanImg;
    nyanAudioElement = audio;

    // Mark the game as finished
    gameFinished = true;

    let direction = 1; // 1 = moving right, -1 = moving left
    let pos = 0; 
    const catWidth = 150;
    const speed = 2; 

    nyanImg.style.transform = 'scaleX(1)';

    function step() {
        pos += speed * direction;
        nyanImg.style.left = `${pos}px`;

        // Vertical bobbing effect
        const time = performance.now();
        nyanImg.style.top = `${100 + 50 * Math.sin(time / 500)}px`;

        // Check boundaries
        if (pos >= window.innerWidth - catWidth && direction === 1) {
            direction = -1;
            nyanImg.style.transform = 'scaleX(-1)';
        } else if (pos <= 0 && direction === -1) {
            direction = 1;
            nyanImg.style.transform = 'scaleX(1)';
        }

        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function endNyanCatAnimation() {
    if (nyanImgElement) {
        document.body.removeChild(nyanImgElement);
        nyanImgElement = null;
    }
    if (nyanAudioElement) {
        document.body.removeChild(nyanAudioElement);
        nyanAudioElement = null;
    }
    // Now the cat and audio are removed
}
