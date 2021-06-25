import escapeRegExp from 'lodash/escapeRegExp'

const whitespaceRegEx = /\s/

function checkForWhiteSpaceBeforeTrigger(text, index) {
  if (index === 0) {
    return true
  }
  return whitespaceRegEx.test(text[index - 1])
}

function findInContentBlock(regex, text, nonEntityStart, callback) {
  let matchArr
  let start
  let prevLastIndex = regex.lastIndex

  // Go through all matches in the text and return the indices to the callback
  // Break the loop if lastIndex is not changed
  while ((matchArr = regex.exec(text)) !== null) {
    if (regex.lastIndex === prevLastIndex) {
      break
    }

    prevLastIndex = regex.lastIndex
    start = nonEntityStart + matchArr.index
    const end = start + matchArr[0].length

    if (whitespaceRegEx.test(text[start])) {
      //trim the result so that we have no whitespaces
      start += 1
    }

    callback(start, end)
  }
}

function findInContentBlockWithWhitespace(
  regex,
  text,
  nonEntityStart,
  callback,
) {
  let matchArr
  let start
  let prevLastIndex = regex.lastIndex

  // Go through all matches in the text and return the indices to the callback
  // Break the loop if lastIndex is not changed
  while ((matchArr = regex.exec(text)) !== null) {
    if (regex.lastIndex === prevLastIndex) {
      break
    }
    prevLastIndex = regex.lastIndex
    start = nonEntityStart + matchArr.index
    const end = start + matchArr[0].length

    //check if whitespace support is active that the char before the trigger is a white space #1844
    if (checkForWhiteSpaceBeforeTrigger(text, matchArr.index)) {
      callback(start, end)
    }
  }
}

const findWithRegex = (regex, contentBlock, supportWhiteSpace, callback) => {
  const contentBlockText = contentBlock.getText()

  // exclude entities, when matching
  contentBlock.findEntityRanges(
    (character) => !character.getEntity(),
    (nonEntityStart, nonEntityEnd) => {
      const text = contentBlockText.slice(nonEntityStart, nonEntityEnd)
      if (supportWhiteSpace) {
        findInContentBlockWithWhitespace(regex, text, nonEntityStart, callback)
      } else {
        findInContentBlock(regex, text, nonEntityStart, callback)
      }
    },
  )
}

export default (triggers, supportWhiteSpace, regExp) => {
  const triggerPattern = `(${triggers
    .map((trigger) => escapeRegExp(trigger))
    .join('|')})`
  const MENTION_REGEX = supportWhiteSpace
    ? new RegExp(`${triggerPattern}(${regExp}|\\s)*`, 'g')
    : new RegExp(`(\\s|^)${triggerPattern}${regExp}*`, 'g')

  return (contentBlock, callback) => {
    findWithRegex(MENTION_REGEX, contentBlock, supportWhiteSpace, callback)
  }
}
