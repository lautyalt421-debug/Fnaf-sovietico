const AudioSys = {
    ctx: null,
    init() { if(!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    beep(f, d) {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.frequency.value = f; g.gain.value = 0.1;
        o.connect(g); g.connect(this.ctx.destination);
        o.start(); o.stop(this.ctx.currentTime + d);
    },
    staticSound(d) {
        const bSize = this.ctx.sampleRate * d;
        const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
        const data = b.getChannelData(0);
        for(let i=0; i<bSize; i++) data[i] = Math.random() * 2 - 1;
        const s = this.ctx.createBufferSource();
        s.buffer = b; const g = this.ctx.createGain();
        g.gain.value = 0.05; s.connect(g); g.connect(this.ctx.destination);
        s.start();
    }
};

const game = {
    active: false, power: 100, hour: 0, cam: 1,
    isCam: false, isDoor: false, isMask: false,
    bots: {
        stalnoy: { pos: 1, path: [1, 2, 4, 100], scare: "stalnoy_scare.gif" }
    },

    start() {
        AudioSys.init();
        AudioSys.beep(400, 0.5);
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        this.active = true;
        this.updateOffice();
        
        setInterval(() => this.loop(), 1000);
        setInterval(() => this.moveBots(), 5000);
    },

    loop() {
        if(!this.active) return;
        // Energía
        let drain = 0.15 + (this.isDoor ? 0.3 : 0) + (this.isCam ? 0.2 : 0);
        this.power -= drain;
        document.getElementById('power').innerText = Math.floor(this.power) + "%";
        if(this.power <= 0) this.jumpscare('stalnoy');

        // Reloj (Cada 60 seg cambia hora)
        this.tickCounter = (this.tickCounter || 0) + 1;
        if(this.tickCounter >= 60) {
            this.hour++; this.tickCounter = 0;
            document.getElementById('clock').innerText = this.hour + ":00 AM";
            if(this.hour === 6) { alert("GANASTE"); location.reload(); }
        }
    },

    moveBots() {
        if(!this.active) return;
        let b = this.bots.stalnoy;
        if(Math.random() > 0.5) {
            let idx = b.path.indexOf(b.pos);
            if(idx < b.path.length - 1) b.pos = b.path[idx+1];
            
            if(this.isCam && b.pos === this.cam) this.triggerStatic();
            if(b.pos === 100 && !this.isDoor) this.jumpscare('stalnoy');
            else if(b.pos === 100 && this.isDoor) { b.pos = 1; AudioSys.beep(100, 0.2); }
        }
    },

    triggerStatic() {
        const s = document.getElementById('static-overlay');
        s.classList.add('static-on');
        AudioSys.staticSound(0.5);
        setTimeout(() => s.classList.remove('static-on'), 500);
    },

    toggleDoor() {
        this.isDoor = !this.isDoor;
        document.getElementById('btn-door').classList.toggle('active');
        AudioSys.beep(200, 0.1);
        this.updateOffice();
    },

    toggleMonitor() {
        if(this.isMask) return;
        this.isCam = !this.isCam;
        document.getElementById('monitor-layer').classList.toggle('hidden');
        if(this.isCam) { this.triggerStatic(); this.updateCam(); }
    },

    toggleMask() {
        if(this.isCam) return;
        this.isMask = !this.isMask;
        document.getElementById('btn-mask').classList.toggle('active');
        AudioSys.beep(600, 0.05);
    },

    switchCam(n) {
        this.cam = n;
        this.triggerStatic();
        this.updateCam();
    },

    updateOffice() {
        const img = this.isDoor ? "oficina_cerrada.jpg" : "oficina_base.jpg";
        document.getElementById('office-img').style.backgroundImage = `url('assets/images/${img}')`;
    },

    updateCam() {
        const names = ["", "MUELLE", "PASILLO", "CALDERAS", "PATIO", "NODO"];
        let suffix = (this.bots.stalnoy.pos === this.cam) ? "_stalnoy" : "";
        document.getElementById('cam-img').src = `assets/images/${names[this.cam].toLowerCase()}${suffix}.jpg`;
        document.getElementById('cam-label').innerText = `CAM 0${this.cam} - ${names[this.cam]}`;
    },

    jumpscare(name) {
        this.active = false;
        const l = document.getElementById('jumpscare-layer');
        document.getElementById('scare-img').src = `assets/sprites/${this.bots[name].scare}`;
        l.classList.remove('hidden');
        AudioSys.staticSound(2);
        setTimeout(() => location.reload(), 2000);
    }
};
