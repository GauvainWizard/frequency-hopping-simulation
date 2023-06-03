import { Cell } from "./cell.js";
var State;
(function (State) {
    State[State["STOPPED"] = 0] = "STOPPED";
    State[State["PAUSED"] = 1] = "PAUSED";
    State[State["PLAYING"] = 2] = "PLAYING";
})(State || (State = {}));
class EventListener {
    start_button;
    play_button;
    pause_button;
    stop_button;
    trx_count_input;
    mai_count_input;
    lambda_input;
    mu_input;
    hsn_input;
    interval_input;
    simulator_table;
    state;
    cell;
    constructor() {
        this.start_button =
            document.querySelector("#start-button");
        this.play_button =
            document.querySelector("#play-button");
        this.pause_button =
            document.querySelector("#pause-button");
        this.stop_button =
            document.querySelector("#stop-button");
        this.trx_count_input =
            document.querySelector("#trx-count");
        this.mai_count_input =
            document.querySelector("#mai-count");
        this.lambda_input = document.querySelector("#lambda");
        this.mu_input = document.querySelector("#mu");
        this.hsn_input = document.querySelector("#hsn");
        this.interval_input =
            document.querySelector("#interval");
        this.simulator_table =
            document.querySelector("#simulator-table");
        this.cell = new Cell();
        this.trx_count_input.addEventListener("input", this.update_trx, false);
        // this.update_trx({ target: this.trx_count_input }); already called in set_state(State.STOPPED)
        this.mai_count_input.addEventListener("input", this.update_mai, false);
        this.update_mai({ target: this.mai_count_input });
        this.start_button.addEventListener("click", this.init, false);
        this.play_button.addEventListener("click", () => this.set_state(State.PLAYING), false);
        this.pause_button.addEventListener("click", () => this.set_state(State.PAUSED), false);
        this.stop_button.addEventListener("click", () => this.set_state(State.STOPPED), false);
        this.set_state(State.STOPPED);
    }
    set_state(state) {
        this.state = state;
        this.trx_count_input.disabled = true;
        this.mai_count_input.disabled = true;
        this.lambda_input.disabled = true;
        this.mu_input.disabled = true;
        this.hsn_input.disabled = true;
        this.interval_input.disabled = true;
        this.start_button.style.display = "none";
        this.play_button.style.display = "none";
        this.pause_button.style.display = "none";
        this.stop_button.style.display = "none";
        if (state === State.STOPPED) {
            this.start_button.style.display = "flex";
            this.trx_count_input.disabled = false;
            this.mai_count_input.disabled = false;
            this.lambda_input.disabled = false;
            this.mu_input.disabled = false;
            this.hsn_input.disabled = false;
            this.interval_input.disabled = false;
            this.cell.stop();
            this.simulator_table.innerHTML = "";
            document.querySelector(".stats").innerHTML =
                "<h3>STATS</h3>";
            document.querySelector(".logs").innerHTML =
                "<h3>LOGS</h3>";
            this.update_trx({ target: this.trx_count_input });
        }
        else if (state === State.PAUSED) {
            this.play_button.style.display = "flex";
            this.stop_button.style.display = "flex";
            this.cell.pause();
        }
        else if (state === State.PLAYING) {
            this.pause_button.style.display = "flex";
            this.stop_button.style.display = "flex";
            this.cell.simulate();
        }
    }
    init = () => {
        const trx_amount = Number(this.trx_count_input?.value);
        const mai_amount = Number(this.mai_count_input?.value);
        const hsn_value = Number(this.hsn_input?.value);
        const lambda_value = Number(this.lambda_input?.value);
        const mu_value = Number(this.mu_input?.value);
        const interval_value = Number(this.interval_input?.value);
        console.log(this.cell);
        this.cell.init(trx_amount, mai_amount, hsn_value, lambda_value, mu_value, interval_value);
        this.set_state(State.PLAYING);
    };
    update_mai = (e) => {
        if (this.simulator_table) {
            const mai_target = e.target;
            const mai_amount = Number(mai_target.value);
            const mais = document.querySelector("#mais");
            mais.innerHTML = ``;
            for (let mai = 0; mai < mai_amount; ++mai) {
                mais.innerHTML += `<li style="--mai-color:${(mai * 137.508) % 360}" value="${mai}">${mai}</li>`;
            }
        }
    };
    update_trx = (e) => {
        if (this.simulator_table) {
            const trx_target = e.target;
            const trx_amount = Number(trx_target.value);
            // Create the table
            let tableHtml = `<thead><tr id='head'><th>Frame</th></tr></thead><tbody>`;
            for (let trx = 0; trx < trx_amount; ++trx) {
                tableHtml += `<tr id='trx${trx + 1}'><th>TRX ${trx + 1}</th></tr>`;
            }
            tableHtml += "</tbody>";
            // Add the table to the DOM
            this.simulator_table.innerHTML = tableHtml;
        }
    };
}
const event_listener = new EventListener();
//# sourceMappingURL=eventlistener.js.map