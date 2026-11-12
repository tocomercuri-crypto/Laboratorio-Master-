// ============================================================
// Google Apps Script - API do Laboratório Diesel
// Cole este código em: Extensões > Apps Script na planilha
// Depois: Implantar > Nova implantação > App da Web
//   - Executar como: Eu
//   - Quem tem acesso: Qualquer pessoa
// Copie a URL gerada e cole no app.
// ============================================================

const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const params = e.parameter;
    const action = params.action;
    let postData = {};

    if (e.postData) {
      postData = JSON.parse(e.postData.contents);
    }

    let result;

    switch(action) {
      case 'getAll':
        result = getAllData(params.sheet);
        break;
      case 'add':
        result = addRow(params.sheet, postData);
        break;
      case 'update':
        result = updateRow(params.sheet, postData);
        break;
      case 'delete':
        result = deleteRow(params.sheet, params.id);
        break;
      case 'deleteByOS':
        result = deleteByField(params.sheet, 'OSID', params.osId);
        break;
      case 'addVenda':
        result = addVendaCompleta(postData);
        break;
      case 'nextNum':
        result = getNextNum(params.sheet);
        break;
      default:
        result = { error: 'Ação desconhecida: ' + action };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== FUNÇÕES DE DADOS =====

function getAllData(sheetName) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    rows.push(obj);
  }
  return rows;
}

function addRow(sheetName, rowData) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  if (!sheet) return { error: 'Aba não encontrada' };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(h => rowData[h] !== undefined ? rowData[h] : '');
  sheet.appendRow(newRow);

  return { success: true, id: rowData.ID };
}

function updateRow(sheetName, rowData) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  if (!sheet) return { error: 'Aba não encontrada' };

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('ID');
  if (idCol === -1) return { error: 'Coluna ID não encontrada' };

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(rowData.ID)) {
      const updatedRow = headers.map(h => rowData[h] !== undefined ? rowData[h] : data[i][headers.indexOf(h)]);
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([updatedRow]);
      return { success: true };
    }
  }
  return { error: 'ID não encontrado' };
}

function deleteRow(sheetName, id) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  if (!sheet) return { error: 'Aba não encontrada' };

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('ID');

  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'ID não encontrado' };
}

function deleteByField(sheetName, fieldName, fieldValue) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  if (!sheet) return { success: true };

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true };

  const headers = data[0];
  const col = headers.indexOf(fieldName);
  if (col === -1) return { success: true };

  let deleted = 0;
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][col]) === String(fieldValue)) {
      sheet.deleteRow(i + 1);
      deleted++;
    }
  }
  return { success: true, deleted: deleted };
}

function addVendaCompleta(postData) {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // Adiciona venda
  const vendasSheet = ss.getSheetByName('Vendas');
  const vHeaders = vendasSheet.getRange(1, 1, 1, vendasSheet.getLastColumn()).getValues()[0];
  const vRow = vHeaders.map(h => postData.venda[h] !== undefined ? postData.venda[h] : '');
  vendasSheet.appendRow(vRow);

  // Adiciona itens
  const itensSheet = ss.getSheetByName('ItensVenda');
  const iHeaders = itensSheet.getRange(1, 1, 1, itensSheet.getLastColumn()).getValues()[0];
  postData.itens.forEach(item => {
    const iRow = iHeaders.map(h => item[h] !== undefined ? item[h] : '');
    itensSheet.appendRow(iRow);
  });

  // Baixa no estoque
  const estSheet = ss.getSheetByName('Estoque');
  const estData = estSheet.getDataRange().getValues();
  const estHeaders = estData[0];
  const idCol = estHeaders.indexOf('ID');
  const qtdCol = estHeaders.indexOf('Quantidade');

  postData.itens.forEach(item => {
    for (let i = 1; i < estData.length; i++) {
      if (String(estData[i][idCol]) === String(item.ItemID)) {
        const newQtd = Math.max(0, Number(estData[i][qtdCol]) - Number(item.Qtd));
        estSheet.getRange(i + 1, qtdCol + 1).setValue(newQtd);
        estData[i][qtdCol] = newQtd;
        break;
      }
    }
  });

  return { success: true, vendaId: postData.venda.ID };
}

function getNextNum(sheetName) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  if (!sheet) return { num: 1 };

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const numCol = headers.indexOf('Num');
  if (numCol === -1) return { num: 1 };

  let max = 0;
  for (let i = 1; i < data.length; i++) {
    const n = Number(data[i][numCol]);
    if (n > max) max = n;
  }
  return { num: max + 1 };
}
