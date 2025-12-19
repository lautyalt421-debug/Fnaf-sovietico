let GAME = { active: false, hour: 0, power: 100, camOpen: false, doorClosed: false, maskOn: false, currentCam: 1, night: 1 };
const IMG_PATH = "assets/images/";
const camNames = { 1: "muelle", 2: "pasillo", 3: "calderas", 4: "patio", 5: "nodo" };
const BOTS = { stalnoy: { pos: 1, path: [1, 2, 4, 100] }, prizrak: { pos: 1, path: [1, 3, 100] } };

function startGame(nightNum) {
    GAME.active = true;
    GAME.night = nightNum;
    
    // Dificultad escalable: IA más rápida y menos batería por noche
    let aiSpeed = 6000 - (nightNum * 800);
    let powerMult = 1 + (nightNum * 0.15);

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    document.getElementById('office-bg').style.backgroundImage = `url('${IMG_PATH}oficina_base.jpg')`;
    
    setInterval(tickClock, 60000); 
    setInterval(() => updatePower(powerMult), 1500); 
    setInterval(moveBots, aiSpeed); 
}

function tickClock() {
    if (!GAME.active) return;
    GAME.hour++;
    document.getElementById('clock').innerText = `${GAME.hour}:00 AM`;
    if (GAME.hour === 6) endGame("¡SOBREVIVISTE A LA NOCHE " + GAME.night + "!");
}

function updatePower(mult) {
    if (!GAME.active) return;
    let drain = 0.1 * mult;
    if (GAME.camOpen) drain += 0.3;
    if (GAME.doorClosed) drain += 0.6;
    GAME.power -= drain;
    document.getElementById('power-num').innerText = Math.floor(GAME.power);
    document.getElementById('power-fill').style.width = GAME.power + "%";
    if (GAME.power <= 0) endGame("SIN ENERGÍA - ESTÁS INDEFENSO");
}

function moveBots() {
    if (!GAME.active) return;
    for (let b in BOTS) {
        if (Math.random() > 0.5) {
            let bot = BOTS[b];
            let idx = bot.path.indexOf(bot.pos);
            if (idx < bot.path.length - 1) bot.pos = bot.path[idx + 1];
            if (bot.pos === 100) checkAttack(b);
        }
    }
}

function checkAttack(name) {
    if (name === 'stalnoy' && !GAME.doorClosed) endGame("STALNOY TE ATRAPÓ");
    if (name === 'prizrak' && !GAME.maskOn) endGame("PRIZRAK TE ATRAPÓ");
    if (GAME.active) BOTS[name].pos = 1; 
}

function toggleMonitor() {
    GAME.camOpen = !GAME.camOpen;
    document.getElementById('camera-monitor').classList.toggle('hidden');
    if (GAME.camOpen) changeCam(GAME.currentCam);
}

function changeCam(id) {
    GAME.currentCam = id;
    let enemy = "";
    for (let b in BOTS) { if (BOTS[b].pos === id) enemy = "_" + b; }
    document.getElementById('cam-img').src = `${IMG_PATH}${camNames[id]}${enemy}.jpg`;
    document.getElementById('cam-name').innerText = `CCTV: ${camNames[id].toUpperCase()}`;
}

function toggleDoor() {
    GAME.doorClosed = !GAME.doorClosed;
    document.getElementById('btn-door').innerText = GAME.doorClosed ? "🚪 PUERTA: CERRADA" : "🚪 PUERTA: ABIERTA";
}

function toggleMask() {
    GAME.maskOn = !GAME.maskOn;
    document.getElementById('btn-mask').style.background = GAME.maskOn ? "#0f0" : "#222";
}

function endGame(msg) { GAME.active = false; alert(msg); location.reload(); }
