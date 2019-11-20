// src/utils.ts

/******************************************************************************************************************************
    
    This file contains some variables or helper functions I use in other files

*******************************************************************************************************************************/

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