document.addEventListener('DOMContentLoaded', function() {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const style = document.createElement('style');
    style.textContent = `
        #durmsgeo-player {
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 320px;
            background-color: #0e0d0d;
            border: 1px solid #333;
            border-radius: 12px;
            padding: 15px;
            font-family: 'Inter', sans-serif;
            color: #ffffff;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            transition: all 0.3s ease;
        }
        #durmsgeo-player.minimized {
            width: 60px;
            height: 60px;
            overflow: hidden;
            padding: 0;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #durmsgeo-player.minimized .player-content {
            display: none;
        }
        #durmsgeo-player.minimized .maximize-btn {
            display: flex;
            width: 100%;
            height: 100%;
            align-items: center;
            justify-content: center;
            background: #0e0d0d;
            border: 2px solid #05df34;
            border-radius: 50%;
        }
        .maximize-btn svg {
            fill: #05df34;
            width: 24px;
            height: 24px;
        }
        .player-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .track-info {
            font-size: 14px;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #05df34;
            max-width: 240px;
        }
        .minimize-btn {
            background: none;
            border: none;
            color: #fff;
            cursor: pointer;
            padding: 0;
        }
        .progress-container {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            font-size: 11px;
            color: #aaa;
        }
        .controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .control-btn {
            background: none;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .control-btn svg {
            fill: #fff;
            width: 18px;
            height: 18px;
            transition: fill 0.2s;
        }
        .control-btn:hover svg {
            fill: #05df34;
        }
        .control-btn.play-btn svg {
            width: 32px;
            height: 32px;
            fill: #05df34;
        }
        .volume-container {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        input[type=range] {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            height: 12px;
            width: 12px;
            border-radius: 50%;
            background: #05df34;
            cursor: pointer;
            margin-top: -4px;
        }
        input[type=range]::-moz-range-thumb {
            appearance: none;
            height: 12px;
            width: 12px;
            border-radius: 50%;
            background: #05df34;
            cursor: pointer;
            border: none;
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            background: #333;
            border-radius: 2px;
        }
        input[type=range]::-moz-range-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            background: #333;
            border-radius: 2px;
        }
        .hidden { display: none !important; }
    `;
    document.head.appendChild(style);

    const playerHTML = `
        <div id="durmsgeo-player">
            <div class="maximize-btn hidden">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
            </div>
            <div class="player-content">
                <div class="player-header">
                    <div class="track-info" id="dg-track-title">Carregando...</div>
                    <button class="minimize-btn" id="dg-min-btn">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M19 13H5v-2h14v2z"/></svg>
                    </button>
                </div>
                
                <div class="progress-container">
                    <span id="dg-current-time">0:00</span>
                    <input type="range" id="dg-seek-bar" value="0" min="0" step="1">
                    <span id="dg-duration">0:00</span>
                </div>

                <div class="controls">
                    <button class="control-btn" id="dg-prev">
                        <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>
                    <button class="control-btn" id="dg-rewind">
                        <svg viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
                    </button>
                    <button class="control-btn play-btn" id="dg-play-pause">
                        <svg id="dg-icon-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        <svg id="dg-icon-pause" class="hidden" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </button>
                    <button class="control-btn" id="dg-forward">
                        <svg viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
                    </button>
                    <button class="control-btn" id="dg-next">
                        <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                    </button>
                </div>

                <div class="volume-container">
                    <button class="control-btn" id="dg-mute">
                        <svg id="dg-icon-vol" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                        <svg id="dg-icon-muted" class="hidden" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                    </button>
                    <input type="range" id="dg-volume-bar" value="100" min="0" max="100">
                </div>
                <audio id="dg-audio"></audio>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', playerHTML);

    const playlist = [
        { title: "Trap", src: "assets/musica1.mp3" },
        { title: "Forró", src: "assets/musica2.mp3" }
    ];

    let currentTrack = 0;
    let isPlaying = false;
    
    const audio = document.getElementById('dg-audio');
    const title = document.getElementById('dg-track-title');
    const playBtn = document.getElementById('dg-play-pause');
    const iconPlay = document.getElementById('dg-icon-play');
    const iconPause = document.getElementById('dg-icon-pause');
    const prevBtn = document.getElementById('dg-prev');
    const nextBtn = document.getElementById('dg-next');
    const seekBar = document.getElementById('dg-seek-bar');
    const currentTimeEl = document.getElementById('dg-current-time');
    const durationEl = document.getElementById('dg-duration');
    const volumeBar = document.getElementById('dg-volume-bar');
    const muteBtn = document.getElementById('dg-mute');
    const iconVol = document.getElementById('dg-icon-vol');
    const iconMuted = document.getElementById('dg-icon-muted');
    const rewindBtn = document.getElementById('dg-rewind');
    const forwardBtn = document.getElementById('dg-forward');
    const playerWidget = document.getElementById('durmsgeo-player');
    const minBtn = document.getElementById('dg-min-btn');
    const maxBtn = document.querySelector('.maximize-btn');

    function loadTrack(index) {
        audio.src = playlist[index].src;
        title.textContent = playlist[index].title;
        audio.load();
    }

    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            iconPlay.classList.remove('hidden');
            iconPause.classList.add('hidden');
        } else {
            audio.play();
            iconPlay.classList.add('hidden');
            iconPause.classList.remove('hidden');
        }
        isPlaying = !isPlaying;
    }

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' + sec : sec}`;
    }

    loadTrack(currentTrack);

    playBtn.addEventListener('click', togglePlay);

    prevBtn.addEventListener('click', () => {
        currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrack);
        if(isPlaying) audio.play();
    });

    nextBtn.addEventListener('click', () => {
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack(currentTrack);
        if(isPlaying) audio.play();
    });

    audio.addEventListener('timeupdate', () => {
        if(audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            seekBar.value = audio.currentTime;
            seekBar.max = audio.duration;
            currentTimeEl.textContent = formatTime(audio.currentTime);
            durationEl.textContent = formatTime(audio.duration);
        }
    });

    seekBar.addEventListener('input', () => {
        audio.currentTime = seekBar.value;
    });

    volumeBar.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
        if(audio.volume === 0) {
            iconVol.classList.add('hidden');
            iconMuted.classList.remove('hidden');
        } else {
            iconVol.classList.remove('hidden');
            iconMuted.classList.add('hidden');
        }
    });

    muteBtn.addEventListener('click', () => {
        if(audio.muted) {
            audio.muted = false;
            iconVol.classList.remove('hidden');
            iconMuted.classList.add('hidden');
            volumeBar.value = audio.volume * 100;
        } else {
            audio.muted = true;
            iconVol.classList.add('hidden');
            iconMuted.classList.remove('hidden');
            volumeBar.value = 0;
        }
    });

    rewindBtn.addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    });

    forwardBtn.addEventListener('click', () => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    });

    audio.addEventListener('ended', () => {
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack(currentTrack);
        audio.play();
    });

    minBtn.addEventListener('click', () => {
        playerWidget.classList.add('minimized');
        maxBtn.classList.remove('hidden');
    });

    maxBtn.addEventListener('click', () => {
        playerWidget.classList.remove('minimized');
        maxBtn.classList.add('hidden');
    });
});