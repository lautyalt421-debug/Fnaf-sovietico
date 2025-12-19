#office-bg {
    width: 140vw; height: 100vh;
    background: url('assets/images/oficina_base.jpg') center/cover;
    position: absolute; left: -20vw;
}

/* Efecto de Estática en Cámaras */
.noise-effect {
    position: absolute; inset: 0;
    background: url('assets/images/cams/static.gif');
    opacity: 0.1; pointer-events: none;
}

/* Barra de Energía */
#power-bar { width: 100px; height: 10px; border: 1px solid #0f0; background: #222; }
#power-fill { height: 100%; background: #0f0; width: 100%; transition: 0.3s; }

/* Luz de Radio (Feedback) */
#radio-indicator { width: 15px; height: 15px; border-radius: 50%; background: red; margin: 5px auto; box-shadow: 0 0 10px red; }

/* Animación Alarma Boss Fight */
.boss-alarm { animation: pulseRed 0.5s infinite; }
@keyframes pulseRed { 0% { background: #000; } 50% { background: #400; } }
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
