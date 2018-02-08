#! /usr/bin/env node

const inquirer = require('inquirer')
const fs = require('fs')

const CHOICES = fs.readdirSync(`${__dirname}/templates`)
const CURRENT_DIR = process.cwd()

const QUESTIONS = [
  {
    name: 'project-choice',
    type: 'list',
    message: 'Which template would you like to use?',
    choices: CHOICES
  },
  {
    name: 'project-name',
    type: 'input',
    message: 'Project name:',
    validate: function (input) {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true
      else return 'Please use only letters, numbers, underscores and hashes for the name...'
    }
  }
]

const RESET = "\x1b[0m",
      RED   = "\x1b[31m",
      GREEN = "\x1b[32m",
      BLUE  = "\x1b[36m"

const REDISH   = string => RED   + string + RESET,
      GREENISH = string => GREEN + string + RESET,
      BLUEISH  = string => BLUE  + string + RESET

inquirer.prompt(QUESTIONS)
  .then(answers => {
    const projectChoice = answers['project-choice']
    const projectName = answers['project-name']
    const templatePath = `${__dirname}/templates/${projectChoice}`
  
    try {
      fs.mkdirSync(`${CURRENT_DIR}/${projectName}`)
      process.stdout.write(
        GREENISH(`\nDirectory ${projectName} created!\n`)
      )
      
    } catch (err) {
      console.error(
        REDISH(`\nFailed to create ${projectName} project dir ↴\n`)
        + REDISH(err.message)
      )
      return
    }    
    
    createDirectoryContents(templatePath, projectName)
  })

function createDirectoryContents (templatePath, newProjectPath) {
  var filesToCreate
  
  try {
    filesToCreate = fs.readdirSync(templatePath)
    process.stdout.write(
      GREENISH(`Copying template files...\n`)
    )
  } catch (err) {
    console.error(
      REDISH(`\nNot a valid template, ${templatePath} must be a folder ↴\n`)
      + REDISH(err.message )
    )
    return
  }

  filesToCreate.forEach(file => {
    const origFilePath = `${templatePath}/${file}`
    
    // get stats about the current file
    const stats = fs.statSync(origFilePath)
    
    if (stats.isFile()) {
      var contents
      try {
        contents = fs.readFileSync(origFilePath, 'utf8')
      } catch (err) {
        console.error(
          REDISH(`\nFailed to read ${origFilePath} file ↴\n`)
          + REDISH(err.message)
        )
      }
      
      const writePath = `${CURRENT_DIR}/${newProjectPath}/${file}`
      
      try {
        fs.writeFileSync(writePath, contents, 'utf8')
        console.log(
          GREENISH(' -> ')
          + BLUEISH(writePath) 
          + ' file created.'
        )
      } catch (err) {
        console.error(
          REDISH(`\nFailed to create ${writePath} file ↴\n`)
          + REDISH(err.message)
        )
      }
      
    } else if (stats.isDirectory()) {
      try {
        fs.mkdirSync(`${CURRENT_DIR}/${newProjectPath}/${file}`)
        console.log(
          GREENISH(' -> ')
          + BLUEISH(newProjectPath)
          + ' directory created.'
        )
      } catch (err) {
        console.error(
          REDISH(`\nFailed to create ${newProjectPath} template dir ↴\n`)
          + REDISH(err.message)
        )
      }
      
      // recursive call
      createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`)
    }
  })
}