const fs = require('fs')

const matchProps = require('./shared').matchProps
const matchEnvVars = require('./shared').matchEnvVars

const RESET = '\x1b[0m',
  RED = '\x1b[31m',
  BLUE = '\x1b[36m'

const REDISH = string => RED + string + RESET,
  BLUEISH = string => BLUE + string + RESET

const CURRENT_DIR = process.cwd()

const createDirectoryContents = (templatePath, newProjectPath, options) => {
  var filesToCreate

  process.env['PROJECT_NAME'] = options['project-name'] || 'undefined'

  try {
    filesToCreate = fs.readdirSync(templatePath)
    process.stdout.write(BLUEISH(`\n-> Copying template files...\n\n`))
  } catch (err) {
    console.error(
      REDISH(
        `\n-> Not a valid template, ${templatePath} must be a folder ↴\n`
      ) + REDISH(err.message)
    )
    return
  }

  filesToCreate.forEach(object => {
    const origFilePath = `${templatePath}/${object}`

    //- Current "object" data.
    const stats = fs.statSync(origFilePath)

    if (stats.isFile() && object !== 'template.js') {
      //- If "object" is indeed a file this will get it contents
      var contents
      try {
        contents = fs.readFileSync(origFilePath, 'utf8')
      } catch (err) {
        console.error(
          REDISH(`\n-> Failed to read ${origFilePath} file ↴\n`) +
            REDISH(err.message)
        )
      }

      /*- Just keep tailing those matchers until we fill the whole file.
        - this functions lives inside of bin/shared dir! -*/
      contents = matchEnvVars(contents)

      //- Where template file will be created (inside the generated project)
      const writePath = `${CURRENT_DIR}/${newProjectPath}/${object}`

      try {
        fs.writeFileSync(writePath, contents, 'utf8')
        console.log(BLUEISH(' -> ') + BLUEISH(writePath) + ' file created.\n')
      } catch (err) {
        console.error(
          REDISH(`\n-> Failed to create ${writePath} file ↴\n`) +
            REDISH(err.message)
        )
      }
    } else if (stats.isDirectory()) {
      try {
        fs.mkdirSync(`${CURRENT_DIR}/${newProjectPath}/${object}`)
        console.log(
          BLUEISH(' -> ') + BLUEISH(newProjectPath) + ' directory created.'
        )
      } catch (err) {
        console.error(
          REDISH(`\n-> Failed to create ${newProjectPath} template dir ↴\n`) +
            REDISH(err.message)
        )
      }

      // recursive call
      createDirectoryContents(
        `${templatePath}/${object}`,
        `${newProjectPath}/${object}`,
        options
      )
    }
  })
}

module.exports = createDirectoryContents
