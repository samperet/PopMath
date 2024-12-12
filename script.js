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
    let userGoal = null;
    if (urlParams.has('goal')) {
        userGoal = parseInt(urlParams.get('goal'));
        document.getElementById('goal').value = userGoal;
    } else {
        const goalInput = document.getElementById('goal').value;
        userGoal = goalInput ? parseInt(goalInput) : null;
    }

    if (userGoal && userGoal > 0) {
        goal = userGoal;
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
    choicesDiv.innerHTML = '';

    // Generate random numbers
    let num1 = getRandomInt(low, high, includeNegatives);
    let num2 = getRandomInt(low, high, includeNegatives);
    let operation = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let questionText, correctAnswer;

    // Adjust numbers if negatives not included
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

    // If negatives not allowed and correctAnswer < 0, regenerate
    if (!includeNegatives && correctAnswer < 0) {
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

    if (selectedAnswer == currentQuestion.correctAnswer) {
        // Correct answer
        e.target.style.backgroundColor = '#c8e6c9'; // green for correct
        score++;
        scoreSpan.textContent = score;
        correctSound.play();

        // Update progress bar if goal is set
        if (goal && goal > 0) {
            updateProgressBar();
            // Check if goal is reached
            if (score >= goal) {
                showGoalVideo();
                return;
            }
        }

        // Confetti effect
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Automatically go to the next question after a brief delay
        setTimeout(generateQuestion, 1000);
    } else {
        // Wrong answer
        e.target.style.backgroundColor = '#ffccbc'; // red for wrong
        e.target.disabled = true; // disable this wrong choice only
        incorrectSound.play();
        // The user can continue selecting other answers until correct
    }
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

// Initial settings update to handle URL parameters on page load
window.onload = function () {
    if (mainContainer.classList.contains('hidden')) {
        updateSettings();
    }
};

// New function to update the progress bar and move Nyan Cat
function updateProgressBar() {
    if (goal && goal > 0) {
        let progressPercentage = (score / goal) * 100;
        if (progressPercentage > 100) progressPercentage = 100;

        nyanCat.style.left = `calc(${progressPercentage}% - 30px)`;
        rainbowFill.style.width = `${progressPercentage}%`;
    }
}

// Modified showGoalVideo function: animate Nyan Cat in a wave across the screen
function showGoalVideo() {
    // Create and play the Nyan Cat audio
    const audio = document.createElement('audio');
    audio.src = 'Nyan Cat.mp3'; // Path to your Nyan Cat MP3
    audio.autoplay = true;
    audio.loop = true;
    document.body.appendChild(audio);

    // Create Nyan Cat image
    const nyanImg = document.createElement('img');
    nyanImg.src = 'Nyan Cat.gif'; // Path to your Nyan Cat GIF
    nyanImg.style.position = 'fixed';
    nyanImg.style.width = '150px'; 
    nyanImg.style.zIndex = '1000';
    document.body.appendChild(nyanImg);

    // Wave animation parameters
    const animationDuration = 10000; // 10 seconds
    const startTime = performance.now();
    const amplitude = 100; // Height of the wave
    const frequency = 0.005; // Wave frequency
    const speed = 0.3; // Horizontal speed
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const centerY = screenHeight / 2 - 75; // Vertical center (subtract half of cat height)

    function animate(time) {
        const elapsed = time - startTime;
        if (elapsed < animationDuration) {
            const x = speed * elapsed;
            const y = centerY + amplitude * Math.sin(frequency * elapsed);
            nyanImg.style.left = x + 'px';
            nyanImg.style.top = y + 'px';

            requestAnimationFrame(animate);
        } else {
            // After 10 seconds, remove the cat, audio, and reset game
            document.body.removeChild(nyanImg);
            document.body.removeChild(audio);
            resetGame();
        }
    }

    requestAnimationFrame(animate);
}

// Add CSS for modal or any other necessary elements in JavaScript (since we cannot edit CSS externally)
const style = document.createElement('style');
style.innerHTML = `
/* Modal styles and other styles if needed */
/* In this version, we are not using the modal for the goal video anymore, 
   but leaving this here for reference if needed. */
`;
document.head.appendChild(style);
