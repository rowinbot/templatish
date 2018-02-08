#! /usr/bin/env node

const inquirer = require('inquirer')
const fs = require('fs')

const CHOICES = fs.readdirSync(`${__dirname}/templates`)
const CURRENT_DIR = process.cwd()

const QUESTIONS = [
  {
    name: 'project-choice',
    type: 'list',
    message: 'What template would you like to use?',
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

const RED = "\x1b[31m"
const GREEN = "\x1b[32m"
const BLUE = "\x1b[36m"
const RESET_COL = "\x1b[0m"

inquirer.prompt(QUESTIONS)
  .then(answers => {
    const projectChoice = answers['project-choice']
    const projectName = answers['project-name']
    const templatePath = `${__dirname}/templates/${projectChoice}`
  
    try {
      fs.mkdirSync(`${CURRENT_DIR}/${projectName}`)
      process.stdout.write(
        GREEN 
        + `\nDirectory ${projectName} created!\n` 
        + RESET_COL
      )
      
    } catch (err) {
      console.error(
        RED 
        + `\nFailed to create ${projectName} project dir ↴\n` 
        + err.message 
        + RESET_COL
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
      GREEN 
      + `Copying template files...\n` 
      + RESET_COL
    )
  } catch (err) {
    console.error(
      RED 
      + `\nNot a valid template, ${templatePath} must be a folder ↴\n` 
      + err.message 
      + RESET_COL
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
          RED 
          + `\nFailed to read ${origFilePath} file ↴\n` 
          + err.message 
          + RESET_COL
        )
      }
      
      const writePath = `${CURRENT_DIR}/${newProjectPath}/${file}`
      
      try {
        fs.writeFileSync(writePath, contents, 'utf8')
        console.log(
          GREEN
          + ' -> '
          + BLUE
          + writePath 
          + RESET_COL
          + ' file created.'
        )
      } catch (err) {
        console.error(
          RED 
          + `\nFailed to create ${writePath} file ↴\n` 
          + err.message 
          + RESET_COL
        )
      }
      
    } else if (stats.isDirectory()) {
      try {
        fs.mkdirSync(`${CURRENT_DIR}/${newProjectPath}/${file}`)
        console.log(
          GREEN
          + ' -> '
          + BLUE
          + newProjectPath 
          + RESET_COL
          + ' directory created.'
        )
      } catch (err) {
        console.error(
          RED 
          + `\nFailed to create ${newProjectPath} template dir ↴\n` 
          + err.message 
          + RESET_COL
        )
      }
      
      // recursive call
      createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`)
    }
  })
}