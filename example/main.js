import { parseJSON } from '../dist/main.js'
import util from 'util'

const logObj = (parser, serializedObj) =>
  console.log(
    util.inspect(parser(serializedObj), {
      showHidden: false,
      depth: null,
      colors: true,
    }),
  )

const testStr =
  '{"a":"abc\\n","b":{"a":"test","b":true,"c":null},"c":[{"a":123,"b":0.1135,"c":-1.22616,"d":0.01351,"f":123000000},7789,"\\r","ꌫ"]}'

logObj(JSON.parse, testStr)
logObj(parseJSON, testStr)
