// open tutorial pop-up when clicking on tutorial button
const tutorialBtn = document.getElementById('tutorial');
const tutorialOverlay = document.getElementById('tutorial-overlay');
const closeBtn = document.getElementById('close-icon');

tutorialBtn.addEventListener('click', () => {
    tutorialOverlay.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
    tutorialOverlay.style.display = 'none';
});
