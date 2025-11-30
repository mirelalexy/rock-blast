// code runs when the dom content loads
window.addEventListener("DOMContentLoaded", () => {
    // dom elements
    const tutorialBtns = document.querySelectorAll('.tutorial');
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const closeTutorialBtn = document.getElementById('close-tutorial-icon');
    const hsBtns = document.querySelectorAll('.trophy-icon');
    const hsOverlay = document.getElementById('hs-overlay');
    const closeHsBtn = document.getElementById('close-hs-icon');
    const startBtn = document.getElementById('start');
    const startOverBtn = document.getElementById('start-over');
    const homepage = document.getElementById('home-container');
    const game = document.getElementById('game-container');
    const input = document.getElementById('username');
    const exitBtn = document.getElementById('exit');
    const warningOverlay = document.getElementById('warning-overlay');
    const warningPopup = document.getElementById('warning-popup');
    const noBtn = document.getElementById('no');
    const yesBtn = document.getElementById('yes');
    const gameOverPage = document.getElementById('game-over-container');
    const finalScoreSpan = document.getElementById('final-score');
    const finalUser = document.getElementById('player-username');
    const countdownDiv = document.getElementById('countdown');
    const infoContainer = document.getElementById('info-container');
    const scoreSpan = document.getElementById('score');
    const livesSpan = document.getElementById('lives');
    const nextLifeSpan = document.getElementById('next-life');

    // touchscreen controls
    const arrowUp = document.getElementById('arrow-up');
    const arrowDown = document.getElementById('arrow-down');
    const arrowLeft = document.getElementById('arrow-left');
    const arrowRight = document.getElementById('arrow-right');
    const rotateLeftBtn = document.getElementById('rotate-left');
    const rotateRightBtn = document.getElementById('rotate-right');
    const attackBtn = document.getElementById('attack');

    // press and release for touchscreen controls
    function bindHold(btn, onPress, onRelease) {
        // start touch
        btn.addEventListener("touchstart", e => {
            e.preventDefault(); // prevent scrolling and zoom
            onPress();
        })

        // release touch
        btn.addEventListener("touchend", e => {
            e.preventDefault();
            onRelease();
        })

        // add mouse fallback to make touch buttons usable on pc too
        btn.addEventListener("mousedown", onPress);
        btn.addEventListener("mouseup", onRelease);
        btn.addEventListener("mouseleave", onRelease);
    }

    // create the bindings for touchscreen controls
    // movement
    bindHold(arrowUp, () => user.up = true, () => user.up = false);
    bindHold(arrowLeft, () => user.left = true, () => user.left = false);
    bindHold(arrowRight, () => user.right = true, () => user.right = false);
    bindHold(arrowDown, () => user.down = true, () => user.down = false);

    // rotation
    bindHold(rotateLeftBtn, () => user.rotateLeft = true, () => user.rotateLeft = false);
    bindHold(rotateRightBtn, () => user.rotateRight = true, () => user.rotateRight = false);

    // attack
    attackBtn.addEventListener("touchstart", e => {
        e.preventDefault();
        shoot();
    })

    // add mouse fallback for shooting too
    attackBtn.addEventListener("mousedown", shoot);

    // game stats
    let asteroids = [];
    let rockets = [];
    let nextLifePts = 4000; // every 4000 points mean an extra life
    let nextLifeThreshold = nextLifePts; // next score the player must hit to get a life
    let lives = 3;
    let maxRockets = 3;
    let gameOver = false;
    let username = "";
    let score = 0;
    let gamePaused = false;
    let interval = null;
    const maxAsteroids = 15; // avoid spawning too many asteroids for balanced gameplay
    let gameActive = false;
    let spawnInterval = null;


    // create animated stars homepage background
    // stars canvas
    const bg = document.getElementById('bg');
    // get context
    const sctx = bg.getContext("2d");

    // set canvas size
    function resize() {
        bg.width = window.innerWidth;
        bg.height = window.innerHeight;
    }

    resize();

    // glow effect
    sctx.shadowBlur = 10;
    sctx.shadowColor = "white";

    // create animation on canvas
    // set max stars to avoid drawing too many stars
    function animateStars(maxStars = 1) {
        for (let i = 0; i < maxStars; i++) {
            // set random position and size for the stars
            let x = Math.random() * bg.width;
            let y = Math.random() * bg.height;
            let r = Math.random() * 2.5;

            // draw the white stars
            sctx.beginPath();
            sctx.fillStyle = "white";
            sctx.arc(x, y, r, 0, Math.PI * 2);
            sctx.fill();
        }

        setTimeout(animateStars, 100);
    }

    animateStars();

    // on click event listeners for buttons
    tutorialBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // show tutorial pop-up and black tint
            tutorialOverlay.style.display = 'flex';
        });
    });

    closeTutorialBtn.addEventListener('click', () => {
        // hide tutorial pop-up and black tint
        tutorialOverlay.style.display = 'none';
    });

    hsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            renderHighScores();
            
            // show hs pop-up and black tint
            hsOverlay.style.display = 'flex';
        });
    });

    closeHsBtn.addEventListener('click', () => {
        // hide hs pop-up and black tint
        hsOverlay.style.display = 'none';
    });

    startBtn.addEventListener('click', () => {
        username = input.value.trim() || "Player"; // default name if left empty

        homepage.style.display = 'none';
        hsBtns.forEach(btn => btn.style.display = 'none');
        game.style.display = 'flex';
        gameOverPage.style.display = 'none';
        bg.style.visibility = 'hidden';

        // initialize game state on start
        initGame();

        // only start game when clicking on start button
        gameActive = true;

        // reset timestamp
        lastTime = performance.now();

        // use smooth movement
        requestAnimationFrame(gameLoop);

        // spawn asteroids every three seconds
        spawnInterval = setInterval(() => {
            if (!gameOver && gameActive) spawnAsteroid();
        }, 3000);
    });

    // restart game state when clicking on start over
    startOverBtn.addEventListener('click', () => {
        // reset interval
        if (spawnInterval) {
            clearInterval(spawnInterval);
            spawnInterval = null;
        }

        // reset state
        initGame();
        gameOver = false;
        gamePaused = false;
        gameActive = true;

        // reset timestamp
        lastTime = performance.now();

        // restart game loop
        requestAnimationFrame(gameLoop);

        // spawn asteroids every three seconds
        spawnInterval = setInterval(() => {
            if (!gameOver && gameActive) spawnAsteroid();
        }, 3000);

        // style
        game.style.display = 'flex';
        gameOverPage.style.display = 'none';
        bg.style.visibility = 'hidden';
        hsBtns.forEach(btn => btn.style.display = 'none');
    })

    exitBtn.addEventListener('click', () => {
        // pause game
        gamePaused = true;

        // make elements visible
        warningOverlay.style.display = 'flex';
        warningPopup.style.display = 'flex';

        // clear interval if it exists
        if (interval) clearInterval(interval);
        // reset interval
        interval = null;

        // reset countdown text
        countdownDiv.textContent = '';
    });

    noBtn.addEventListener('click', () => {
        // pause the game
        gamePaused = true;

        // show overlay only
        warningOverlay.style.display = 'flex';
        warningPopup.style.display = 'none';

        // reset countdown
        let countdown = 3;
        countdownDiv.textContent = countdown;

        interval = setInterval(() => {
            countdown--;
            countdownDiv.textContent = countdown;

            if (countdown <= 0) {
                clearInterval(interval);
                warningOverlay.style.display = 'none';
                // unpause game
                gamePaused = false;
                countdownDiv.textContent = '';
            }
        }, 1000);
    });

    yesBtn.addEventListener('click', () => {
        finalScoreSpan.textContent = score;
        finalUser.textContent = username;
        addHighScore(username, score);

        // clear old content/go back to default
        infoContainer.innerHTML = `<p><span id="player-username">${username}</span>, you earned <span id="final-score">${score}</span> points!</p>`;

        // get highscores
        const scores = loadHighScores();

        // define index to use to search through highscores
        const index = scores.findIndex(hs => hs.player === username && hs.score === score);

        // inform player if in score is in top five
        if (index != -1) {
            infoContainer.innerHTML += `<p id="hs-place-p">You are #${index + 1} in Top Scores.</p>`;
        }

        gameOverPage.style.display = 'flex';
        warningOverlay.style.display = 'none';
        game.style.display = 'none';
        hsBtns[1].style.display = 'flex';
        bg.style.visibility = "visible";
    });

    // highscores
    // store top 5 high scores (fake data)
    let highScores = [ { player: "Norre", score: 8000 }, { player: "Pink_", score: 6000 }, { player: "HeavenAndBack", score: 4400 }, { player: "Lexy", score: 2200 }, { player: "Jinx", score: 2000 }];

    // run once at startup to populate highscore pop-up
    if (!localStorage.getItem("highScores")) {
        saveHighScores(highScores);
    }

    // save high scores using web storage api
    function saveHighScores(highScores) {
        localStorage.setItem("highScores", JSON.stringify(highScores));
    }

    // load high scores using web storage api
    function loadHighScores() {
        const scores = localStorage.getItem("highScores");
        return scores ? JSON.parse(scores) : []; 
    }

    // add high scores
    function addHighScore(player, score) {
        let highScores = loadHighScores();

        // add new score
        highScores.push({ player, score });

        // sort descending by score
        highScores.sort((player1, player2) => player2.score - player1.score);

        // keep only top five
        highScores = highScores.slice(0, 5);

        // save new top five in local storage
        saveHighScores(highScores); 
    }

    function renderHighScores() {
        // get highscore container
        const hsContainer = document.getElementById('hs-cards-container');

        // get highscores
        const highScores = loadHighScores();

        // clean old content
        hsContainer.innerHTML = "";
        
        // render each highscore
        highScores.forEach(hs => {
            hsContainer.innerHTML += `<div class="hs-card">
                                        <div class="hs-place-user">
                                            <p class="hs-place">${highScores.indexOf(hs) + 1}</p>
                                            <p class="hs-user">${hs.player}</p>
                                        </div>
                                        <p class="hs-score">${hs.score}</p>
                                    </div>`;
        })
    }

    // game canvas
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    // resize canvas whenever the window changes
    function resizeGameCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", () => {
        resizeGameCanvas();
    })
    
    resizeGameCanvas();

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
            color: "#FF0000",
            r: 18
        },
        2: {
            color: "#FF9100",
            r: 26
        },
        3: {
            color: "#FFEF0D",
            r: 36
        },
        4: {
            color: "#FF00FF",
            r: 46
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
                this.x = canvas.width + limit;
            }

            // right side
            if (this.x > canvas.width + limit) {
                this.x = -limit;
            }

            // top side
            if (this.y < -limit) {
                this.y = canvas.height + limit;
            }

            // bottom side
            if (this.y > canvas.height + limit) {
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
            // introduce life in seconds
            this.life = 3.0;
            this.r = 4; // radius
        }

        // movement based on delta time
        update(dt) {
            // new x = old x + speed * time
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            // update life
            this.life -= dt;
        }

        // draw rocket
        draw(ctx) {
            // save before translate/rotate
            ctx.save();

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
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(-10, -4, 14, 8);

            // restore
            ctx.restore();
        }
    }

    // draw ship on canvas
    function drawShip() {
        // save before translate/rotate
        ctx.save();

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

        // restore
        ctx.restore();
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

    // shoot rockets
    function shoot() {
        // assure we cannot have more than three rockets
        if (rockets.length >= maxRockets) return;

        // create three rockets centered on ship angle fired in a small spread
        const baseAngle = ship.angle;
        const spread = 0.16; // radians

        // recreate final angles
        const angles = [baseAngle, baseAngle - spread, baseAngle + spread];

        for (const angle of angles) {
            // assure we cannot have more than three rockets
            if (rockets.length >= maxRockets) break;

            // move from center of ship to shoot
            // cos: how far to move on the x axis
            // sin: how far to move on the y axis
            // to move by length, multiply by length (in this case half of ship height)
            const sx = ship.x + Math.cos(angle) * (ship.h / 2);
            const sy = ship.y + Math.sin(angle) * (ship.h / 2);
            
            // create new rocket
            rockets.push(new Rocket(sx, sy, angle));
        }
    }

    // spawn random asteroids
    function spawnAsteroid() {
        // do not go over max number
        if (asteroids.length >= maxAsteroids) return;

        // choose side of screen to spawn from
        // 0: top, 1: right, 2: bottom, 3: left
        const side = Math.floor(rand(0, 4));

        // spawn outside the screen so it slides in naturally
        const margin = 30;

        // store horizontal/vertical position
        let x, y;

        // spawn on side
        switch (side) {
            case 0:
                // spawn randomly on x axis
                x = rand(0, canvas.width);
                y = -margin;
                break;
            case 1:
                x = canvas.width + margin;
                // spawn randomly on y axis
                y = rand(0, canvas.height);
                break;
            case 2:
                 // spawn randomly on x axis
                x = rand(0, canvas.width);
                y = canvas.height + margin;
                break;
            case 3:
                x = -margin;
                // spawn randomly on y axis
                y = rand(0, canvas.height);
                break;
        }

        // pick a random direction for asteroid to go to but avoid edges
        const aimX = rand(0.2 * canvas.width, 0.8 * canvas.width);
        const aimY = rand(0.2 * canvas.height, 0.8 * canvas.height);

        // calculate the angle the asteroid has to follow
        // aimX - x = how far to move on x axis to reach target point
        // aimY - y = how far to move on y axis to reach target point
        const angle = Math.atan2(aimY - y, aimX - x);

        // pick a random speed in px/second to make the game feel less predictable
        const speed = rand(30, 110);

        // pick health (1-4)
        const health = Math.floor(rand(1, 5));

        // convert angle and speed into velocity
        // vx = how fast it moves left/right
        // vy = how fast it  moves up/down
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        // create asteroid
        asteroids.push(new Asteroid(x, y, vx, vy, health));
    }

    // initialize game
    function initGame() {
        asteroids = [];
        rockets = [];
        score = 0;
        lives = 3;
        nextLifeThreshold = nextLifePts;  // reset threshold
        // spawn five asteroids
        for (let i = 0; i < 5; i++) {
            spawnAsteroid();
        }
        // place ship in page center
        ship.x = canvas.width / 2;
        ship.y = canvas.height / 2;

        // update ui
        updateGameStatsUI();
    }

    // rocket/asteroid interactions
    // handle case of rocket hitting asteroid
    function rocketHitsAst(rocket, ast) {
        // calculate distance between center of rocket and center of asteroid
        const distance = dist(rocket.x, rocket.y, ast.x, ast.y);
        // since they are both circles, compare distance to the sum of their radiuses
        // if the sum is greater, collision exists because circles overlap
        return distance < rocket.r + ast.r;
    }

    // solve bug: rockets show up only the first time x is pressed
    function updateRockets(dt) {
        rockets.forEach(rocket => {
            rocket.update(dt);

            // remove if off-screen or life has expired
            if (rocket.life <= 0 || rocket.x < -30 || rocket.x > canvas.width + 30 ||
                rocket.y < -30 || rocket.y > canvas.height + 30) {
                rockets.splice(rockets.indexOf(rocket), 1);
            }

            // check collisions with asteroids
            asteroids.forEach(asteroid => {
                if (rocketHitsAst(rocket, asteroid)) {
                    // reduce asteroid health
                    asteroid.health = Math.max(0, asteroid.health - 1);

                    // destroy rocket
                    rockets.splice(rockets.indexOf(rocket), 1);

                    // if asteroid destroyed, give player score and life
                    if (asteroid.health <= 0) {
                        score += 200;
                        updateGameStatsUI();
                        while (score >= nextLifeThreshold) {
                            lives += 1;
                            nextLifeThreshold += nextLifePts;
                            updateGameStatsUI();
                        }

                        // remove asteroid
                        asteroids.splice(asteroids.indexOf(asteroid), 1);

                        // spawn new asteroid
                        spawnAsteroid();
                    }
                }
            })
        })
    }

    // handle case of ship hitting asteroid
    function shipHitsAst(ast) {
        // ship is not a circle, so approx radius to understand how big the ship is
        const shipR = Math.max(ship.w, ship.h);

        // calculate distance between ship and asteroid
        const distance = dist(ship.x, ship.y, ast.x, ast.y);

        // subtract a number from sum to get collision right (ship radius is not accurate enough by itself, collision happens too early)
        return distance < shipR + ast.r - 9;
    }

    // reset after ship/asteroid collision
    function resetAfterCollision() {
        // update lives
        lives -= 1;
        updateGameStatsUI();

        // if no more lives...
        if (lives <= 0) {
            gameOver = true;
            gameActive = false;
            game.style.display = 'none';
            gameOverPage.style.display = 'flex';
            hsBtns.forEach(btn => btn.style.display = 'flex');
            bg.style.visibility = 'visible';
            // final stats and username
            finalScoreSpan.textContent = score;
            finalUser.textContent = username;
            addHighScore(username, score);

            // clear interval
            if (spawnInterval) {
                clearInterval(spawnInterval);
                spawnInterval = null;
            }
        }

        // reset ship to center of page
        ship.x = canvas.width / 2;
        ship.y = canvas.height / 2;

        // reset angle and rockets
        ship.angle = 0;
        rockets = [];

        // respawn asteroids
        asteroids = [];
        for (let i = 0; i < 5; i++) {
            spawnAsteroid();
        }
    }

    // handle asteroid/asteroid collision
    function astHitsAst() {
        for (let i = 0; i < asteroids.length; i++) {
            for (let j = i + 1; j < asteroids.length; j++) {
                const ast1 = asteroids[i];
                const ast2 = asteroids[j];

                // calculate distance between the two asteroids
                const distance = dist(ast1.x, ast1.y, ast2.x, ast2.y);

                // calculate sum of their radiuses
                const minD = ast1.r + ast2.r;

                // if circles overlap, collision occures
                if (distance < minD && distance > 0) {
                    // normalize vector
                    const nx = (ast2.x - ast1.x) / distance;
                    const ny = (ast2.y - ast1.y) / distance;

                    // difference in how fast they are moving into each other
                    // how fast 1 is moving into 2 - how fast 2 is moving into 1 along the collision direction
                    const p = ast1.vx * nx + ast1.vy * ny - ast2.vx * nx - ast2.vy * ny;

                    // when they collide, 1 bounces back => loses velocity in the collision direction
                    ast1.vx -= p * nx;
                    ast1.vy -= p * ny;
                
                    // when they collide, 2 gains velocity
                    ast2.vx += p * nx;
                    ast2.vy += p * ny;

                    // calculate overlap
                    const overlap = (minD - distance) / 2;

                    // 1 loses, 2 gains
                    ast1.x -= nx * overlap;
                    ast2.y -= ny * overlap;

                    ast2.x += nx * overlap;
                    ast2.y += ny * overlap;
                }
            }
        }
    }

    // update game stats
    function updateGameStatsUI() {
        scoreSpan.textContent = score;
        livesSpan.textContent = lives;
        const ptsLeft = nextLifeThreshold - score;
        nextLifeSpan.textContent = ptsLeft;
    }

    // main update loop
    function update(dt) {
        if (gameOver) return;

        // update asteroids
        asteroids.forEach(asteroid => asteroid.update(dt));

        // if asteroids collide...
        astHitsAst();

        // update rockets and handle rocket/asteroid collisions
        updateRockets(dt);

        // update ship
        updateShip(dt);

        // if ship collides with asteroid...
        asteroids.forEach(asteroid => {
            if (shipHitsAst(asteroid)) {
                resetAfterCollision();
            }
        })
    }

    // store timestamp of previous frame
    let lastTime = 0;

    // game loop
    function gameLoop(timestamp) {
        if (!gameActive || gameOver) return; // stop game

        // use delta time
        if (!gamePaused) {
            const dt = (timestamp - lastTime) / 1000; // px/second
            lastTime = timestamp;

            // clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // update movement for ship, rockets, and asteroids
            update(dt);

            // draw ship, rockets, and asteroids
            drawShip();
            rockets.forEach(rocket => rocket.draw(ctx));
            asteroids.forEach(asteroid => asteroid.draw(ctx));
        }
        else {
            lastTime = timestamp; // pause game
        }

        // continue game loop for each new frame
        requestAnimationFrame(gameLoop);
    }

    // start game loop
    requestAnimationFrame(gameLoop);
})