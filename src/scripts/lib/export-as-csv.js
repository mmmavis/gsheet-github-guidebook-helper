import fs from 'fs';
import json2csv from 'json2csv';
import chalk from 'chalk';

export default function(content, filePath, cb) {
  let headerFields = Object.keys(content[0]).map(key => {
    return {
      label: key,
      value: function(row, field, data) {
        return row[field.label];
      },
      default: ``
    }
  });

  console.log(`content.length`, content.length);

  try {
    let csvData = json2csv({ data: content, fields: headerFields, del: `\t` });

    fs.writeFile(filePath, csvData, `utf8`, (fileWriteErr) => {
      if (fileWriteErr) {
        cb(fileWriteErr);
      }

      console.log(chalk.blue(`[CSV File Saved] ${filePath}`));
      cb();
    });

  } catch (csvConvertError) {
    cb(csvConvertError);
  }
}
