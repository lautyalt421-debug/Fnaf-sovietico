let GAME = { active: false, hour: 0, power: 100, camOpen: false, doorClosed: false, maskOn: false, currentCam: 1, night: 1 };
const IMG_PATH = "assets/images/";
const SPRITE_PATH = "assets/sprites/";

const BOTS = {
    stalnoy: { pos: 1, path: [1, 2, 4, 100], active: false, gif: "stalnoy_scare.gif" },
    prizrak: { pos: 1, path: [1, 3, 100], active: false, gif: "prizrak_scare.gif" },
    svyaz: { pos: 1, path: [1, 5, 2, 100], active: false, gif: "svyaz_scare.gif" }
};

const sounds = {
    ambient: new Audio('assets/audio/ambiente.mp3'),
    door: new Audio('assets/audio/puerta_metal.mp3'),
    scare: new Audio('assets/audio/grito.mp3'),
    breath: new Audio('assets/audio/respiracion.mp3')
};
sounds.ambient.loop = true; sounds.breath.loop = true;

document.addEventListener('DOMContentLoaded', loadMenu);

// ASIGNACIÓN MANUAL DE EVENTOS PARA EVITAR BUGS DE BLOQUEO
function setupButtons() {
    document.getElementById('btn-mask').onclick = toggleMask;
    document.getElementById('btn-door').onclick = toggleDoor;
    document.getElementById('btn-monitor').onclick = toggleMonitor;
}

function toggleDoor() {
    if(!GAME.active || GAME.maskOn) return; 
    GAME.doorClosed = !GAME.doorClosed;
    sounds.door.play();
    const office = document.getElementById('office-bg');
    office.style.backgroundImage = GAME.doorClosed ? `url('${IMG_PATH}oficina_cerrada.jpg')` : `url('${IMG_PATH}${GAME.night === 5 ? "oficina_rota.jpg" : "oficina_base.jpg"}')`;
    document.getElementById('btn-door').classList.toggle('active-btn');
}

function toggleMask() {
    if(!GAME.active) return;
    GAME.maskOn = !GAME.maskOn;
    
    const maskOverlay = document.getElementById('mask-overlay');
    const btnMonitor = document.getElementById('btn-monitor');
    const btnDoor = document.getElementById('btn-door');

    if(GAME.maskOn) {
        if(GAME.camOpen) toggleMonitor(); 
        maskOverlay.classList.remove('hidden');
        sounds.breath.play();
        // BLOQUEAMOS TODO EXCEPTO EL BOTÓN DE LA MÁSCARA
        btnMonitor.classList.add('controls-disabled');
        btnDoor.classList.add('controls-disabled');
    } else {
        maskOverlay.classList.add('hidden');
        sounds.breath.pause();
        // DESBLOQUEAMOS
        btnMonitor.classList.remove('controls-disabled');
        btnDoor.classList.remove('controls-disabled');
    }
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
    staticL.style.opacity = "0.9";
    setTimeout(() => {
        let enemy = "";
        for (let b in BOTS) { if (BOTS[b].active && BOTS[b].pos === id) enemy = "_" + b; }
        document.getElementById('cam-img').src = `${IMG_PATH}${({1:"muelle",2:"pasillo",3:"calderas",4:"patio",5:"nodo"})[id]}${enemy}.jpg`;
        staticL.style.opacity = enemy ? "0.4" : "0.1";
    }, 200);
}

function updatePower() {
    if(!GAME.active) return;
    let usage = 1 + (GAME.doorClosed?1:0) + (GAME.camOpen?1:0) + (GAME.maskOn?1:0);
    document.getElementById('usage-visual').innerText = "[I]".repeat(usage);
    GAME.power -= (0.06 * Math.pow(usage, 1.4)); 
    document.getElementById('power-num').innerText = Math.max(0, Math.floor(GAME.power));
    document.getElementById('power-fill').style.width = GAME.power + "%";
    if(GAME.power <= 0) triggerJumpscare("svyaz");
}

function moveBots() {
    if(!GAME.active) return;
    for(let b in BOTS) {
        if(BOTS[b].active && Math.random() > 0.4) {
            let idx = BOTS[b].path.indexOf(BOTS[b].pos);
            if(idx < BOTS[b].path.length - 1) BOTS[b].pos = BOTS[b].path[idx + 1];
            if(BOTS[b].pos === 100) checkAttack(b);
        }
    }
}

function checkAttack(name) {
    if(name === 'stalnoy' && !GAME.doorClosed) triggerJumpscare('stalnoy');
    else if(name === 'prizrak') startOxygenFailure();
    else if(name === 'svyaz' && GAME.camOpen) triggerJumpscare('svyaz');
    else BOTS[name].pos = 1;
}

function startOxygenFailure() {
    const alertBox = document.getElementById('oxygen-alert');
    alertBox.classList.remove('hidden');
    setTimeout(() => {
        if(!GAME.maskOn) {
            triggerJumpscare('prizrak');
        } else {
            setTimeout(() => {
                alertBox.classList.add('hidden');
                BOTS.prizrak.pos = 1;
            }, 4000);
        }
    }, 4000);
}

function triggerJumpscare(botName) {
    GAME.active = false;
    window.gameIntervals.forEach(clearInterval);
    sounds.ambient.pause(); sounds.breath.pause(); sounds.scare.play();
    const container = document.getElementById('jumpscare-container');
    document.getElementById('jumpscare-img').src = SPRITE_PATH + BOTS[botName].gif + "?t=" + new Date().getTime();
    container.classList.remove('hidden');
    setTimeout(() => {
        container.classList.add('hidden');
        document.getElementById('death-reason').innerText = botName.toUpperCase() + " TE ATRAPÓ";
        document.getElementById('game-over-screen').classList.remove('hidden');
    }, 1800);
}

function startGame(n) {
    GAME.active = true; GAME.night = n; GAME.power = 100; GAME.hour = 0;
    BOTS.stalnoy.active = n >= 1; BOTS.prizrak.active = n >= 2; BOTS.svyaz.active = (n >= 3 && n !== 5);
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    document.getElementById('office-bg').style.backgroundImage = `url('${IMG_PATH}${n===5?"oficina_rota.jpg":"oficina_base.jpg"}')`;
    setupButtons(); // Inicializar clics
    window.gameIntervals = [
        setInterval(() => {
            GAME.hour++; document.getElementById('clock').innerText = GAME.hour + ":00 AM";
            if(GAME.hour === 6) {
                GAME.active = false; window.gameIntervals.forEach(clearInterval);
                localStorage.setItem('sombra_night', n+1);
                document.getElementById('win-screen').classList.remove('hidden');
            }
        }, 45000),
        setInterval(updatePower, 1000), setInterval(moveBots, 6000)
    ];
    sounds.ambient.play();
}

function retryNight() { location.reload(); }
function loadMenu() {
    const menu = document.getElementById('night-menu');
    const unlocked = parseInt(localStorage.getItem('sombra_night') || 1);
    menu.innerHTML = "";
    for (let i = 1; i <= 6; i++) {
        let btn = document.createElement('button');
        btn.innerText = i===5?"MOLOT":"NOCHE "+i;
        if (i > unlocked) btn.className = 'locked';
        btn.onclick = () => startGame(i);
        menu.appendChild(btn);
    }
}
function resetProgress() { localStorage.clear(); location.reload(); }
