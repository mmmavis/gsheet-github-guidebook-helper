import habitat from 'habitat';
import prompt from 'prompt';
import chalk from 'chalk';
import fs from 'fs';
import moment from 'moment';
import GithubApiHelper from './lib/github-api-helper';
import getAcceptedProposals from './get-accepted-proposals';
import mapGuidebookSessionIds from './map-guidebook-session-ids';
import mapGuidebookFacilitatorIds from './map-guidebook-facilitator-ids';

habitat.load(`.env`);
habitat.load(`defaults.env`);

const GITHUB_OWNER = habitat.get(`GITHUB_OWNER`);
const GITHUB_REPO = habitat.get(`GITHUB_REPO`);
const SCRIPT_OPTIONS = [
  {
    title: `Get accepted proposals`,
    funcToRun: function(cb) {
      getAcceptedProposals(GITHUB_OWNER, GITHUB_REPO, cb);
    }
  },
  {
    title: `Map Guidebook session ids to Google Spreadsheet`,
    funcToRun: function(cb) {
      mapGuidebookSessionIds(cb);
    }
  },
  {
    title: `Map Guidebook facilitator ids to Google Spreadsheet`,
    funcToRun: function(cb) {
      mapGuidebookFacilitatorIds(cb);
    }
  }
];
const PROMPT_PROPERTIES = [
  {
    name: `script_num`,
    description: `Choose the script you would like to run`,
    type: `integer`,
    required: true,
    message: `Input must be an integer from 1 to ${SCRIPT_OPTIONS.length}.`,
    conform: function(value) {
      return value >= 1 && value <= SCRIPT_OPTIONS.length;
    }
  }
];

prompt.message = `✧✧✧ `;
prompt.start();

function printListOfOptions(introLine, options) {
  console.log(chalk.bold(`\n${introLine}                         \n`));
  options.forEach((option, i) => {
    console.log(chalk.bold(`  ${i+1}) ${option.title}`));
  });
  console.log(`\n`);
}

function printAndRecordLog(timestamp, scriptNum, typeOfActionDone) {
  let log = `[${timestamp}] Script #${scriptNum} ${typeOfActionDone}.`;

  console.log(chalk.red(log));

  if (!fs.existsSync(`./log/`)){
    fs.mkdirSync(`./log/`);
  }

  fs.appendFile(`./log/activity-log.txt`, `${log}\n`, `utf8`, (fileWriteErr) => {
    if (fileWriteErr) console.log(fileWriteErr);
  });
}

function runSelectedScript(scriptNum) {
  printAndRecordLog(moment().local().format('YYYY-MM-DD HH:mm:ss'), scriptNum, `selected`);

  let cb = () => {
    printAndRecordLog(moment().local().format('YYYY-MM-DD HH:mm:ss'), scriptNum, `run`);
  };

  SCRIPT_OPTIONS[scriptNum-1].funcToRun.apply(null, [ cb ]);
}

console.log(chalk.bold.white.bgRed(`\n **********   Target GitHub Repo >>> ${GITHUB_OWNER}/${GITHUB_REPO} ********** \n`));
printListOfOptions(`Available scripts`, SCRIPT_OPTIONS);

prompt.get(PROMPT_PROPERTIES, function (err, result) {
  if (err) {
    console.log(err);

    return;
  }

  runSelectedScript(result.script_num);
});
