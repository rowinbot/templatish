#! /usr/bin/env node

const Confirm = require('prompt-confirm')
const inquirer = require('inquirer')
const fs = require('fs')

const createDirectoryContents = require('./createDir')
const removeDirectory = require('./removeDir')

const CHOICES = fs.readdirSync(`${__dirname}/../templates`)
const CURRENT_DIR = process.cwd()

const RESET = '\x1b[0m',
  RED = '\x1b[31m',
  GREEN = '\x1b[32m',
  BLUE = '\x1b[36m'

const REDISH = string => RED + string + RESET,
  GREENISH = string => GREEN + string + RESET,
  BLUEISH = string => BLUE + string + RESET

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
  const projectChoice = answers['project-choice'],
    projectName = answers['project-name'],
    templatePath = `${__dirname}/../templates/${projectChoice}`

  const projectPath = `${CURRENT_DIR}/${projectName}`
  
})

  try {
    //- Try to make the project directory using {projectName} on current path
    fs.mkdirSync(projectPath)
    
    process.stdout.write(GREENISH(`\n-> Directory ${projectName} created!\n`))
    
    //- Try to populate the new project directory
    createDirectoryContents(templatePath, projectName, answers)
  } catch (err) {
    /*- If there were any errors, check if the error 
      - is that the directory was already been created. -*/
    if (err.code == 'EEXIST') {
      //- If so... Ask to overwrite it.
      new Confirm(`Are you okay with overwriting ${GREENISH(projectPath)} dir?`).ask(
        function(yes) {
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
                  createDirectoryContents(templatePath, projectName, answers)
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
          } else if(!yes) {
            //- If he doesn't want us to remove the old directory, cancel the command...
            console.error(
              REDISH(`\n-> Failed to create ${projectName} project dir ↴\n`) +
                REDISH(err.message)
            )
          }
        }
      )
    } else {
      //- If the error was anything else just cancel the command and log what the hell happened.
      console.error(
        REDISH(`\n-> Failed to create ${projectName} project dir ↴\n`) +
          REDISH(err.message)
      )
    }
  }