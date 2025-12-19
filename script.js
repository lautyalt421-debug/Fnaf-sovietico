const AudioSys = {
    ctx: null,
    init() { if(!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    beep(f, d) {
        if(!this.ctx) return;
        let o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.frequency.value = f; g.gain.value = 0.1;
        o.connect(g); g.connect(this.ctx.destination);
        o.start(); o.stop(this.ctx.currentTime + d);
    },
    noise(d) {
        if(!this.ctx) return;
        let b = this.ctx.createBuffer(1, this.ctx.sampleRate * d, this.ctx.sampleRate),
            data = b.getChannelData(0);
        for(let i=0; i<data.length; i++) data[i] = Math.random() * 2 - 1;
        let s = this.ctx.createBufferSource(); s.buffer = b;
        let g = this.ctx.createGain(); g.gain.value = 0.05;
        s.connect(g); g.connect(this.ctx.destination); s.start();
    }
};

const game = {
    active: false, night: 1, power: 100, hour: 0, cam: 1,
    isCam: false, isDoor: false, isMask: false,
    bots: {
        stalnoy: { pos: 1, path: [1, 2, 4, 100], scare: "stalnoy_scare.gif" }
    },

    start(n) {
        this.night = n;
        AudioSys.init();
        AudioSys.beep(400, 0.3);
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        this.active = true;
        this.updateOffice();
        this.timer = setInterval(() => this.loop(), 1000);
        this.aiTimer = setInterval(() => this.moveBots(), 6000 - (this.night * 500));
    },

    loop() {
        if(!this.active) return;
        this.power -= (0.15 + (this.isDoor?0.3:0) + (this.isCam?0.2:0));
        document.getElementById('power').innerText = Math.floor(this.power) + "%";
        if(this.power <= 0) this.jumpscare('stalnoy');

        this.ticks = (this.ticks || 0) + 1;
        if(this.ticks >= 50) { // Cada 50 seg sube una hora
            this.hour++; this.ticks = 0;
            document.getElementById('clock').innerText = this.hour + ":00 AM";
            if(this.hour === 6) { alert("OPERACIÓN COMPLETADA"); location.reload(); }
        }
    },

    moveBots() {
        let b = this.bots.stalnoy;
        if(Math.random() > 0.4) {
            let idx = b.path.indexOf(b.pos);
            if(idx < b.path.length - 1) b.pos = b.path[idx+1];
            if(this.isCam && b.pos === this.cam) this.triggerStatic();
            if(b.pos === 100 && !this.isDoor) this.jumpscare('stalnoy');
            else if(b.pos === 100 && this.isDoor) { b.pos = 1; AudioSys.beep(100, 0.2); }
        }
    },

    triggerStatic() {
        let s = document.getElementById('static-overlay');
        s.classList.add('static-on');
        AudioSys.noise(0.4);
        setTimeout(() => s.classList.remove('static-on'), 400);
    },

    toggleDoor() {
        this.isDoor = !this.isDoor;
        document.getElementById('btn-door').classList.toggle('active');
        AudioSys.beep(150, 0.1);
        this.updateOffice();
    },

    toggleMonitor() {
        this.isCam = !this.isCam;
        document.getElementById('monitor-layer').classList.toggle('hidden');
        if(this.isCam) { this.triggerStatic(); this.updateCam(); }
    },

    toggleMask() {
        if(this.isCam) return;
        this.isMask = !this.isMask;
        document.getElementById('btn-mask').classList.toggle('active');
        AudioSys.beep(500, 0.05);
    },

    switchCam(n) {
        this.cam = n;
        this.triggerStatic();
        this.updateCam();
    },

    updateOffice() {
        let name = this.isDoor ? "oficina_cerrada.jpg" : "oficina_base.jpg";
        document.getElementById('office-img').style.backgroundImage = `url('assets/images/${name}')`;
    },

    updateCam() {
        let names = ["", "muelle", "pasillo", "calderas", "patio", "nodo"];
        let suffix = (this.bots.stalnoy.pos === this.cam) ? "_stalnoy" : "";
        let finalPath = `assets/images/${names[this.cam]}${suffix}.jpg`;
        document.getElementById('cam-img').src = finalPath;
        document.getElementById('cam-label').innerText = `CAM 0${this.cam} - ${names[this.cam].toUpperCase()}`;
    },

    jumpscare(bot) {
        this.active = false;
        clearInterval(this.timer); clearInterval(this.aiTimer);
        let layer = document.getElementById('jumpscare-layer');
        document.getElementById('scare-img').src = `assets/sprites/${this.bots[bot].scare}`;
        layer.classList.remove('hidden');
        AudioSys.noise(2);
        setTimeout(() => location.reload(), 3000);
    }
};
