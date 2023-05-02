class GsmSystem {
    private readonly numTimeSlots: number;
    private readonly TRXs: TRX[];

    constructor(numTRX: number, numTimeSlots: number) {
        this.TRXs = [];
        this.numTimeSlots = numTimeSlots;
        // generate, for each TRX, a random MAIO that is not already in the array
        let usedMAIOs: number[] = [];
        for (let i = 0; i < numTRX; i++) {
            let randomMAIO: number;
            do {
                randomMAIO = Math.floor(Math.random() * 62); // generate random MAIO between 0 and 61 (There are 62 frequencies in GSM)
            } while (usedMAIOs.includes(randomMAIO));
            usedMAIOs.push(randomMAIO);
            this.TRXs.push(new TRX(randomMAIO));
        }
    }

    public simulate() {
        let frame = 0;
        const interval = setInterval(() => {
            const hsn = Math.floor(Math.random() * 64);
            this.TRXs.forEach((trx, index) => {
                let td = document.querySelector<HTMLTableElement>(`#trx${index + 1}_slot${frame}`);
                if (td) {
                    td.innerHTML = trx.getFrequency().toString();
                    td.style.backgroundColor = `hsl(${trx.getFrequency() * 137.508 % 360}, 80%, 60%)`;
                }
                trx.hop(hsn, this.numTimeSlots);
            });
            ++frame;
            if (frame === this.numTimeSlots) {
                clearInterval(interval);
            }
        }, 1000);
    }
}

class TRX {
    private frequency: number;
    private maio: number;

    constructor(maio: number) {
        this.frequency = maio;
        this.maio = maio;
    }

    public hop(hsn: number, numTimeSlots: number) {
        this.frequency = (this.maio + hsn) % 62;
        console.log(`TRX ${this.maio + 1} hopped to frequency ${this.frequency} (${this.maio} + ${hsn}) in time slot ${numTimeSlots}`);
    }

    public getFrequency() {
        return this.frequency;
    }

    public getMaio() {
        return this.maio;
    }
}


const createButton = document.querySelector<HTMLButtonElement>('#createButton');
let trxCountInput = document.querySelector<HTMLInputElement>('#trxCount');
let slotCountInput = document.querySelector<HTMLInputElement>('#slotCount');
let simulatorTable = document.querySelector<HTMLTableElement>('#simulatorTable');

createButton?.addEventListener('click', () => {
    if (trxCountInput && slotCountInput && simulatorTable) {
        const trxCount = Number(trxCountInput?.value);
        const slotCount = Number(slotCountInput?.value);

        const gsmSystem = new GsmSystem(trxCount, slotCount);

        // Créer le tableau avec les dimensions spécifiées
        let tableHtml = '<thead><tr><th>Time Slot N°</th>'
        for (let j = 0; j < slotCount; j++) {
            tableHtml += `<th>${j}</th>`;
        }
        tableHtml += '</tr><thead><tbody>';
        for (let i = 0; i < trxCount; i++) {
            tableHtml += `<tr><th>TRX ${i + 1}`;
            for (let j = 0; j < slotCount; j++) {
                tableHtml += `<td width="20" id="trx${i + 1}_slot${j}"></td>`;
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody>';

        // Ajouter le tableau dans l'élément correspondant
        simulatorTable.innerHTML = tableHtml;

        // Lancer la simulation
        gsmSystem.simulate();
    }
});
