let nocheProgreso = parseInt(localStorage.getItem("sin-core-save")) || 1;
let energia = 100, hora = 0, juegoActivo = false, nActiva = 1;
let puerta = false, ducto = false, monitor = false, camActual = "cam01";

const bots = {
    Aura: { pos: "cam02", activa: true, ruta: ["cam02", "cam03", "cam04", "oficina"] },
    Void: { pos: "cam05", activa: false, ruta: ["cam05", "cam06", "oficina"] },
    Synapse: { pos: "cam07", activa: false, ruta: ["cam07", "cam08", "oficina"] }
};

function init() {
    const selector = document.getElementById("night-selector");
    selector.innerHTML = "";
    for(let i=1; i<=5; i++) {
        let btn = document.createElement("button");
        btn.innerText = `NOCHE ${i}`;
        btn.disabled = i > nocheProgreso;
        btn.onclick = () => empezar(i);
        selector.appendChild(btn);
    }
}

function empezar(n) {
    nActiva = n;
    juegoActivo = true;
    energia = 100; hora = 0;
    bots.Void.activa = n >= 2;
    bots.Synapse.activa = n >= 3;
    document.getElementById("screen-menu").classList.add("hidden");
    document.getElementById("screen-game").classList.remove("hidden");
    document.getElementById("noche-txt").innerText = `TURNO ${n}`;
    
    setInterval(updateEnergia, 1000);
    setInterval(updateReloj, 60000);
    setInterval(iaMovement, 4500);
}

function controlDefensa(tipo) {
    if(!juegoActivo) return;
    if (tipo === 'puerta') puerta = !puerta;
    if (tipo === 'ducto') ducto = !ducto;
    document.getElementById("snd-switch").play();
    actualizarOficina();
}

function actualizarOficina() {
    document.getElementById("main-view").src = `assets/oficina/oficina_${puerta ? "1" : "0"}${ducto ? "1" : "0"}.jpg`;
}

function abrirMonitor() {
    if(!juegoActivo) return;
    monitor = true;
    document.getElementById("monitor-overlay").classList.remove("hidden");
    document.getElementById("snd-static").play();
    cambiarCam(camActual);
}

function cerrarMonitor() {
    monitor = false;
    document.getElementById("monitor-overlay").classList.add("hidden");
    document.getElementById("snd-static").pause();
}

function cambiarCam(id) {
    camActual = id;
    document.getElementById("snd-switch").play();
    const vista = document.getElementById("cam-view");
    const ruido = document.getElementById("crt-static");
    
    if(id === "cam01") {
        // CORE Neutro vs Enojado (Se enoja si la energía es baja en noches difíciles)
        let enojado = (nActiva >= 4 && energia < 25);
        vista.src = enojado ? "assets/cameras/cam01_core_enojado.jpg" : "assets/cameras/cam01_core_neutro.jpg";
        ruido.style.opacity = enojado ? "0.3" : "0.05";
    } else {
        let b = Object.keys(bots).find(k => bots[k].pos === id && bots[k].activa);
        vista.src = b ? `assets/cameras/${id}_${b.toLowerCase()}.jpg` : `assets/cameras/${id}_vacia.jpg`;
        ruido.style.opacity = b ? "0.6" : "0.1";
        
        // Alerta Synapse en ductos
        if(id === "cam08" && bots.Synapse.pos === "cam08") document.getElementById("snd-metal").play();
    }
}

function iaMovement() {
    if(!juegoActivo) return;
    for(let b in bots) {
        if(bots[b].activa && Math.random() > 0.65) {
            let idx = bots[b].ruta.indexOf(bots[b].pos);
            if(idx < bots[b].ruta.length - 1) {
                bots[b].pos = bots[b].ruta[idx+1];
                if(bots[b].pos === "oficina") triggersAtaque(b);
            }
        }
    }
}

function triggersAtaque(b) {
    setTimeout(() => {
        if(!juegoActivo) return;
        if(b === "Aura" && !puerta) die("aura");
        else if((b === "Void" || b === "Synapse") && !ducto) die(b.toLowerCase());
        else { bots[b].pos = bots[b].ruta[0]; } // Reset
    }, 4500);
}

function updateEnergia() {
    if(!juegoActivo) return;
    let u = 1 + (puerta?1:0) + (ducto?1:0) + (monitor?1:0);
    energia -= (0.12 * u);
    document.getElementById("power-percent").innerText = Math.floor(energia);
    document.getElementById("uso-bars").className = "uso-" + (u > 3 ? 3 : u);
    
    if(energia <= 0) die("core");
}

function updateReloj() {
    if(!juegoActivo) return;
    hora++;
    document.getElementById("reloj").innerText = `${hora}:00 AM`;
    if(hora === 6) {
        juegoActivo = false;
        if(nActiva === nocheProgreso) localStorage.setItem("sin-core-save", nActiva + 1);
        document.getElementById("screen-win").classList.remove("hidden");
    }
}

function die(quien) {
    juegoActivo = false;
    document.getElementById("snd-scream").play();
    document.getElementById("death-msg").innerText = `SISTEMA CORRUPTO: ${quien.toUpperCase()}`;
    document.getElementById("screen-game").classList.add("hidden");
    document.getElementById("monitor-overlay").classList.add("hidden");
    document.getElementById("screen-death").classList.remove("hidden");
}

init();
