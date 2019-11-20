// src/utils.ts

/******************************************************************************************************************************
    
    This file contains some variables or helper functions I use in other files

*******************************************************************************************************************************/

import * as db from './database';
import { Website } from './Website';

/******************************************************************************************************************************
    Array containing the inputs asked to the user after entering the command "addWebsite"
*******************************************************************************************************************************/

export const addWebsiteQuestions = [
    {
      type : 'input',
      name : 'url',
      message : 'Enter the website url : (Ctrl + C to quit)'
    },
    {
      type : 'input',
      name : 'checkInterval',
      message : 'Enter the check interval (in seconds) : (Ctrl + C to quit)'
    },
];

/******************************************************************************************************************************
    Array containing the inputs asked to the user after entering the command "addUnavailableWebsite"
*******************************************************************************************************************************/

export const addUnavailableWebsiteQuestions = [
  {
    type : 'input',
    name : 'checkInterval',
    message : 'Enter the check interval (in seconds) : (Ctrl + C to quit)'
  }
]

/******************************************************************************************************************************
    Array containing the inputs asked to the user after entering the command "deleteWebsite"
*******************************************************************************************************************************/

export const getDeleteWebsiteQuestions = async () : Promise<any[]> => {
  const websites : Website[] = await db.getWebsites();
  const urls : string[] = websites.map((website : Website) => website.getUrl());
  return [
    {
      type : 'list',
      name : 'website choice',
      message : 'Select the website you want to delete from your monitoring list : (Ctrl + C to quit)',
      choices : urls
    }
  ]
}