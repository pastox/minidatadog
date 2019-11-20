# Submission of the Datadog project by Aurélien Pasteau

## Install

### Save the minidatadog folder and then, run the following commands to install the application (assuming you already have node and npm installed):

* Go inside the minidatadog folder

```bash 
    cd minidatadog
```

* Install the dependencies

```bash 
    npm install
```

* Build the application

```bash 
    npm run build
```

* Install the application globally

```bash 
    npm install -g ./
```

## Documentation

* If you need help, you can check the documentation from the command-line, using : 
  
```bash
    minidatadog --help
```

  or

```bash
    minidatadog -h
```

* If you want to add a new website to monitor, use : 

```bash
    minidatadog addWebsite
```

and the CLI will ask you to input the url and the check interval for the new website

* If you want to delete a website from the monitoring list, use : 

```bash
    minidatadog deleteWebsite
```

and the CLI will ask you to select the website you want to delete

* If you want to see the current list of websites in your monitoring list, use : 

```bash
    minidatadog getWebsites
```

and the CLI will ask you to select the website you want to delete

* If you want to visualize the monitoring view, use :

```bash
    minidatadog monitor
```

* If you want to experience the monitoring of a partially available website that will sometimes trigger alerts, use :

```bash
    minidatadog addUnavailableWebsite
```

This command adds the website https://random-res-app.herokuapp.com/ to the list of websites to monitor. 
It is a small application I created and deployed to Heroku and that responds with a 500 error 80% of the time.

## Code architecture

If you want to learn more about the code, feel free to visit the different files; every function, method or piece of code is commented

```bash
    |-- README.md

```

## Technologies

* This is a Node app running with Typescript

* For the CLI, I used the libraries "commander" : https://github.com/tj/commander.js/  and "inquirer" : https://github.com/SBoudrias/Inquirer.js/

* I store the websites data in a MongoDB database hosted on MLab

## What I would do next to improve the design of the system :

* In this version, when the user launches the command "monitor", no stats have been computed before, and so during the first minutes,
  the stats over 10 minutes are actually just the stats over the time since the command launch, and same for the stats over 1 hour.
  In order to improve this, I am thinking of deploying the application to a server, and keep the ping logic turning for each website.

* In the same logic, I would store all the history of statistics and alerts in the database in order not to loose them all if I have to restart the          application

* I would add more unit tests if the project was going to become more complex and massive
  
* Finally, I would create a front end user interface with a front end framework like React to be able better display the statistics, in the form of     charts or figures for example