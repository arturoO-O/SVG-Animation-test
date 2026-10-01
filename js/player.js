import Sound from "./sound.js";
import Spring from "./spring.js";

class Player {
    constructor() {
        //reference
        this.sound = new Sound();

        //position
        this.x = 50;
        this.y = 50;
        this.r = 0;

        //movement
        this.velocity = {
            x:0,
            y:0,
            r:0,
            magnitude:0,
        };

        this.acceleration = {
            x:0,
            y:0,
            r:0,
            magnitude: 0,
        };

        this.velocityMagnitude = 0;

        //size and scale
        const width =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;

        const height =
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;
        const playerSize = 3;

        this.scale = {
            width: width,
            height: height,
            ratio: width/height,
        };

        this.size = {
            x: playerSize,
            y: playerSize*this.scale.ratio,
        };

        //physics
        this.mass = 10;
        this.frictionCoefficient = 6;
        this.maxAcceleration = 300;
        this.collisionEnergyLoss = 1.25;
        this.covertRotationalEnergy = 5;

        //springs
        this.springs = {
            xSpring: new Spring(0, 200, 2),
            ySpring: new Spring(0, 200, 2),
        };

        //faces
        this.lastFaceTime = performance.now(),
        this.faceCooldown = 0.5,

        //SVG elements of the sphere (3 total)
        this.elements = {
            base: document.getElementById("playerBase"),
            face: document.getElementById("playerFace"),
            highlight: document.getElementById("playerHighlight"),
            outline: document.getElementById("playerOutline"),
        };
    }

    updateScale() {
        const width =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;

        const height =
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;

        this.scale.width = width;
        this.scale.height = height;
        this.scale.ratio = width/height;

        this.size.y = this.size.x*this.scale.ratio;
    }

    update(dt, input, gravity) {
        this.handleInput(input);
        this.applyFriction(gravity);
        this.applyVelocity(dt);
        this.handleBoundaries();
        this.springs.xSpring.update(dt);
        this.springs.ySpring.update(dt);
        this.updateScale();
    }

    handleInput(input) {
        const right = input.isDown("ArrowRight");
        const left = input.isDown("ArrowLeft");

        const up = input.isDown("ArrowUp");
        const down = input.isDown("ArrowDown");

        //acceleration x
        if (right && !left) {
            this.acceleration.x = this.maxAcceleration;
        } else if (left && !right) {
            this.acceleration.x = -this.maxAcceleration;
        } else {
            this.acceleration.x = 0;
        }

        //acceleration y
        if (down && !up) {
            this.acceleration.y = this.maxAcceleration;
        } else if (up && !down) {
            this.acceleration.y = -this.maxAcceleration;
        } else {
            this.acceleration.y = 0;
        }
    }

    applyFriction(gravity) {
        const frictionAcceleration =
            this.frictionCoefficient * gravity;

        //x axis friction
        if (this.velocity.x > 0) {
            this.acceleration.x -= frictionAcceleration;
        } else if (this.velocity.x < 0) {
            this.acceleration.x += frictionAcceleration;
        }

        //y axis friction
        if (this.velocity.y > 0) {
            this.acceleration.y -= frictionAcceleration;
        } else if (this.velocity.y < 0) {
            this.acceleration.y += frictionAcceleration;
        }

        //WIP (friction stop) kinda buggy
        if (this.velocity.x > 0 && this.acceleration.x < 0) {
            this.velocity.x = Math.max(0, this.velocity.x);
        } else if (this.velocity.x < 0 && this.acceleration.x > 0) {
            this.velocity.x = Math.min(0, this.velocity.x);
        }

        if (this.velocity.y > 0 && this.acceleration.y < 0) {
            this.velocity.y = Math.max(0, this.velocity.y);
        } else if (this.velocity.y < 0 && this.acceleration.y > 0) {
            this.velocity.y = Math.min(0, this.velocity.y);
        }
    }

    applyVelocity(dt) {
        this.velocity.x += this.acceleration.x * dt;
        this.velocity.y += this.acceleration.y * dt;

        this.acceleration.magnitude = Math.abs((this.acceleration.y+this.acceleration.x)/2);
        this.velocity.magnitude = Math.abs((this.velocity.y+this.velocity.x)/2);

        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        this.r += this.velocity.r * dt;
    }

    handleBoundaries() {
        if (this.x >= 100-this.size.x) {
            this.x = 100-this.size.x;
            this.bounce("x");
        }

        if (this.x <= this.size.x) {
            this.x = this.size.x;
            this.bounce("x");
        }

        if (this.y >= 100-this.size.y) {
            this.y = 100-this.size.y;
            this.bounce("y");
        }

        if (this.y <= this.size.y) {
            this.y = this.size.y;
            this.bounce("y");
        }
    }

    bounce(axis) {
        if (axis === "x") {
            this.velocity.x = -this.velocity.x/this.collisionEnergyLoss;
            this.acceleration.x = -this.acceleration.x/this.collisionEnergyLoss;
            this.springs.xSpring.position = Math.min(this.velocity.x/200, this.size.x/2);
            this.springs.xSpring.target = 0;
            this.velocity.r = -this.velocity.y*this.covertRotationalEnergy;
        }

        if (axis === "y") {
            this.velocity.y = -this.velocity.y/this.collisionEnergyLoss;
            this.acceleration.y = -this.acceleration.y/this.collisionEnergyLoss;
            this.springs.ySpring.position = Math.min(this.velocity.y/200, this.size.y/2)
            this.springs.ySpring.target = 0;
            this.velocity.r = -this.velocity.x*this.covertRotationalEnergy
        }

        this.sound.playBounceSound(this.velocity.magnitude);

        if (this.velocity.magnitude >= 40) {
            const randomNum = Math.floor(Math.random()*4)+1;
            this.elements.face.setAttribute("href", "/images/faces/hitwall"+randomNum+".png");
            this.lastFaceTime = performance.now()/1000
        }
    }

    render() {
        const elements = Object.values(this.elements);
        const currentTime = performance.now()/1000;
        const rotation = this.r; //degrees

        var xSpringValue = this.springs.xSpring.position
        var ySpringValue = this.springs.ySpring.position

        var finalX = this.size.x-xSpringValue+ySpringValue;
        var finalY = this.size.y+xSpringValue-ySpringValue;

        var faceX = finalX*1.5;
        var faceY = finalY*1.5;

        var finalFaceX = (this.x-faceX/2);
        var finalFaceY = (this.y-faceY/2);

        for (const element of elements) {
            element.setAttribute("cx", `${this.x}%`);
            element.setAttribute("cy", `${this.y}%`);
            element.setAttribute("rx", `${finalX}%`);
            element.setAttribute("ry", `${finalY}%`);
            element.setAttribute("x", `${finalFaceX}%`);
            element.setAttribute("y", `${finalFaceY}%`);
            element.setAttribute("width",`${faceX}%`);
            element.setAttribute("height",`${faceY}%`);
        }

        //keep the rotation of the ball
        this.elements.face.style.transformOrigin=`${this.x}% ${this.y}%`;
        this.elements.face.style.transform=`rotate(${rotation}deg)`;

        //image face handling
        if (currentTime-this.lastFaceTime<this.faceCooldown) {
            return;
        }

        if (this.velocity.magnitude > 20) {
            this.elements.face.setAttribute("href", "/images/faces/fast.png");
        } else {
            this.elements.face.setAttribute("href", "/images/faces/normal.png");
        }
    }
}

export default Player;