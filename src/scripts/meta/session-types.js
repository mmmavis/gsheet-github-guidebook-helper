// key: name of the session type
// value: { 
//   githubMetaType: whether if it is a "milestone" or "label",
//   githubMetaValue: the corresponding GitHub milestone(label),
//   stringToAppend: localized line to append to session description
// }

export default {
  "Gallery": {
    githubMetaType: `label`,
    githubMetaValue: `[Session Format] Gallery`,
    stringToAppend: `This is a Gallery session.`
  },
  "Learning Forum": {
    githubMetaType: `label`,
    githubMetaValue: `[Session Format] Learning Forum`,
    stringToAppend: `This is a Learning Forum session.`
  },
  "Shed": {
    githubMetaType: `label`,
    githubMetaValue: `[Session Format] Shed`,
    stringToAppend: `This is a Shed session.`
  }
}
