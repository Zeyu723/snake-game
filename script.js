// 获取DOM元素
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const restartButton = document.getElementById('restart-btn');

// 游戏配置
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let speed = 7;

// 游戏状态
let gameRunning = false;
let gamePaused = false;
let score = 0;
let gameLoop;

// 蛇的初始位置和速度
let snake = [
    { x: 5, y: 5 }
];
let velocityX = 0;
let velocityY = 0;

// 食物位置
let foodX;
let foodY;

// 初始化游戏
function initGame() {
    snake = [{ x: 5, y: 5 }];
    velocityX = 0;
    velocityY = 0;
    score = 0;
    scoreElement.textContent = score;
    placeFood();
}

// 随机放置食物
function placeFood() {
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);
    
    // 确保食物不会出现在蛇身上
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === foodX && snake[i].y === foodY) {
            placeFood();
            return;
        }
    }
}

// 游戏主循环
function gameUpdate() {
    if (gamePaused) return;
    
    // 移动蛇
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
    snake.unshift(head);
    
    // 检测是否吃到食物
    if (head.x === foodX && head.y === foodY) {
        score += 10;
        scoreElement.textContent = score;
        placeFood();
        // 每得100分增加速度
        if (score % 100 === 0) {
            speed += 1;
        }
    } else {
        snake.pop();
    }
    
    // 检测碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 绘制游戏
    drawGame();
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制食物
    ctx.fillStyle = 'red';
    ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize, gridSize);
    
    // 绘制蛇
    ctx.fillStyle = 'lime';
    for (let i = 0; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
        
        // 绘制蛇身边框
        ctx.strokeStyle = 'darkgreen';
        ctx.strokeRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }
}

// 检测碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检测是否撞墙
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // 检测是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    gameRunning = false;
    alert(`游戏结束！你的得分是: ${score}`);
    startButton.disabled = false;
    pauseButton.disabled = true;
}

// 开始游戏
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        initGame();
        gameLoop = setInterval(gameUpdate, 1000 / speed);
        startButton.disabled = true;
        pauseButton.disabled = false;
    }
}

// 暂停游戏
function togglePause() {
    gamePaused = !gamePaused;
    pauseButton.textContent = gamePaused ? '继续' : '暂停';
}

// 重新开始游戏
function restartGame() {
    if (gameRunning) {
        clearInterval(gameLoop);
    }
    startGame();
}

// 键盘控制
function keyDown(e) {
    // 防止按键导致页面滚动
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
    
    // 上
    if (e.keyCode === 38 && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    }
    // 下
    else if (e.keyCode === 40 && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    }
    // 左
    else if (e.keyCode === 37 && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    }
    // 右
    else if (e.keyCode === 39 && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

// 触摸控制（针对移动设备）
let touchStartX, touchStartY;

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // 判断滑动方向
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (diffX > 0 && velocityX !== 1) {
            // 向左滑
            velocityX = -1;
            velocityY = 0;
        } else if (diffX < 0 && velocityX !== -1) {
            // 向右滑
            velocityX = 1;
            velocityY = 0;
        }
    } else {
        // 垂直滑动
        if (diffY > 0 && velocityY !== 1) {
            // 向上滑
            velocityX = 0;
            velocityY = -1;
        } else if (diffY < 0 && velocityY !== -1) {
            // 向下滑
            velocityX = 0;
            velocityY = 1;
        }
    }
    
    // 防止页面滚动
    e.preventDefault();
    
    // 重置触摸起点
    touchStartX = null;
    touchStartY = null;
}

// 事件监听
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', restartGame);
document.addEventListener('keydown', keyDown);
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);

// 初始化
pauseButton.disabled = true;
drawGame();