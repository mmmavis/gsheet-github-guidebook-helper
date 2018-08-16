import fs from 'fs';
import moment from 'moment';
import GithubApiHelper from './github-api-helper';
import exportAsJson from './export-as-json';
import exportAsCsv from './export-as-csv';
import searchGoogleSpreadsheet from './search-google-spreadsheet';
import generateMetaToAdd from './generate-meta-to-add';

import SESSION_TYPES from '../meta/session-types.js';
import LANGUAGES from '../meta/languages.js';

// import issues from '../meta/github-issues.json';

// import myIssues from '../001941.json';
// let issues = myIssues.issues;
// let matchedRows = myIssues.matched_spreadsheet_rows;

const DIR_PATH_ROOT = "./log";

function tidyUpRowMeta(rows, uuidMap) {
  return rows.map(row => {
    // we don't need these keys that were generated from "google-spreadsheet" library
    delete row[`_xml`];
    delete row[`id`];
    delete row[`app`];
    delete row[`app:edited`];
    delete row[`_links`];
    delete row[`save`];
    delete row[`del`];

    // we don't need these keys that were submitted as part of the original proposal
    delete row[`space`];
    delete row[`secondaryspace`];
    delete row[`proposallanguage`];
    delete row[`additionallanguage`];

    // add additional meta
    let issue = uuidMap[row.uuid];
    let metaFromIssueToPull = [
      `track`, `type`, `language`
    ];

    // full name of the proposal submitter
    row[`fullname`] = `${row.firstname.trim()} ${row.surname.trim()}`;

    metaFromIssueToPull.forEach(metaKey => {
      row[metaKey] = issue[metaKey];
    });

    // append extra note to "descriptionforguidebook"
    let description = row[`description`];
    let type = row[`type`];
    let language = row[`language`];

    type.forEach(t => {
      description = `${description}<br><br>${SESSION_TYPES[t].stringToAppend}`;
    });

    language.forEach(l => {
      description = `${description}<br><br>${LANGUAGES[l].localizedString}`;
    });

    // cuz Guidebook looks for HTML
    row[`descriptionforguidebook`] = description.replace(/\n/g, `<br>`);

    // convert as comma-joined string
    row[`track`] = row[`track`].join(`;`);
    row[`type`] = row[`type`].join(`;`);
    row[`language`] = row[`language`].join(`;`);

    return row;
  });
}

export default function(githubOwner, githubRepo, searchQualifiers, cb) {
  let timestamp = moment();
  let date = timestamp.format(`YYYYMMDD`);
  let time = timestamp.format(`HHmmss`);

  let dir = `${DIR_PATH_ROOT}/${date}`;
  let filePath = `${dir}/${time}`;

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  // available search qualifiers: https://help.github.com/articles/searching-issues-and-pull-requests/
  // https://developer.github.com/v3/search/#search-issues

  GithubApiHelper.search(`issues`, { q: searchQualifiers.join(` `) }, (error, issues, endpointInfo) => {
    // GitHub template: **[ UUID ]** __uuid__
    // let uuids = issues.map(issue => issue.body.split(`\n`)[0].replace(`[ UUID ]`, ``).replace(/\*/g, ``).trim());

    let uuidMap = {};
    issues.forEach(issue => {
      // GitHub template: **[ UUID ]** __uuid__
      let uuid = issue.body.split(`\n`)[0].replace(`[ UUID ]`, ``).replace(/\*/g, ``).trim();

      // add uuid to issue object
      issue.uuid = uuid;

      issue = Object.assign({}, issue, generateMetaToAdd(issue));
      uuidMap[uuid] = issue;
    });

    let sharedKeyInfo = {
      name: `uuid`,
      values: Object.keys(uuidMap)
    };
    searchGoogleSpreadsheet(sharedKeyInfo, {}, (sheetError, matchedRows) => {
      if (sheetError) console.log(`sheetError`, sheetError);

      let report = {
        api_call_made: endpointInfo,
        timestamp: timestamp.local().format('YYYY-MM-DD HH:mm:ss'),
        count: issues.length,
        issues: issues,
        matched_spreadsheet_rows: matchedRows
      };

      exportAsJson(report, `${filePath}.json`, (jsonFileErr) => {
        if (jsonFileErr) { console.log(jsonFileErr); }

        matchedRows = tidyUpRowMeta(matchedRows, uuidMap);

        exportAsCsv(matchedRows, `${filePath}.csv`, (csvFileErr) => {
          if (csvFileErr) { console.log(csvFileErr); }

          cb();
        });
      });
    });
  });
}
