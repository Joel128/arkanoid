const canvas: HTMLCanvasElement = document.querySelector('canvas')!;
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
let countPoints: number = 0;

import dataJson from './data.json';
let result: { arcade_scores: { player_name: string; score: number }[] } =
    dataJson;
console.log(result);
const p = document.getElementById('List');
const p2 = document.createElement('p');
p2.style.color = 'red';
p2.style.fontWeight = 'bold';
p2.style.fontSize = '20px';
p2.style.textAlign = 'center';
p2.style.padding = '10px';
p2.innerHTML = 'Arcade Scores' + '<br/><br/>';
for(let i = 0; i < result.arcade_scores.length; i++){
    p2.innerHTML +=(i+1) + ' - ' + result.arcade_scores[i].player_name + ' - ' + result.arcade_scores[i].score + '<br/>';
}
p?.appendChild(p2);

const $sprite: HTMLImageElement = document.querySelector(
    '#sprite'
) as HTMLImageElement;
const list: HTMLImageElement = document.querySelector(
    '#List'
) as HTMLImageElement;
const $bricks: HTMLImageElement = document.querySelector(
    '#bricks'
) as HTMLImageElement;

canvas.width = 448;
canvas.height = 400;

const ballRadius: number = 3;

let x: number = canvas.width / 2;
let y: number = canvas.height - 30;

let dx: number = -3;
let dy: number = -3;

const PADDLE_SENSITIVITY: number = 8;

const paddleHeight: number = 10;
const paddleWidth: number = 50;

let paddleX: number = (canvas.width - paddleWidth) / 2;
let paddleY: number = canvas.height - paddleHeight - 10;

let rightPressed: boolean = false;
let leftPressed: boolean = false;

enum BRICK_STATUS {
    ACTIVE = 1,
    DESTROYED = 0,
}

const brickRowCount: number = 6;
const brickColumnCount: number = 13;
const brickWidth: number = 32;
const brickHeight: number = 16;
const brickPadding: number = 0;
const brickOffsetTop: number = 80;
const brickOffsetLeft: number = 16;
const bricks: {
    x: number;
    y: number;
    status: BRICK_STATUS;
    color: number;
}[][] = [];

for (let i: number = 0; i < brickColumnCount; i++) {
    bricks[i] = [];
    for (let j: number = 0; j < brickRowCount; j++) {
        const brickX: number =
            i * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY: number =
            j * (brickHeight + brickPadding) + brickOffsetTop;

        const random: number = Math.floor(Math.random() * 8);

        bricks[i][j] = {
            x: brickX,
            y: brickY,
            status: BRICK_STATUS.ACTIVE,
            color: random,
        };
    }
}
function drawBall(): void {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(): void {
    ctx.drawImage(
        $sprite,
        29,
        174,
        paddleWidth,
        paddleHeight,
        paddleX,
        paddleY,
        paddleWidth,
        paddleHeight
    );
}

function drawBricks(): void {
    for (let i: number = 0; i < brickColumnCount; i++) {
        for (let j: number = 0; j < brickRowCount; j++) {
            const currentbrick = bricks[i][j];
            if (currentbrick.status === BRICK_STATUS.ACTIVE) {
                const clipX: number = currentbrick.color * 32;
                ctx.drawImage(
                    $bricks,
                    clipX,
                    0,
                    brickWidth,
                    brickHeight,
                    currentbrick.x,
                    currentbrick.y,
                    brickWidth,
                    brickHeight
                );
            }
        }
    }
}

function drawScore(): void {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`SCORE: ${countPoints}`, 5, 50);
}

function drawUI(): void {
    ctx.fillText(`FPS: ${framesPerSec}`, 5, 30);
}

function collisionDetection(): void {
    for (let i: number = 0; i < brickColumnCount; i++) {
        for (let j: number = 0; j < brickRowCount; j++) {
            const brick = bricks[i][j];
            if (brick.status === BRICK_STATUS.DESTROYED) continue;
            const isBallSameXAsBrick: boolean =
                x > brick.x && x < brick.x + brickWidth;
            const isBallSameYAsBrick: boolean =
                y > brick.y && y < brick.y + brickWidth;

            if (isBallSameXAsBrick && isBallSameYAsBrick) {
                dy = -dy;
                brick.status = BRICK_STATUS.DESTROYED;
                countPoints++;
            }
        }
    }
}

function ballMovement(): void {
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }

    if (y + dy < ballRadius) {
        dy = -dy;
    }

    const isBallSameXAsPaddle: boolean =
        x > paddleX && x < paddleX + paddleWidth;
    const isBallTouching: boolean = y + dy > paddleY;

    if (isBallSameXAsPaddle && isBallTouching) {
        dy = -dy;
    } else if (
        y + dy > canvas.height - ballRadius ||
        y + dy > paddleY + paddleHeight
    ) {
        document.location.reload();
    }

    x += dx;
    y += dy;
}

function paddleMovement(): void {
    const { width: canvasWidth } = canvas;
    const maxX = canvasWidth - paddleWidth;

    if (rightPressed && paddleX < maxX) {
        paddleX += PADDLE_SENSITIVITY;
    }
    if (leftPressed && paddleX > 0) {
        paddleX -= PADDLE_SENSITIVITY;
    }
}

function clearCanvas(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function initEvents(): void {
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    function keyDownHandler(e: KeyboardEvent): void {
        if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd') {
            rightPressed = true;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a') {
            leftPressed = true;
        }
    }

    function keyUpHandler(e: KeyboardEvent): void {
        if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd') {
            rightPressed = false;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a') {
            leftPressed = false;
        }
    }
}

const fps: number = 60;

let msPrev: number = window.performance.now();
let msFPSPrev: number = window.performance.now() + 1000;

const msPerFrame: number = 1000 / fps;
let fr: number = 0;
let framesPerSec: number = fps;
// Añade esto al final del archivo JavaScript

let gameOver: boolean = false;

function showSaveScoreButton() {
    const saveScoreBtn = document.getElementById('saveScoreBtn');
    const playerNameInput = document.getElementById('playerNameInput');
    if (saveScoreBtn && playerNameInput) {
        saveScoreBtn.style.display = 'block';
        playerNameInput.style.display = 'block';
    }
}

function saveScore() {
    const playerNameInput = document.getElementById('playerNameInput') as HTMLInputElement;
    if (playerNameInput.value.trim() === '') {
        alert('Please enter your name.');
        return;
    }
    const player_name = playerNameInput.value;
    const arcade_scores = [...result.arcade_scores, { player_name, score: countPoints }];
    arcade_scores.sort((a, b) => b.score - a.score); // Ordena las puntuaciones de mayor a menor
    result.arcade_scores = arcade_scores.slice(0, 10); // Limita a las 10 mejores puntuaciones
    console.log(result); // Muestra la lista actualizada en la consola
    // Aquí puedes guardar result en localStorage o enviarlo a un servidor
    // Por ejemplo: localStorage.setItem('arcadeScores', JSON.stringify(result));
}

function checkGameOver() {
    if (y + dy > canvas.height - ballRadius || y + dy > paddleY + paddleHeight) {
        gameOver = true;
        showSaveScoreButton();
    }
}


document.getElementById('saveScoreBtn')?.addEventListener('click', saveScore);

function draw(): void {
    window.requestAnimationFrame(draw);
    const msNow: number = window.performance.now();
    const msPassed: number = msNow - msPrev;

    if (msPassed < msPerFrame) return;

    const excessTime = msPassed % msPerFrame;
    msPrev = msNow - excessTime;

    fr++;

    if (msFPSPrev < msNow) {
        msFPSPrev = msNow + 1000;
        framesPerSec = fr;
        fr = 0;
    }
    if (!gameOver) {
        window.requestAnimationFrame(draw);
       // ... render code
    clearCanvas();
    // hay que dibujar los elementos
    drawScore();
    drawBall();
    drawPaddle();
    drawBricks();
    drawUI();

    // colisiones y movimientos
    collisionDetection();
    ballMovement();
    paddleMovement();
    checkGameOver();
    }

    
}

draw();
initEvents();

