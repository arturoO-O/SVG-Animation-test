var Game = {};

Game.Entities = {};
Game.Entities.Player = {};
Game.keys = [];

//Game properties
Game.running = false;
Game.lastTickTime = performance.now();

//Physics constant properties
Game.gravity = 9.81;
const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;   
const ratio = width/height
var plr = Game.Entities.Player

//Get SVG elements
plr.playerBase = document.getElementById("playerBase");
plr.playerHighlight = document.getElementById("playerHighlight");
plr.playerOutline = document.getElementById("playerOutline");

//Physics independent properties
plr.xPosition = 50;
plr.yPosition = 50;
plr.xVelocity = 0;
plr.yVelocity = 0;
plr.xAcceleration = 0;
plr.yAcceleration = 0;

plr.mass = 10;
plr.sphereSize = 5;
plr.xsize = 5;
plr.ysize = 10;
plr.frictionCoefficient = 6;
plr.maxAcceleration = 300;

//Define functions
Game.start = function(){
    Game.running = true;
    Game.lastTickTime = performance.now();
    requestAnimationFrame(Game.loop);
}

//Main game loop function, this will control the game logic, rendering and running state.
Game.loop = function(){
    if (!Game.running) return;

    var time = performance.now();
    var dt = (time - Game.lastTickTime) / 1000;

    Game.lastTickTime = time;
    Game.update(dt);
    Game.render();

    requestAnimationFrame(Game.loop);
}

//A function to make the ball bounce
//side: string
Game.bounce = function(side){
    var randomNum = Math.floor(Math.random() * 3) + 1;
    var bounceAudio = document.getElementById("bounceAudio"+randomNum);
    bounceAudio.pause();
    bounceAudio.currentTime = 0;
    bounceAudio.play();
    var speedMag = Math.abs((plr.yVelocity+plr.xVelocity)/2)
    bounceAudio.volume = Math.min(1, speedMag/100)

    if (side == "y") {
        plr.yVelocity = -plr.yVelocity;
        plr.yAcceleration = -plr.yAcceleration;
    } else if (side == "x") {
        plr.xVelocity = -plr.xVelocity; 
        plr.xAcceleration = -plr.xAcceleration;
    }
}


//This will update all the values of the game, such as positions of objects.
Game.update = function(dt) {

    //Playe input
    if (Game.keys["ArrowRight"]) {
        plr.xAcceleration = plr.maxAcceleration;
    } else if (Game.keys["ArrowLeft"]) {
        plr.xAcceleration = -plr.maxAcceleration;
    } else if (Game.keys["ArrowRight"] && Game.keys["ArrowLeft"]) {
        plr.xAcceleration = 0;
    } else {
        plr.xAcceleration = 0;
    }

    if (Game.keys["ArrowUp"]) {
        plr.yAcceleration = -plr.maxAcceleration;
    } else if (Game.keys["ArrowDown"]) {
        plr.yAcceleration = plr.maxAcceleration;
    } else if (Game.keys["ArrowUp"] && Game.keys["ArrowDown"]) {
        plr.yAcceleration = 0;
    } else {
        plr.yAcceleration = 0;
    }

    //Friction acceleration
    var frictionAcceleration = plr.frictionCoefficient * Game.gravity;

    //X friction
    if (plr.xVelocity > 0) {
        plr.xAcceleration -= frictionAcceleration;
    } 
    else if (plr.xVelocity <= 0) {
        plr.xAcceleration += frictionAcceleration;
    }
    //Y friction
    if (plr.yVelocity > 0) {
        plr.yAcceleration -= frictionAcceleration;
    } 
    else if (plr.yVelocity <= 0) {
        plr.yAcceleration += frictionAcceleration;
    }

    // Prevent friction from making the player reverse direction
    if (plr.xVelocity > 0 && plr.xAcceleration < 0) {
        plr.xVelocity = Math.max(0, plr.xVelocity);
    }
    else if (plr.xVelocity < 0 && plr.xAcceleration > 0) {
        plr.xVelocity = Math.min(0, plr.xVelocity);
    }

    if (plr.yVelocity > 0 && plr.yAcceleration < 0) {
        plr.yVelocity = Math.max(0, plr.yVelocity);
    }
    else if (plr.yVelocity < 0 && plr.yAcceleration > 0) {
        plr.yVelocity = Math.min(0, plr.yVelocity);
    }

    plr.xVelocity += plr.xAcceleration * dt;
    plr.yVelocity += plr.yAcceleration * dt;

    plr.xPosition += plr.xVelocity * dt;
    plr.yPosition += plr.yVelocity * dt;

    console.log(plr.xPosition);
    console.log(plr.yPosition);

    if (plr.xPosition >= (100-plr.xsize)) {
        plr.xPosition = (100-plr.xsize);
        Game.bounce("x");
    }
    if (plr.yPosition >= (100-plr.ysize)) {
        plr.yPosition = 100-plr.ysize;
        Game.bounce("y");
    }
    if (plr.xPosition <= (plr.xsize) ) {
        plr.xPosition = plr.xsize;
        Game.bounce("x");
    }
    if (plr.yPosition <= (plr.ysize) ) {
        plr.yPosition = plr.ysize;
        Game.bounce("y");
    }
};

//This will render the game frame with all the positions and values that were updated.
Game.render = function() {
    //update x
    plr.playerBase.setAttribute("cx",plr.xPosition+"%");
    plr.playerHighlight.setAttribute("cx",plr.xPosition+"%");
    plr.playerOutline.setAttribute("cx",plr.xPosition+"%");

    //update y
    plr.playerBase.setAttribute("cy",plr.yPosition + "%");
    plr.playerHighlight.setAttribute("cy",plr.yPosition + "%");
    plr.playerOutline.setAttribute("cy",plr.yPosition + "%");

    //Update size
    plr.playerBase.setAttribute("rx",plr.xsize+"%")
    plr.playerHighlight.setAttribute("rx",plr.xsize+"%")
    plr.playerOutline.setAttribute("rx",plr.xsize+"%")
    plr.playerBase.setAttribute("ry",plr.ysize+"%")
    plr.playerHighlight.setAttribute("ry",plr.ysize+"%")
    plr.playerOutline.setAttribute("ry",plr.ysize+"%")
};

//Connect the keys
document.addEventListener("keydown", function(event) {
    Game.keys[event.key] = true;
});
document.addEventListener("keyup", function(event) {
    Game.keys[event.key] = false;
});

//Start the game
Game.start();