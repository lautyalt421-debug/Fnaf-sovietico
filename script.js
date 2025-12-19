let GAME = { active: false, hour: 0, power: 100, camOpen: false, doorClosed: false, maskOn: false, currentCam: 1, night: 1 };
const IMG_PATH = "assets/images/";
const SPRITE_PATH = "assets/sprites/";

const BOTS = {
    stalnoy: { pos: 1, path: [1, 2, 4, 100], active: false, gif: "stalnoy_scare.gif" },
    prizrak: { pos: 1, path: [1, 3, 100], active: false, gif: "prizrak_scare.gif" },
    svyaz: { pos: 1, path: [1, 5, 2, 100], active: false, gif: "svyaz_scare.gif" },
    molot: { pos: 1, path: [1, 100], active: false, gif: "molot_scare.gif" }
};

const sounds = {
    ambient: new Audio('assets/audio/ambiente.mp3'),
    door: new Audio('assets/audio/puerta_metal.mp3'),
    scare: new Audio('assets/audio/grito.mp3'),
    breath: new Audio('assets/audio/respiracion.mp3')
};
sounds.ambient.loop = true; sounds.breath.loop = true;

window.onload = loadMenu;

function loadMenu() {
    const menu = document.getElementById('night-menu');
    menu.innerHTML = "";
    const unlocked = parseInt(localStorage.getItem('sombra_night') || 1);
    for (let i = 1; i <= 6; i++) {
        let btn = document.createElement('button');
        btn.innerText = i === 5 ? "MOLOT" : "NOCHE " + i;
        if (i > unlocked) btn.style.opacity = "0.3";
        else btn.onclick = () => startGame(i);
        menu.appendChild(btn);
    }
    document.getElementById('btn-reset').onclick = () => { localStorage.clear(); location.reload(); };
}

function startGame(n) {
    GAME.active = true; GAME.night = n; GAME.power = 100; GAME.hour = 0;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');

    // SETUP BOTONES (CLICK Y TOUCH)
    const setupBtn = (id, fn) => {
        const el = document.getElementById(id);
        el.onclick = fn;
        el.ontouchstart = (e) => { e.preventDefault(); fn(); };
    };

    setupBtn('btn-mask', toggleMask);
    setupBtn('btn-door', toggleDoor);
    setupBtn('btn-monitor', toggleMonitor);
    setupBtn('btn-cam-close', toggleMonitor);
    setupBtn('btn-retry', () => location.reload());
    setupBtn('btn-next', () => location.reload());

    document.querySelectorAll('.cam-btn').forEach(btn => {
        const camId = parseInt(btn.dataset.cam);
        btn.onclick = () => changeCam(camId);
        btn.ontouchstart = (e) => { e.preventDefault(); changeCam(camId); };
    });

    document.getElementById('office-bg').style.backgroundImage = `url('${IMG_PATH}${n===5?"oficina_rota.jpg":"oficina_base.jpg"}')`;
    
    window.gameIntervals = [
        setInterval(tickClock, 45000),
        setInterval(updatePower, 1000),
        setInterval(moveBots, 6000)
    ];
    sounds.ambient.play();
}

function toggleMask() {
    if(!GAME.active) return;
    GAME.maskOn = !GAME.maskOn;
    if(GAME.camOpen) toggleMonitor();

    const overlay = document.getElementById('mask-overlay');
    const bM = document.getElementById('btn-monitor');
    const bD = document.getElementById('btn-door');

    if(GAME.maskOn) {
        overlay.classList.remove('hidden');
        sounds.breath.play();
        bM.classList.add('controls-disabled');
        bD.classList.add('controls-disabled');
        document.getElementById('btn-mask').classList.add('active-btn');
    } else {
        overlay.classList.add('hidden');
        sounds.breath.pause();
        bM.classList.remove('controls-disabled');
        bD.classList.remove('controls-disabled');
        document.getElementById('btn-mask').classList.remove('active-btn');
    }
}

function toggleDoor() {
    if(!GAME.active || GAME.maskOn) return;
    GAME.doorClosed = !GAME.doorClosed;
    sounds.door.play();
    document.getElementById('office-bg').style.backgroundImage = GAME.doorClosed ? `url('${IMG_PATH}oficina_cerrada.jpg')` : `url('${IMG_PATH}${GAME.night === 5 ? "oficina_rota.jpg" : "oficina_base.jpg"}')`;
    document.getElementById('btn-door').classList.toggle('active-btn');
}

function toggleMonitor() {
    if(!GAME.active || GAME.maskOn) return;
    GAME.camOpen = !GAME.camOpen;
    const mon = document.getElementById('camera-monitor');
    if(GAME.camOpen) {
        mon.classList.remove('hidden');
        changeCam(GAME.currentCam);
    } else {
        mon.classList.add('hidden');
    }
}

function changeCam(id) {
    GAME.currentCam = id;
    let enemy = "";
    for (let b in BOTS) { 
        if(BOTS[b].pos === id) {
            // Solo mostrar si el bot está activo en esta noche
            if((b==='stalnoy'&&GAME.night>=1)||(b==='prizrak'&&GAME.night>=2)||(b==='svyaz'&&GAME.night>=3)) enemy = "_" + b;
        }
    }
    document.getElementById('cam-img').src = `${IMG_PATH}${({1:"muelle",2:"pasillo",3:"calderas",4:"patio",5:"nodo"})[id]}${enemy}.jpg`;
    document.getElementById('cam-label').innerText = "CCTV: " + ({1:"MUELLE",2:"PASILLO",3:"CALDERAS",4:"PATIO",5:"NODO"})[id];
}

function updatePower() {
    if(!GAME.active) return;
    let usage = 1 + (GAME.doorClosed?1:0) + (GAME.camOpen?1:0) + (GAME.maskOn?1:0);
    document.getElementById('usage-visual').innerText = "[I]".repeat(usage);
    GAME.power -= (0.09 * usage);
    document.getElementById('power-num').innerText = Math.max(0, Math.floor(GAME.power));
    if(GAME.power <= 0) triggerJumpscare("svyaz");
}

function tickClock() {
    GAME.hour++;
    document.getElementById('clock').innerText = GAME.hour + ":00 AM";
    if(GAME.hour === 6) {
        GAME.active = false;
        window.gameIntervals.forEach(clearInterval);
        localStorage.setItem('sombra_night', GAME.night + 1);
        document.getElementById('win-screen').classList.remove('hidden');
    }
}

function moveBots() {
    if(!GAME.active) return;
    for(let b in BOTS) {
        let canMove = (b==='stalnoy'&&GAME.night>=1) || (b==='prizrak'&&GAME.night>=2) || (b==='svyaz'&&GAME.night>=3 && GAME.night!==5) || (b==='molot'&&GAME.night===5);
        if(canMove && Math.random() > 0.4) {
            let idx = BOTS[b].path.indexOf(BOTS[b].pos);
            if(idx < BOTS[b].path.length - 1) BOTS[b].pos = BOTS[b].path[idx+1];
            if(BOTS[b].pos === 100) checkAttack(b);
        }
    }
}

function checkAttack(name) {
    if(name === 'stalnoy' && !GAME.doorClosed) triggerJumpscare('stalnoy');
    else if(name === 'prizrak') startOxygenFailure();
    else if(name === 'svyaz' && GAME.camOpen) triggerJumpscare('svyaz');
    else if(name === 'molot') triggerJumpscare('molot');
    else BOTS[name].pos = 1;
}

function startOxygenFailure() {
    document.getElementById('oxygen-alert').classList.remove('hidden');
    setTimeout(() => {
        if(!GAME.maskOn) triggerJumpscare('prizrak');
        else {
            setTimeout(() => {
                document.getElementById('oxygen-alert').classList.add('hidden');
                BOTS.prizrak.pos = 1;
            }, 4000);
        }
    }, 4000);
}

function triggerJumpscare(bot) {
    GAME.active = false;
    window.gameIntervals.forEach(clearInterval);
    sounds.ambient.pause(); sounds.breath.pause();
    sounds.scare.play();
    document.getElementById('jumpscare-img').src = SPRITE_PATH + BOTS[bot].gif + "?t=" + Date.now();
    document.getElementById('jumpscare-container').classList.remove('hidden');
}
