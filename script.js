const GAME = {
    night: 5, active: false, cameraOpen: false, maskOn: false, doorClosed: false,
    currentCam: 1, radioFreq: 50, radioTarget: 50, bossFightActive: false
};

const BOTS = {
    stalnoy: { pos: 1, path: [1, 2, 4, 100] },
    prizrak: { pos: 1, path: [1, 3, 100] },
    svyaz: { pos: 1, path: [1, 5, 100] }
};

// TRADUCCIÓN DE NOMBRES DE ARCHIVO
const mapaCamaras = {
    1: "muelle",
    2: "pasillo",
    3: "calderas",
    4: "patio",
    5: "nodo"
};

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    GAME.active = true;
    setInterval(gameLoop, 3000);
    if (GAME.night === 5) setTimeout(startBossSequence, 15000);
}

function toggleMonitor() {
    if (GAME.maskOn) return;
    GAME.cameraOpen = !GAME.cameraOpen;
    document.getElementById('camera-monitor').classList.toggle('hidden');
    if (GAME.cameraOpen) changeCam(GAME.currentCam);
}

function changeCam(id) {
    GAME.currentCam = id;
    const camImg = document.getElementById('cam-img');
    const label = document.getElementById('cam-label');
    
    let base = mapaCamaras[id];
    let botVisible = "";

    // Revisar si algún bot está en esta cámara
    for (let b in BOTS) {
        if (BOTS[b].pos === id) botVisible = "_" + b;
    }

    // Busca: muelle.jpg o muelle_stalnoy.jpg
    camImg.src = `assets/images/cams/${base}${botVisible}.jpg`;
    label.innerText = `CCTV: ${base.toUpperCase()}`;

    document.querySelectorAll('.cam-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-cam-${id}`).classList.add('active');
}

function gameLoop() {
    if (!GAME.active || GAME.bossFightActive) return;
    // Mover bots aleatoriamente
    for (let b in BOTS) {
        if (Math.random() > 0.6) {
            let idx = BOTS[b].path.indexOf(BOTS[b].pos);
            if (idx < BOTS[b].path.length - 1) BOTS[b].pos = BOTS[b].path[idx + 1];
        }
    }
    checkAttacks();
}

function checkAttacks() {
    if (BOTS.stalnoy.pos === 100 && !GAME.doorClosed) triggerJumpscare('stalnoy');
    if (BOTS.prizrak.pos === 100 && !GAME.maskOn) triggerJumpscare('prizrak');
}

function startBossSequence() {
    GAME.bossFightActive = true;
    // Efecto de Stalnoy corriendo y rompiendo el vidrio
    setTimeout(() => {
        document.getElementById('office-bg').style.backgroundImage = "url('assets/images/oficina_rota.jpg')";
        document.body.classList.add('alarm-mode');
        document.getElementById('btn-emp').classList.remove('hidden');
        document.getElementById('enemy-layer').innerHTML = '<img src="assets/images/sprites/tanque_boss.png" style="width:70%;">';
    }, 4000);
}

function triggerJumpscare(bot) {
    GAME.active = false;
    const sc = document.getElementById('jumpscare-screen');
    sc.classList.remove('hidden');
    document.getElementById('jumpscare-img').src = `assets/images/sprites/${bot}_scare.gif`;
    setTimeout(() => location.reload(), 3000);
}

// Eventos de botones
document.getElementById('btn-mask').onclick = () => {
    GAME.maskOn = !GAME.maskOn;
    document.getElementById('mask-overlay').classList.toggle('hidden');
};
document.getElementById('btn-door').onclick = () => {
    GAME.doorClosed = !GAME.doorClosed;
    document.getElementById('btn-door').innerText = GAME.doorClosed ? "CERRADA" : "ABIERTA";
};
