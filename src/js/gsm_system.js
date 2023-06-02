import { TRX } from "./trx.js";
function poisson(lambda) {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = Math.random();
    do {
        k++;
        p *= Math.random();
    } while (p >= L);
    return k;
}
export class GsmSystem {
    TRXs; // All TRXs
    trx_count; // Number of TRXs
    lambda;
    mu;
    interval;
    frame = 1;
    simulating;
    constructor() {
        this.TRXs = Array.from({ length: 8 }, (v, i) => new TRX(i));
    }
    init(numTRX, mai_count, hsn = 0, lambda, mu, interval = 500, frame = 1) {
        this.stop();
        this.lambda = lambda;
        this.mu = mu;
        this.trx_count = numTRX;
        this.interval = interval;
        this.frame = frame;
        this.TRXs = this.TRXs.sort(() => Math.random() - 0.5); // Shuffle it to simulate random distribution of maio
        this.TRXs.forEach((trx) => {
            trx.init(mai_count, hsn);
        });
        this.simulating = false;
    }
    /**
     * Stop the simulation
     */
    stop() {
        this.simulating = false;
    }
    /**
     * Pause the simulation
     */
    pause() {
        this.simulating = false;
    }
    /**
     * Simulate the GSM system
     */
    simulate() {
        this.simulating = true;
        const interval = setInterval(() => {
            if (!this.simulating) {
                clearInterval(interval);
                return;
            }
            // Determine the number of communications that arrive in this frame using a Poisson distribution
            const num_communications = poisson(this.lambda);
            for (let i = 0; i < num_communications; i++) {
                // Find an available TRX
                const trx = this.TRXs.find((trx) => trx.is_available());
                if (trx) {
                    // Determine the duration of the communication using a Poisson distribution
                    const communication_duration = poisson(this.mu);
                    trx.communicate(communication_duration);
                }
            }
            // For each TRXs (range 0 to numTRX - 1)
            this.TRXs.slice(0, this.trx_count).forEach((trx, index) => {
                const trx_td = document.querySelector(`#trx${index + 1}`);
                if (trx_td) {
                    trx_td.innerHTML += `<td id="trx${index + 1}_slot${this.frame}"></td>`;
                }
                let trx_slot = document.querySelector(`#trx${index + 1}_slot${this.frame}`);
                // If the TRX is communicating, color the slot
                if (!trx.is_available()) {
                    trx_slot.setAttribute("communication-slot", "");
                    trx_slot.innerHTML = `${trx.get_frequency().toString()}`;
                    trx_slot.style.setProperty("--communication-color", `hsl(${(trx.get_frequency() * 137.508) % 360}, 80%, 60%)`);
                    // If it is the first or last slot of the communication, add a border
                    if (trx.is_first_slot())
                        trx_slot.setAttribute("first-slot", "");
                    if (trx.is_last_slot())
                        trx_slot.setAttribute("last-slot", "");
                }
                trx.hop(this.frame);
            });
            ++this.frame;
        }, this.interval);
    }
}
//# sourceMappingURL=gsm_system.js.map