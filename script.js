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
let goal = 10; // Default goal is now 10

// Event Listeners
enterBtn.addEventListener('click', enterApp);
settingsIcon.addEventListener('click', toggleSettings);
settingsOkBtn.addEventListener('click', closeSettings);

// Functions
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

    low = urlParams.has('low') ? parseInt(urlParams.get('low')) : parseInt(document.getElementById('low').value);
    high = urlParams.has('high') ? parseInt(urlParams.get('high')) : parseInt(document.getElementById('high').value);
    includeNegatives = urlParams.has('negatives') ? urlParams.get('negatives') === 'true' : document.getElementById('negatives').checked;

    questionTypes = [];
    const validTypes = ['addition', 'subtraction', 'multiplication', 'division'];
    validTypes.forEach(type => {
        if (document.getElementById(type).checked) questionTypes.push(type);
    });

    goal = urlParams.has('goal') ? parseInt(urlParams.get('goal')) : parseInt(document.getElementById('goal').value) || 10;
    goalValueSpan.textContent = goal;
    progressContainer.classList.toggle('hidden', !(goal && goal > 0));
    updateProgressBar();
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

    if (!includeNegatives) {
        if (operation === 'subtraction' && num1 < num2) [num1, num2] = [num2, num1];
        if (operation === 'division') {
            num2 = num2 === 0 ? 1 : num2;
            num1 = num1 * num2;
        }
    }

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
            while (num2 === 0) num2 = getRandomInt(low, high, includeNegatives);
            correctAnswer = num1 / num2;
            questionText = `${num1} ÷ ${num2}`;
            if (!Number.isInteger(correctAnswer)) correctAnswer = correctAnswer.toFixed(2);
            break;
    }

    if (!includeNegatives && correctAnswer < 0) return generateQuestion();

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
    const selectedAnswer = e.target.textContent;
    const buttons = Array.from(choicesDiv.children);

    if (selectedAnswer == currentQuestion.correctAnswer) {
        e.target.style.backgroundColor = '#c8e6c9'; // Correct answer
        score++;
        scoreSpan.textContent = score;
        correctSound.play();
        if (goal && score >= goal) showGoalVideo();
        else generateQuestion(); // Automatically advance
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
