# S-14 Group Project - West Coast Harvard

**Home Gym Exercise Application**

# S.W.E.A.T. (Software Wearable Exercise Application Tool)

Description - This github repository contains all of the pieces to the SWEAT application  design by students in the Harvard S-14 class on Wearables.   The product loads a React-Native application on a phone (Android or Iphone) and allows the user to evaluate their exercise routine.  Currently the application is limited only to 2 types of situps, V-Situps and Pulse Situps, but the model can be trained to do other exercises.

# Prerequisities

## snack.edge.io

- Account on snack.edge.io  or similar react-native platform

## Web server accessable though port 5000

- Ubuntu
- Python3   minimum of Python 3.5
- Flask python libraries
- Nodejs (minimum of version 14)

# Getting Started

## Front End Application

In order to begin, you need to take the Application code (which is a React-Native) code application and load it as a snack on snack.edge.io website. 

## Installation

### React Native 

Create a new Snack and load the files in the github exercise_app directory into snack.expo.io
- assets directory with all .png files 
- user_data directory with all associated file
- App.js in main directory structure
- package.json in main directory structure

### Back End WEb Server

Once the snack app is installed,  go into the server_side direcotry in the git repository.
you need to place the flask-working onto a directory (can be home directory) on your server

Create a /var/tmp/edgeimpulse directory
copy the run-edgeimpulse.js program into that directory from the git repository server_side directory
in the github MLmodels directory copy all files into the /var/tmp/edgeimpulse directory as well

run the command:  python3 flask-working.py   (Note you will need to run this in a mechanism that does not kill the flask-working process if you log out)

This should show you the following (or something similar on the screen)

ubuntu@<server_name>$ python3 flask-working.py
 * Serving Flask app "flask-working" (lazy loading)
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: off
 * Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)



## Usage

Once the App is installed in edge.io as a snack,  and the web server is running, you should download the edge app onto your phone (Iphone or Android)

Now copy the QRC code from edge.io using a code reader, and you should now be able to run your app.

## Versioning

For the versions available see github

## Authors

* **Nicholas Pesce** - *Backend server/ Flask development*
* **Micah Nickerson  - *Front end App development *


## Acknowledgments

- Jose Luis Ramirez Herran

* Susanne Chong 

* Lucy Zhang
