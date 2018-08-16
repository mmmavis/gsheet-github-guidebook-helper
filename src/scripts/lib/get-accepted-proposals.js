import exportIssues from './lib/export-issues';

export default function(githubOwner, githubRepo, cb) {
  // available search qualifiers: https://help.github.com/articles/searching-issues-and-pull-requests/
  // https://developer.github.com/v3/search/#search-issues

  // As of September 19, 2017, all open GitHub tickets are accepted proposals
  const SEARCH_QUALIFIERS = [
    `repo:${githubOwner}/${githubRepo}`,
    `is:open`,
    `author:mozfest-bot`
  ];

  exportIssues(githubOwner, githubRepo, SEARCH_QUALIFIERS, () => {
    cb();
  });
};
