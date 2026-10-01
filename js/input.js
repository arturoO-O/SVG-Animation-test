class Input {
    constructor() {
        this.keys = {};

        document.addEventListener("keydown", (event) => {
            this.keys[event.key] = true;
        });

        document.addEventListener("keyup", (event) => {
            this.keys[event.key] = false;
        });
    }

    isDown(key) {
        return this.keys[key] === true;
    }
}

export default Input;