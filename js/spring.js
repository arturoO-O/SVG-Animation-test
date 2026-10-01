class Spring {
    constructor(position = 0, stiffness = 100, damping = 5){
        this.position = position;
        this.velocity = 0;
        this.target = position
        this.stiffness = stiffness;
        this.damping = damping;
    }

    update(dt) {
        const displacement = this.target-this.position;
        const springForce = displacement*this.stiffness;
        const dampingForce = this.velocity*this.damping;
        const force = springForce-dampingForce;
        const acceleration = force;
        this.velocity += acceleration * dt;
        this.position += this.velocity * dt;
    }
}

export default Spring;