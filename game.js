const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const startGameBtn = document.getElementById("startGame");

canvas.width = 800;
canvas.height = 600;

const laneWidth = canvas.width / 5;
const roadStartX = (canvas.width - laneWidth * 5) / 2;

const playerImg = new Image();
playerImg.src = "images/player_car.png";

const obstacleImg = new Image();
obstacleImg.src = "images/obstacle_car.png";

const pitImg = new Image();
pitImg.src = "images/pit.png";

const player = {
    x: roadStartX + laneWidth * 2 + (laneWidth - 100) / 2,
    y: canvas.height - 120,
    width: 100,
    height: 100,
    lane: 2,
};

let obstacles = [];
let pits = [];
let obstacleSpeed = 3;
let frame = 0;
let startTime = Date.now();
let isGameRunning = false;

function showMenu() {
    menu.style.display = "flex";
    canvas.style.display = "none";
    isGameRunning = false;
}

function startGame() {
    menu.style.display = "none";
    canvas.style.display = "block";
    isGameRunning = true;
    resetGame();
    gameLoop();
}

function drawTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`Время: ${elapsedTime}с`, canvas.width - 10, 30);
}

function drawRoadLines(offset) {
    ctx.fillStyle = "#101010";
    ctx.fillRect(roadStartX, 0, laneWidth * 5, canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    for (let i = 1; i < 5; i++) {
        const x = roadStartX + i * laneWidth;
        ctx.beginPath();
        ctx.moveTo(x, -offset);
        ctx.lineTo(x, canvas.height - offset);
        ctx.stroke();
    }
}

function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function drawPits() {
    pits.forEach(pit => {
        ctx.drawImage(pitImg, pit.x, pit.y, pit.width, pit.height);
    });
}

function updateGame() {
    if (!isGameRunning) return;

    frame++;

    obstacles.forEach(obstacle => {
        obstacle.y += obstacleSpeed;
    });

    pits.forEach(pit => {
        pit.y += obstacleSpeed;
    });

    if (frame % 120 === 0) {
        const obstacleLane = Math.floor(Math.random() * 5);
        obstacles.push({
            x: roadStartX + laneWidth * obstacleLane + (laneWidth - 70) / 2,
            y: -100,
            width: 70,
            height: 100,
            lane: obstacleLane,
        });

        const occupiedLanes = obstacles.map(obstacle => obstacle.lane);
        const freeLanes = [...Array(5).keys()].filter(lane => !occupiedLanes.includes(lane));

        if (freeLanes.length > 0 && frame % 240 === 0) {
            const pitLane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
            pits.push({
                x: roadStartX + laneWidth * pitLane + (laneWidth - 100) / 2,
                y: -100,
                width: 100,
                height: 100,
            });
        }

        if (frame % 600 === 0) {
            obstacleSpeed += 0.5;
        }
    }

    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);
    pits = pits.filter(pit => pit.y < canvas.height);

    obstacles.forEach(obstacle => {
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            alert(`Игра окончена! Вы продержались ${Math.floor((Date.now() - startTime) / 1000)} секунд.`);
            showMenu();
        }
    });

    pits.forEach(pit => {
        if (
            player.x < pit.x + pit.width &&
            player.x + player.width > pit.x &&
            player.y < pit.y + pit.height &&
            player.y + player.height > pit.y
        ) {
            alert(`Игра окончена! Вы попали в яму. Вы продержались ${Math.floor((Date.now() - startTime) / 1000)} секунд.`);
            showMenu();
        }
    });
}

function resetGame() {
    player.lane = 2;
    player.x = roadStartX + laneWidth * 2 + (laneWidth - 100) / 2;
    obstacles = [];
    pits = [];
    obstacleSpeed = 3;
    frame = 0;
    startTime = Date.now();
}

function gameLoop() {
    if (!isGameRunning) return;

    const offset = (frame * obstacleSpeed) % 40;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRoadLines(offset);
    drawPlayer();
    drawObstacles();
    drawPits();
    drawTimer();
    updateGame();

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && player.lane > 0) {
        player.lane--;
        player.x = roadStartX + laneWidth * player.lane + (laneWidth - 100) / 2;
    } else if (e.key === "ArrowRight" && player.lane < 4) {
        player.lane++;
        player.x = roadStartX + laneWidth * player.lane + (laneWidth - 100) / 2;
    }
});

startGameBtn.addEventListener("click", startGame);

showMenu();
