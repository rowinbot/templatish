/*- Takes a template file (as String) and changes the
  - matched key with a enviromental variable -*/
const matchEnvVars = fileStr => {
  //- Matches every %[WHATEVER]% (note: caps)
  var strAry = fileStr.match(/(%[A-Z_])[_A-Z]+%/g)

  for (var position in strAry) {
    const envVar = strAry[position].replace(/%/g, '')

    if (process.env[envVar] !== undefined) {
      fileStr = fileStr.replace(strAry[position], process.env[envVar])
    }
  }

  return fileStr
}

/*- Takes a template file (as String) and changes the
  - matched key with a template property -*/
const matchProps = (fileStr, props) => {
  //- Matches every %[whatever]_prop% (note suffix: _prop)
  var strAry = fileStr.match(/%\w+(_[pP]rop%)/g)

  for (var position in strAry) {
    const prop = strAry[position].replace(/%/g, '').replace(/(_[pP]rop)/g, '')
    if (props[prop] !== undefined) {
      fileStr = fileStr.replace(strAry[position], props[prop])
    }
  }
  
  return fileStr
}

module.exports = {
  matchEnvVars,
  matchProps,
}
