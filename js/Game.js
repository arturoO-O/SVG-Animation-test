import Player from "./player.js";
import Input from "./input.js";

const fps = 60;
const Game = {
    running: false,

    lastTickTime: 0,
    maxDt: 1/fps,

    gravity: 9.81,

    input: new Input(),
    player: new Player(),

    start() {
        this.running = true;
        this.lastTickTime = performance.now();

        requestAnimationFrame(() => this.loop());
    },

    stop() {
        this.running = false;
    },

    loop() {
        if (!this.running) {
            return;
        }

        const currentTime = performance.now();

        const dt = Math.min(((currentTime-this.lastTickTime)/1000), this.maxDt)

        this.lastTickTime = currentTime;

        this.update(dt);
        this.render();

        requestAnimationFrame(() => this.loop());
    },

    update(dt) {
        this.player.update(dt, this.input, this.gravity);
    },

    render() {
        this.player.render();
    }
};

export default Game;