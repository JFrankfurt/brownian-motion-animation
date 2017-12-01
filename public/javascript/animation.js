const background = "#344361";
const lifespan = 10000;

let space = new SVGSpace("pt", ready).setup({bgcolor: background});
let form = new SVGForm(space);

let maxCount = Math.round((space.size.x * (space.size.y / 4)) / 32500);
let lastAdded = 0;

// (0) => 0; (0.25) => 0.5; (0.5) => 1; (0.75) => 0.46; (1) => 0... https://goo.gl/SFNWE3
const lifespanFade = (x) => -1 * (Math.cos(x / (0.5 * Math.PI) * 10) * 0.5 + 0.5) + 1;
const randomPoint = (space = {x: 0, y: 0, z: 0}) => {
    return {
        x: Math.random() * space.x,
        y: Math.random() * space.y,
        z: Math.random() * space.z
    }
};
const rand = () => Math.random() - Math.random();

class DriftingDot extends Particle {
    constructor(...args) {
        super(...args);
        this.time = 0;
    }

    animate(time, frameTime, ctx) {
        form.enterScope(this);
        this.play(time, frameTime);

        this.time += Math.round(frameTime);

        let opacity = 1;
        switch (Window.PreRec.active) {
            case "p1":
                opacity = lifespanFade(this.time / lifespan);
                // dampen momentum
                if (Math.abs(this.momentum.x) + Math.abs(this.momentum.y) > 0.4) {
                    this.momentum.x *= Math.random();
                    this.momentum.y *= Math.random();
                }
                // relocation
                if (this.x > space.size.x || this.x < 0 || this.y > (space.size.y / 4) || this.y < 0) {
                    this.moveTo(randomPoint(space.size));
                    this.momentum.x *= (Math.random() - Math.random()) * 0.5;
                    this.momentum.y *= (Math.random() - Math.random()) * 0.5;
                    this.time = 0; // always re-enter with an opacity of 0.
                }
                break;
            case "p2":
                // todo: add line connections if within a certain distance

                break;
            case "p3":
                // todo: pull points to a single organized structure

                break;
            case "p4":
                // todo: pre-rec logo skeleton in dots

                break;
        }
        //draw fill and dot.
        form.stroke(false).fill(`rgba(255, 255, 255, ${opacity})`);
        form.point(this, this.radius, true);
    }

    // faster physics
    integrate(t, dt) {
        return this.integrateEuler(t, dt);
    }

    // random force application.
    forces(state, t) {
        if (Window.PreRec.active === "p1") {
            let brownian = new Vector(rand() / 200, rand() / 200);
            return {force: brownian};
        } else {
            return {force: 0};
        }
    }
}

space.add({
    animate: function (time, frameTime, ctx) {
        // add dots if too few.
        let count = Object.keys(space.items).length;
        maxCount = Math.round((space.size.x * (space.size.y / 4)) / 32500); // trust me, this is a reasonable dot ratio.
        if (count < maxCount && time - lastAdded > Math.random() * 1500 + 500) {
            let dot = new DriftingDot(randomPoint(space.size));
            dot.setRadius(Math.random() > 0.5 ? 3 : 2);
            dot.mass = 1;
            if (Window.PreRec.active === "p1") { // if on the first page give the dot an initial momentum
                dot.impulse(new Vector((Math.random() - Math.random()) / 15, (Math.random() - Math.random()) / 15));
            }
            space.add(dot);
            lastAdded = Math.round(time);
        }
    }
});

function ready(bounds, elem) {
    form.scope("item", elem);
    space.play();
}