function poisson(lambda) {
  let L = Math.exp(-lambda);
  let k = 0;
  let p = 1;

  do {
    k++;
    p *= Math.random();
  } while (p > L);

  return k - 1;
}

class GsmSystem {
  private readonly TRXs: TRX[];
  private readonly lambda: number;
  private readonly mu: number;

  constructor(numTRX: number, hsn: number = 0, lambda: number, mu: number) {
    this.lambda = lambda;
    this.mu = mu;
    const sequence = [0, 1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - 0.5);

    this.TRXs = Array.from(
      { length: numTRX },
      (v, i) => new TRX(i, hsn, sequence)
    ).sort(() => Math.random() - 0.5); // Create an array of TRXs and shuffle it to simulate random distribution of maio
  }

  public simulate() {
    let frame = 0;
    const interval = setInterval(() => {
      // Determine the number of communications that arrive in this frame using a Poisson distribution
      const numCommunications = poisson(this.lambda);

      for (let i = 0; i < numCommunications; i++) {
        const communicationDuration = poisson(this.mu);
        const trx = this.TRXs.find((trx) => trx.isAvailable());

        if (trx) {
          trx.communicate(communicationDuration);
        }
      }

      this.TRXs.forEach((trx, index) => {
        if (!trx.isAvailable()) {
          let td = document.querySelector<HTMLTableElement>(`#trx${index + 1}`);
          if (td) {
            td.innerHTML += `<td style="background-color:hsl(${
              (trx.getFrequency() * 137.508) % 360
            }, 80%, 60%); border-top: 2px solid black; border-bottom: 2px solid black;" width="20" id="trx${
              index + 1
            }_slot${frame}">${trx.getFrequency().toString()}</td>`;
          }
          if (trx.isFirstSlot()) {
            let td = document.querySelector<HTMLTableElement>(
              `#trx${index + 1}_slot${frame}`
            );
            if (td) {
              td.style.borderLeft = `2px solid black`;
            }
          }
          if (trx.isLastSlot()) {
            let td = document.querySelector<HTMLTableElement>(
              `#trx${index + 1}_slot${frame}`
            );
            if (td) {
              td.style.borderRight = `2px solid black`;
            }
          }
        } else {
          let td = document.querySelector<HTMLTableElement>(`#trx${index + 1}`);
          if (td) {
            td.innerHTML += `<td width="20" id="trx${
              index + 1
            }_slot${frame}"></td>`;
          }
        }
        trx.hop(frame);
      });
      ++frame;
    }, 1000);
  }
}

class TRX {
  private frequency: number;
  private communicationDuration: number;
  private communicationDurationTotal: number;
  private readonly maio: number;
  private readonly hsn: number;
  private readonly sequence: number[];

  constructor(maio: number, hsn: number = 0, sequence: number[]) {
    this.frequency = (maio + hsn) % 8;
    this.maio = maio;
    this.hsn = hsn;
    this.sequence = sequence;
    this.communicationDuration = 0;
    this.communicationDurationTotal = 0;
  }

  public hop(frame) {
    this.frequency = this.sequence[(this.maio + frame + this.hsn) % 8];
    if (this.communicationDuration > 0) {
      this.communicationDuration--;
    }
    if (this.communicationDuration === 0) {
      this.communicationDurationTotal = 0;
    }
  }

  public getFrequency() {
    return this.frequency;
  }

  public isAvailable() {
    return this.communicationDuration === 0;
  }

  public isFirstSlot() {
    return this.communicationDurationTotal === this.communicationDuration;
  }

  public isLastSlot() {
    return this.communicationDuration === 1;
  }

  public communicate(duration: number) {
    this.communicationDuration = duration;
    this.communicationDurationTotal = duration;
  }
}

const createButton = document.querySelector<HTMLButtonElement>("#createButton");
let trxCountInput = document.querySelector<HTMLInputElement>("#trxCount");
let lambda = document.querySelector<HTMLInputElement>("#lambda");
let mu = document.querySelector<HTMLInputElement>("#mu");
let hsn = document.querySelector<HTMLInputElement>("#hsn");
let simulatorTable =
  document.querySelector<HTMLTableElement>("#simulatorTable");

createButton?.addEventListener("click", () => {
  if (trxCountInput && simulatorTable && hsn && lambda && mu) {
    const trxCount = Number(trxCountInput?.value);
    const hsnValue = Number(hsn?.value);
    const lambdaValue = Number(lambda?.value);
    const muValue = Number(mu?.value);

    const gsmSystem = new GsmSystem(trxCount, hsnValue, lambdaValue, muValue);

    // Créer le tableau avec les dimensions spécifiées
    let tableHtml =
      "<thead><tr id='frameSlots'><th>Frame Slot N°</th></tr></thead><tbody>";
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
