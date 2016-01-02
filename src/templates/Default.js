// The default template attempts to follow the schema from
// https://github.com/olivierlacan/keep-a-changelog

export default class Default {
  logHeader = '# Change Log\nAll notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org/).\n\nGenerated by [auto-changelog](https://github.com/CookPete/auto-changelog)'

  unreleasedTitle = 'Unreleased'
  mergesTitle = 'Merged'
  fixesTitle = 'Fixed'
  commitsTitle = 'Commits'

  fixPrefix = ''
  mergePrefix = ''

  commitListLimit = 3
  commitHashLength = 7

  sectionSpacing = '\n\n\n'
  listSpacing = '\n\n'

  constructor (origin) {
    this.origin = origin
  }

  formatDate = (date) => {
    return date.slice(0, 10)
  }

  render = (releases) => {
    return [
      this.logHeader,
      releases.map(this.renderRelease).join(this.sectionSpacing)
    ].join(this.sectionSpacing) + '\n'
  }

  renderRelease = (release, index, releases) => {
    const previousRelease = releases[index + 1]
    let log = [ this.renderReleaseHeading(release, previousRelease) ]
    const merges = this.renderMerges(release.merges)
    const fixes = this.renderFixes(release.fixes)
    log = log.concat(merges).concat(fixes)
    if (merges.length + fixes.length === 0) {
      log = log.concat(this.renderCommits(release.commits))
    }
    return log.join(this.listSpacing)
  }

  renderReleaseHeading = (release, previousRelease) => {
    const title = this.renderReleaseTitle(release, previousRelease)
    const date = release.date ? ' - ' + this.formatDate(release.date) : ''
    return `## ${title}${date}`
  }

  renderReleaseTitle = (release, previousRelease) => {
    let heading = release.tag || this.unreleasedTitle
    if (previousRelease) {
      heading = `[${heading}](${this.origin}/compare/${previousRelease.tag}...${release.tag || 'HEAD'})`
    }
    return heading
  }

  renderList = (title, list) => {
    const heading = title ? `### ${title}\n` : ''
    return heading + list
  }

  renderMerges = (merges) => {
    if (merges.length === 0) return []
    const list = merges.map(this.renderMerge).join('\n')
    return this.renderList(this.mergesTitle, list)
  }

  renderMerge = ({ pr, message }) => {
    const href = pr.replace('#', this.origin + '/pull/')
    return `* ${this.mergePrefix}[${pr}](${href}): ${message}`
  }

  renderFixes = (fixes) => {
    if (fixes.length === 0) return []
    const list = fixes.map(this.renderFix).join('\n')
    return this.renderList(this.fixesTitle, list)
  }

  renderFix = ({ fixes, commit }) => {
    const numbers = fixes.map(this.renderFixNumber).join(', ')
    return `* ${this.fixPrefix}${numbers}: ${commit.subject}`
  }

  renderFixNumber = (string) => {
    const href = string.replace('#', this.origin + '/issues/')
    const number = string.replace(this.origin + '/issues/', '#')
    return `[${number}](${href})`
  }

  renderCommits = (commits) => {
    if (commits.length === 0) return []
    const list = commits
      .sort(this.sortCommits)
      .slice(0, this.commitListLimit)
      .map(this.renderCommit)
      .join('\n')
    return this.renderList(this.commitsTitle, list)
  }

  renderCommit = ({ hash, subject }) => {
    const href = `${this.origin}/commit/${hash}`
    const shortHash = hash.slice(0, this.commitHashLength)
    return `* [\`${shortHash}\`](${href}): ${subject}`
  }

  sortCommits = (a, b) => {
    // If we have to list commits, list the juicy ones first
    return b.insertions + b.deletions - a.insertions + a.deletions
  }
}