class Sound {
    constructor() {
        this.prefix = "bounceAudio";
        this.lastBounceTime = 0;
        this.bounceCooldown = 0.1; // seconds
    }

    playBounceSound(vel) {
        const currentTime = performance.now() / 1000;

        if (currentTime-this.lastBounceTime<this.bounceCooldown) {
            return;
        }

        this.lastBounceTime = currentTime;

        const randomNum = Math.floor(Math.random()*3)+1;
        const bounceAudio = document.getElementById(
            this.prefix+randomNum
        );

        bounceAudio.pause();
        bounceAudio.currentTime = 0;
        bounceAudio.volume = Math.min(1, vel/100);
        bounceAudio.play();
    }
}

export default Sound;