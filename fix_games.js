const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');
const games = fs.readdirSync(gamesDir).filter(d => fs.statSync(path.join(gamesDir, d)).isDirectory());

games.forEach(game => {
    const htmlPath = path.join(gamesDir, game, 'index.html');
    const jsPath = path.join(gamesDir, game, 'script.js');
    if (!fs.existsSync(htmlPath) || !fs.existsSync(jsPath)) return;

    let html = fs.readFileSync(htmlPath, 'utf8');
    let js = fs.readFileSync(jsPath, 'utf8');

    // 1. Settings HTML Update (skip soroban since it has custom settings)
    if (game !== 'soroban') {
        html = html.replace(
            /<div class="difficulty-label">.*?<\/div>[\s\S]*?<span id="difficulty" class="text"><\/span>[\s\S]*?<\/button>\s*<\/div>/,
            `<div class="difficulty-label">Valor máximo de los números:</div>
              <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
                  <button onclick="decrease()" class="button-3d btn-control" style="width: 40px; padding: 5px 0;">-</button>
                  <input type="number" id="difficulty" class="text" style="width: 100px; text-align: center; border: 2px solid #ccc; border-radius: 8px; margin: 0; padding: 5px;" onchange="updateDifficulty(this.value)">
                  <button onclick="increase()" class="button-3d btn-control" style="width: 40px; padding: 5px 0;">+</button>
              </div>`
        );

        // 4. JS Settings Logic Update
        js = js.replace(/difficulty\.innerHTML = dificultad_set;/g, 'difficulty.value = dificultad_set;');
        if (!js.includes('function updateDifficulty')) {
            js = js.replace('function applySettings()', `function updateDifficulty(val) {
    let num = parseInt(val);
    if (!isNaN(num) && num >= 10) {
        dificultad_set = num;
    } else {
        difficulty.value = dificultad_set;
    }
}

function applySettings()`);
        }
    }

    // 2 & 5. Keyboard Mod
    if (game.endsWith('-teclado')) {
        let baseName = game.split('-')[0];
        let titleName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        html = html.replace(`<title>${titleName}!</title>`, `<title>${titleName}! (Teclado)</title>`);
        
        // Remove old buttons, add input
        if (!html.includes('id="userAnswer"')) {
            html = html.replace(
                /<div id="controls"[\s\S]*?<\/div>/,
                `<div id="controls" style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 20px;">
                    <input type="number" id="userAnswer" style="width: 200px; height: 80px; font-size: 50px; text-align: center; margin-bottom: 20px; border: 2px solid #000; border-radius: 10px;">
                    <button onclick="validar()" class="button-3d" style="background-color: #6358FF; color: white;">Validar</button>
                </div>`
            );
        }

        // Add userAnswer var and validar function in JS
        if (!js.includes('var userAnswer = document.getElementById("userAnswer")')) {
            js = js.replace('var divsumando1', 'var userAnswer = document.getElementById("userAnswer");\nvar divsumando1');
            
            // Rewrite checkAnswer -> validar
            let validarFunc = `
function validar() {
    let val = parseFloat(userAnswer.value);
    if(isNaN(val)) return;
    if (val === correcto) {
        // Correct
        currentRacha++;
        let ptos = Math.floor(dificultad_set / 5);
        if (ptos < 1) ptos = 1;
        currentScore += Math.floor(ptos * Math.pow(1.1, currentRacha - 1));
        
        retro.innerHTML = "¡Correcto!";
        retro.style.color = "#58FFC2";
        imagen.src = "gifs/right.gif";
    } else {
        // Wrong
        currentRacha = 0;
        retro.innerHTML = "¡Incorrecto! Era " + correcto;
        retro.style.color = "#FF2977";
        imagen.src = "gifs/wrong.gif";
    }
    
    score_ui.innerHTML = currentScore;
    racha_ui.innerHTML = currentRacha;
    userAnswer.value = "";
    userAnswer.focus();
    
    setTimeout(function() {
        generate();
    }, 2000);
}`;
            js = js.replace(/function checkAnswer[\s\S]*?2000\);\n}/, validarFunc);
            
            // update firebase keys
            js = js.replace(new RegExp(`"${baseName}"`, 'g'), `"${game}"`);
        }
    }

    // 3. isGameTerminated Mod
    if (!js.includes('let isGameTerminated = false;')) {
        js = 'let isGameTerminated = false;\n' + js;
        
        // in terminarJuego
        js = js.replace('async function terminarJuego() {', 'async function terminarJuego() {\n    isGameTerminated = true;');
        
        // in resetGame
        js = js.replace('function resetGame() {', 'function resetGame() {\n    isGameTerminated = false;');
        
        // in generate
        js = js.replace('function generate () {', 'function generate () {\n    if(isGameTerminated) return;');
        js = js.replace('function generate() {', 'function generate() {\n    if(isGameTerminated) return;');
    }

    // 6. Magnitudes logic
    if (game === 'magnitudes') {
        html = html.replace('> VS <', '> vs <');
        if (!html.includes('¿Qué resultado es mayor?')) {
            html = html.replace('<div style="text-align:center; padding-top: 50px;', '<div style="text-align:center; padding-top: 30px; font-size: 24px; font-weight: bold;">¿Qué resultado es mayor?</div>\n      <div style="text-align:center; padding-top: 20px;');
        }
    }

    fs.writeFileSync(htmlPath, html, 'utf8');
    fs.writeFileSync(jsPath, js, 'utf8');
});

console.log("Done updating games.");
