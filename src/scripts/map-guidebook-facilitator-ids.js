import GoogleSpreadsheet from 'google-spreadsheet';
import habitat from 'habitat';

habitat.load(`.env`);
habitat.load(`defaults.env`);

const GOOGLE_API_CLIENT_EMAIL = habitat.get(`GOOGLE_API_CLIENT_EMAIL`);
const GOOGLE_API_PRIVATE_KEY = habitat.get(`GOOGLE_API_PRIVATE_KEY`);
const CLONE_GOOGLE_SPREADSHEET_ID = habitat.get(`CLONE_GOOGLE_SPREADSHEET_ID`);

function getGuidebookFacilitators(googleSheet, callback) {
  // GoogleSpreadsheet.getRows(worksheet_id, callback)
  // worksheet_id - the index of the sheet to read from (index starts at 1)
  let sheetNum = ``; // remember to update this number
  
  googleSheet.getRows(sheetNum, (getRowError, rows) => {
    callback(getRowError, rows);
  });
}

function getSessionsFromMasterSheet(googleSheet, callback) {
  // GoogleSpreadsheet.getRows(worksheet_id, callback)
  // worksheet_id - the index of the sheet to read from (index starts at 1)
  let sheetNum = ``; // remember to update this number

  googleSheet.getRows(sheetNum, (getRowError, rows) => {
    callback(getRowError, rows);
  });
}

export default function(callback) {
  let googleSheet = new GoogleSpreadsheet(CLONE_GOOGLE_SPREADSHEET_ID);

  // line breaks are essential for the private key.
  // if reading this private key from env var this extra replace step is a MUST
  googleSheet.useServiceAccountAuth({
    "client_email": GOOGLE_API_CLIENT_EMAIL,
    "private_key": GOOGLE_API_PRIVATE_KEY.replace(/\\n/g, `\n`)
  }, (err) => {
    if (err) {
      console.log(`[Error] ${err}`);
      callback(err);
    }

    getGuidebookFacilitators(googleSheet, (error, guidebookFacilitators) => {
      let guidebookIdMap = {};
      guidebookFacilitators.forEach(facilitator => {
        guidebookIdMap[facilitator[`name`].trim()] = facilitator.itemidoptional;
      });

      getSessionsFromMasterSheet(googleSheet, (error, masterSheetRows) => {
        masterSheetRows.forEach((row, i) => {
          let facilitatorFullName = row.fullname.trim();
          row.guidebookfacilitatorid = guidebookIdMap[facilitatorFullName];
          row.save();

          if (i === masterSheetRows.length-1) {
            callback();
          }
        });
      });
    });
  });
};

