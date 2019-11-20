// src/Website.test.ts

/******************************************************************************************************************************
    
	This file creates a test for the alerts logic of the Website class

*******************************************************************************************************************************/

import { Queue } from "./Queue";
import * as models from "./models"
import { Website } from "./Website";
const chalk = require("chalk");

/******************************************************************************************************************************
    Function that tests the alerts logic : given a check interval and two queues containing stats over 2 minutes so that the 
    first queue leads to a negative alert and the second one to a positive alert, return true if the "checkIsDownChange" method
    has indeed the right effect on the "isDown" and "alerts" attributes of the "Website" object 
*******************************************************************************************************************************/

const testAlertsLogic = (checkInterval : number, pingRes2min1 : Queue<models.PingRes>, pingRes2min2 : Queue<models.PingRes>) : boolean => {
    const website : Website = new Website("", checkInterval);
    website.setPingRes2min(pingRes2min1);
    website.checkIsDownChange();
    if (!(website.getIsDown() && website.getAlerts().length === 1 && website.getAlerts()[0].down)) {
        return false;
    }
    website.setPingRes2min(pingRes2min2);
    website.checkIsDownChange();
    if (website.getIsDown() || website.getAlerts().length !== 2 || website.getAlerts()[1].down) {
        return false;
    }
    return true;
}

/******************************************************************************************************************************
    When '''npm test''' is run, this code is executed to run the above test
*******************************************************************************************************************************/
const checkInterval : number = 7;
const n : number = Math.ceil(2*60/(3*checkInterval));
const pingRes2min1 : Queue<models.PingRes> = new Queue();
// fill the first queue with around 1/3 of 500 status codes
for (let i : number = 0; i<n; i++) {
    pingRes2min1.add({status : 200, responseTime : 150});
    pingRes2min1.add({status : 200, responseTime : 232});
    pingRes2min1.add({status : 500, responseTime : 429});
}
const m : number = Math.ceil(2*60/(10*checkInterval));
const pingRes2min2 : Queue<models.PingRes> = new Queue();
// fill the second queue with around 1/10 of 500 status codes
for (let i : number = 0; i<m; i++) {
    pingRes2min1.add({status : 200, responseTime : 150});
    pingRes2min1.add({status : 200, responseTime : 232});
    pingRes2min1.add({status : 200, responseTime : 150});
    pingRes2min1.add({status : 200, responseTime : 232});
    pingRes2min1.add({status : 200, responseTime : 150});
    pingRes2min1.add({status : 200, responseTime : 232});
    pingRes2min1.add({status : 200, responseTime : 150});
    pingRes2min1.add({status : 200, responseTime : 232});
    pingRes2min1.add({status : 200, responseTime : 232});
    pingRes2min1.add({status : 500, responseTime : 429});
}

if (testAlertsLogic(checkInterval, pingRes2min1, pingRes2min2)) {
    console.log(chalk.bold.green("Alerts test passed!"));
}
else {
    console.log(chalk.bold.red("Alerts test failed..."));
}

process.exit();
