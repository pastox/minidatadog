// src/database.ts

/******************************************************************************************************************************
    
    This file connects to the database and contains functions to interact with it

*******************************************************************************************************************************/

import * as models from './models';
import { Website } from './Website';
const chalk = require('chalk');
const mongoose = require('mongoose');

const db = mongoose.connect("mongodb://datadoguser:datadog2019@ds031349.mlab.com:31349/minidatadog", {useUnifiedTopology: true, useNewUrlParser : true});

/******************************************************************************************************************************
    Function that adds a website to the database
*******************************************************************************************************************************/

export const addWebsite = async (website : Website) : Promise<void> => {
    await models.Website.create({url : website.getUrl(), checkInterval : website.getCheckInterval()}, (err : any) => {
        if (err) {
            console.log(chalk.red.bold("Failed to save new website... Make sure your arguments are a url and an integer"));
            process.exit();
        }
        else {
            console.log(chalk.green.bold("New website successully added"));
            process.exit();
        }
    });
    return;
}

/******************************************************************************************************************************
    Function that gets all the websites in the database
*******************************************************************************************************************************/

export const getWebsites = async () : Promise<Website[]> => {
    const dbRes = await models.Website.find();
    const websites : Website[] = dbRes.map((wb : {url : string, checkInterval : number}) => new Website(wb.url, wb.checkInterval))
    return websites;
}