// open tutorial pop-up when clicking on tutorial button
const tutorialBtn = document.getElementById('tutorial');
const tutorialOverlay = document.getElementById('tutorial-overlay');
const closeTutorialBtn = document.getElementById('close-tutorial-icon');

tutorialBtn.addEventListener('click', () => {
    tutorialOverlay.style.display = 'flex';
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
const startBtn = document.getElementById('start');
const homepage = document.getElementById('home-container');
const game = document.getElementById('game-container')

startBtn.addEventListener('click', () => {
    homepage.style.display = 'none';
    hsBtns.forEach(btn => btn.style.display = 'none');
    game.style.display = 'flex';
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
});