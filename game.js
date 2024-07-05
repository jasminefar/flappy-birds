<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flappy Bird Game</title>
    <style>
        body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #70c5ce;
        }
        canvas {
            border: 1px solid #000;
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas" width="320" height="480"></canvas>
    <script>
        class Bird {
            constructor() {
                this.x = 50;
                this.y = 150;
                this.width = 20;
                this.height = 20;
                this.gravity = 0.6;
                this.lift = -15;
                this.velocity = 0;
                this.score = 0;
                this.color = "yellow";
                this.soundFlap = new Audio("flap.mp3");
                this.soundScore = new Audio("score.mp3");
                this.soundHit = new Audio("hit.mp3");
            }

            show(ctx) {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }

            update() {
                this.velocity += this.gravity;
                this.y += this.velocity;
                if (this.y > canvas.height - this.height) {
                    this.y = canvas.height - this.height;
                    this.velocity = 0;
                }
                if (this.y < 0) {
                    this.y = 0;
                    this.velocity = 0;
                }
            }

            up() {
                this.velocity += this.lift;
                this.soundFlap.play();
            }

            hits(pipe) {
                if (this.y < pipe.top || this.y + this.height > canvas.height - pipe.bottom) {
                    if (this.x + this.width > pipe.x && this.x < pipe.x + pipe.width) {
                        return true;
                    }
                }
                return false;
            }

            scorePoint() {
                this.score++;
                this.soundScore.play();
            }

            gameOver() {
                this.soundHit.play();
            }
        }

        class Pipe {
            constructor() {
                this.gap = 100;
                this.top = Math.random() * (canvas.height - this.gap);
                this.bottom = canvas.height - this.top - this.gap;
                this.x = canvas.width;
                this.width = 20;
                this.speed = 2;
                this.highlight = false;
                this.color = "green";
            }

            show(ctx) {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, 0, this.width, this.top);
                ctx.fillRect(this.x, canvas.height - this.bottom, this.width, this.bottom);
            }

            update() {
                this.x -= this.speed;
            }

            offscreen() {
                return this.x < -this.width;
            }

            highlightPipe() {
                this.highlight = true;
                this.color = "red";
            }
        }

        class Game {
            constructor() {
                this.canvas = document.getElementById("gameCanvas");
                this.ctx = this.canvas.getContext("2d");
                this.bird = new Bird();
                this.pipes = [];
                this.frameCount = 0;
                this.gameRunning = true;
                this.difficulty = 75; // Pipe spawn rate
                this.gameSpeed = 2; // Initial pipe speed
                this.scoreDisplay = document.createElement("div");
                this.scoreDisplay.style.position = "absolute";
                this.scoreDisplay.style.top = "10px";
                this.scoreDisplay.style.left = "10px";
                this.scoreDisplay.style.fontFamily = "Arial";
                this.scoreDisplay.style.fontSize = "20px";
                this.scoreDisplay.style.color = "#000";
                document.body.appendChild(this.scoreDisplay);
                this.loadSounds();
                this.generatePipes();
            }

            loadSounds() {
                this.bird.soundFlap.src = "flap.mp3";
                this.bird.soundScore.src = "score.mp3";
                this.bird.soundHit.src = "hit.mp3";
            }

            generatePipes() {
                setInterval(() => {
                    if (this.gameRunning) {
                        this.pipes.push(new Pipe());
                    }
                }, this.difficulty);
            }

            draw() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.bird.update();
                this.bird.show(this.ctx);

                for (let i = this.pipes.length - 1; i >= 0; i--) {
                    this.pipes[i].update();
                    this.pipes[i].show(this.ctx);

                    if (this.pipes[i].offscreen()) {
                        this.pipes.splice(i, 1);
                        this.bird.scorePoint();
                        this.increaseDifficulty();
                    }

                    if (this.bird.hits(this.pipes[i])) {
                        this.gameRunning = false;
                        this.pipes[i].highlightPipe();
                        this.bird.gameOver();
                    }
                }

                this.scoreDisplay.textContent = "Score: " + this.bird.score;

                if (this.gameRunning) {
                    requestAnimationFrame(() => this.draw());
                } else {
                    this.endGame();
                }
            }

            endGame() {
                this.ctx.fillStyle = "#000";
                this.ctx.font = "30px Arial";
                this.ctx.fillText("Game Over", this.canvas.width / 2 - 70, this.canvas.height / 2);
                this.ctx.fillText("Final Score: " + this.bird.score, this.canvas.width / 2 - 90, this.canvas.height / 2 + 40);
            }

            increaseDifficulty() {
                if (this.bird.score > 0 && this.bird.score % 10 === 0) {
                    this.difficulty -= 5;
                    this.gameSpeed += 0.2;
                }
            }
        }

        const game = new Game();

        window.addEventListener("keydown", (e) => {
            if (e.code === "Space") {
                game.bird.up();
            }
        });

        game.draw();
    </script>
</body>
</html>
