// --- CONFIGURACIÓN DEL JUEGO ---
const GAME = {
    night: 5,
    active: false,
    cameraOpen: false,
    maskOn: false,
    doorClosed: false,
    currentCam: 1,
    radioFreq: 50,
    radioTarget: 50,
    bossFightActive: false
};

// --- CONFIGURACIÓN DE ANIMATRÓNICOS (IA) ---
const BOTS = {
    // STALNOY: El rápido. Cam 1 -> 2 -> 4 -> Oficina
    stalnoy: { pos: 1, path: [1, 2, 4, 100], name: "Stalnoy", img: "stalnoy_cerca.png" },
    
    // PRIZRAK: El del Gas. Cam 1 -> 3 -> Oficina
    prizrak: { pos: 1, path: [1, 3, 100], name: "Prizrak", img: "prizrak_gas.png" },
    
    // SVYAZ: El de la Radio. Cam 1 -> 5 -> Oficina
    svyaz: { pos: 1, path: [1, 5, 100], name: "Svyaz", img: "svyaz_static.png" },
    
    // MOLOT: El Tanque (Boss). Solo aparece scriptado en Noche 5
    molot: { active: false } 
};

// Nombres de Cámaras para mostrar en pantalla
const CAM_NAMES = {
    1: "MUELLE DE CARGA",
    2: "PASILLO MANTENIMIENTO",
    3: "SALA DE CALDERAS",
    4: "PATIO DE VIGÍA",
    5: "NODO ELÉCTRICO"
};

// --- INICIO DEL JUEGO ---
function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    GAME.active = true;
    
    // Sonido ambiente
    playAudio('assets/audio/ambiente.mp3', true);

    // Loop de IA (Se ejecuta cada 2 segundos)
    setInterval(gameLoop, 2000);
    
    // Loop de Radio (Se ejecuta rápido)
    setInterval(radioLoop, 100);

    // Evento Scriptado Noche 5
    if (GAME.night === 5) {
        setTimeout(startBossSequence, 15000); // A los 15s empieza el caos
    }
}

// --- CORE DEL JUEGO (IA) ---
function gameLoop() {
    if (!GAME.active || GAME.bossFightActive) return;

    // Mover Stalnoy
    if (Math.random() > 0.4) moveBot('stalnoy');
    // Mover Prizrak
    if (Math.random() > 0.6) moveBot('prizrak');
    // Mover Svyaz
    if (Math.random() > 0.5) moveBot('svyaz');

    checkJumpscares();
}

function moveBot(botName) {
    let bot = BOTS[botName];
    let currentIndex = bot.path.indexOf(bot.pos);
    
    // Si no está en la oficina (100), avanza
    if (currentIndex < bot.path.length - 1) {
        bot.pos = bot.path[currentIndex + 1];
        console.log(`${botName} movido a Cam ${bot.pos}`);
    }
}

// --- MECÁNICAS DE JUGADOR ---

// 1. Monitor de Cámaras
document.getElementById('btn-monitor').addEventListener('click', toggleMonitor);
document.getElementById('btn-close-cam').addEventListener('click', toggleMonitor);

function toggleMonitor() {
    if (GAME.maskOn) return; // No puedes ver cámaras con máscara
    GAME.cameraOpen = !GAME.cameraOpen;
    const monitor = document.getElementById('camera-monitor');
    
    if (GAME.cameraOpen) {
        monitor.classList.remove('hidden');
        updateCamImage();
    } else {
        monitor.classList.add('hidden');
    }
}

function changeCam(num) {
    GAME.currentCam = num;
    // Actualizar botones visualmente
    document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.cam-btn')[num-1].classList.add('active');
    updateCamImage();
}

function updateCamImage() {
    const imgElement = document.getElementById('cam-img');
    const label = document.getElementById('cam-label');
    let imgSrc = `assets/images/cams/cctv${GAME.currentCam}_vacia.jpg`;

    // Verificar si hay algún bot en esta cámara
    for (let key in BOTS) {
        if (BOTS[key].pos === GAME.currentCam) {
            // Ejemplo: cctv1_stalnoy.jpg
            imgSrc = `assets/images/cams/cctv${GAME.currentCam}_${key}.jpg`;
        }
    }
    
    imgElement.src = imgSrc;
    label.innerText = `🔴 REC | CCTV-${GAME.currentCam}: ${CAM_NAMES[GAME.currentCam]}`;
}

// 2. Máscara de Gas
document.getElementById('btn-mask').addEventListener('click', () => {
    GAME.maskOn = !GAME.maskOn;
    const overlay = document.getElementById('mask-overlay');
    if (GAME.maskOn) {
        overlay.classList.remove('hidden');
        playAudio('assets/audio/respiracion.wav');
        if (GAME.cameraOpen) toggleMonitor(); // Cierra monitor al poner máscara
    } else {
        overlay.classList.add('hidden');
    }
});

// 3. Puerta
document.getElementById('btn-door').addEventListener('click', () => {
    GAME.doorClosed = !GAME.doorClosed;
    const btn = document.getElementById('btn-door');
    btn.innerText = GAME.doorClosed ? "PUERTA: CERRADA" : "PUERTA: ABIERTA";
    btn.style.borderColor = GAME.doorClosed ? "red" : "white";
    playAudio('assets/audio/puerta_metal.mp3');
});

// 4. Radio
const radioSlider = document.getElementById('radio-dial');
const radioText = document.getElementById('radio-status');

radioSlider.addEventListener('input', (e) => {
    GAME.radioFreq = parseInt(e.target.value);
});

function radioLoop() {
    // La frecuencia objetivo se mueve sola lentamente
    if (Math.random() < 0.05) {
        GAME.radioTarget += (Math.random() - 0.5) * 5;
    }
    
    let diff = Math.abs(GAME.radioFreq - GAME.radioTarget);
    if (diff > 15) {
        radioText.innerText = "SEÑAL: ERROR";
        radioText.style.color = "red";
    } else {
        radioText.innerText = "SEÑAL: ESTABLE";
        radioText.style.color = "#0f0";
    }
}

// --- LOGICA DE MUERTE (JUMPSCARES) ---
function checkJumpscares() {
    // 1. Stalnoy ataca si está en oficina y puerta abierta
    if (BOTS.stalnoy.pos === 100 && !GAME.doorClosed) {
        triggerJumpscare('stalnoy');
    } else if (BOTS.stalnoy.pos === 100 && GAME.doorClosed) {
        // Si la puerta está cerrada, vuelve a la cámara 1
        console.log("Stalnoy golpeó la puerta y se fue");
        BOTS.stalnoy.pos = 1; 
        playAudio('assets/audio/golpe_metal.mp3');
    }

    // 2. Prizrak ataca si está en oficina y NO tienes máscara
    if (BOTS.prizrak.pos === 100) {
        if (!GAME.maskOn) {
            triggerJumpscare('prizrak');
        } else {
            console.log("Prizrak te vio con máscara y se fue");
            BOTS.prizrak.pos = 1;
        }
    }
}

function triggerJumpscare(botName) {
    GAME.active = false;
    const screen = document.getElementById('jumpscare-screen');
    const img = document.getElementById('jumpscare-img');
    
    screen.classList.remove('hidden');
    img.src = `assets/images/sprites/${botName}_jumpscare.gif`;
    playAudio('assets/audio/grito.mp3');
    
    setTimeout(() => {
        alert("GAME OVER");
        location.reload();
    }, 3000);
}

// --- SECUENCIA DEL BOSS (NOCHE 5) ---
function startBossSequence() {
    GAME.bossFightActive = true;
    console.log("INICIANDO BOSS FIGHT");

    // 1. Audio pasos
    playAudio('assets/audio/pasos_corriendo.mp3');

    setTimeout(() => {
        // 2. Romper Vidrio
        document.getElementById('office-bg').style.backgroundImage = "url('assets/images/oficina_rota.jpg')";
        playAudio('assets/audio/vidrio_roto.mp3');
        
        // 3. Activar Alarma
        document.body.classList.add('alarm-mode');
        
        // 4. Mostrar Tanque
        const enemyLayer = document.getElementById('enemy-layer');
        enemyLayer.innerHTML = '<img src="assets/images/sprites/tanque_boss.png" style="width:80%; margin-top:10%; animation: shake 0.5s infinite;">';
        
        // 5. Botón EMP
        const btnEmp = document.getElementById('btn-emp');
        btnEmp.classList.remove('hidden');
        
        // Lógica: Tienes 3 segundos para pulsar EMP
        setTimeout(() => {
            if (GAME.active) triggerJumpscare('molot');
        }, 3000);
        
        btnEmp.onclick = () => {
            playAudio('assets/audio/emp_blast.mp3');
            alert("¡HAS DERROTADO AL TANQUE! NOCHE 5 COMPLETADA.");
            location.reload();
        };

    }, 4000);
}

// --- UTILIDAD DE AUDIO ---
function playAudio(file, loop = false) {
    try {
        let audio = new Audio(file);
        audio.loop = loop;
        audio.play().catch(e => console.log("Audio error (necesita interacción user):", e));
    } catch (e) {
        console.log("Audio no encontrado");
    }
  }
