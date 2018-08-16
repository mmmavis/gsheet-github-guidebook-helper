import GoogleSpreadsheet from 'google-spreadsheet';
import habitat from 'habitat';

habitat.load(`.env`);
habitat.load(`defaults.env`);

const GOOGLE_API_CLIENT_EMAIL = habitat.get(`GOOGLE_API_CLIENT_EMAIL`);
const GOOGLE_API_PRIVATE_KEY = habitat.get(`GOOGLE_API_PRIVATE_KEY`);
const CLONE_GOOGLE_SPREADSHEET_ID = habitat.get(`CLONE_GOOGLE_SPREADSHEET_ID`);

export default function(sharedKeyInfo, metaToAdd = {}, callback) {
  // sharedKeyInfo = { name: name of the shared key, values: array of values }

  var sheet = new GoogleSpreadsheet(CLONE_GOOGLE_SPREADSHEET_ID);

  // line breaks are essential for the private key.
  // if reading this private key from env var this extra replace step is a MUST
  sheet.useServiceAccountAuth({
    "client_email": GOOGLE_API_CLIENT_EMAIL,
    "private_key": GOOGLE_API_PRIVATE_KEY.replace(/\\n/g, `\n`)
  }, (err) => {
    if (err) {
      console.log(`[Error] ${err}`);
      callback(err);
    }

    // GoogleSpreadsheet.getRows(worksheet_id, callback)
    // worksheet_id - the index of the sheet to read from (index starts at 1)
    sheet.getRows(1, (getRowError, rows) => {
      console.log(rows.length);
      if (getRowError) {
        console.log(`[getRowError]`, getRowError);
      }

      let matchedRows = rows.filter(row => {
        return sharedKeyInfo.values.indexOf(row[sharedKeyInfo.name]) > -1;
      });

      callback(err, matchedRows);
    });
  });
}
