* { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; user-select: none; }
body { background: #000; color: #0f0; font-family: monospace; overflow: hidden; height: 100vh; }
.hidden { display: none !important; }

#start-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; background: #000; }
.glitch { font-size: 2.5rem; text-shadow: 2px 2px #f00; color: #0f0; }
#night-menu { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
#night-menu button { padding: 15px; background: none; border: 1px solid #0f0; color: #0f0; font-size: 1.2rem; cursor: pointer; }

#game-container { position: relative; height: 100vh; display: flex; flex-direction: column; }
#office-bg { flex: 1; background-size: cover; background-position: center; transition: 0.3s; }

#top-bar { position: absolute; top: 0; width: 100%; padding: 15px; display: flex; justify-content: space-between; background: rgba(0,0,0,0.7); z-index: 100; font-size: 1.2rem; }
#usage-visual { color: #0f0; font-weight: bold; letter-spacing: 2px; }

#ui-panel { height: 18vh; display: flex; background: #000; padding: 10px; gap: 10px; border-top: 2px solid #333; }
.ui-btn-wrapper { flex: 1; }
#ui-panel button { width: 100%; height: 100%; background: #111; border: 1px solid #0f0; color: #0f0; font-weight: bold; font-size: 0.9rem; border-radius: 5px; }
.active-btn { background: #0f0 !important; color: #000 !important; box-shadow: 0 0 15px #0f0; }

#camera-monitor { position: fixed; inset: 0; z-index: 2000; display: flex; flex-direction: column; background: #000; }
#cam-viewport { flex: 1.5; position: relative; overflow: hidden; }
#cam-img { width: 100%; height: 100%; object-fit: contain; }
#static-layer { position: absolute; inset: 0; background: url('assets/images/estatica.gif'); opacity: 0.2; pointer-events: none; }

#molot-minigame { position: absolute; inset: 0; background: rgba(255, 0, 0, 0.4); z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; }
#molot-minigame p { color: white; background: red; padding: 5px; margin-bottom: 10px; font-weight: bold; animation: blink 0.4s infinite; }
#node-container { position: relative; width: 90%; height: 70%; border: 1px solid white; }
.node { position: absolute; width: 50px; height: 50px; background: #400; border: 2px solid #f00; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.node.active { background: #0f0; border-color: #fff; }

#cam-controls { flex: 1; background: #000; padding: 10px; display: flex; flex-direction: column; gap: 10px; }
.cam-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex: 1; }
.cam-btn { background: #222; border: 1px solid #0f0; color: #0f0; font-weight: bold; }
#btn-cam-close { height: 60px; background: #400; color: #fff; border: none; font-weight: bold; font-size: 1.1rem; }

#mask-overlay { position: fixed; inset: 0; z-index: 500; border: 60px solid black; background: radial-gradient(circle, transparent 40%, black 100%); pointer-events: none; }
#oxygen-alert { position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%); z-index: 2500; color: red; font-size: 1.5rem; text-align: center; font-weight: bold; animation: blink 0.5s infinite; }

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

#jumpscare-container { position: fixed; inset: 0; z-index: 9999; background: #000; }
#jumpscare-img { width: 100%; height: 100%; object-fit: cover; }
#death-screen, #win-screen { position: fixed; inset: 0; z-index: 10000; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
    
