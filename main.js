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
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    // set width and height
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
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
        x: canvas.width / 2, // from the left
        y: canvas.height / 2, // from the top
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

    // asteroid size/color based on lives left
    const astConfig = {
        1: {
            color: "#ff00ff",
            r: 18
        },
        2: {
            color: "#ff9100",
            r: 26
        },
        3: {
            color: "#ffef0d",
            r: 36
        },
        4: {
            color: "#ff0000",
            r: 26
        }
    }

    // use random number for asteroid spawn/directions
    const rand = (min, max) => Math.random() * (max - min) + min;

    // use pythagorean theorem to calculate distance between two points (ship, asteroid)
    const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

    // asteroid
    class Asteroid {
        constructor(x, y, vx, vy, health) {
            // assign data to asteroid obj
            Object.assign(this, { x, y, vx, vy, health });
        }

        // get radius
        get r() {
            return astConfig[this.health].r;
        }

        // movement based on delta time
        update(dt) {
            // new x = old x + speed * time
            this.x += this.vx * dt;
            this.y += this.vy * dt;

            // if asteroid goes 10 pixels outside screen, teleport on the opposite side
            const limit = 10;

            // left side
            if (this.x < -limit) {
                this.x = canvas.clientWidth + limit;
            }

            // right side
            if (this.x > canvas.clientWidth + limit) {
                this.x = -limit;
            }

            // top side
            if (this.y < -limit) {
                this.y = canvas.clientWidth + limit;
            }

            // bottom side
            if (this.y > canvas.clientWidth + limit) {
                this.y = -limit;
            }
        }

        // draw asteroid
        draw(ctx) {
            ctx.beginPath();
            ctx.fillStyle = astConfig[this.health].color;

            // full circle
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();

            // text (lives left)
            ctx.fillStyle = "#000000";
            ctx.font = `${Math.max(12, this.r/ 1.5)}px "Press Start 2P"`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(this.health), this.x, this.y);
        }
    }

    // rocket
    class Rocket {
        constructor(x, y, angle) {
            this.x = x;
            this.y = y;
            const speed = 400; // pixels/second
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }

        // movement based on delta time
        update(dt) {
            // new x = old x + speed * time
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        }

        // draw rocket
        draw(ctx) {
            // move origin to rocket position
            ctx.translate(this.x, this.y);

            // rotate canvas to align with the angle the rocket points to
            ctx.rotate(Math.atan2(this.vy, this.vx));

            // draw small rectangle centered at rocket position
            // values:
            // -10: move left of origin
            // 14: rectangle extends to the right
            // horizontal center = (-10 + 20/2) = 0 (perfectly centered)
            // -4: move up of origin
            // 8: rectangle extends downwards
            // vertical center = (-4 + 8/2) = 0 (perfectly centered)
            ctx.fillRect(-10, -4, 14, 8);
        }
    }

    // draw ship on canvas
    function drawShip() {
        // move origin to ship position
        ctx.translate(ship.x, ship.y);

        // rotate canvas to ship angle (triangle points in the direction the ship is facing)
        ctx.rotate(ship.angle);

        ctx.beginPath();

        // move up by half the height
        ctx.moveTo(0, -ship.h / 2);

        // draw a line from top to bottom-left corner of triangle
        ctx.lineTo(-ship.w, ship.h / 2);

        // draw a line bottom-left to bottom-right corner of triangle
        ctx.lineTo(ship.w, ship.h / 2);

        // complete triangle
        ctx.closePath();

        ctx.fillStyle = "#800080";
        ctx.fill();

        ctx.strokeStyle = "#FFFFFF";
        ctx.stroke();
    }

    // keyboard events
    // when key is pressed
    window.addEventListener('keydown', e => {
        // handle arrows, z, c, x

        // handle both uppercase/lowercase letters
        const key = e.key.toLowerCase();

        switch (key) {
            case 'arrowleft':
                user.left = true;
                break;
            case 'arrowright':
                user.right = true;
                break;
            case 'arrowup':
                user.up = true;
                break;
            case 'arrowdown':
                user.down = true;
                break;
            case 'z':
                user.rotateLeft = true;
                break;
            case 'c':
                user.rotateRight = true;
                break;
            case 'x':
                shoot();
                break;
        }
    })

    // when key is released
    window.addEventListener('keyup', e => {
        // handle arrows, z, c, x

        // handle both uppercase/lowercase letters
        const key = e.key.toLowerCase();

        switch (key) {
            case 'arrowleft':
                user.left = false;
                break;
            case 'arrowright':
                user.right = false;
                break;
            case 'arrowup':
                user.up = false;
                break;
            case 'arrowdown':
                user.down = false;
                break;
            case 'z':
                user.rotateLeft = false;
                break;
            case 'c':
                user.rotateRight = false;
                break;
            // no state to turn off for x: shooting is an instant action
        }
    })

    // move ship based on keyboard events and delta time
    function updateShip(dt) {
        // use delta time to assure smooth movement
        if (user.left) ship.x -= ship.speed * dt;
        if (user.right) ship.x += ship.speed * dt;
        if (user.up) ship.y -= ship.speed * dt;
        if (user.down) ship.y += ship.speed * dt;
        if (user.rotateLeft) ship.angle -= ship.rotationSpeed * dt;
        if (user.rotateRight) ship.angle += ship.rotationSpeed * dt;

        // make sure ship does not go outside canvas
        ship.x = Math.max(0, Math.min(canvas.width, ship.x)); // ship.x cannot be greater than width of canvas/negative
        ship.y = Math.max(0, Math.min(canvas.height, ship.y));
    }

    drawShip();
})