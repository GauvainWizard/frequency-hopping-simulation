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

function focus_frame(frame) {
  const frame_element = document.querySelector<HTMLTableElement>(
    `#trx1_slot${frame}`
  )!;
  frame_element.scrollIntoView(true);
}

(window as any).focus_frame = focus_frame;

export class Cell {
  private TRXs: TRX[]; // All TRXs
  private trx_count: number; // Number of TRXs
  private lambda: number;
  private mu: number;
  private interval: number;
  private frame: number = 1;
  private simulating: boolean;
  private interferences_count: number = 0;

  constructor() {
    this.TRXs = Array.from({ length: 8 }, (v, i) => new TRX(i));
  }

  public init(
    num_trx: number,
    mai_count: number,
    hsn: number = 0,
    lambda: number,
    mu: number,
    interval: number = 500,
    frame: number = 1
  ) {
    this.stop();
    this.lambda = lambda;
    this.mu = mu;
    this.trx_count = num_trx;
    this.interval = interval;
    this.frame = frame;

    // Unique random MAIOs for each TRX
    const maios: number[] = Array.from(Array(num_trx).keys()).sort(
      () => Math.random() - 0.5
    );

    this.TRXs.slice(0, num_trx).forEach((trx, index) => {
      trx.init(mai_count, hsn);
      trx.set_maio(maios[index]);
    });

    this.simulating = false;
  }

  /**
   * Stop the simulation
   */
  public stop() {
    this.simulating = false;
    this.interferences_count = 0;
  }

  /**
   * Pause the simulation
   */
  public pause() {
    this.simulating = false;
  }

  /**
   * Simulate the GSM system
   */
  public simulate() {
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

      // Array of frequencies used in this frame
      let frequencies: number[] = Array<number>(8).fill(0);

      // For each TRXs (range 0 to num_trx - 1)
      this.TRXs.slice(0, this.trx_count).forEach((trx, index) => {
        const trx_td = document.querySelector<HTMLTableElement>(
          `#trx${index + 1}`
        );
        if (trx_td) {
          trx_td.innerHTML += `<td id="trx${index + 1}_slot${
            this.frame
          }"></td>`;
        }
        let trx_slot = document.querySelector<HTMLTableElement>(
          `#trx${index + 1}_slot${this.frame}`
        );
        // If the TRX is communicating, color the slot
        if (!trx.is_available()) {
          trx_slot.setAttribute("communication-slot", "");
          trx_slot.innerHTML = `${trx.get_frequency().toString()}`;
          trx_slot.style.setProperty(
            "--communication-color",
            `hsl(${(trx.get_frequency() * 137.508) % 360}, 80%, 60%)`
          );

          // Add the frequency to the array of frequencies used in this frame
          ++frequencies[trx.get_frequency()];

          // If it is the first or last slot of the communication, add a border
          if (trx.is_first_slot()) trx_slot.setAttribute("first-slot", "");
          if (trx.is_last_slot()) trx_slot.setAttribute("last-slot", "");
        }
        trx.hop(this.frame);
      });

      // If two or more frequencies are the same frequency, report it in the div with class "logs"
      const logs = document.querySelector<HTMLDivElement>(".logs")!;
      frequencies.forEach((frequency, index) => {
        if (frequency > 1) {
          // delete h3 if exists
          if (logs.innerHTML.includes("<h3>LOGS</h3>"))
            logs.innerHTML = logs.innerHTML.replace("<h3>LOGS</h3>", "");

          // on click focus on the frame
          logs.innerHTML =
            `<h3>LOGS</h3> <p onclick="focus_frame(${this.frame})">[Interference Frame ${this.frame}] Frequency ${index} is used ${frequency} times.</p>` +
            logs.innerHTML;
          this.interferences_count += frequency - 1;
        }
      });

      const stats = document.querySelector<HTMLDivElement>(".stats")!;
      stats.innerHTML = `<h3>STATS</h3>`;
      stats.innerHTML += `<p>Total frames: ${this.frame}</p>`;
      stats.innerHTML += `<p>Total hops: ${this.frame * this.trx_count}</p>`;
      stats.innerHTML += `<p>Total interferences : ${this.interferences_count}</p>`;
      stats.innerHTML += `<p>Interference Rate: ${(
        (this.interferences_count / (this.frame * this.trx_count)) *
        100
      ).toFixed(2)}%</p>`;

      const trx_head = document.querySelector<HTMLTableElement>("#head")!;
      trx_head.innerHTML += `<td>${this.frame}</td>`;
      ++this.frame;
    }, this.interval);
  }
}
