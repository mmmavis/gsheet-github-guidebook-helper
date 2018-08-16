import TRACKS from '../meta/tracks.js';
import SESSION_TYPES from '../meta/session-types.js';
import LANGUAGES from '../meta/languages.js';

function findMeta(map, githubIssue) {
  return Object.keys(map).filter(key => {
    let meta = map[key];
    let matched;

    // console.log(`githubIssue`, githubIssue);
    // console.log(`\n\n\n\n`);

    if (meta.githubMetaType === `label`) {
      matched = githubIssue.labels.find(label => {
        // console.log(label.name, `/////`, meta.githubMetaValue);
        return label.name === meta.githubMetaValue;
      });
    }

    if (meta.githubMetaType === `milestone`) {
      matched = githubIssue.milestone && githubIssue.milestone.title === meta.githubMetaValue;
    }

    return matched;
  });
}

export default function(githubIssue) {
  // for all meta in "githubIssue" see https://developer.github.com/v3/issues/#get-a-single-issue
  let uuid = githubIssue.uuid;
  let newObj = { 
    uuid: uuid,
    track: findMeta(TRACKS, githubIssue),
    type: findMeta(SESSION_TYPES, githubIssue),
    language: findMeta(LANGUAGES, githubIssue)
  };

  return newObj;
};
