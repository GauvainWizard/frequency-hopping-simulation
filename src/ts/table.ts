import { TRX } from "./trx";

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

class GsmSystem {
  private readonly TRXs: TRX[];
  private readonly lambda: number;
  private readonly mu: number;

  constructor(
    numTRX: number,
    maiCount: number,
    hsn: number = 0,
    lambda: number,
    mu: number
  ) {
    this.lambda = lambda;
    this.mu = mu;

    this.TRXs = Array.from(
      { length: numTRX },
      (v, i) => new TRX(i, hsn, maiCount)
    ).sort(() => Math.random() - 0.5); // Create an array of TRXs and shuffle it to simulate random distribution of maio
  }

  public simulate() {
    let frame = 1;
    const interval = setInterval(() => {
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

      this.TRXs.forEach((trx, index) => {
        let trx_td = document.querySelector<HTMLTableElement>(
          `#trx${index + 1}`
        );
        // If the TRX is communicating, color the slot
        if (!trx.is_available()) {
          if (trx_td) {
            trx_td.innerHTML += `<td style="background-color:hsl(${
              (trx.get_frequency() * 137.508) % 360
            }, 80%, 60%); border-top: 2px solid black; border-bottom: 2px solid black;" id="trx${
              index + 1
            }_slot${frame}">${trx.get_frequency().toString()}</td>`;
          }

          let trx_slot = document.querySelector<HTMLTableElement>(
            `#trx${index + 1}_slot${frame}`
          );
          // If it is the first or last slot of the communication, add a border
          if (trx.is_first_slot() && trx_slot)
            trx_slot.style.borderLeft = `2px solid black`;
          if (trx.is_last_slot() && trx_slot)
            trx_slot.style.borderRight = `2px solid black`;
        } else {
          if (trx_td) {
            trx_td.innerHTML += `<td id="trx${index + 1}_slot${frame}"></td>`;
          }
        }
        trx.hop(frame);
      });
      ++frame;
    }, 1000);
  }
}

const createButton = document.querySelector<HTMLButtonElement>("#createButton");
let trxCountInput = document.querySelector<HTMLInputElement>("#trxCount");
let maiCountInput = document.querySelector<HTMLInputElement>("#maiCount");
let lambda = document.querySelector<HTMLInputElement>("#lambda");
let mu = document.querySelector<HTMLInputElement>("#mu");
let hsn = document.querySelector<HTMLInputElement>("#hsn");
let simulatorTable =
  document.querySelector<HTMLTableElement>("#simulatorTable");

createButton?.addEventListener("click", () => {
  if (trxCountInput && simulatorTable && hsn && lambda && mu) {
    const trxCount = Number(trxCountInput?.value);
    const maiCount = Number(maiCountInput?.value);
    const hsnValue = Number(hsn?.value);
    const lambdaValue = Number(lambda?.value);
    const muValue = Number(mu?.value);

    const gsmSystem = new GsmSystem(
      trxCount,
      maiCount,
      hsnValue,
      lambdaValue,
      muValue
    );

    // Créer le tableau avec les dimensions spécifiées
    let tableHtml = "<tbody>";
    for (let i = 0; i < trxCount; i++) {
      tableHtml += `<tr id='trx${i + 1}'><th>TRX ${i + 1}</th></tr>`;
    }
    tableHtml += "</tbody>";

    // Ajouter le tableau dans l'élément correspondant
    simulatorTable.innerHTML = tableHtml;

    // Lancer la simulation
    gsmSystem.simulate();
  }
});
