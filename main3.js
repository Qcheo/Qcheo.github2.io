const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

const colors = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
  "pink"
];

const boxSize = 50; // Size of the color boxes
const gap = 10; // Gap between the boxes and the canvas edge
const colorBoxes = {
  red: { color: "white", count: 0, x: gap, y: height / 2 - boxSize / 2, width: boxSize, height: boxSize },
  blue: { color: "white", count: 0, x: width - gap - boxSize, y: height / 2 - boxSize / 2, width: boxSize, height: boxSize },
  green: { color: "white", count: 0, x: width / 2 - boxSize / 2, y: gap, width: boxSize, height: boxSize },
  yellow: { color: "red", count: 0, x: width / 2 - boxSize / 2, y: height - gap - boxSize, width: boxSize, height: boxSize },
  purple: { color: "white", count: 0, x: gap, y: gap, width: boxSize, height: boxSize },
  orange: { color: "white", count: 0, x: width - gap - boxSize, y: gap, width: boxSize, height: boxSize },
  pink: { color: "white", count: 0, x: gap, y: height - gap - boxSize, width: boxSize, height: boxSize }
};

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomColor() {
  return colors[random(0, colors.length - 1)];
}

function Ball(x, y, velX, velY, color, size) {
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.color = color;
  this.size = size;
}

Ball.prototype.draw = function () {
  ctx.beginPath();
  ctx.fillStyle = this.color;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.fill();
};

Ball.prototype.update = function () {
  this.x += this.velX;
  this.y += this.velY;

  // Bounce off the walls
  if (this.x <= 0 || this.x >= width) this.velX = -this.velX;
  if (this.y <= 0 || this.y >= height) this.velY = -this.velY;
};

Ball.prototype.collisionDetect = function (balls, colorBoxes) {
  for (const [key, box] of Object.entries(colorBoxes)) {
    if (this.color === key) {
      const left = box.x;
      const right = box.x + box.width;
      const top = box.y;
      const bottom = box.y + box.height;

      if (this.x >= left && this.x <= right && this.y >= top && this.y <= bottom) {
        box.count++; // Increment the count for the color box
        balls.splice(balls.indexOf(this), 1); // Remove the ball from the array
        return true; // Collided with a box
      }
    }
  }
  for (let i = 0; i < balls.length; i++) {
    if (this !== balls[i]) {
      const dx = this.x - balls[i].x;
      const dy = this.y - balls[i].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.size + balls[i].size) {
        if (this.velX === 0 && this.velY === 0) {
          this.velX = balls[i].velX;
          this.velY = balls[i].velY;
        } else {
          balls[i].velX = -balls[i].velX;
          balls[i].velX = -balls[i].velX;
        }
      }
    }
  }
  return false; // Did not collide with any box
};

let balls = [];

while (balls.length < 150) {
  const size = random(10, 20);
  const ball = new Ball(
    random(0 + size, width - size),
    random(0 + size, height - size),
    random(-5, 5),
    random(-5, 5),
    randomColor(),
    size
  );
  balls.push(ball);
}

function loop() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    ball.draw();
    ball.update();
    if (!ball.collisionDetect(balls, colorBoxes)) {
      // If it didn't collide with a box, check for collisions with other balls
      for (let j = i + 1; j < balls.length; j++) {
        if (balls[i] !== balls[j]) {
          const dx = balls[i].x - balls[j].x;
          const dy = balls[i].y - balls[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < balls[i].size + balls[j].size) {
            if (balls[i].velX === 0 && balls[i].velY === 0) {
              balls[i].velX = balls[j].velX;
              balls[i].velY = balls[j].velY;
            } else if (balls[j].velX === 0 && balls[j].velY === 0) {
              balls[j].velX = balls[i].velX;
              balls[j].velY = balls[i].velY;
            } else {
              balls[i].velX = -balls[i].velX;
              balls[j].velX = -balls[j].velX;
            }
          }
        }
      }
    }
  }

  drawColorBoxes();
  drawBallsCount();

  requestAnimationFrame(loop);
}

function drawColorBoxes() {
  for (const [key, box] of Object.entries(colorBoxes)) {
    ctx.fillStyle = key;
    ctx.fillRect(box.x, box.y, box.width, box.height);
    ctx.fillStyle = box.color;
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(box.count.toString(), box.x + box.width / 2, box.y + box.height / 2);
  }
}

function drawBallsCount() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(balls.length.toString(), width - gap, height - gap);
}

loop();