// shared/js/firebase-config.js

/* 
 * =====================================================================
 * ⚠️ ATENCIÓN: CONFIGURACIÓN DE FIREBASE REQUERIDA
 * =====================================================================
 * Para que el Leaderboard funcione, debes crear un proyecto en Firebase:
 * 1. Ve a https://console.firebase.google.com/ y crea un proyecto.
 * 2. Activa "Firestore Database" en modo de prueba (o configura reglas para escritura anónima).
 * 3. Ve a Project Settings > General > "Add app" (ícono de Web </>)
 * 4. Copia tu "firebaseConfig" real y reemplázalo aquí abajo:
 */

const firebaseConfig = {
    apiKey: "AIzaSyAmHPNej3Qpmt4jb3V5Rbfrbm_MsEnWKVY",
    authDomain: "math-hub-a45c5.firebaseapp.com",
    projectId: "math-hub-a45c5",
    storageBucket: "math-hub-a45c5.firebasestorage.app",
    messagingSenderId: "3003341330",
    appId: "1:3003341330:web:c35d806e7d09fbc83796cb",
    measurementId: "G-XY314T89QP"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ---------------------------------------------------------
// Lógica del Leaderboard Global
// ---------------------------------------------------------

/**
 * Guarda una puntuación en Firestore
 * @param {string} gameId - "sumas", "restas", o "soroban"
 * @param {string} playerName - 3 letras, ej. "EDG"
 * @param {number} score - Puntuación calculada
 * @param {string} settingsInfo - String describiendo la dificultad usada
 */
async function saveHighScore(gameId, playerName, score, settingsInfo) {
    try {
        await db.collection("leaderboards").doc(gameId).collection("scores").add({
            name: playerName.trim().substring(0, 15),
            score: Math.floor(score),
            date: firebase.firestore.FieldValue.serverTimestamp(),
            settings: settingsInfo
        });
        console.log("Puntuación guardada exitosamente");
    } catch (error) {
        console.error("Error al guardar la puntuación:", error);
    }
}

/**
 * Obtiene el Top 10 de un juego específico
 */
async function getTopScores(gameId) {
    try {
        const snapshot = await db.collection("leaderboards")
            .doc(gameId)
            .collection("scores")
            .orderBy("score", "desc")
            .limit(10)
            .get();

        let scores = [];
        snapshot.forEach(doc => {
            scores.push(doc.data());
        });
        return scores;
    } catch (error) {
        console.error("Error al obtener puntuaciones:", error);
        return [];
    }
}

/**
 * Verifica si una puntuación entra en el Top 10
 */
async function isHighScore(gameId, newScore) {
    if (newScore <= 0) return false;

    const scores = await getTopScores(gameId);
    if (scores.length < 10) return true; // Si hay menos de 10, siempre entra

    // El último (menor) de la lista actual
    const lowestTopScore = scores[scores.length - 1].score;
    return newScore > lowestTopScore;
}

// --- Global UI Overrides ---

// Custom Alert Override
window.alert = function(msg) {
    let overlay = document.getElementById("customAlertOverlay");
    let panel = document.getElementById("customAlertPanel");
    if(!overlay) {
        overlay = document.createElement("div");
        overlay.id = "customAlertOverlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0"; overlay.style.left = "0"; overlay.style.right = "0"; overlay.style.bottom = "0";
        overlay.style.background = "rgba(0,0,0,0.5)"; overlay.style.zIndex = "9998";
        document.body.appendChild(overlay);

        panel = document.createElement("div");
        panel.id = "customAlertPanel";
        panel.style.position = "fixed";
        panel.style.top = "20%"; panel.style.left = "50%"; panel.style.transform = "translateX(-50%)";
        panel.style.backgroundColor = "#F5F5F5"; panel.style.padding = "30px";
        panel.style.width = "90%"; panel.style.maxWidth = "320px";
        panel.style.zIndex = "9999"; panel.style.textAlign = "center";
        panel.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.2)";
        panel.style.borderRadius = "15px"; panel.style.fontFamily = "'Inria Sans', sans-serif";
        
        let msgDiv = document.createElement("div");
        msgDiv.id = "customAlertMessage";
        msgDiv.style.fontSize = "18px"; msgDiv.style.marginBottom = "20px";
        
        let btn = document.createElement("button");
        btn.innerText = "OK";
        btn.className = "button-3d";
        btn.style.width = "auto"; btn.style.padding = "10px 40px"; btn.style.fontSize = "16px";
        btn.style.cursor = "pointer";
        btn.onclick = () => { overlay.style.display = "none"; panel.style.display = "none"; };

        panel.appendChild(msgDiv);
        panel.appendChild(btn);
        document.body.appendChild(panel);
    }
    document.getElementById("customAlertMessage").innerText = msg;
    overlay.style.display = "block";
    panel.style.display = "block";
};

// Intercept "Volver a inicio"
document.addEventListener("DOMContentLoaded", () => {
    let homeLinks = document.querySelectorAll("a[href='../../index.html']");
    homeLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            if (typeof currentScore !== 'undefined' && currentScore > 0 && typeof isHighScore !== 'undefined') {
                e.preventDefault();
                handleUnsavedExit(link.href);
            }
        });
    });
});

async function handleUnsavedExit(href) {
    let gameId = window.location.pathname.split('/').slice(-2, -1)[0];
    const isTop10 = await isHighScore(gameId, currentScore);
    
    if (isTop10) {
        let overlay = document.getElementById("exitOverlay");
        let panel = document.getElementById("exitPanel");
        if(!overlay) {
            overlay = document.createElement("div");
            overlay.id = "exitOverlay";
            overlay.style.position = "fixed";
            overlay.style.top = "0"; overlay.style.left = "0"; overlay.style.right = "0"; overlay.style.bottom = "0";
            overlay.style.background = "rgba(0,0,0,0.5)"; overlay.style.zIndex = "9998";
            document.body.appendChild(overlay);

            panel = document.createElement("div");
            panel.id = "exitPanel";
            panel.style.position = "fixed";
            panel.style.top = "20%"; panel.style.left = "50%"; panel.style.transform = "translateX(-50%)";
            panel.style.backgroundColor = "#F5F5F5"; panel.style.padding = "30px";
            panel.style.width = "90%"; panel.style.maxWidth = "320px";
            panel.style.zIndex = "9999"; panel.style.textAlign = "center";
            panel.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.2)";
            panel.style.borderRadius = "15px"; panel.style.fontFamily = "'Inria Sans', sans-serif";
            
            panel.innerHTML = `
                <div style="font-size:18px; font-weight:bold; margin-bottom:15px;">¡Tienes un récord sin guardar!</div>
                <div style="font-size:14px; margin-bottom:15px;">Ingresa tu nombre antes de salir:</div>
                <input type="text" id="exitInitials" class="name-input" maxlength="15" autocomplete="off" style="width:100%; box-sizing:border-box; font-size:20px; text-align:center; padding:10px; margin-bottom:20px; border:2px solid #ccc; border-radius:8px;">
                <div style="display:flex; justify-content:space-between; gap:10px;">
                    <button id="btnExitSkip" class="button-3d" style="background-color:#ccc; color:#333; width:auto; padding:10px 15px; font-size:14px;">Salir sin guardar</button>
                    <button id="btnExitSave" class="button-3d" style="width:auto; padding:10px 15px; font-size:14px;">Guardar y salir</button>
                </div>
            `;
            document.body.appendChild(panel);
            
            document.getElementById("btnExitSkip").onclick = () => { window.location.href = href; };
            document.getElementById("btnExitSave").onclick = async () => {
                let name = document.getElementById("exitInitials").value;
                if(name.trim().length > 0) {
                    await saveHighScore(gameId, name, currentScore, "Max: " + (typeof dificultad_set !== 'undefined' ? dificultad_set : ""));
                }
                window.location.href = href;
            };
        }
        overlay.style.display = "block";
        panel.style.display = "block";
    } else {
        // Not a high score, just leave
        window.location.href = href;
    }
}
