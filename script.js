let GAME = { 
    active: false, 
    hour: 0, 
    power: 100, 
    camOpen: false, 
    doorClosed: false, 
    maskOn: false, 
    currentCam: 1, 
    night: 1 
};

const IMG_PATH = "assets/images/";
const camNames = { 1: "muelle", 2: "pasillo", 3: "calderas", 4: "patio", 5: "nodo" };

const BOTS = {
    stalnoy: { pos: 1, path: [1, 2, 4, 100], active: false },
    prizrak: { pos: 1, path: [1, 3, 100], active: false },
    svyaz: { pos: 1, path: [1, 5, 2, 100], active: false }
};

const sounds = {
    ambient: new Audio('assets/audio/ambiente.mp3'),
    door: new Audio('assets/audio/puerta_metal.mp3'),
    scare: new Audio('assets/audio/grito.mp3')
};
sounds.ambient.loop = true;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-mask').addEventListener('pointerdown', toggleMask);
    document.getElementById('btn-monitor').addEventListener('pointerdown', toggleMonitor);
    document.getElementById('btn-door').addEventListener('pointerdown', toggleDoor);
    loadMenu();
});

// --- FUNCIONES DE INTERFAZ ---
function toggleDoor() {
    if(!GAME.active) return;
    
    GAME.doorClosed = !GAME.doorClosed;
    sounds.door.play();
    
    const office = document.getElementById('office-bg');
    const btnDoor = document.getElementById('btn-door');
    
    if (GAME.doorClosed) {
        office.style.backgroundImage = `url('${IMG_PATH}oficina_cerrada.jpg')`;
        btnDoor.classList.add('active-btn');
    } else {
        let normalBG = (GAME.night === 5) ? "oficina_rota.jpg" : "oficina_base.jpg";
        office.style.backgroundImage = `url('${IMG_PATH}${normalBG}')`;
        btnDoor.classList.remove('active-btn');
    }
}

function toggleMask() {
    if(!GAME.active) return;
    GAME.maskOn = !GAME.maskOn;
    if(GAME.camOpen && GAME.maskOn) toggleMonitor();
    document.getElementById('mask-overlay').classList.toggle('hidden');
    document.getElementById('btn-mask').classList.toggle('active-btn');
}

function toggleMonitor() {
    if(!GAME.active || GAME.maskOn) return;
    GAME.camOpen = !GAME.camOpen;
    document.getElementById('camera-monitor').classList.toggle('hidden');
    if(GAME.camOpen) changeCam(GAME.currentCam);
}

function changeCam(id) {
    GAME.currentCam = id;
    const staticL = document.getElementById('static-layer');
    staticL.classList.add('static-total');
    
    setTimeout(() => {
        let enemy = "";
        let isEnemyHere = false;
        for (let b in BOTS) { 
            if (BOTS[b].active && BOTS[b].pos === id) {
                enemy = "_" + b;
                isEnemyHere = true;
            }
        }
        staticL.classList.remove('static-total');
        if(isEnemyHere) staticL.classList.add('static-strong'); 
        else staticL.classList.remove('static-strong');

        document.getElementById('cam-img').src = `${IMG_PATH}${camNames[id]}${enemy}.jpg`;
        document.getElementById('cam-name').innerText = `CCTV: ${camNames[id].toUpperCase()}`;
    }, 200);
}

// --- LÓGICA DE JUEGO ---
function updatePower() {
    if(!GAME.active) return;
    let usage = 1;
    if(GAME.doorClosed) usage++;
    if(GAME.camOpen) usage++;
    if(GAME.maskOn) usage++;

    document.getElementById('usage-visual').innerText = "[I]".repeat(usage);
    GAME.power -= (0.12 * usage) + (GAME.night * 0.03);
    
    document.getElementById('power-num').innerText = Math.max(0, Math.floor(GAME.power));
    document.getElementById('power-fill').style.width = GAME.power + "%";
    if(GAME.power <= 0) endGame("SISTEMAS APAGADOS");
}

function moveBots() {
    if(!GAME.active) return;
    for(let b in BOTS) {
        let bot = BOTS[b];
        if(bot.active && Math.random() > 0.4) {
            let oldPos = bot.pos;
            let idx = bot.path.indexOf(bot.pos);
            if(idx < bot.path.length - 1) bot.pos = bot.path[idx + 1];
            
            if(oldPos === GAME.currentCam && GAME.camOpen) {
                document.getElementById('static-layer').classList.add('static-total');
                setTimeout(() => changeCam(GAME.currentCam), 500);
            }
            if(bot.pos === 100) checkAttack(b);
        }
    }
}

function checkAttack(name) {
    if(name === 'stalnoy' && !GAME.doorClosed) endGame("STALNOY TE ATRAPÓ");
    if(name === 'prizrak' && !GAME.maskOn) endGame("PRIZRAK TE ATRAPÓ");
    if(name === 'svyaz' && GAME.camOpen) endGame("ERROR DE MONITOR");
    BOTS[name].pos = 1;
}

function tickClock() {
    GAME.hour++;
    document.getElementById('clock').innerText = GAME.hour + ":00 AM";
    if(GAME.hour === 6) {
        let unlocked = parseInt(localStorage.getItem('sombra_night') || 1);
        if(GAME.night >= unlocked) localStorage.setItem('sombra_night', GAME.night + 1);
        endGame("¡SOBREVIVISTE!");
    }
}

// --- CONTROL DE SESIÓN ---
function startGame(n) {
    GAME.active = true; GAME.night = n; GAME.power = 100; GAME.hour = 0;
    GAME.doorClosed = false;
    GAME.maskOn = false;
    GAME.camOpen = false;

    BOTS.stalnoy.active = n >= 1;
    BOTS.prizrak.active = n >= 2;
    BOTS.svyaz.active = (n >= 3 && n !== 5); // Svyaz no aparece en la Bossfight
    if(n >= 4 && n !== 5) Object.values(BOTS).forEach(b => b.active = true);
    
    sounds.ambient.play();
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    document.getElementById('btn-door').classList.remove('active-btn');
    
    let bg = (n === 5) ? "oficina_rota.jpg" : "oficina_base.jpg";
    document.getElementById('office-bg').style.backgroundImage = `url('${IMG_PATH}${bg}')`;

    window.gameIntervals = [
        setInterval(tickClock, 45000),
        setInterval(updatePower, 1000),
        setInterval(moveBots, 8000 - (n * 1000))
    ];
}

function endGame(m) {
    GAME.active = false;
    window.gameIntervals.forEach(clearInterval);
    if(!m.includes("SOBREVIVISTE")) sounds.scare.play();
    alert(m);
    location.reload();
}

function loadMenu() {
    const menu = document.getElementById('night-menu');
    const unlocked = localStorage.getItem('sombra_night') || 1;
    for (let i = 1; i <= 6; i++) {
        let btn = document.createElement('button');
        btn.innerText = i === 5 ? "JEFE" : (i === 6 ? "MODO 6" : "NOCHE " + i);
        if (i > unlocked) btn.className = 'locked';
        btn.onclick = () => startGame(i);
        menu.appendChild(btn);
    }
}

function resetProgress() { localStorage.clear(); location.reload(); }
