const args = process.argv.slice(2).reduce((acc, arg) => {
  let [key, value] = arg.split('=')

  //- (1) When no value is set to the argument, return true *Boolean*.
  //- (2) If the argument has true/false, it will return its value
  //-     as a *Boolean*.
  //- (3) If the argument is a digit(with or without points)
  //-     it will return its value as *Integer*.
  //- (4) If none of the last it sill return its value as *String*.
  acc[key] =
    value === undefined
      ? true
      : /true|false/.test(value)
        ? value === 'true'
        : /\d+[\.]?/.test(value) ? Number(value) : value
  return acc
}, {})

module.exports = {
  args,
}
