// src/Website.ts

/******************************************************************************************************************************
    
    This file creates the class "Website", with the following attributes:
        - url : string; --> the URL of the instance
        - checkInterval : number; --> the check interval to ping the instance
        - pingRes2min : Queue<models.PingRes>; --> a queue containing values of the ping responses over the last 2 minutes
        - pingRes10min : Queue<models.PingRes>; --> a queue containing values of the ping responses over the last 10 minutes
        - pingRes60min : Queue<models.PingRes>; --> a queue containing values of the ping responses over the last 2 minutes
        - isDown : boolean; --> boolean value describing whether the instance is currently down or not
        - alerts : models.Alert[]; --> array of all the alerts concerning the instance since the start of the running monitoring

    The methods are explained below

*******************************************************************************************************************************/

import * as models from './models';
const { performance } = require('perf_hooks');
import * as requests from './requests';
import { Queue } from './Queue';

export class Website {

    private url : string;
    private checkInterval : number;
    private pingRes2min : Queue<models.PingRes> = new Queue<models.PingRes>();
    private pingRes10min : Queue<models.PingRes> = new Queue<models.PingRes>();
    private pingRes60min : Queue<models.PingRes> = new Queue<models.PingRes>();
    private isDown : boolean = false;
    private alerts : models.Alert[] = [];

    /******************************************************************************************************************************
        Constructor instantiating a Website based on the url and the check Interval. It also launches the ping cycle without
        forgetting to check for new alerts after every ping
    *******************************************************************************************************************************/

    constructor(url : string, checkInterval : number) {
        this.url = url;
        this.checkInterval = checkInterval;
        setInterval(() => {this.pingAndSave(); this.checkIsDownChange()}, this.checkInterval*1000);
    }

    /******************************************************************************************************************************
        Method that pings the instance and return the status code of the response and the response time
    *******************************************************************************************************************************/

    private ping = async () : Promise<models.PingRes> => {
        const t0 = performance.now();
        const res = await requests.ping(this.url);
        const t1 = performance.now();
        return {status : res.status, responseTime : t1-t0}
    }

    /******************************************************************************************************************************
        Method that calls the "ping" method and updates the 3 queues containing the infos over the different time intervals
    *******************************************************************************************************************************/

    private pingAndSave = async () : Promise<void> => {
        const pingRes : models.PingRes = await this.ping();
        if (this.pingRes2min.getLength() === Math.floor(2*60/this.checkInterval)) {
            this.pingRes2min.remove();
        }
        this.pingRes2min.add(pingRes);
        if (this.pingRes10min.getLength() === Math.floor(10*60/this.checkInterval)) {
            this.pingRes10min.remove();
        }
        this.pingRes10min.add(pingRes);
        if (this.pingRes60min.getLength() === Math.floor(60*60/this.checkInterval)) {
            this.pingRes60min.remove();
        }
        this.pingRes60min.add(pingRes);
    }

    /******************************************************************************************************************************
        Method that computes the availability of the instance over the "timeInterval" last minutes
    *******************************************************************************************************************************/

    private getAvailability = (timeInterval : number) : number => {
        const statusArray : number[] = this.getStatusOverTimeInterval(timeInterval);
        if (statusArray.length > 0) {
            return statusArray.filter((status : number) => status < 400).length / statusArray.length * 100;
        }
        else {
            return 100;
        }
    }

    /******************************************************************************************************************************
        Method that returns an array of all the status codes over the last "timeInterval" minutes
    *******************************************************************************************************************************/

    private getStatusOverTimeInterval = (timeInterval : number) : number[] => {
        const pingResQueue = this.getPingResQueue(timeInterval);
        return pingResQueue.getQueue().map((pingRes : models.PingRes) => pingRes.status);
    }

    /******************************************************************************************************************************
        Method that returns an array of all the response times over the last "timeInterval" minutes
    *******************************************************************************************************************************/

    private getResponseTimesOverTimeInterval = (timeInterval : number) : number[] => {
        const pingResQueue = this.getPingResQueue(timeInterval);
        return pingResQueue.getQueue().map((pingRes : models.PingRes) => pingRes.responseTime);
    }

    /******************************************************************************************************************************
        Method that returns an array of all the stats to print in the next table in the console
    *******************************************************************************************************************************/

    public getNewStats = (timeInterval : number) : Array<string|number> => {
        const statusArray : number[] = this.getStatusOverTimeInterval(timeInterval);
        const responseTimesArray : number[] = this.getResponseTimesOverTimeInterval(timeInterval);
        const n = statusArray.length;
        // compute availability
        const availability : number = statusArray.filter((status : number) => status < 400).length / n * 100;
        // compute response time stats
        const maxResponseTime : number = Math.max(...responseTimesArray);
        const minResponseTime : number = Math.min(...responseTimesArray);
        const avgResponseTime : number = responseTimesArray.reduce((acc : number, cur : number) => acc + cur, 0) / n;
        // compute the proportions of each status code range
        let prop100 : number = 0;
        let prop200 : number = 0;
        let prop300 : number = 0;
        let prop400 : number = 0;
        let prop500 : number = 0;
        statusArray.forEach((status : number) => {
            switch(Math.floor(status/100)) {
                case (1) :
                    prop100 += 1;
                    break;
                case (2) :
                    prop200 += 1;
                    break;
                case (3) :
                    prop300 += 1;
                    break;
                case (4) :
                    prop400 += 1;
                    break;
                case (5) :
                    prop500 += 1;
                    break;
                default : 
                    break;
            }
        })
        prop100 = prop100 / n * 100;
        prop200 = prop200 / n * 100;
        prop300 = prop300 / n * 100;
        prop400 = prop400 / n * 100;
        prop500 = prop500 / n * 100;
        return [this.url, availability, maxResponseTime, minResponseTime, avgResponseTime, prop100, prop200, prop300, prop400, prop500];
    }

    /******************************************************************************************************************************
        Method that computes the availability over the 2 last minutes and changes the value of "isDown" and adds an alert to 
        "alerts" if the computed availability has just crossed the 80% threshold
    *******************************************************************************************************************************/

    public checkIsDownChange = () : void => {
        const availability : number = this.getAvailability(2);
        if (this.isDown) {
            if (availability >= 80) {
                this.isDown = false;
                this.alerts.push({down : false, date : new Date(), availability, url : this.url});
            }
        }
        else {
            if (availability < 80) {
                this.isDown = true;
                this.alerts.push({down : true, date : new Date(), availability, url : this.url});
            }
        }
    }

    /******************************************************************************************************************************
        Method that returns the correct queue among the 3 queue attributes based on the given "timeInterval"
    *******************************************************************************************************************************/

    private getPingResQueue = (timeInterval : number) : Queue<models.PingRes> => {
        let pingResQueue : Queue<models.PingRes>;
        switch (timeInterval) {
            case (2):
                pingResQueue = this.pingRes2min;
                break;
            case (10):
                pingResQueue = this.pingRes10min;
                break;
            case (60):
                pingResQueue = this.pingRes60min;
                break;
            default:
                throw new Error("The time interval can only be 2, 10 or 60...");
        }
        return pingResQueue;
    }

    /******************************************************************************************************************************
        Method that returns the instance's URL
    *******************************************************************************************************************************/

    public getUrl = () : string => {
        return this.url;
    }

    /******************************************************************************************************************************
        Method that returns the instance's checkInterval
    *******************************************************************************************************************************/

    public getCheckInterval = () : number => {
        return this.checkInterval;
    }

    /******************************************************************************************************************************
        Method that returns whether or not the instance is down
    *******************************************************************************************************************************/

    public getIsDown = () : boolean => {
        return this.isDown;
    }

    /******************************************************************************************************************************
        Method that returns the instance's checkInterval
    *******************************************************************************************************************************/

    public getAlerts = () : models.Alert[] => {
        return this.alerts;
    }

    /******************************************************************************************************************************
        Method that sets a new value to the "setPingRes2min" attribute : this method is only used for the test of the alerts logic
    *******************************************************************************************************************************/

    public setPingRes2min = (queue : Queue<models.PingRes>) : void => {
        this.pingRes2min = queue;
    } 

}