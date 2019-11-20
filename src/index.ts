#!/usr/bin/env node

/******************************************************************************************************************************
    
    This file is the entry point of the application. It defines the commands the user can use and some exceptions

*******************************************************************************************************************************/

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const program = require('commander');
const { prompt } = require('inquirer');

import * as functions from './functions';
import * as utils from './utils';

/******************************************************************************************************************************
    When the app is launched, clear the console and log the name of the app
*******************************************************************************************************************************/

clear();
console.log(
  chalk.green(
    figlet.textSync('Mini Datadog', { horizontalLayout: 'full' })
  )
);

/******************************************************************************************************************************
   Version and description of the app
*******************************************************************************************************************************/

program
    .version("1.0.0")
    .description("Aurélien Pasteau's submission of the Datadog take home project")

/******************************************************************************************************************************
   Define the command 'addWebsite'. The user is asked to enter the url of a valid and functional website as well as the
   desired checkInterval (in seconds)
*******************************************************************************************************************************/

program
    .command("addWebsite")
    .description("add a new website to monitor, along with the check interval (in seconds)")
    .action(() : void => {
        prompt(utils.addWebsiteQuestions).then((answers : {url : string, checkInterval : number}) => {
            functions.addWebsite(answers.url, answers.checkInterval, true);
        })
    });

/******************************************************************************************************************************
    Define the command 'monitor' that leads the user to the monitoring view
*******************************************************************************************************************************/

program
    .command("monitor")
    .description("access the monitoring view with metrics for the different websites")
    .action(() : void => {
        functions.monitor();
    })

/******************************************************************************************************************************
    Define the command 'addUnavailableWebsite' that asks the user to input a check interval and that saves the website 
    "https://random-res-app.herokuapp.com/" with the given check interval. This website has the particularity to be available
    in average only 80% of the time
*******************************************************************************************************************************/

program
    .command("addUnavailableWebsite")
    .description("adds a website that is in average available only 80% of the time with a checkInterval of 7 seconds")
    .action(() : void => {
        console.log(chalk.bold.white("This will add the website 'https://random-res-app.herokuapp.com/' that is in average available 80% of the time"))
        prompt(utils.addUnavailableWebsiteQuestions).then((answers : {checkInterval : number}) => {
            functions.addWebsite("https://random-res-app.herokuapp.com/", answers.checkInterval, false);
        })
    })

/******************************************************************************************************************************
    Print error message in case no command or a wrong command was given
*******************************************************************************************************************************/

const options : any = program.options.concat([{short : "-h", long : "--help"}])
const optionsStrings : string[] = options.map((opt : any) => opt.short).concat(options.map((opt : any) => opt.long))
if (process.argv.length <= 2) {
    console.log(chalk.red.bold("No command found : the following might help you \n"));
    program.outputHelp();
    process.exit();
}
else if (!optionsStrings.includes(process.argv[2])) {
    if (!program.commands.map((command : any) => command._name).includes(process.argv[2])) {
        console.log(chalk.red.bold(process.argv[2] + " : command not found. The following might help you \n"));
        program.outputHelp();
        process.exit();
    }
}

program.parse(process.argv);

