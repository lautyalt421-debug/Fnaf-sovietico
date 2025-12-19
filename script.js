let STATE = {
    night: 1, hour: 0, power: 100,
    active: false, door: false, mask: false, cam: false,
    radioVal: 50, radioTarget: 50, bossMode: false
};

const BOTS = {
    stalnoy: { pos: 1, path: [1, 2, 4, 100] },
    prizrak: { pos: 1, path: [1, 3, 100] },
    svyaz: { pos: 1, path: [1, 5, 100] }
};

const camFiles = { 1: "muelle", 2: "pasillo", 3: "calderas", 4: "patio", 5: "nodo" };

function startGame(n) {
    STATE.night = n;
    STATE.active = true;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    
    // Iniciar Sistemas
    setInterval(tickClock, 60000); // 1 hora cada 60 seg
    setInterval(updatePower, 1500); // Consumo de luz
    setInterval(aiMove, 5000 - (n * 500)); // IA se acelera cada noche
    
    if (n === 5) setTimeout(triggerBoss, 20000); // El Tanque aparece a los 20 seg
}

function tickClock() {
    if (!STATE.active) return;
    STATE.hour++;
    document.getElementById('clock').innerText = `${STATE.hour} AM`;
    if (STATE.hour === 6) alert("¡SOBREVIVISTE!");
}

function updatePower() {
    if (!STATE.active) return;
    let cost = 0.1;
    if (STATE.door) cost += 0.4;
    if (STATE.cam) cost += 0.3;
    
    STATE.power -= cost;
    document.getElementById('power-num').innerText = Math.floor(STATE.power);
    document.getElementById('power-fill').style.width = STATE.power + "%";
    
    if (STATE.power <= 0) die("Energía agotada");
}

function aiMove() {
    if (!STATE.active || STATE.bossMode) return;
    for (let b in BOTS) {
        if (Math.random() > 0.5) {
            let bot = BOTS[b];
            let idx = bot.path.indexOf(bot.pos);
            if (idx < bot.path.length - 1) bot.pos = bot.path[idx + 1];
            else attack(b);
        }
    }
}

function attack(name) {
    if (name === 'stalnoy' && !STATE.door) die('stalnoy');
    if (name === 'prizrak' && !STATE.mask) die('prizrak');
    // Si la puerta está cerrada, Stalnoy vuelve a la cámara 1
    if (name === 'stalnoy' && STATE.door) BOTS.stalnoy.pos = 1;
}

function triggerBoss() {
    STATE.bossMode = true;
    // Secuencia de Boss: Pasos -> Vidrio Roto -> Alarma -> Tanque
    document.getElementById('office-bg').style.backgroundImage = "url('assets/images/oficina_rota.jpg')";
    document.getElementById('game-container').classList.add('boss-alarm');
    document.getElementById('enemy-layer').innerHTML = '<img src="assets/images/sprites/tanque_boss.png" style="width:70%;">';
    document.getElementById('btn-emp').classList.remove('hidden');
}

function die(bot) {
    STATE.active = false;
    const js = document.getElementById('jumpscare-screen');
    js.classList.remove('hidden');
    document.getElementById('jumpscare-img').src = `assets/images/sprites/${bot}_scare.gif`;
    setTimeout(() => location.reload(), 3000);
}

// Controles de botones
document.getElementById('btn-door').onclick = () => {
    STATE.door = !STATE.door;
    document.getElementById('btn-door').innerText = STATE.door ? "PUERTA: OFF" : "PUERTA: ON";
};

document.getElementById('btn-mask').onclick = () => {
    STATE.mask = !STATE.mask;
    document.getElementById('mask-overlay').classList.toggle('hidden');
};
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
