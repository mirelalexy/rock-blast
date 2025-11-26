// open tutorial pop-up when clicking on tutorial button
const tutorialBtns = document.querySelectorAll('.tutorial');
const tutorialOverlay = document.getElementById('tutorial-overlay');
const closeTutorialBtn = document.getElementById('close-tutorial-icon');

tutorialBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tutorialOverlay.style.display = 'flex';
    });
});

closeTutorialBtn.addEventListener('click', () => {
    tutorialOverlay.style.display = 'none';
});

// open highscores pop-up when clicking on trophy icon
const hsBtns = document.querySelectorAll('.trophy-icon');
const hsOverlay = document.getElementById('hs-overlay');
const closeHsBtn = document.getElementById('close-hs-icon');

hsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        hsOverlay.style.display = 'flex';
    });
});

closeHsBtn.addEventListener('click', () => {
    hsOverlay.style.display = 'none';
});

// animated homepage background
// get context and screen size
const bg = document.getElementById('bg');
const ctx = bg.getContext("2d");

// set canvas and background color;
function resize() {
    bg.width = window.innerWidth;
    bg.height = window.innerHeight;
}

resize();

// glow effect
ctx.shadowBlur = 10;
ctx.shadowColor = "white";

function animate() {
  // set random position and size for the stars
    let x = Math.random() * bg.width;
    let y = Math.random() * bg.height;
    let r = Math.random() * 2.5;

    // draw the stars;
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    setTimeout(animate, 100);
}

animate();

// hide homepage when entering game
const startBtns = document.querySelectorAll('.start');
const homepage = document.getElementById('home-container');
const game = document.getElementById('game-container')

startBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        homepage.style.display = 'none';
        hsBtns.forEach(btn => btn.style.display = 'none');
        game.style.display = 'flex';
        gameOver.style.display = 'none';
        bg.style.visibility = "hidden";
    });
});

// open warning pop-up when clicking on exit button
const exitBtn = document.getElementById('exit');
const warningOverlay = document.getElementById('warning-overlay');
const noBtn = document.getElementById('no');
const yesBtn = document.getElementById('yes');
const gameOver =document.getElementById('game-over-container');

exitBtn.addEventListener('click', () => {
    warningOverlay.style.display = 'flex';
});

noBtn.addEventListener('click', () => {
    warningOverlay.style.display = 'none';
});

yesBtn.addEventListener('click', () => {
    gameOver.style.display = 'flex';
    warningOverlay.style.display = 'none';
    game.style.display = 'none';
    hsBtns[1].style.display = 'flex';
    bg.style.visibility = "visible";
});

// game canvas
// wrap in arrow function to prevent bugs/overwriting
// code runs when the file loads
(() => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    // game state
    let asteroids = [];
    let rockets = [];
    let score = 0;
    let nextLifePts = 2000; // every 2000 points mean an extra life
    let nextLifeThreshold = nextLifePts; // next score the player must hit to get a life
    let lives = 3;
    let maxRockets = 3;
    let gameOver = false;

    // ship
    const ship = {
        x: 200, // from the left
        y: 200, // from the top
        w: 20, // half-width
        h: 26,
        angle: 0, // by default point to the right
        speed: 180, // move 180 pixels/second
        rotationSpeed: Math.PI // rotate 180°/second
    }

    // track what user is doing
    const user = {
        left: false,
        right: false,
        up: false,
        down: false,
        rotateLeft: false,
        rotateRight: false,
        shoot: false
    }
})