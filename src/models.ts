// src/models.ts

/******************************************************************************************************************************
    
	This file defines the mongoose model for the websites collection in the database, as well as some useful interfaces for
	type checking inside the entire project

*******************************************************************************************************************************/

const mongoose = require('mongoose');

const websiteSchema = mongoose.Schema({
    url : String,
    checkInterval : Number
});
  
export const Website = mongoose.model('Website', websiteSchema);

export interface PingRes {
  	status : number;
  	responseTime : number;
}

export interface UrlDict {
  	[date : string] : PingRes;
}

export interface Alert {
	down : boolean;
	date : Date;
	availability : number;
	url : string;
}
