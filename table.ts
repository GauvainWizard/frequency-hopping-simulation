const createButton = document.querySelector<HTMLButtonElement>('#createButton');
let trxCountInput = document.querySelector<HTMLInputElement>('#trxCount');
let slotCountInput = document.querySelector<HTMLInputElement>('#slotCount');
let simulatorTable = document.querySelector<HTMLTableElement>('#simulatorTable');

createButton?.addEventListener('click', () => {
    if (trxCountInput && slotCountInput && simulatorTable) {
        const trxCount = Number(trxCountInput?.value);
        const slotCount = Number(slotCountInput?.value);

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
    }
});
