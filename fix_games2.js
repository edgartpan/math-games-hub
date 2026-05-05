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

    // 1. Fix "Valor máximo de los sumandos" -> "Valor máximo de los números"
    // Also change the structure to use <input type="number">
    if (game !== 'soroban') {
        const oldSettingsPanel = /<div style="text-align: center; margin-bottom: 20px;">\s*<div class="difficulty-label" style="font-size: 18px;">Valor máximo de los.*?<\/div>\s*<div style="margin-top: 15px;">\s*<button id="baja" onclick="decrease\(\)" class="button-3d btn-control">-<\/button>\s*<span id="difficulty".*?<\/span>\s*<button id="sube" onclick="increase\(\)" class="button-3d btn-control">\+<\/button>\s*<\/div>\s*<\/div>/g;

        const newSettingsPanel = `<div style="text-align: center; margin-bottom: 20px;">
              <div class="difficulty-label" style="font-size: 18px;">Valor máximo de los números:</div>
              <div style="margin-top: 15px; display: flex; justify-content: center; align-items: center; gap: 10px;">
                  <button id="baja" onclick="decrease()" class="button-3d btn-control" style="width: 40px; padding: 5px 0;">-</button>
                  <input type="number" id="difficulty" class="text" style="width: 100px; font-size:30px; text-align: center; border: 2px solid #ccc; border-radius: 8px; margin: 0; padding: 5px;" onchange="updateDifficulty(this.value)">
                  <button id="sube" onclick="increase()" class="button-3d btn-control" style="width: 40px; padding: 5px 0;">+</button>
              </div>
          </div>`;
          
        html = html.replace(oldSettingsPanel, newSettingsPanel);

        // 4. JS Settings Logic Update
        js = js.replace(/difficulty\.innerHTML = dificultad_set;/g, 'difficulty.value = dificultad_set;');
        if (!js.includes('function updateDifficulty')) {
            js = js.replace('function applySettings()', `function updateDifficulty(val) {
    let num = parseInt(val);
    if (!isNaN(num) && num >= 1) {
        dificultad_set = num;
    } else {
        difficulty.value = dificultad_set;
    }
}

function applySettings()`);
        }
    }

    // 2. Fix the missing Input field in "-teclado" apps
    if (game.endsWith('-teclado')) {
        let baseName = game.split('-')[0];
        let titleName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        html = html.replace(`<title>${titleName}!</title>`, `<title>${titleName}! (Teclado)</title>`);
        
        // Remove 3 buttons, replace with input field.
        const oldButtons = /<div style="text-align:center;">\s*<button id="btnopcion1".*?<\/button>\s*<button id="btnopcion2".*?<\/button>\s*<button id="btnopcion3".*?<\/button>\s*<\/div>/g;
        
        const newControls = `<div id="controls" style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 20px;">
        <input type="number" id="userAnswer" style="width: 200px; height: 80px; font-size: 50px; text-align: center; margin-bottom: 20px; border: 2px solid #000; border-radius: 10px;">
        <button onclick="validar()" class="button-3d" style="background-color: #6358FF; color: white;">Validar</button>
      </div>`;
      
        html = html.replace(oldButtons, newControls);

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
            
            // Generate in Teclado shouldn't deal with btnopcion
            js = js.replace(/btnopcion1\.innerHTML = opciones\[0\];\s*btnopcion2\.innerHTML = opciones\[1\];\s*btnopcion3\.innerHTML = opciones\[2\];/g, 'userAnswer.value = "";\nuserAnswer.focus();');
            
            // update firebase keys
            js = js.replace(new RegExp(`"${baseName}"`, 'g'), `"${game}"`);
        }
    }

    fs.writeFileSync(htmlPath, html, 'utf8');
    fs.writeFileSync(jsPath, js, 'utf8');
});

console.log("Fixes applied.");
