// src/functions.ts

/******************************************************************************************************************************
    
    This file contains functions that embody the behavior of the application

*******************************************************************************************************************************/

import * as db from './database';
import * as requests from './requests';
import * as models from './models';
const chalk = require('chalk');
const size = require('window-size');
import Table from 'cli-table';
import { Website } from './Website';

/******************************************************************************************************************************
    Function that adds a website to the database. If parameter checkIfExists is set to true, the url is first checked and if the 
    website is down or doesn't exist, an error message is displayed
*******************************************************************************************************************************/

export const addWebsite = async (url : string, checkInterval : number, checkIfExists : boolean) : Promise<void> => {
    console.log(chalk.bold("Loading..."));
    if (checkIfExists) {
        const exists : boolean = await requests.verifyURLExistence(url);
        if (exists) {
            const website : Website = new Website(url, checkInterval);
            await db.addWebsite(website);
        }
        else {
            console.log(chalk.red.bold("The given url doesn't lead to any working website..."));
            process.exit();
        }
    }
    else {
        const website : Website = new Website(url, checkInterval);
        await db.addWebsite(website);
    }
}

/******************************************************************************************************************************
    Function that deletes a website from the database based on its url
*******************************************************************************************************************************/

export const deleteWebsite = async (url : string) : Promise<void> => {
    console.log(chalk.bold("Loading..."));
    await db.deleteWebsite(url);
    console.log(chalk.bold.green("Website " + url + " successfully deleted"));
    process.exit();
}

/******************************************************************************************************************************
    Function that gets and displays all the websites in the database
*******************************************************************************************************************************/

export const getWebsites = async () : Promise<void> => {
    console.log(chalk.bold("Loading..."));
    const websites : Website[] = await db.getWebsites();
    if (websites.length > 0) {
        console.log(chalk.cyan.bold("Your websites are : "));
        websites.forEach(async (website : Website) => {
            console.log(chalk.bold.white("- " + website.getUrl() + " --- Check Interval : " + website.getCheckInterval() + " seconds"));
        });
    }
    else {
        console.log(chalk.red.bold("You haven't saved any websites yet..."));
    }
    process.exit();
}

/******************************************************************************************************************************
    Function that monitors all the website : 
        - prints the stats of all saved websites every 10 seconds over 10 minutes
        - prints all the alerts that have been raised since the beginning of the monitoring every 10 seconds
        - prints the stats of all saved websites every minute over 1 hour
*******************************************************************************************************************************/

export const monitor = async () : Promise<void> => {
    // get all the websites
    const websites : Website[] = await db.getWebsites();
    // in case there is no selected website
    if (websites.length === 0) {
        console.log(chalk.bold.red("You haven't selected any websites yet. Run '''minidatadog addWebsite''' to do so"));
        process.exit();
    }
    console.log(chalk.bold.white("For a better monitoring experience, display your console in full screen! \n"));
    // print the websites
    console.log(chalk.cyan.bold("Your websites are : "))
    websites.forEach(async (website : Website) => {
        console.log(chalk.bold.white("- " + website.getUrl() + " --- Check Interval : " + website.getCheckInterval() + " seconds"));
    });
    console.log("\n");
    const maxCheckInterval : number = Math.max(...websites.map((website : Website) => website.getCheckInterval()));
    // warn users that there are gonna be some NANs in the first tables
    if (maxCheckInterval >= 10) {
        console.log(chalk.yellow.bold("Warning : You set some check intervals to values greater than 10, so it is normal that the " + Math.floor(maxCheckInterval/10) + " first tables will display values like NAN or Infinity"));
    }
    console.log("\n\n");
    // Every 10 seconds, print the stats over 10 minutes and print all the alerts
    setInterval(() => {
        let alerts : models.Alert[] = [];
        websites.forEach((website : Website) => {
            alerts = alerts.concat(website.getAlerts());
        })
        alerts.sort((a : models.Alert, b : models.Alert) => a.date.getTime() - b.date.getTime());
        printTable(websites, 10);
        alerts.forEach((alert : models.Alert) => {
            if (alert.down) {
                console.log(chalk.bold.white.bgRed("Website " + alert.url + " is down! Availability=" + alert.availability + "%, Time=" + alert.date.toLocaleString("en-GB", {timeZone : 'UTC'})));
            }
            else {
                console.log(chalk.bold.white.bgGreen("Website " + alert.url + " is up again! Availability=" + alert.availability + "%, Time=" + alert.date.toLocaleString("en-GB", {timeZone : 'UTC'})));
            }
        })
        console.log("\n\n");
    }, 10000);
    // Every minute, print the stats over 1 hour
    setInterval(() => {
        printTable(websites, 60)
        console.log("\n\n");
    }, 1000*60);
}

/******************************************************************************************************************************
    Function that prints a table in the console with the stats of the websites in input parameter 'websites' over a time range of
    parameter 'timeInterval'
*******************************************************************************************************************************/

const printTable = (websites : Website[], timeInterval : number) : void => {
    console.log(chalk.bold.cyan(new Date().toLocaleString("en-GB", {timeZone : 'UTC'}) + " : Stats over the last " + timeInterval + " minutes : \n"));
    const windowWidth : number = size.get().width;
    const table : Table = new Table({
        head : ["URL", "Availab. (%)", "Max. resp. time (ms)", "Min. resp. time (ms)", "Avg. resp. time (ms)", "Prop. 1** status (%)", "Prop. 2** status (%)", "Prop. 3** status (%)", "Prop. 4** status (%)", "Prop. 5** status (%)" ],
        colWidths: [35, 14, 22, 22, 22, 22, 22, 22, 22, 22].map((w : number) => Math.floor(w*windowWidth/237))
    });
    websites.forEach((website : Website) => {
        table.push(website.getNewStats(timeInterval));
    })
    console.log(table.toString() + "\n");
}

