const canvas = document.querySelector("canvas");

const c = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2,
};

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  init();
});

window.addEventListener("mousemove", (event) => {
  mouse.x = event.x;
  mouse.y = event.y;
});

window.addEventListener("click", () => {
  if (canvas.style.backgroundColor === "black") {
    canvas.style.backgroundColor = "white";
  } else {
    canvas.style.backgroundColor = "black";
  }
});

const rotate = (velocity, angle) => {
  const rotatedVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
  };

  return rotatedVelocities;
};

const resolveCollision = (particle, otherParticle) => {
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
    // Grab angle between the two colliding particles
    const angle = -Math.atan2(
      otherParticle.y - particle.y,
      otherParticle.x - particle.x
    );

    // Store mass in variable for better readability in collision equation
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    // velocity before equation
    const u1 = rotate(particle.velocity, angle);
    const u2 = rotate(otherParticle.velocity, angle);

    // Velocity after 1d collision equation
    const v1 = {
      x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
      y: u1.y,
    };
    const v2 = {
      x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
      y: u2.y,
    };

    // Finally velocity after rotating axis back to original location
    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    // Swap particle velocity for realistic bounce effect
    particle.velocity.x = vFinal1.x;
    particle.velocity.y = vFinal1.y;

    otherParticle.velocity.x = vFinal2.x;
    otherParticle.velocity.y = vFinal2.y;
  }
};

class Particle {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
    };
    this.mass = 1;
    this.opacity = 0;

    this.draw = () => {
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      c.save();
      c.globalAlpha = this.opacity;
      c.fillStyle = this.color;
      c.fill();
      c.restore();
      c.strokeStyle = this.color;
      c.stroke();
      c.closePath();
    };

    this.update = (particles) => {
      for (let i = 0; i < particles.length; i++) {
        if (particles[i] === this) continue;

        if (
          getDistance(this.x, this.y, particles[i].x, particles[i].y) -
            particles[i].radius -
            radius <
          0
        ) {
          resolveCollision(this, particles[i]);
        }
      }

      if (this.x + this.radius > innerWidth || this.x - this.radius < 0) {
        this.velocity.x = -this.velocity.x;
      }

      if (this.y + this.radius > innerHeight || this.y - this.radius < 0) {
        this.velocity.y = -this.velocity.y;
      }

      if (
        getDistance(mouse.x, mouse.y, this.x, this.y) < 80 &&
        this.opacity < 0.5
      ) {
        this.opacity += 0.5;
      } else if (this.opacity > 0) {
        this.opacity -= 0.5;
        this.opacity = Math.max(0, this.opacity);
      }

      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.draw();
    };
  }
}

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getDistance = (x1, y1, x2, y2) => {
  const xDist = x2 - x1;
  const yDist = y2 - y1;
  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
};

let particles = [];
let colors = ["#B01607", "#2C2AFF", "#2C2AB0"];

const init = () => {
  particles = [];
  for (let i = 0; i < 400; i++) {
    let radius = getRandomNumber(5, 30);
    let x = getRandomNumber(radius, innerWidth - radius);
    let y = getRandomNumber(radius, innerHeight - radius);
    let dx = getRandomNumber(0, 4);
    let dy = getRandomNumber(0, 4);
    let color = colors[getRandomNumber(0, colors.length)];

    if (i !== 0) {
      for (let j = 0; j < particles.length; j++) {
        if (
          getDistance(x, y, particles[j].x, particles[j].y) -
            particles[j].radius -
            radius <
          0
        ) {
          x = getRandomNumber(radius, innerWidth - radius);
          y = getRandomNumber(radius, innerHeight - radius);

          j = -1;
        }
      }
    }

    particles.push(new Particle(x, y, radius, color));
  }
};

const animate = () => {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, innerWidth, innerHeight);

  particles.forEach((particle) => {
    particle.update(particles);
  });
};

init();
animate();
