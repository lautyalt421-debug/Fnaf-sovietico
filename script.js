let GAME = { active: false, hour: 0, power: 100, camOpen: false, doorClosed: false, maskOn: false, currentCam: 1, night: 1, molotActive: false, nodesHit: 0 };
const IMG_PATH = "assets/images/";
const SPRITE_PATH = "assets/sprites/";

const BOTS = {
    stalnoy: { pos: 1, path: [1, 2, 4, 100], gif: "stalnoy_scare.gif" },
    prizrak: { pos: 1, path: [1, 3, 100], gif: "prizrak_scare.gif" },
    svyaz: { pos: 1, path: [1, 5, 2, 100], gif: "svyaz_scare.gif" },
    molot: { pos: 1, gif: "molot_scare.gif" }
};

window.onload = loadMenu;

function loadMenu() {
    const menu = document.getElementById('night-menu');
    menu.innerHTML = "";
    const unlocked = parseInt(localStorage.getItem('sombra_night') || 1);
    for (let i = 1; i <= 6; i++) {
        let btn = document.createElement('button');
        btn.innerText = (i === 6) ? "???" : "NOCHE " + i;
        if (i > unlocked) btn.style.opacity = "0.2";
        else btn.onclick = () => startGame(i);
        menu.appendChild(btn);
    }
    document.getElementById('btn-reset').onclick = () => { localStorage.clear(); location.reload(); };
}

function startGame(n) {
    GAME.active = true; GAME.night = n; GAME.power = 100; GAME.hour = 0;
    GAME.molotActive = false;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');

    const bind = (id, fn) => {
        const el = document.getElementById(id);
        el.onclick = fn;
        el.ontouchstart = (e) => { e.preventDefault(); fn(); };
    };

    bind('btn-mask', toggleMask);
    bind('btn-door', toggleDoor);
    bind('btn-monitor', toggleMonitor);
    bind('btn-cam-close', toggleMonitor);

    document.querySelectorAll('.cam-btn').forEach(btn => {
        btn.onclick = () => changeCam(parseInt(btn.dataset.cam));
    });

    updateOfficeImg();
    window.gameIntervals = [
        setInterval(tickClock, 45000),
        setInterval(updatePower, 1000),
        setInterval(moveBots, 5500)
    ];
}

function updatePower() {
    if(!GAME.active) return;
    let consumption = 1 + (GAME.doorClosed?1:0) + (GAME.camOpen?1:0) + (GAME.maskOn?1:0);
    document.getElementById('usage-visual').innerText = "I".repeat(consumption);
    GAME.power -= (0.12 * consumption);
    document.getElementById('power-num').innerText = Math.max(0, Math.floor(GAME.power));
    if(GAME.power <= 0) triggerJumpscare('svyaz');
}

function moveBots() {
    if(!GAME.active) return;

    // NOCHE 5: Solo Molot y Stalnoy
    if(GAME.night === 5) {
        // Stalnoy se mueve
        if(Math.random() > 0.3) {
            let idx = BOTS.stalnoy.path.indexOf(BOTS.stalnoy.pos);
            if(idx < BOTS.stalnoy.path.length - 1) BOTS.stalnoy.pos = BOTS.stalnoy.path[idx+1];
            if(BOTS.stalnoy.pos === 100) checkAttack('stalnoy');
        }
        // Molot ataca
        if(GAME.camOpen && !GAME.molotActive && Math.random() > 0.8) {
            startMolotMinigame();
        }
        return; // Detener aquí para que otros no se muevan
    }

    // Noches Normales (IA Escalada)
    let moveChance = GAME.night === 4 ? 0.65 : 0.5;
    for(let b in BOTS) {
        if(b === 'molot') continue;
        if(Math.random() < moveChance) {
            let idx = BOTS[b].path.indexOf(BOTS[b].pos);
            if(idx < BOTS[b].path.length - 1) BOTS[b].pos = BOTS[b].path[idx+1];
            if(BOTS[b].pos === 100) checkAttack(b);
        }
    }
}

function startMolotMinigame() {
    GAME.molotActive = true;
    GAME.nodesHit = 0;
    const ui = document.getElementById('molot-minigame');
    const container = document.getElementById('node-container');
    container.innerHTML = "";
    ui.classList.remove('hidden');

    for(let i=1; i<=4; i++) {
        let node = document.createElement('div');
        node.className = "node"; node.innerText = i;
        node.style.left = (Math.random() * 80) + "%"; node.style.top = (Math.random() * 80) + "%";
        
        const hit = () => {
            if(i === GAME.nodesHit + 1) {
                GAME.nodesHit++; node.classList.add('active');
                if(GAME.nodesHit === 4) { GAME.molotActive = false; ui.classList.add('hidden'); }
            }
        };
        node.onclick = hit; node.ontouchstart = (e) => { e.preventDefault(); hit(); };
        container.appendChild(node);
    }
    setTimeout(() => { if(GAME.molotActive) triggerJumpscare('molot'); }, 5000);
}

function checkAttack(name) {
    if(name === 'stalnoy' && !GAME.doorClosed) triggerJumpscare('stalnoy');
    else if(name === 'prizrak' && GAME.camOpen) triggerJumpscare('prizrak');
    else if(name === 'svyaz') startOxygenFailure();
    else BOTS[name].pos = 1;
}

function triggerJumpscare(bot) {
    if(!GAME.active) return;
    GAME.active = false;
    window.gameIntervals.forEach(clearInterval);
    document.getElementById('jumpscare-img').src = SPRITE_PATH + BOTS[bot].gif + "?t=" + Date.now();
    document.getElementById('jumpscare-container').classList.remove('hidden');
    setTimeout(() => { location.reload(); }, 2000);
}

// ... (El resto de funciones: toggleDoor, toggleMask, changeCam, etc., igual que antes)
function toggleDoor() { if(!GAME.active || GAME.maskOn) return; GAME.doorClosed = !GAME.doorClosed; updateOfficeImg(); document.getElementById('btn-door').classList.toggle('active-btn'); }
function toggleMask() { if(!GAME.active || GAME.camOpen) return; GAME.maskOn = !GAME.maskOn; document.getElementById('mask-overlay').classList.toggle('hidden'); document.getElementById('btn-mask').classList.toggle('active-btn'); }
function toggleMonitor() { if(!GAME.active || (GAME.maskOn && !GAME.camOpen) || GAME.molotActive) return; GAME.camOpen = !GAME.camOpen; document.getElementById('camera-monitor').classList.toggle('hidden'); if(GAME.camOpen) changeCam(GAME.currentCam); }
function changeCam(id) { GAME.currentCam = id; let hasBot = false; let enemy = ""; for (let b in BOTS) { if (BOTS[b].pos === id && b !== 'molot') { hasBot = true; enemy = "_" + b; } } document.getElementById('static-layer').style.opacity = hasBot ? "0.8" : "0.2"; const camFiles = {1:"muelle", 2:"pasillo", 3:"calderas", 4:"patio", 5:"nodo"}; document.getElementById('cam-img').src = `${IMG_PATH}${camFiles[id]}${enemy}.jpg`; }
function updateOfficeImg() { let base = GAME.night === 5 ? "oficina_rota.jpg" : "oficina_base.jpg"; if(GAME.doorClosed) base = "oficina_cerrada.jpg"; document.getElementById('office-bg').style.backgroundImage = `url('${IMG_PATH}${base}')`; }
function startOxygenFailure() { document.getElementById('oxygen-alert').classList.remove('hidden'); setTimeout(() => { if(!GAME.maskOn) triggerJumpscare('svyaz'); else { document.getElementById('oxygen-alert').classList.add('hidden'); BOTS.svyaz.pos = 1; } }, 5000); }
function tickClock() { GAME.hour++; document.getElementById('clock').innerText = (GAME.hour === 0 ? "12" : GAME.hour) + ":00 AM"; if(GAME.hour === 6) { GAME.active = false; window.gameIntervals.forEach(clearInterval); localStorage.setItem('sombra_night', GAME.night + 1); document.getElementById('win-screen').classList.remove('hidden'); } }
                   
