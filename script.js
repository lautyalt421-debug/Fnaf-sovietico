let GAME = { active: false, hour: 0, power: 100, camOpen: false, doorClosed: false, maskOn: false, currentCam: 1, night: 1, molot: false, nodes: 0 };
const IMG_PATH = "assets/images/";
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
        btn.innerText = (i === 6) ? "EXPEDIENTE ???" : "OPERACIÓN " + i;
        btn.style.opacity = (i > unlocked) ? "0.3" : "1";
        if (i <= unlocked) btn.onclick = () => startGame(i);
        menu.appendChild(btn);
    }
    document.getElementById('btn-reset').onclick = () => { localStorage.clear(); location.reload(); };
}

function startGame(n) {
    GAME = { active: true, hour: 0, power: 100, camOpen: false, doorClosed: false, maskOn: false, currentCam: 1, night: n, molot: false, nodes: 0 };
    for(let b in BOTS) BOTS[b].pos = 1;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    setupEvents();
    updateOffice();
    window.gameIntervals = [
        setInterval(tickClock, 45000),
        setInterval(updatePower, 1000),
        setInterval(moveBots, 5000)
    ];
}

function updatePower() {
    if(!GAME.active) return;
    let usage = 1 + (GAME.doorClosed?1:0) + (GAME.camOpen?1:0) + (GAME.maskOn?1:0);
    GAME.power -= (0.12 * usage);

    // EFECTO PARPADEO: Si la energía es menor a 20%, las luces fallan aleatoriamente
    if (GAME.power < 20 && Math.random() > 0.8) {
        document.getElementById('office-bg').style.filter = "brightness(0.1)";
        setTimeout(() => { document.getElementById('office-bg').style.filter = "brightness(1)"; }, 100);
    }

    document.getElementById('power-num').innerText = Math.max(0, Math.floor(GAME.power));
    document.getElementById('usage-visual').innerText = "I".repeat(usage);
    if(GAME.power <= 0) triggerJumpscare('svyaz');
}

function moveBots() {
    if(!GAME.active) return;
    let diff = (GAME.night >= 4) ? 0.75 : 0.45;

    for(let b in BOTS) {
        if (b === 'prizrak' && GAME.night < 2) continue; 
        if (b === 'svyaz' && GAME.night < 3) continue;   
        if (b === 'molot' && GAME.night < 5) continue;   
        if (GAME.night === 5 && (b === 'prizrak' || b === 'svyaz')) continue; 

        if(Math.random() < diff) {
            if(b === 'molot') { if(GAME.camOpen && !GAME.molot) startMolot(); continue; }
            let idx = BOTS[b].path.indexOf(BOTS[b].pos);
            if(idx < BOTS[b].path.length - 1) BOTS[b].pos = BOTS[b].path[idx+1];
            if(BOTS[b].pos === 100) checkAttack(b);
        }
    }
}

function changeCam(id) {
    GAME.currentCam = id;
    let bot = "";
    for(let b in BOTS) { if(BOTS[b].pos === id && b !== 'molot') bot = "_" + b; }
    document.getElementById('static-layer').style.opacity = bot ? "0.85" : "0.2";
    const cams = {1:"muelle", 2:"pasillo", 3:"calderas", 4:"patio", 5:"nodo"};
    document.getElementById('cam-img').src = `${IMG_PATH}${cams[id]}${bot}.jpg`;
}

function checkAttack(name) {
    if(name === 'stalnoy' && !GAME.doorClosed) triggerJumpscare('stalnoy');
    else if(name === 'prizrak' && GAME.camOpen) triggerJumpscare('prizrak');
    else if(name === 'svyaz') {
        document.getElementById('oxygen-alert').classList.remove('hidden');
        setTimeout(() => {
            if(!GAME.maskOn) triggerJumpscare('svyaz');
            else { document.getElementById('oxygen-alert').classList.add('hidden'); BOTS.svyaz.pos = 1; }
        }, 5000);
    }
    else BOTS[name].pos = 1;
}

function startMolot() {
    GAME.molot = true; GAME.nodes = 0;
    const ui = document.getElementById('molot-minigame');
    const cont = document.getElementById('node-container');
    ui.classList.remove('hidden'); cont.innerHTML = "";
    for(let i=1; i<=4; i++) {
        let n = document.createElement('div'); n.className = 'node'; n.innerText = i;
        n.style.left = Math.random()*80+"%"; n.style.top = Math.random()*80+"%";
        n.onclick = () => { if(i === GAME.nodes + 1) { GAME.nodes++; n.classList.add('hit'); if(GAME.nodes === 4) { GAME.molot = false; ui.classList.add('hidden'); } } };
        cont.appendChild(n);
    }
    setTimeout(() => { if(GAME.molot) triggerJumpscare('molot'); }, 6000);
}

function setupEvents() {
    const click = (id, fn) => {
        const el = document.getElementById(id);
        el.onclick = fn;
        el.ontouchstart = (e) => { e.preventDefault(); fn(); };
    };
    click('btn-mask', () => { if(!GAME.camOpen) { GAME.maskOn = !GAME.maskOn; document.getElementById('mask-overlay').classList.toggle('hidden'); document.getElementById('btn-mask').classList.toggle('active-btn'); } });
    click('btn-door', () => { if(!GAME.maskOn) { GAME.doorClosed = !GAME.doorClosed; updateOffice(); document.getElementById('btn-door').classList.toggle('active-btn'); } });
    click('btn-monitor', toggleMonitor);
    click('btn-cam-close', toggleMonitor);
    document.querySelectorAll('.cam-btn').forEach(b => { b.onclick = () => changeCam(parseInt(b.dataset.cam)); });
}

function toggleMonitor() {
    if(!GAME.active || (GAME.maskOn && !GAME.camOpen) || GAME.molot) return;
    GAME.camOpen = !GAME.camOpen;
    document.getElementById('camera-monitor').classList.toggle('hidden');
    if(GAME.camOpen) changeCam(GAME.currentCam);
}

function updateOffice() {
    let img = (GAME.night >= 5) ? "oficina_rota.jpg" : "oficina_base.jpg";
    if(GAME.doorClosed) img = "oficina_cerrada.jpg";
    document.getElementById('office-bg').style.backgroundImage = `url('${IMG_PATH}${img}')`;
}

function triggerJumpscare(bot) {
    if(!GAME.active) return;
    GAME.active = false;
    window.gameIntervals.forEach(clearInterval);
    document.getElementById('jumpscare-img').src = `assets/sprites/${BOTS[bot].gif}?t=${Date.now()}`;
    document.getElementById('jumpscare-container').classList.remove('hidden');
    setTimeout(() => location.reload(), 2000);
}

function tickClock() {
    GAME.hour++;
    document.getElementById('clock').innerText = (GAME.hour === 0 ? "12" : GAME.hour) + ":00 AM";
    if(GAME.hour === 6) { localStorage.setItem('sombra_night', GAME.night + 1); location.reload(); }
}
