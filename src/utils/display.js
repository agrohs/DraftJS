export const ensureString = (string) => (string ? `${string}` : '')

export const ensureNumeric = (string) =>
  Number(ensureString(string).replace(/[^0-9.]/gi, ''))

export const ensureArray = (array = []) =>
  !array ? [] : Array.isArray(array) ? array : [array]

export const ensureObject = (object) => object || {}

export const isType = (value, type) => {
  // eslint-disable-next-line eqeqeq
  return value != undefined && typeof value === type
}

export const lowercase = (string, defaultValue = '') => {
  return !stringNotEmpty(string)
    ? defaultValue
    : ensureString(string).toLowerCase()
}

export const stringNotEmpty = (stringable) => {
  const string = ensureString(stringable)
  return string.length > 0 && !['null', 'undefined'].includes(string)
}
