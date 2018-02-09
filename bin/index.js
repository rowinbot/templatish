#! /usr/bin/env node

const Confirm = require('prompt-confirm')
const inquirer = require('inquirer')
const fs = require('fs')

const createDirectoryContents = require('./createDir')
const removeDirectory = require('./removeDir')

const CHOICES = fs.readdirSync(`${__dirname}/../templates`)
const CURRENT_DIR = process.cwd()

const RESET = '\x1b[0m'
const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const BLUE = '\x1b[36m'

const REDISH = string => RED + string + RESET
const GREENISH = string => GREEN + string + RESET
const BLUEISH = string => BLUE + string + RESET

//- Initialize function vars.
var projectChoice = '',
  projectName = '',
  templatePath = '',
  projectPath = '',
  projectProperties = {},
  templateConfig = {}

const QUESTIONS = [
  {
    name: 'project-choice',
    type: 'list',
    message: 'Which template would you like to use?',
    choices: CHOICES,
  },
  {
    name: 'project-name',
    type: 'input',
    message: 'Project name:',
    validate(input) {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true
      else
        return 'Please use only letters, numbers, underscores and hashes for the name...'
    },
  },
]

inquirer.prompt(QUESTIONS).then(answers => {
  //- Populate createDir function data.
  projectChoice = answers['project-choice']
  projectName = answers['project-name']
  projectProperties = answers
  templatePath = `${__dirname}/../templates/${projectChoice}`
  projectPath = `${CURRENT_DIR}/${projectName}`

  const templateConfigPath = `${templatePath}/template.json`

  //*- Check selected template configuration
  if (fs.existsSync(templateConfigPath)) {
    /*-- Try to read template config --*/
    try {
      templateConfig = require(`${templateConfigPath}`)
    } catch (e) {
      //- Cancel and throw error
      console.error(
        REDISH(`\n-> Unable to read template configuration ↴\n`) + REDISH(e)
      )
    } finally {
      var templateQuestions = []
      //- Continue to map the data...
      for (var property in templateConfig) {
        //- Check if property is a object and has message property.
        const item = templateConfig[property]
        if (
          item instanceof Object &&
          item.constructor === Object &&
          item['message'] !== undefined &&
          item['message'].length > 0
        ) {
          if (item['type'] === 'select' && item['switch'] !== undefined) {
            //-- SELECT TYPE --//
            if (typeof item['switch'] === 'string') {
              //- If so, it will check for an array (name of which given in "switch").
              const options = templateConfig[item['switch']]
              if (options !== undefined && options instanceof Array) {
                // Delete unnecesary items.
                delete item['switch']
                
                // Set inquirer data properties.
                item['name'] = property
                item['choices'] = options
                item['type'] = "list"

                //- Load the data into our options object to present a inquirer dialog.
                templateQuestions.push(item)
              } else {
                //- If array property is undefined
                console.error(
                  REDISH(`\n-> Unable to read template configuration ↴\n`) +
                    REDISH('Options in switch property are not defined.')
                )
              }
            } else if (item['switch'] instanceof Array) {
              // Set inquirer data properties.
              item['choices'] = item['switch']
              item['name'] = property
              item['type'] = "list"
              
              // Delete unnecesary items.
              delete item['switch']
              
              //- Load the data into our options object to present a inquirer dialog.
              templateQuestions.push(item)
            }
          } else if (item['type'] === 'input' || item['type'] === undefined) {
            //-- INPUT TYPE --//
            item['name'] = property
            delete item['switch']
            
            //- Load the data into our options (if object > 0) to present a inquirer dialog.
            if (Object.keys(item).length > 0) templateQuestions.push(item)
          }
        }
      }
      
      /*- With the mapped data ask user for template properties -*/
      inquirer.prompt(templateQuestions).then(templateAnswers => {
        /*- Asign template properties and generator properties to projectProperties -*/
        projectProperties = Object.assign({}, templateAnswers, answers)
        
        /*- Init project creation -*/
        createDir()
      })
    }
    /*-- End (try/catch) --*/
  } else {
    //- Continue...
    createDir()
  }
})

const createDir = () => {
  try {
    //- Try to make the project directory using {projectName} on current path
    fs.mkdirSync(projectPath)

    process.stdout.write(GREENISH(`\n-> Directory ${projectName} created!\n`))

    //- Try to populate the new project directory
    createDirectoryContents(templatePath, projectName, projectProperties)
  } catch (err) {
    /*- If there were any errors, check if the error 
      - is that the directory was already been created. -*/
    if (err.code == 'EEXIST') {
      //- If so... Ask to overwrite it.
      new Confirm(
        `Are you okay with overwriting ${GREENISH(projectPath)} dir?`
      ).ask(function(yes) {
        if (yes) {
          //- If overwriting is true, then it will start to overwrite
          removeDirectory(projectPath, true)
            .then(payload => {
              //- Removed (old project directory)
              console.log(GREENISH('\n-> Successfully overwriten'))
              try {
                //- Try again to make the project directory
                fs.mkdirSync(projectPath)
                process.stdout.write(
                  GREENISH(`-> Directory ${projectName} created!\n`)
                )
                //- Try to populate the new project directory
                createDirectoryContents(templatePath, projectName, projectProperties)
              } catch (error) {
                //- Unable to create and cancel the command...
                console.error(
                  REDISH(
                    `\n-> Failed to create ${projectName} project dir ↴\n`
                  ) + REDISH(error.message)
                )
              }
            })
            .catch(error => {
              //- Unable to remove the old project directory
              console.log(error)
              console.error(
                REDISH(`\n-> Unable to remove ${projectName} dir :( ↴\n`) +
                  REDISH(error.message)
              )
            })
        } else if (!yes) {
          //- If he doesn't want us to remove the old directory, cancel the command...
          console.error(
            REDISH(`\n-> Failed to create ${projectName} project dir ↴\n`) +
              REDISH(err.message)
          )
        }
      })
    } else {
      //- If the error was anything else just cancel the command and log what the hell happened.
      console.error(
        REDISH(`\n-> Failed to create ${projectName} project dir ↴\n`) +
          REDISH(err.message)
      )
    }
  }
}
