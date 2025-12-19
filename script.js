let GAME = { active: false, hour: 0, power: 100, camOpen: false, doorClosed: false, maskOn: false, currentCam: 1, night: 1 };
const IMG_PATH = "assets/images/";
const camNames = { 1: "muelle", 2: "pasillo", 3: "calderas", 4: "patio", 5: "nodo" };

// ESTADO DE LOS ENEMIGOS
const BOTS = {
    stalnoy: { pos: 1, path: [1, 2, 4, 100], active: false },
    prizrak: { pos: 1, path: [1, 3, 100], active: false },
    svyaz: { pos: 1, path: [1, 5, 2, 100], active: false }
};

// AUDIOS
const sounds = {
    ambient: new Audio('assets/audio/ambiente.mp3'),
    door: new Audio('assets/audio/puerta_metal.mp3'),
    scare: new Audio('assets/audio/grito.mp3')
};
sounds.ambient.loop = true;

function startGame(n) {
    GAME.active = true;
    GAME.night = n;
    
    // Activar enemigos según la noche
    BOTS.stalnoy.active = n >= 1;
    BOTS.prizrak.active = n >= 2;
    BOTS.svyaz.active = n >= 3;
    if(n === 4) Object.values(BOTS).forEach(b => b.active = true);

    // Forzar Sonido
    sounds.ambient.play().catch(() => console.log("Clic para audio"));

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    
    // Noche 5 es el Jefe Molot
    let bg = (n === 5) ? "oficina_rota.jpg" : "oficina_base.jpg";
    document.getElementById('office-bg').style.backgroundImage = `url('${IMG_PATH}${bg}')`;

    setInterval(tickClock, 60000); 
    setInterval(updatePower, 1500); 
    setInterval(moveBots, 7000 - (n * 1000)); 
}

function updatePower() {
    if(!GAME.active) return;
    let drain = 0.1 + (GAME.night * 0.05);
    if(GAME.camOpen) drain += 0.3;
    if(GAME.doorClosed) drain += 0.5;
    
    GAME.power -= drain;
    document.getElementById('power-num').innerText = Math.floor(GAME.power);
    document.getElementById('power-fill').style.width = GAME.power + "%";
    if(GAME.power <= 0) endGame("SISTEMAS APAGADOS");
}

function moveBots() {
    if(!GAME.active) return;
    for(let b in BOTS) {
        if(BOTS[b].active && Math.random() > 0.5) {
            let bot = BOTS[b];
            let idx = bot.path.indexOf(bot.pos);
            if(idx < bot.path.length - 1) bot.pos = bot.path[idx + 1];
            if(bot.pos === 100) checkAttack(b);
        }
    }
}

function checkAttack(name) {
    if(name === 'stalnoy' && !GAME.doorClosed) endGame("STALNOY TE ATRAPÓ");
    if(name === 'prizrak' && !GAME.maskOn) endGame("PRIZRAK TE ATRAPÓ");
    if(name === 'svyaz' && GAME.camOpen) endGame("SVYAZ DESTRUYÓ EL MONITOR");
    BOTS[name].pos = 1;
}

function toggleMonitor() {
    GAME.camOpen = !GAME.camOpen;
    document.getElementById('camera-monitor').classList.toggle('hidden');
    if(GAME.camOpen) changeCam(GAME.currentCam);
}

function changeCam(id) {
    GAME.currentCam = id;
    let enemy = "";
    for(let b in BOTS) { if(BOTS[b].active && BOTS[b].pos === id) enemy = "_" + b; }
    document.getElementById('cam-img').src = `${IMG_PATH}${camNames[id]}${enemy}.jpg`;
    document.getElementById('cam-name').innerText = `CCTV: ${camNames[id].toUpperCase()}`;
}

function toggleDoor() { GAME.doorClosed = !GAME.doorClosed; sounds.door.play(); }
function toggleMask() { GAME.maskOn = !GAME.maskOn; }
function tickClock() { GAME.hour++; document.getElementById('clock').innerText = GAME.hour + ":00 AM"; if(GAME.hour === 6) endGame("¡VICTORIA!"); }
function endGame(m) { sounds.scare.play(); alert(m); location.reload(); }
