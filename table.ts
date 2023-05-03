class GsmSystem {
  private readonly numFrame: number;
  private readonly TRXs: TRX[];

  constructor(numTRX: number, numFrame: number, hsn: number = 0) {
    const frequencies = [0, 1, 2, 3, 4, 5, 6, 7];
    const sequence: number[] = [];

    for (let i = 0; i < 8; ++i) {
      const index = (hsn + i) % frequencies.length;
      sequence.push(frequencies.splice(index, 1)[0]);
    }

    this.TRXs = Array.from(
      { length: numTRX },
      (v, i) => new TRX(i, hsn, sequence)
    ).sort(() => Math.random() - 0.5); // Create an array of TRXs with shuffled MAIOs
    this.numFrame = numFrame;
  }

  public simulate() {
    let frame = 0;
    let simulatorTable =
      document.querySelector<HTMLTableElement>("#simulatorTable");
    if (simulatorTable) {
      const interval = setInterval(() => {
        this.TRXs.forEach((trx, index) => {
          trx.hop(frame);
          let td = document.querySelector<HTMLTableElement>(`#trx${index + 1}`);
          if (td) {
            td.innerHTML += `<td style="background-color:hsl(${
              (trx.getFrequency() * 137.508) % 360
            }, 80%, 60%)" width="20" id="trx${index + 1}_slot${frame}">${trx
              .getFrequency()
              .toString()}</td>`;
          }
        });
        ++frame;
      }, 1000);
    }
  }
}

class TRX {
  private frequency: number;
  private maio: number;
  private hsn: number;
  private sequence: number[];

  constructor(maio: number, hsn: number = 0, sequence: number[]) {
    this.frequency = maio;
    this.maio = maio;
    this.hsn = hsn;
    this.sequence = sequence;
  }

  public hop(frame) {
    this.frequency = this.sequence[(this.maio + frame) % 8];
  }

  public getFrequency() {
    return this.frequency;
  }

  public getMaio() {
    return this.maio;
  }
}

const createButton = document.querySelector<HTMLButtonElement>("#createButton");
let trxCountInput = document.querySelector<HTMLInputElement>("#trxCount");
let slotCountInput = document.querySelector<HTMLInputElement>("#slotCount");
let hsn = document.querySelector<HTMLInputElement>("#hsn");
let simulatorTable =
  document.querySelector<HTMLTableElement>("#simulatorTable");

createButton?.addEventListener("click", () => {
  if (trxCountInput && slotCountInput && simulatorTable) {
    const trxCount = Number(trxCountInput?.value);
    const slotCount = Number(slotCountInput?.value);
    const hsnValue = Number(hsn?.value);

    const gsmSystem = new GsmSystem(trxCount, slotCount, hsnValue);

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
