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
    GAME = { active: true, hour: 0, power: 100, camOpen: false, doorClosed: false, maskOn: false, currentCam: 1, night: n };
    for(let b in BOTS) BOTS[b].pos = 1;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    
    document.getElementById('snd-office').play();
    setupEvents();
    updateOffice();
    
    window.gameIntervals = [
        setInterval(tickClock, 45000),
        setInterval(updatePower, 1000),
        setInterval(moveBots, 5000)
    ];
}

function moveBots() {
    if(!GAME.active) return;
    let diff = (GAME.night >= 4) ? 0.7 : 0.4;

    for(let b in BOTS) {
        if (b === 'prizrak' && GAME.night < 2) continue;
        if (b === 'svyaz' && GAME.night < 3) continue;
        if (b === 'molot' && GAME.night < 5) continue;
        if (GAME.night === 5 && (b === 'prizrak' || b === 'svyaz')) continue;

        if(Math.random() < diff) {
            let oldPos = BOTS[b].pos;
            if(b === 'molot') { if(GAME.camOpen && !GAME.molot) startMolot(); continue; }
            
            let idx = BOTS[b].path.indexOf(oldPos);
            if(idx < BOTS[b].path.length - 1) {
                BOTS[b].pos = BOTS[b].path[idx+1];
                // EFECTO DE ESTÁTICA SI SE MUEVE CERCA DE TU VISTA
                if (GAME.camOpen && (oldPos === GAME.currentCam || BOTS[b].pos === GAME.currentCam)) {
                    triggerStatic();
                }
            }
            if(BOTS[b].pos === 100) checkAttack(b);
        }
    }
}

function triggerStatic() {
    const layer = document.getElementById('static-layer');
    const snd = document.getElementById('snd-static');
    layer.classList.add('active-static');
    snd.play();
    setTimeout(() => {
        changeCam(GAME.currentCam);
        setTimeout(() => { 
            layer.classList.remove('active-static'); 
            if(!GAME.camOpen) snd.pause();
        }, 400);
    }, 100);
}

function changeCam(id) {
    GAME.currentCam = id;
    let bot = "";
    for(let b in BOTS) { if(BOTS[b].pos === id && b !== 'molot') bot = "_" + b; }
    
    const names = {1:"muelle", 2:"pasillo", 3:"calderas", 4:"patio", 5:"nodo"};
    document.getElementById('cam-img').src = `${IMG_PATH}${names[id]}${bot}.jpg`;
    document.getElementById('cam-label').innerText = `CAM ${id} - ${names[id].toUpperCase()}`;
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

function updatePower() {
    if(!GAME.active) return;
    let usage = 1 + (GAME.doorClosed?1:0) + (GAME.camOpen?1:0) + (GAME.maskOn?1:0);
    GAME.power -= (0.12 * usage);
    
    if (GAME.power < 20 && Math.random() > 0.8) {
        document.getElementById('office-bg').style.filter = "brightness(0.2)";
        setTimeout(() => document.getElementById('office-bg').style.filter = "brightness(1)", 100);
    }

    document.getElementById('power-num').innerText = Math.max(0, Math.floor(GAME.power));
    document.getElementById('usage-visual').innerText = "I".repeat(usage);
    if(GAME.power <= 0) triggerJumpscare('svyaz');
}

function setupEvents() {
    const btnMask = document.getElementById('btn-mask');
    const btnDoor = document.getElementById('btn-door');
    const btnMon = document.getElementById('btn-monitor');

    btnMask.onclick = () => { 
        if(GAME.camOpen) return;
        GAME.maskOn = !GAME.maskOn;
        btnMask.classList.toggle('active-btn');
        document.getElementById('mask-overlay').classList.toggle('hidden');
    };

    btnDoor.onclick = () => {
        GAME.doorClosed = !GAME.doorClosed;
        btnDoor.classList.toggle('active-btn');
        updateOffice();
    };

    btnMon.onclick = toggleMonitor;
    document.getElementById('btn-cam-close').onclick = toggleMonitor;
    
    document.querySelectorAll('.cam-btn').forEach(b => {
        b.onclick = () => { triggerStatic(); };
    });
}

function toggleMonitor() {
    GAME.camOpen = !GAME.camOpen;
    document.getElementById('camera-monitor').classList.toggle('hidden');
    const snd = document.getElementById('snd-static');
    if(GAME.camOpen) {
        changeCam(GAME.currentCam);
        snd.play();
        snd.volume = 0.2;
    } else {
        snd.pause();
    }
}

function updateOffice() {
    let img = (GAME.night >= 5) ? "oficina_rota.jpg" : "oficina_base.jpg";
    if(GAME.doorClosed) img = "oficina_cerrada.jpg";
    document.getElementById('office-bg').style.backgroundImage = `url('${IMG_PATH}${img}')`;
}

function tickClock() {
    GAME.hour++;
    document.getElementById('clock').innerText = (GAME.hour === 0 ? "12" : GAME.hour) + ":00 AM";
    if(GAME.hour === 6) { 
        localStorage.setItem('sombra_night', GAME.night + 1); 
        alert("TURNO FINALIZADO");
        location.reload(); 
    }
}

function triggerJumpscare(bot) {
    GAME.active = false;
    window.gameIntervals.forEach(clearInterval);
    const container = document.getElementById('jumpscare-container');
    const img = document.getElementById('jumpscare-img');
    img.src = `assets/sprites/${BOTS[bot].gif}`;
    container.classList.remove('hidden');
    setTimeout(() => location.reload(), 2000);
}
