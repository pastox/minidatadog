// src/requests.ts

/******************************************************************************************************************************
    
	This file contains functions that send http requests using axios

*******************************************************************************************************************************/

import axios from 'axios';

/******************************************************************************************************************************
    Function that checks whether a file exists and returns a status code below 400
*******************************************************************************************************************************/

export const verifyURLExistence = (url : string) : Promise<boolean> => {
    return axios.head(url)
    .then((res : any) => {
        return res.status < 400;
    })
    .catch((err : any) => {
        return false;
    })
}

/******************************************************************************************************************************
    Function that pings a website and returns the request's response 
*******************************************************************************************************************************/

export const ping = (url : string) : Promise<any> => {
    return axios.head(url)
    .then((res : any) => {
        return res;
    })
    .catch((err : any) => {
        return err.response;
    })
}