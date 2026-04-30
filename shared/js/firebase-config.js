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
    apiKey: "PEGAR_AQUI_TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef"
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
            name: playerName.toUpperCase().substring(0, 3),
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
