var cifras = document.getElementById("cifras");
var resultado = document.getElementById("resultado");
var answerContainer = document.getElementById("answerContainer");
var userAnswer = document.getElementById("userAnswer");
var retro = document.getElementById("retro");
var generateButton = document.getElementById("generateButton");
var showResultButton = document.getElementById("showResultButton");
var repeatButton = document.getElementById("repeatButton");

var initial = 0;
var finalresult = 0;
var rotatingColors = ["#FF2977", "#26C5AE", "#6358FF"];
var maximumValue = 15;
var delayTime = 0.5;
var numberOfValues = 4;
var increaseSpeed = false;
var increaseSequence = false;
var valuesToDisplay = [];
var currentScore = 0;
var currentRacha = 0;
var level = 1;
var valor = 4;
var racha_ui = document.getElementById("racha_ui");
var score_ui = document.getElementById("score_ui");
var valores = document.getElementById("valores");
var velocidad = document.getElementById("velocidad");
var beepSound = new Audio('audio/beep_short.mp3');

velocidad.innerHTML = delayTime;

showResultButton.style.display = "none";
repeatButton.style.display = "none";

function displayWithDelay(values, delay, callback) {
    let i = 0;
    function showNextValue() {
        if (i < values.length) {
            cifras.style.display = "block";
            answerContainer.style.display = "none";
            resultado.innerHTML = "";

            cifras.innerText = values[i];

            if (i < 3) {
                cifras.style.color = "grey";
            } else {
                cifras.style.color = rotatingColors[(i - 3) % rotatingColors.length];
                beepSound.currentTime = 0;
                beepSound.play();
            }
            i++;
            setTimeout(showNextValue, delay);
        } else {
            cifras.style.display = "none";
            answerContainer.style.display = "flex";
            userAnswer.focus();
            repeatButton.style.display = "inline-block";
            showResultButton.style.display = "inline-block";
            if (callback) callback();
        }
    }
    showNextValue();
}

function generateSequence(numberOfValues) {
    retro.innerText = "";
    retro.style.color = "";
    userAnswer.value = "";

    valuesToDisplay = [".", "..", "..."];
    let currentresult = getRandomInt(1, maximumValue);
    valuesToDisplay.push(currentresult);

    for (let i = 1; i < numberOfValues; i++) {
        let minAllowed = -currentresult;
        let maxAllowed = maximumValue - currentresult;
        let nextValue = getRandomInt(minAllowed, maxAllowed);
        if (nextValue === 0) nextValue = -1; // still avoid 0 if needed
        currentresult += nextValue;
        
        valuesToDisplay.push(nextValue);
    }

    finalresult = currentresult;
    displayWithDelay(valuesToDisplay, delayTime * 1000);
}

function todo() {
    numberOfValues = parseInt(document.getElementById("numCount").value);
    maximumValue = parseInt(document.getElementById("maxValue").value);
    delayTime = parseFloat(document.getElementById("delay").value);
    increaseSpeed = document.getElementById("increaseSpeed").checked;
    increaseSequence = document.getElementById("increaseSequence").checked;

    resultado.innerHTML = " ";
    generateSequence(numberOfValues);
    updateUI();
}

function validarRespuesta() {
    const userValue = parseInt(userAnswer.value);
    if (userValue === finalresult) {
        currentRacha++;
        let multiplier = 1;
        if (increaseSpeed) multiplier *= 1.5;
        if (increaseSequence) multiplier *= 1.5;
        let basePoints = Math.floor((numberOfValues * maximumValue) / delayTime);
        currentScore += Math.floor(basePoints * multiplier);
        
        retro.innerText = "Correcto!";
        retro.style.color = "#26C5AE";

        if (increaseSpeed) {
            delayTime = Math.max(0.1, delayTime * 0.95);
        }
        if (increaseSequence) {
            numberOfValues += 1;
        }

        setTimeout(() => {
            answerContainer.style.display = "none";
            showResultButton.style.display = "none";
            repeatButton.style.display = "none";
            retro.innerText = "";
        }, 3000);
    } else {
        currentRacha = 0;
        retro.innerText = `Incorrecto. Intenta de nuevo.`;
        retro.style.color = "#FF2977";
        setTimeout(() => {
            retro.innerText = "";
        }, 3000);
    }
    updateUI();
}

userAnswer.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        validarRespuesta();
    }
});

function verResultado() {
    cifras.style.display = "none";
    answerContainer.style.display = "none";
    resultado.innerHTML = '<br><br><br><br>El resultado es: ' + finalresult;
}

function reDisplay() {
    displayWithDelay(valuesToDisplay, delayTime * 1000);
}

function updateUI() {
    document.getElementById("delay").value = delayTime.toFixed(2);
    document.getElementById("numCount").value = numberOfValues;
    document.getElementById("valores").innerHTML = numberOfValues;
    document.getElementById("velocidad").innerHTML = delayTime.toFixed(2);
    racha_ui.innerHTML = currentRacha;
    score_ui.innerHTML = currentScore;
}

function toggleSettings() {
    const panel = document.getElementById("settingsPanel");
    const overlay = document.getElementById("settingsOverlay");
    const isVisible = overlay.style.display === "block";
    panel.style.display = isVisible ? "none" : "block";
    overlay.style.display = isVisible ? "none" : "block";
}

function applySettings() {
    todo();
    toggleSettings();
}

function cancelSettings() {
    toggleSettings();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Arcade Firebase Logic
async function terminarJuego() {
    if (currentScore <= 0) {
        alert("¡Juega un poco más para obtener una puntuación!");
        return;
    }
    
    const isTop10 = await isHighScore("soroban", currentScore);
    
    if (isTop10) {
        document.getElementById("highScoreOverlay").style.display = "block";
        document.getElementById("highScorePanel").style.display = "block";
        document.getElementById("initialsInput").focus();
    } else {
        alert("¡Juego terminado! Tu puntaje fue: " + currentScore);
        resetGame();
    }
}

async function submitHighScore() {
    const initials = document.getElementById("initialsInput").value;
    if (initials.trim().length < 1) return;
    
    const settingsStr = `Cif:${numberOfValues},Max:${maximumValue}`;
    await saveHighScore("soroban", initials, currentScore, settingsStr);
    
    document.getElementById("highScoreOverlay").style.display = "none";
    document.getElementById("highScorePanel").style.display = "none";
    
    alert("¡Puntuación guardada exitosamente!");
    resetGame();
}

function resetGame() {
    currentScore = 0;
    currentRacha = 0;
    racha_ui.innerHTML = currentRacha;
    score_ui.innerHTML = currentScore;
    todo();
}
