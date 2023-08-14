import * as fs from './../shared/fs'

export function readFileSync() {
  const resData = fs.readFileSync('accountList')
  return !resData ? [] : JSON.parse(resData)
}

export function writeFileSync(data, merge = true) {
  let params = data
  if (merge) {
    params = [...readFileSync(), ...data]
  }
  fs.writeFileSync('accountList', JSON.stringify(params))
}
