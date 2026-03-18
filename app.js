/**
 * Aura - Premium Typing Engine
 * v1.4 - Comfort Edition (Keybr-inspired)
 */

// --- Global Session State ---
let Session = {
    totalWords: 0,
    totalKeystrokes: 0,
    totalErrors: 0,
    wpmHistory: [],
    bestWpm: 0,
    sessionStartTime: performance.now(),
    lessonsCompleted: 0
};

// --- Active Lesson State ---
let State = {
    currentText: "",
    currentIndex: 0,
    startTime: null,
    isActive: false,
    keystrokes: 0,
    errors: 0,
    combo: 0,
    mode: "both",
    lessonWordCount: 15,
    lastWpmUpdate: 0
};

// --- DOM Elements ---
const DOM = {
    stage: document.getElementById('typing-stage'),
    textContainer: document.getElementById('text-container'),
    caret: document.getElementById('caret'),
    wpmDisplay: document.getElementById('live-wpm'),
    accDisplay: document.getElementById('live-acc'),
    streakDisplay: document.getElementById('live-streak'),
    radios: document.querySelectorAll('input[name="hand-mode"]'),
    wordCountRadios: document.querySelectorAll('input[name="word-count"]'),
    themeSelector: document.getElementById('theme-selector'),
    keyboard: document.getElementById('virtual-keyboard'),
    modal: document.getElementById('welcome-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalText: document.getElementById('modal-text'),
    modalBtn: document.getElementById('modal-button'),
    canvas: document.getElementById('wpm-chart')
};

let charElements = [];
let updateInterval = null;
let graphCtx = DOM.canvas ? DOM.canvas.getContext('2d') : null;

// --- Initialization ---
function init() {
    bindEvents();
    startNewLesson();
    renderGraph();
}

function bindEvents() {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);
    window.addEventListener('resize', () => {
        updateCaretPosition();
        renderGraph();
    });

    if (DOM.modalBtn) {
        DOM.modalBtn.addEventListener('click', () => {
            DOM.modal.classList.add('hidden');
        });
    }

    DOM.radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            State.mode = e.target.value;
            applyKeyboardVisuals();
            transitionToNextLesson();
        });
    });

    DOM.wordCountRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            State.lessonWordCount = parseInt(e.target.value);
            transitionToNextLesson();
        });
    });

    if (DOM.themeSelector) {
        DOM.themeSelector.addEventListener('change', (e) => {
            document.body.dataset.theme = e.target.value;
        });
    }
}

function showModal(title, text, btnText = "Continue") {
    if (!DOM.modal) return;
    DOM.modalTitle.innerText = title;
    DOM.modalText.innerText = text;
    DOM.modalBtn.innerText = btnText;
    DOM.modal.classList.remove('hidden');
}

function applyKeyboardVisuals() {
    if (DOM.keyboard) DOM.keyboard.className = `keyboard isolate-${State.mode}`;
}

// --- Lesson Management ---
function startNewLesson() {
    State.currentText = generateLesson(State.mode, State.lessonWordCount);
    State.currentIndex = 0;
    State.startTime = null;
    State.isActive = false;
    State.keystrokes = 0;
    State.errors = 0;
    State.combo = 0;

    clearInterval(updateInterval);
    renderText();
    updateStatsUI();
    updateCaretPosition();
    if (DOM.caret) DOM.caret.classList.add('idle');
}

function renderText() {
    DOM.textContainer.innerHTML = '';
    DOM.textContainer.appendChild(DOM.caret);
    charElements = [];

    for (let i = 0; i < State.currentText.length; i++) {
        const span = document.createElement('span');
        span.innerText = State.currentText[i];
        span.className = 'char';
        DOM.textContainer.appendChild(span);
        charElements.push(span);
    }
}

function transitionToNextLesson() {
    startNewLesson();
}

// --- Typing Core Logic ---
function handleKeydown(e) {
    if (DOM.modal && !DOM.modal.classList.contains('hidden')) return;
    if (e.key.length !== 1 && e.key !== 'Backspace') return;
    if (e.key === ' ') e.preventDefault();

    const virtualKey = document.getElementById(e.code);
    if (virtualKey) virtualKey.classList.add('active');

    if (e.key === 'Backspace') {
        if (State.currentIndex > 0) {
            State.currentIndex--;
            charElements[State.currentIndex].className = 'char';
            State.combo = 0;
            updateCaretPosition();
            updateStatsUI();
        }
        return;
    }

    if (!State.isActive) {
        State.isActive = true;
        State.startTime = performance.now();
        if (DOM.caret) DOM.caret.classList.remove('idle');
        updateInterval = setInterval(updateTick, 200);
    }

    if (State.currentIndex >= State.currentText.length) return;

    const expectedChar = State.currentText[State.currentIndex];
    const typedChar = e.key;
    State.keystrokes++;
    Session.totalKeystrokes++;

    const charSpan = charElements[State.currentIndex];

    if (typedChar === expectedChar) {
        charSpan.classList.add('correct');
        State.combo++;
    } else {
        charSpan.classList.add('incorrect');
        State.errors++;
        Session.totalErrors++;
        State.combo = 0;
        triggerErrorFeedback();
        if (virtualKey) virtualKey.classList.add('error');
    }

    State.currentIndex++;
    updateCaretPosition();
    updateStatsUI();

    if (State.currentIndex === State.currentText.length) {
        finishLesson();
    }
}

function handleKeyup(e) {
    const virtualKey = document.getElementById(e.code);
    if (virtualKey) {
        virtualKey.classList.remove('active');
        setTimeout(() => virtualKey.classList.remove('error'), 100);
    }
}

function triggerErrorFeedback() {
    DOM.stage.classList.remove('shake-animation');
    void DOM.stage.offsetWidth;
    DOM.stage.classList.add('shake-animation');
}

// --- Analytics & Graph ---
function updateTick() {
    updateStatsUI();
    const now = performance.now();
    if (now - State.lastWpmUpdate > 1000) {
        const wpm = calculateWPM();
        if (State.isActive || wpm > 0) {
            Session.wpmHistory.push(wpm);
            if (Session.wpmHistory.length > 40) Session.wpmHistory.shift();
            renderGraph();
        }
        State.lastWpmUpdate = now;
    }
}

function calculateWPM() {
    if (!State.startTime) return 0;
    const minutesElapsed = (performance.now() - State.startTime) / 60000;
    if (minutesElapsed < 0.01) return 0;
    return Math.max(0, Math.round((State.currentIndex / 5) / minutesElapsed));
}

function updateStatsUI() {
    const currentWpm = calculateWPM();
    const accuracy = Session.totalKeystrokes === 0 ? 100 : Math.max(0, Math.round(((Session.totalKeystrokes - Session.totalErrors) / Session.totalKeystrokes) * 100));

    if (DOM.wpmDisplay) DOM.wpmDisplay.innerText = currentWpm;
    if (DOM.accDisplay) DOM.accDisplay.innerText = accuracy;
    if (DOM.streakDisplay) DOM.streakDisplay.innerText = State.combo;
}

function renderGraph() {
    if (!graphCtx || !DOM.canvas) return;
    const w = DOM.canvas.width;
    const h = DOM.canvas.height;
    graphCtx.clearRect(0, 0, w, h);

    if (Session.wpmHistory.length < 2) return;

    const maxWpmInHistory = Math.max(...Session.wpmHistory);
    const scaleY = Math.max(100, maxWpmInHistory + 10);
    const stepX = w / (Session.wpmHistory.length - 1);

    graphCtx.beginPath();
    graphCtx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent-gold');
    graphCtx.lineWidth = 1.5;
    graphCtx.lineJoin = 'round';

    for (let i = 0; i < Session.wpmHistory.length; i++) {
        const x = i * stepX;
        const y = h - (Session.wpmHistory[i] / scaleY) * h;
        if (i === 0) graphCtx.moveTo(x, y);
        else graphCtx.lineTo(x, y);
    }
    graphCtx.stroke();
}

function updateCaretPosition() {
    if (!DOM.caret) return;
    if (State.currentIndex < charElements.length) {
        const targetSpan = charElements[State.currentIndex];
        // Center caret relative to char with letter-spacing
        DOM.caret.style.transform = `translate(${targetSpan.offsetLeft}px, ${targetSpan.offsetTop}px)`;
    } else if (charElements.length > 0) {
        const lastSpan = charElements[charElements.length - 1];
        DOM.caret.style.transform = `translate(${lastSpan.offsetLeft + lastSpan.offsetWidth}px, ${lastSpan.offsetTop}px)`;
    }
}

function finishLesson() {
    State.isActive = false;
    clearInterval(updateInterval);
    Session.lessonsCompleted++;
    const finalWpm = calculateWPM();
    Session.wpmHistory.push(finalWpm);
    if (Session.wpmHistory.length > 40) Session.wpmHistory.shift();
    renderGraph();

    transitionToNextLesson();
}

document.addEventListener('DOMContentLoaded', init);
