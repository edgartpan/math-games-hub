//get elements from HTML
var divsumando1 = document.getElementById("divsumando1");
var divsumando2 = document.getElementById("divsumando2");
var btnopcion1 = document.getElementById("btnopcion1");
var btnopcion2 = document.getElementById("btnopcion2");
var btnopcion3 = document.getElementById("btnopcion3");
var level_ready = document.getElementById("level_ready");
var retro = document.getElementById("retro");
var imagen = document.getElementById("img");
var racha_ui = document.getElementById("racha_ui");
var score_ui = document.getElementById("score_ui");
var difficulty_value = document.getElementById("difficulty");

//initial values
//  score
var currentScore = 0;
var currentRacha = 0;
racha_ui.innerHTML = currentRacha;
score_ui.innerHTML = currentScore;
//  difficulty
var dificultad_set = 5;
difficulty_value.innerHTML=dificultad_set

//modify difficulty
function increase(){
  dificultad_set = dificultad_set + 1;
  difficulty_value.innerHTML=dificultad_set;
}

function decrease(){
  dificultad_set = dificultad_set - 1;
  difficulty_value.innerHTML=dificultad_set;
}
level_ready.addEventListener('click', generate);

//evaluate
function wrong_answer () {
    currentRacha = 0;
    racha_ui.innerHTML = currentRacha;
    retro.innerHTML = "¿Segur@?";
    retro.style.color = "#FF2977";
    imagen.src="gifs/no.gif";
}

function right_answer () {
    currentRacha++;
    let multiplier = currentRacha >= 10 ? 2 : (currentRacha >= 5 ? 1.5 : 1);
    let basePoints = Math.floor(Math.pow(dificultad_set, 1.5));
    currentScore += Math.floor(basePoints * multiplier);
    
    score_ui.innerHTML = currentScore;
    racha_ui.innerHTML = currentRacha;
    
    retro.innerHTML = "¡Correcto!";
    retro.style.color = "#26C5AE";
    imagen.src="gifs/si.gif"
    setTimeout(function() {
      generate();
    }, 2000);

}

// create necessary variables
var sumando1, sumando2, error1, error2, sorteo, correcto, incorrecto1, incorrecto2, resultados;


//variables sumas
function generate () {

//reset feedback
retro.innerHTML="&nbsp;";
retro.style.color="";
imagen.src="gifs/neutral.gif";

//generate random values to add, and put them in the HTML
let num1 = Math.floor((Math.random() * dificultad_set) + 1);
let num2 = Math.floor((Math.random() * dificultad_set) + 1);

// Ensure sumando1 is the larger number to avoid negative results
sumando1 = Math.max(num1, num2);
sumando2 = Math.min(num1, num2);

divsumando1.innerHTML = sumando1;
divsumando2.innerHTML = sumando2;

//define right and wrong answers
correcto = sumando1 - sumando2;

let rank = Math.floor(Math.random() * 3); // 0 = correct is lowest, 1 = middle, 2 = highest

let inc1, inc2;
if (rank === 0) {
    // Correct is lowest: we need two unique higher numbers
    inc1 = correcto + Math.floor(Math.random() * 3) + 1; 
    inc2 = inc1 + Math.floor(Math.random() * 3) + 1; 
} else if (rank === 2) {
    // Correct is highest: we need two unique lower numbers
    inc1 = correcto - Math.floor(Math.random() * 3) - 1; 
    inc2 = inc1 - Math.floor(Math.random() * 3) - 1; 
    
    // Prevent zero or negative options
    if (inc2 <= 0) {
        inc1 = correcto + Math.floor(Math.random() * 3) + 1;
        inc2 = inc1 + Math.floor(Math.random() * 3) + 1;
    }
} else {
    // Correct is middle: one lower, one higher
    inc1 = correcto - Math.floor(Math.random() * 3) - 1;
    inc2 = correcto + Math.floor(Math.random() * 3) + 1;
    
    // Prevent zero or negative options
    if (inc1 <= 0) {
        inc1 = correcto + Math.floor(Math.random() * 3) + 1;
        inc2 = inc1 + Math.floor(Math.random() * 3) + 1;
    }
}

let opciones = [correcto, inc1, inc2];

// Sort them numerically so the options look ordered on screen from left to right
opciones.sort((a, b) => a - b);

btnopcion1.innerHTML = opciones[0];
btnopcion2.innerHTML = opciones[1];
btnopcion3.innerHTML = opciones[2];
}
  
//validate buttons 
function checkAnswer(btnNum) {
    var selectedBtn = document.getElementById("btnopcion" + btnNum);
    if (selectedBtn.innerText == correcto){
      right_answer()
    } else {
      wrong_answer()
    }
  }

//call main function
generate();

// Settings Modal Logic
function toggleSettings() {
    const panel = document.getElementById("settingsPanel");
    const overlay = document.getElementById("settingsOverlay");
    const isVisible = overlay.style.display === "block";
    panel.style.display = isVisible ? "none" : "block";
    overlay.style.display = isVisible ? "none" : "block";
}

function applySettings() {
    generate();
    toggleSettings();
}

function cancelSettings() {
    toggleSettings();
}

// Arcade Firebase Logic
async function terminarJuego() {
    if (currentScore <= 0) {
        alert("¡Juega un poco más para obtener una puntuación!");
        return;
    }
    
    const isTop10 = await isHighScore("restas", currentScore);
    
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
    
    const settingsStr = "Max: " + dificultad_set;
    await saveHighScore("restas", initials, currentScore, settingsStr);
    
    document.getElementById("highScoreOverlay").style.display = "none";
    document.getElementById("highScorePanel").style.display = "none";
    
    alert("¡Puntuación guardada exitosamente!");
    resetGame();
}

function resetGame() {
    currentScore = 0;
    currentRacha = 0;
    score_ui.innerHTML = currentScore;
    racha_ui.innerHTML = currentRacha;
    generate();
}