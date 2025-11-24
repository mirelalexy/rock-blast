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
const hsBtn = document.getElementById('trophy-icon');
const hsOverlay = document.getElementById('hs-overlay');
const closeHsBtn = document.getElementById('close-hs-icon');

hsBtn.addEventListener('click', () => {
    hsOverlay.style.display = 'flex';
});

closeHsBtn.addEventListener('click', () => {
    hsOverlay.style.display = 'none';
});
