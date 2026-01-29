/* ==========================================================================
   DURMSGEO - VERSÃO CLIENT (CONECTADA AO BACKEND)
   ========================================================================== */

// --- VARIÁVEIS GLOBAIS ---
const synth = window.speechSynthesis;
let globalUtterance = null;
let clickLock = false;
// URL do seu backend (ajuste se hospedar online)
const API_URL = "http://localhost:3000/api"; 

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initScrollReveal();
    initSnow();
    initVoiceSystem();
    initModal();
    initQuizSystem(); // Agora assíncrono internamente
    initZoomSystem();
});

/* =========================================
   1. GESTÃO DE TEMA (Mantido)
   ========================================= */
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const saved = localStorage.getItem('theme');
    
    if (saved === 'dark') {
        body.classList.add('dark');
        if(themeToggle) themeToggle.textContent = '🌙';
    } else {
        body.classList.remove('dark');
        if(themeToggle) themeToggle.textContent = '☀️';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = body.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggle.textContent = isDark ? '🌙' : '☀️';
        });
    }
}

/* =========================================
   2. REVEAL NA SCROLL (Mantido)
   ========================================= */
function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1 });
    revealEls.forEach(el => revealObserver.observe(el));
}

/* =========================================
   3. ACESSIBILIDADE - ZOOM (Mantido)
   ========================================= */
let zoomLevel = parseFloat(localStorage.getItem("zoomLevel")) || 1;

function initZoomSystem() { applyZoom(); }

function applyZoom() {
    document.documentElement.style.fontSize = (zoomLevel * 100) + "%"; 
    localStorage.setItem("zoomLevel", zoomLevel);
}

window.toggleAccessibilityMenu = function() {
    const wrapper = document.querySelector('.accessibility-wrapper');
    if (wrapper) wrapper.classList.toggle('active');
};

window.changeZoom = function(value) {
    zoomLevel = Math.min(1.6, Math.max(0.8, zoomLevel + value));
    applyZoom();
};

window.resetZoom = function() {
    zoomLevel = 1;
    applyZoom();
};

/* =========================================
   4. SISTEMA DE VOZ (Mantido)
   ========================================= */
function initVoiceSystem() {
    const btnMic = document.getElementById('btn-mic-speak');
    if (!btnMic) return;

    if (!('speechSynthesis' in window)) {
        btnMic.style.display = 'none';
        return;
    }

    btnMic.onclick = function(e) {
        e.preventDefault();
        if (clickLock) return;
        clickLock = true;
        setTimeout(() => { clickLock = false; }, 1000);

        if (synth.speaking || synth.pending) {
            fullStop(btnMic);
        } else {
            prepareAndSpeak(btnMic);
        }
    };

    window.addEventListener('beforeunload', () => {
        synth.cancel();
    });
}

function fullStop(btn) {
    synth.cancel();
    globalUtterance = null;
    if(btn) btn.classList.remove('speaking');
}

function prepareAndSpeak(btn) {
    fullStop(btn);

    const quizGame = document.getElementById('quiz-game');
    const quizText = document.getElementById('question-text')?.innerText;
    let textToRead = "";

    if (quizGame && quizGame.style.display !== 'none' && quizText) {
         textToRead = "Quiz. " + quizText;
         const ops = document.querySelectorAll('.option-btn');
         ops.forEach(op => textToRead += ". " + op.innerText);
    } else {
         const main = document.querySelector('main') || document.body;
         textToRead = main.innerText;
    }

    textToRead = textToRead.replace(/[^a-zA-Z0-9 áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ.,?!]/g, ' ');
    textToRead = textToRead.replace(/\s+/g, ' ').trim().substring(0, 1500);

    if (textToRead.length < 2) {
        textToRead = "Não encontrei texto para ler.";
    }

    globalUtterance = new SpeechSynthesisUtterance(textToRead);
    globalUtterance.lang = 'pt-BR';
    globalUtterance.rate = 1.0;
    
    globalUtterance.onstart = () => { if(btn) btn.classList.add('speaking'); };
    globalUtterance.onend = () => { fullStop(btn); };
    globalUtterance.onerror = (e) => { 
        console.log("Erro de voz recuperado"); 
        fullStop(btn); 
    };

    synth.speak(globalUtterance);
}

/* =========================================
   5. NEVE (Mantido)
   ========================================= */
function initSnow() {
    const canvas = document.getElementById("snow");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, flakes = [], angle = 0;

    function resizeSnow() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeSnow);
    resizeSnow();

    const maxFlakes = 50; 
    for (let i = 0; i < maxFlakes; i++) {
        flakes.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 3 + 1, d: Math.random() + 1 });
    }

    function drawSnow() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.beginPath();
        flakes.forEach(f => {
            ctx.moveTo(f.x, f.y);
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        });
        ctx.fill();
        angle += 0.01;
        flakes.forEach(f => {
            f.y += Math.pow(f.d, 2) * 0.5 + 0.5; 
            f.x += Math.sin(angle) * 0.5;
            if (f.y > h) { f.y = -10; f.x = Math.random() * w; }
            if (f.x > w+5 || f.x < -5) { f.x = Math.random() * w; f.y = -10; }
        });
        requestAnimationFrame(drawSnow);
    }
    drawSnow();
}

/* =========================================
   6. MODAL (Mantido)
   ========================================= */
function initModal() {
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modalClose');
    if (modal && modalClose) {
        modalClose.addEventListener('click', () => modal.classList.remove('show'));
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
    }
}

/* =========================================
   7. QUIZ (MODIFICADO PARA BACKEND)
   ========================================= */
function initQuizSystem() {
    const quizIntro = document.getElementById('quiz-intro');
    if (!quizIntro) return;

    // A variável perguntas começa vazia, pois virá do servidor
    let perguntas = [];
    let indice = 0, pts = 0, nome = "";

    // Busca o Ranking inicial do servidor
    fetchRanking('ranking-body-intro');

    // Função para iniciar o jogo
    window.iniciarQuiz = async function() {
        const inp = document.getElementById("player-name");
        if (!inp.value.trim()) return alert("Digite seu nome!");
        
        nome = inp.value.trim();
        indice = 0; 
        pts = 0;

        // Tenta buscar perguntas do backend
        try {
            const resp = await fetch(`${API_URL}/quiz`);
            perguntas = await resp.json();
            
            if(perguntas.length === 0) throw new Error("Sem perguntas");

            document.getElementById("quiz-intro").style.display = "none";
            document.getElementById("quiz-game").style.display = "block";
            document.getElementById("quiz-results").style.display = "none";
            carregar();
        } catch (error) {
            alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
            console.error(error);
        }
    };

    function carregar() {
        const p = perguntas[indice];
        document.getElementById("question-text").innerText = p.pergunta;
        document.getElementById("question-indicator").innerText = `Questão ${indice+1}/${perguntas.length}`;
        document.getElementById("score-indicator").innerText = `${pts} pts`;
        document.getElementById("progress-fill").style.width = `${(indice/perguntas.length)*100}%`;
        
        const div = document.getElementById("options-container");
        div.innerHTML = "";
        
        p.opcoes.forEach((op, i) => {
            const b = document.createElement("button");
            b.className = "option-btn";
            b.innerText = op;
            b.onclick = () => check(i, b);
            div.appendChild(b);
        });
    }

    function check(i, btn) {
        document.querySelectorAll(".option-btn").forEach(b => b.disabled = true);
        if (i === perguntas[indice].correta) { 
            btn.classList.add("correct"); 
            pts += 100; 
        } else { 
            btn.classList.add("wrong"); 
            document.querySelectorAll(".option-btn")[perguntas[indice].correta].classList.add("correct"); 
        }
        
        document.getElementById("score-indicator").innerText = `${pts} pts`;
        setTimeout(() => {
            indice++;
            if (indice < perguntas.length) carregar();
            else fim();
        }, 1500);
    }

    async function fim() {
        document.getElementById("quiz-game").style.display = "none";
        document.getElementById("quiz-results").style.display = "block";
        document.getElementById("final-score").innerText = pts;

        // Envia pontuação para o Backend
        try {
            await fetch(`${API_URL}/ranking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: nome, pontos: pts })
            });
            // Recarrega o ranking atualizado do servidor
            fetchRanking("ranking-body-final");
        } catch (error) {
            console.error("Erro ao salvar ranking", error);
        }
    }

    // Função que busca dados do servidor em vez do localStorage
    async function fetchRanking(elementId) {
        const tb = document.getElementById(elementId);
        if(!tb) return;
        
        try {
            const resp = await fetch(`${API_URL}/ranking`);
            const ranking = await resp.json();
            
            tb.innerHTML = ranking.length ? "" : "<tr><td>-</td><td>Seja o primeiro!</td><td>-</td></tr>";
            ranking.forEach((x, i) => {
                tb.innerHTML += `<tr><td>${i+1}</td><td>${x.nome}</td><td>${x.pontos}</td></tr>`;
            });
        } catch (error) {
            tb.innerHTML = "<tr><td colspan='3'>Offline</td></tr>";
        }
    }

    window.reiniciarQuiz = function() {
        document.getElementById("quiz-results").style.display = "none";
        document.getElementById("quiz-intro").style.display = "block";
        fetchRanking('ranking-body-intro');
        document.getElementById("player-name").value = "";
    };
}

/* =========================================
   8. BARRA DE PROGRESSO DE LEITURA (Mantido)
   ========================================= */
window.onscroll = function() { updateProgressBar() };

function updateProgressBar() {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  
  const bar = document.getElementById("reading-progress-bar");
  if(bar) bar.style.width = scrolled + "%";
}