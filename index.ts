/**
 * Parse serialized JSON to object
 * @param {string} str
 * @returns {object}
 *
 * Reference
 * @see {@link https://lihautan.com/json-parser-with-javascript/}
 * @see {@link https://www.json.org/json-en.html}
 */

export function parseJSON(str: string) {
  let i = 0

  const value = parseValue()
  expectEndOfInput()
  return value

  function parseObject() {
    if (str[i] !== '{') return undefined

    i++
    skipWhitespace()
    const result: Record<string, any> = {}
    let isFirstValue = true
    while (i < str.length && str[i] !== '}') {
      if (!isFirstValue) {
        eatComma()
        skipWhitespace()
      }

      const key = parseString()
      if (key === undefined) {
        expectObjectKey()
      }
      skipWhitespace()
      eatColon()
      const value = parseValue()
      result[key as string] = value
      isFirstValue = false
    }
    expectNotEndOfInput('}')
    i++

    return result
  }

  function parseNumber() {
    let start = i
    if (str[i] === '-') {
      i++
      expectDigit(str.slice(start, i))
    }

    if (str[i] === '0') {
      i++
    } else if (/\d/.test(str[i])) {
      i++
      while (/\d/.test(str[i])) i++
    }

    // fraction
    if (str[i] === '.') {
      i++
      expectDigit(str.slice(start, i))
      while (/\d/.test(str[i])) i++
    }

    // exponent
    if (/e|E/.test(str[i])) {
      i++
      if (str[i] === '-' || str[i] === '+') i++
      expectDigit(str.slice(start, i))
      while (/\d/.test(str[i])) i++
    }

    if (i > start) {
      return Number(str.slice(start, i))
    }
  }

  function parseValue(): any {
    skipWhitespace()
    const value =
      parseString() ??
      parseNumber() ??
      parseObject() ??
      parseArray() ??
      parseKeyword('true', true) ??
      parseKeyword('false', false) ??
      parseKeyword('null', null)
    skipWhitespace()
    return value
  }

  function parseKeyword(name: string, value: any) {
    if (str.substring(i, i + name.length) === name) {
      i += name.length
      return value
    }
  }

  function parseString() {
    const isQuote = (char: string) => /\"/.test(char)
    const isValidEscapeCharExcludeU = (char: string) => /\"|\\|\/|b|f|n|r|t/.test(char)
    const isHexadecimal = (fourHexdigits: string) => /[0-9a-f]{4}/.test(fourHexdigits)

    if (!isQuote(str[i])) return undefined

    i++
    let result = ''
    while (i < str.length && !isQuote(str[i])) {
      if (str[i] === '\\') {
        const nextChar = str[i + 1]

        if (isValidEscapeCharExcludeU(nextChar)) {
          result += {
            n: '\n',
            r: '\r',
            b: '\b',
            f: '\f',
            t: '\t',
            '"': '"',
            '\\': '\\',
            '/': '/',
          }[nextChar]

          i++
        } else if (nextChar === 'u') {
          const hexDigits = str.substring(i + 2, i + 6)
          if (isHexadecimal(hexDigits)) {
            result += String.fromCharCode(parseInt(hexDigits, 16))
            i += 5
          } else {
            i += 2
            expectEscapeUnicode(result)
          }
        } else {
          expectEscapeUnicode(result)
        }
      } else {
        result += str[i]
      }
      i++
    }
    expectNotEndOfInput('"')
    i++
    return result
  }

  function parseArray() {
    if (str[i] !== '[') return undefined
    i++
    skipWhitespace()

    const result = []

    let isFirstValue = true
    while (i < str.length && str[i] !== ']') {
      if (!isFirstValue) {
        eatComma()
      }
      const value = parseValue()
      result.push(value)
      isFirstValue = false
    }
    expectNotEndOfInput(']')
    i++
    return result
  }

  function skipWhitespace() {
    while (/\s/.test(str[i])) i++
  }

  function eatComma() {
    expectCharacter(',')
    i++
  }

  function eatColon() {
    expectCharacter(':')
    i++
  }

  // Error handling
  function expectDigit(numSoFar: string) {
    if (/\D/.test(str[i])) {
      console.log(`JSON_ERROR_0005 Expecting a digit here;
  
      For example:
      ${numSoFar}5
      ${' '.repeat(numSoFar.length)}^`)
      throw new Error('JSON_ERROR_0006 Expecting a digit')
    }
  }

  function expectCharacter(expected: string) {
    if (str[i] !== expected) {
      console.log(`Expecting a \`${expected}\` here`)
      throw new Error('JSON_ERROR_0004 Unexpected token')
    }
  }

  function expectNotEndOfInput(expected?: string) {
    if (i === str.length) {
      console.log(`Expecting a \`${expected}\` here`)
      throw new Error('JSON_ERROR_0001 Unexpected End of Input')
    }
  }

  function expectEndOfInput() {
    if (i < str.length) {
      printCodeSnippet('Expecting to end here')
      throw new Error('JSON_ERROR_0002 Expected End of Input')
    }
  }

  function expectObjectKey() {
    console.log(`Expecting object key here
  
  For example:
  { "foo": "bar" }
    ^^^^^`)
    throw new Error('JSON_ERROR_0003 Expecting JSON Key')
  }

  function expectEscapeUnicode(strSoFar: string) {
    printCodeSnippet(`Expect escape unicode
  
  For example:
  "${strSoFar}\\u0123
  ${' '.repeat(strSoFar.length + 1)}^^^^^^`)
    throw new Error('JSON_ERROR_0009 Expecting an escape unicode')
  }

  function printCodeSnippet(message: string) {
    const from = Math.max(0, i - 10)
    const trimmed = from > 0
    const padding = (trimmed ? 4 : 0) + (i - from)
    const snippet = [
      (trimmed ? '... ' : '') + str.slice(from, i + 1),
      ' '.repeat(padding) + '^',
      ' '.repeat(padding) + message,
    ].join('\n')
    console.log(snippet)
  }
}

let a = {
  a: 'abc\\n',
  b: {
    a: 'test',
    b: true,
    c: null,
  },
  c: [{ a: 123, b: 0.1135, c: -1.22616, d: 1351e-5, f: 123e6 }, 7789, '\\r', '\ua32b'],
}
