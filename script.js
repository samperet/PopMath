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

// Event Listeners
enterBtn.addEventListener('click', enterApp);
settingsIcon.addEventListener('click', toggleSettings);
settingsOkBtn.addEventListener('click', closeSettings);

function enterApp() {
    splashDiv.classList.add('hidden');
    mainContainer.classList.remove('hidden');
    updateSettings(); // Ensure settings are up to date
    resetGame();
    generateQuestion(); // Start the game
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

function resetGame() {
    score = 0;
    scoreSpan.textContent = score;
    updateProgressBar();
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
        e.target.style.backgroundColor = 'green'; // Green for correct

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
        e.target.style.backgroundColor = 'red'; // Red for wrong
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

    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const x = (elapsed / 10) % window.innerWidth;
        const y = 100 + 50 * Math.sin((elapsed / 500) * Math.PI);

        nyanImg.style.left = `${x}px`;
        nyanImg.style.top = `${y}px`;

        if (elapsed < 20000) {
            requestAnimationFrame(step);
        } else {
            document.body.removeChild(nyanImg);
            document.body.removeChild(audio);
            resetGame();
        }
    }

    requestAnimationFrame(step);
}
