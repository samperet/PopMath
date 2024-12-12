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
let goal = null; // Goal for number of correct answers

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
    // No longer update settings here
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
        goal = goalInput ? parseInt(goalInput) : null;
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

    // Generate random numbers
    let num1 = getRandomInt(low, high, includeNegatives);
    let num2 = getRandomInt(low, high, includeNegatives);
    let operation = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let questionText, correctAnswer;

    // Adjust numbers to prevent negative answers when negatives are not included
    if (!includeNegatives) {
        switch (operation) {
            case 'subtraction':
                // Ensure num1 >= num2 to avoid negative results
                if (num1 < num2) {
                    [num1, num2] = [num2, num1]; // Swap values
                }
                break;
            case 'division':
                // Ensure num1 is a multiple of num2 to get integer results
                num2 = num2 === 0 ? 1 : num2; // Avoid division by zero
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
            // Ensure division is valid
            while (num2 === 0) {
                num2 = getRandomInt(low, high, includeNegatives);
            }
            correctAnswer = num1 / num2;
            questionText = `${num1} ÷ ${num2}`;
            // Limit decimal places for division results
            if (!Number.isInteger(correctAnswer)) {
                correctAnswer = correctAnswer.toFixed(2);
            }
            break;
    }

    // Ensure correctAnswer is not negative when negatives are not included
    if (!includeNegatives && correctAnswer < 0) {
        // Regenerate the question
        generateQuestion();
        return;
    }

    currentQuestion = {
        questionText,
        correctAnswer
    };

    questionDiv.textContent = questionText;

    // Generate choices
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
        // Update progress bar if goal is set
        if (goal && goal > 0) {
            updateProgressBar();
            // Check if goal is reached
            if (score >= goal) {
                // Show a celebration or message
                // Pop up the specified video
                showGoalVideo();
            }
        }
        // Confetti effect
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
    // Generate a wrong answer based on common misconceptions
    let errorMargin = getRandomInt(1, 5, false);
    let wrongAnswer;
    if (typeof correctAnswer === 'number') {
        wrongAnswer =
            parseFloat(correctAnswer) +
            errorMargin * (Math.random() < 0.5 ? -1 : 1);
        // Limit decimal places for division results
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

// Initial settings update to handle URL parameters on page load
window.onload = function () {
    // Check if the game is already started
    if (mainContainer.classList.contains('hidden')) {
        updateSettings();
    }
};

// New function to update the progress bar and move Nyan Cat
function updateProgressBar() {
    if (goal && goal > 0) {
        let progressPercentage = (score / goal) * 100;
        if (progressPercentage > 100) progressPercentage = 100;

        // Move Nyan Cat along the progress bar
        nyanCat.style.left = `calc(${progressPercentage}% - 30px)`; // Adjust the offset as needed

        // Adjust the width of the rainbow fill
        rainbowFill.style.width = `${progressPercentage}%`;
    }
}

// Function to show the video when the goal is reached
// [Previous script remains the same up to showGoalVideo function]

// Function to show the Nyan Cat celebration when the goal is reached
function showGoalVideo() {
    // Create audio element for Nyan Cat song
    const nyanAudio = new Audio('https://raw.githubusercontent.com/samperet/PopMath/87865aed60c127caa36179ed6005a8c4d241e8d9/Nyan%20Cat.mp3');
    
    // Create container for Nyan Cat animation
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

    // Create Nyan Cat image
    const nyanCatImg = document.createElement('img');
    nyanCatImg.src = 'https://raw.githubusercontent.com/samperet/PopMath/87865aed60c127caa36179ed6005a8c4d241e8d9/Nyan%20Cat.gif';
    nyanCatImg.style.position = 'absolute';
    nyanCatImg.style.width = '200px';
    nyanCatImg.style.height = 'auto';

    // Add Nyan Cat to container
    nyanContainer.appendChild(nyanCatImg);
    document.body.appendChild(nyanContainer);

    // Play Nyan Cat audio
    nyanAudio.play();

    // Animate Nyan Cat
    function animateNyanCat() {
        const maxWidth = window.innerWidth - 200;
        const maxHeight = window.innerHeight - 100;

        // Random start position
        nyanCatImg.style.left = '0px';
        nyanCatImg.style.top = `${Math.random() * maxHeight}px`;

        // Animation function
        function move() {
            const currentLeft = parseInt(nyanCatImg.style.left);
            if (currentLeft < maxWidth) {
                nyanCatImg.style.left = `${currentLeft + 5}px`;
                requestAnimationFrame(move);
            } else {
                // Restart from left side with new vertical position
                nyanCatImg.style.left = '0px';
                nyanCatImg.style.top = `${Math.random() * maxHeight}px`;
                requestAnimationFrame(move);
            }
        }

        // Start the animation
        move();
    }

    // Start Nyan Cat animation
    animateNyanCat();

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.position = 'fixed';
    closeBtn.style.bottom = '20px';
    closeBtn.style.right = '20px';
    closeBtn.style.zIndex = '1001';
    
    closeBtn.addEventListener('click', () => {
        // Stop audio
        nyanAudio.pause();
        nyanAudio.currentTime = 0;
        
        // Remove Nyan Cat container
        nyanContainer.remove();
        closeBtn.remove();

        // Reset game
        resetGame();
    });

    // Add close button to body
    document.body.appendChild(closeBtn);
}

// [Rest of the previous script remains the same]
