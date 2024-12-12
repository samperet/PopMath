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
let goal = 10; // Default goal is now 10

// Event Listeners
enterBtn.addEventListener('click', enterApp);
settingsIcon.addEventListener('click', toggleSettings);
settingsOkBtn.addEventListener('click', closeSettings); // Event listener for OK button
nextBtn.addEventListener('click', generateQuestion);

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
    // Check if URL parameters exist and override settings
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
    if (urlParams.has('types')) {
        questionTypes = [];
        const types = urlParams.get('types').split(',');
        const validTypes = ['addition', 'subtraction', 'multiplication', 'division'];
        types.forEach(type => {
            if (validTypes.includes(type)) {
                questionTypes.push(type);
                document.getElementById(type).checked = true;
            }
        });
        // Uncheck other types
        validTypes.forEach(type => {
            if (!questionTypes.includes(type)) {
                document.getElementById(type).checked = false;
            }
        });
    } else {
        // Use user-selected settings
        questionTypes = [];
        if (document.getElementById('addition').checked) questionTypes.push('addition');
        if (document.getElementById('subtraction').checked) questionTypes.push('subtraction');
        if (document.getElementById('multiplication').checked) questionTypes.push('multiplication');
        if (document.getElementById('division').checked) questionTypes.push('division');
    }

    if (questionTypes.length === 0) {
        alert('Please select at least one question type.');
        settingsDiv.classList.remove('hidden');
        return;
    }

    // Goal
    if (urlParams.has('goal')) {
        goal = parseInt(urlParams.get('goal'));
        document.getElementById('goal').value = goal;
    } else {
        const goalInput = document.getElementById('goal').value;
        goal = goalInput ? parseInt(goalInput) : 10; // Default to 10 if no input
    }

    if (goal && goal > 0) {
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
    if (goal && goal > 0) {
        updateProgressBar();
    }
}

function generateQuestion() {
    nextBtn.classList.add('hidden');
    choicesDiv.innerHTML = '';

    let num1 = getRandomInt(low, high, includeNegatives);
    let num2 = getRandomInt(low, high, includeNegatives);
    let operation = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let questionText, correctAnswer;

    // Adjust numbers to prevent negative answers when negatives are not included
    if (!includeNegatives) {
        switch (operation) {
            case 'subtraction':
                if (num1 < num2) {
                    [num1, num2] = [num2, num1]; // Swap values
                }
                break;
            case 'division':
                num2 = num2 === 0 ? 1 : num2;
                num1 = num1 * num2;
                break;
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
            while (num2 === 0) {
                num2 = getRandomInt(low, high, includeNegatives);
            }
            correctAnswer = num1 / num2;
            questionText = `${num1} ÷ ${num2}`;
            if (!Number.isInteger(correctAnswer)) {
                correctAnswer = correctAnswer.toFixed(2);
            }
            break;
    }

    if (!includeNegatives && correctAnswer < 0) {
        generateQuestion();
        return;
    }

    currentQuestion = {
        questionText,
        correctAnswer
    };

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
    let selectedAnswer = e.target.textContent;
    Array.from(choicesDiv.children).forEach(btn => {
        btn.disabled = true;
        if (btn.textContent == currentQuestion.correctAnswer) {
            btn.style.backgroundColor = '#c8e6c9'; // Correct answer
        } else if (btn === e.target) {
            btn.style.backgroundColor = '#ffccbc'; // Selected wrong answer
        }
    });

    if (selectedAnswer == currentQuestion.correctAnswer) {
        score++;
        scoreSpan.textContent = score;
        correctSound.play();
        if (goal && goal > 0) {
            updateProgressBar();
            if (score >= goal) {
                showGoalVideo();
            }
        }
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    } else {
        incorrectSound.play();
    }

    nextBtn.classList.remove('hidden');
}

function generateChoices(correctAnswer) {
    let choices = [correctAnswer];
    while (choices.length < 3) {
        let wrongAnswer = generateMisconception(correctAnswer);
        if (
            !choices.includes(wrongAnswer) &&
            (!(!includeNegatives && wrongAnswer < 0))
        ) {
            choices.push(wrongAnswer);
        }
    }
    return shuffleArray(choices);
}

function generateMisconception(correctAnswer) {
    let errorMargin = getRandomInt(1, 5, false);
    let wrongAnswer;
    if (typeof correctAnswer === 'number') {
        wrongAnswer =
            parseFloat(correctAnswer) +
            errorMargin * (Math.random() < 0.5 ? -1 : 1);
        wrongAnswer = Number.isInteger(correctAnswer)
            ? wrongAnswer
            : parseFloat(wrongAnswer.toFixed(2));
    } else {
        wrongAnswer =
            parseInt(correctAnswer) +
            errorMargin * (Math.random() < 0.5 ? -1 : 1);
    }
    return wrongAnswer.toString();
}

function getRandomInt(min, max, includeNegatives) {
    let value = Math.floor(Math.random() * (max - min + 1) + min);
    if (includeNegatives && Math.random() < 0.5) {
        value = -value;
    }
    return value;
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
        if (progressPercentage > 100) progressPercentage = 100;

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

    const playBtn = document.createElement('button');
    playBtn.textContent = 'Play Nyan Cat Music';
    playBtn.style.position = 'fixed';
    playBtn.style.top = '50%';
    playBtn.style.left = '50%';
    playBtn.style.transform = 'translate(-50%, -50%)';
    playBtn.style.zIndex = '1001';
    playBtn.style.padding = '10px 20px';
    playBtn.style.fontSize = '18px';

    nyanContainer.appendChild(nyanCatImg);
    nyanContainer.appendChild(playBtn);
    document.body.appendChild(nyanContainer);

    playBtn.addEventListener('click', () => {
        nyanAudio.play()
            .then(() => {
                playBtn.style.display = 'none';
                
                function animateNyanCat() {
                    const maxWidth = window.innerWidth - 200;
                    const maxHeight = window.innerHeight - 100;
                    nyanCatImg.style.left = '0px';
                    nyanCatImg.style.top = `${Math.random() * maxHeight}px`;

                    function move() {
                        const currentLeft = parseInt(nyanCatImg.style.left);
                        if (currentLeft < maxWidth) {
                            nyanCatImg.style.left = `${currentLeft + 5}px`;
                            requestAnimationFrame(move);
                        } else {
                            nyanCatImg.style.left = '0px';
                            nyanCatImg.style.top = `${Math.random() * maxHeight}px`;
                            requestAnimationFrame(move);
                        }
                    }
                    move();
                }
                animateNyanCat();
            })
            .catch((error) => {
                console.error('Error playing audio:', error);
                alert('Unable to play music. This might be due to browser autoplay restrictions.');
            });
    });

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
