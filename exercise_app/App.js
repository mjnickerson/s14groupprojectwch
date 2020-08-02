import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert, ActivityIndicator, Vibration, Platform} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import Constants from 'expo-constants';

//declare static variables and routines

//////// DEMO MODE /////////////////////////////////////////////
//run a simulation within the app or really connect to server?
var runSim = true; //flag of "start exercising" running // DISCONNECTS THE APP FROM THE EC2 SERVER CURL PROXY and LOADS SIMULATED RANDOMIZED DATA
var rapidSim = false; //speed up the overall simulation (relies on simulatedRawReturnData);
var rapidRandom = true; //randomly change classifications directly into engine, regardless of simulatedRawReturnData, to test configuration;
var simWarning = false; //show a warning to the user its running in simulation mode?
var timeTillNextRandomClass = (17); //seconds, actual desired time elapsed, till we randomly select new class; Used for diagonstrics;
var simulatedReturnedSitupCount = 1; //how many situps to add per response period.
var randomReturn = [];
////////////////////////////////////////////////////////////////

////////TEMPORARY VARIABLES FOR COUNTER - DELETE ME ////////////////
//var simulatedRawReturnData = "{ anomaly: 0, results: [ { label: 'Class_1', value: 0.01359375 }, { label: 'Class_10', value: 0.1034375 }, { label: 'Class_11', value: 0.1178125 }, { label: 'Class_12', value: 0.1278125 }, { label: 'Class_2', value: 0.02546875 }, { label: 'Class_3', value: 0.0378125 }, { label: 'Class_4', value: 0.0434375 }, { label: 'Class_5', value: 0.0534375 }, { label: 'Class_6', value: 0.0646875 }, { label: 'Class_7', value: 0.0771875 }, { label: 'Class_8', value: 0.0846875 }, { label: 'Class_9', value: 0.0946875 }] }"
//var simulatedReturnClasses = [(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12)];
////////////////////////////////////////////////////////////////

///// PRECISION THRESHOLD /////////////////////////////////////
//threshold for classification - when are we unsure?
var predictionCutoff = 0.25;

///////// TIME INTERVALS ///////////////////////////////
//time variables
var collectionTimeDelta = (0.25 * 1000); // every one quarter second, 250 milliseconds
var processTimeDelta = (5 * 1000); //every 5 seconds, 7000 milliseconds
var reportTimeDelta = (3 * 1000); //every 3 seconds, 3000 milliseconds

if (runSim) { //adjust runSim time for the set classification response time
  timeTillNextRandomClass = (timeTillNextRandomClass - (processTimeDelta/1000) - (reportTimeDelta/1000))
}

if (rapidSim) { //speed up the processing pace
  processTimeDelta = (processTimeDelta * 0.20);
  reportTimeDelta = (reportTimeDelta * 0.40);
  timeTillNextRandomClass = 4; //
}
///////////////////////////////////////////////////////

//text variables, and default display (error mode)
var currentExerciseRoutine = "<!!!!!! ERROR !!!!!!>";
var countOfExercise = "< NO ACCELEROMETER CONNECTED >";
var displayImprovementFeedback = "< ERROR >";
var sensorPosition = "< UNKNOWN >";
var connectedText = "< DICONNECTED >";
var accDataDump = "<no raw data>";
var returnClassDataDump = "<no raw data>";
var runningTimeDisplay = "00:00:00";
var welcomeTextIteration = "FOR EYE OF THE TIGER!"
var positiveFeedback = ""; //default is blank, no positive feedback.

//classification and display variables

//Classifications:
//1 - Pulse Situp correct, measured by head
//2-3 Pulse Situp wrong, measured by head
//4   Pulse Situp correct, measured by arm
//5-6 Pulse Situp correct, measured by arm
//7 V Situp incorrect, measured by head
//8-9 V Situp incorrect, measured by Head
//10 V Situp correct, measured by arm
//11-12 V Situp incorrect, measured by arm
//13, we cant determine
//14, show blank (default)
var class_routine_text_source = ["Pulse Sit ups","Pulse Sit ups","Pulse Sit ups","Pulse Sit ups","Pulse Sit ups","Pulse Sit ups","V Sit ups",
"V Sit ups","V Sit ups","V Sit ups","V Sit ups","V Sit ups","Ummm.....","Calculating...",];
var class_improvement_text_source = ["Great job!\nYou are doing the Pulse sit up correctly. Keep up the good workout!",
"Pulse situp needs improvement!\nTry to adjust your head to align in the center when you are in a sitting position.",
"Pulse situp needs improvement!\nTry to adjust your head to align in the center when you are in a sitting position.",
"Great job!\nYou are doing the Pulse sit up correctly. Keep up the good workout!",
"Pulse situp needs improvement!\nYour arms are way too high. Stretch your arms straight when you lift up your torso.",
"Pulse situp needs improvement!\nYour arms are way too low. Try to stretch your arms straight when you lift up your torso.",
"Great job!\nYou are doing the V sit up correctly. Keep up the good workout!",
"V-situp needs improvement!\nTry to adjust your form to align in the center when you lift up your torso.",
"V-situp needs improvement!\nTry to adjust your form to align in the center when you lift up your torso.",
"Great job!\nYou are doing the V sit up correctly. Keep up the good workout!",
"V-situp needs improvement!\nTry to adjust your arms to align in the center when you lift up your torso.",
"V-situp needs improvement!\nTry to adjust your arms to align in the center when you lift up your torso.",
"Sorry!\nWe're unsure what exercise you're doing -\nPlease Try again!",
""];
//below can be modified from strings above to simplify if time allows --> would be easy to just modify the start of the string!
var class_summary_recommendary = ["are done super well!\nYou are doing the Pulse sit up correctly. Keep up the good workout!",
"need improvement!\nTry to adjust your head to align in the center when you are in a sitting position.",
"need improvement!\nTry to adjust your head to align in the center when you are in a sitting position.",
"are done very well!\nYou are doing the Pulse sit up correctly. Keep up the good workout!",
"need improvement!\nYour arms are way too high. Stretch your arms straight when you lift up your torso.",
"need improvement!\nYour arms are way too low. Try to stretch your arms straight when you lift up your torso.",
"are done very well!\nYou are doing the V sit up correctly. Keep up the good workout!",
"need improvement!\nTry to adjust your form to align in the center when you lift up your torso.",
"need improvement!\nTry to adjust your form to align in the center when you lift up your torso.",
"are done super well!\nYou are doing the V sit up correctly. Keep up the good workout!",
"need improvement!\nTry to adjust your arms to align in the center when you lift up your torso.",
"need improvement!\nTry to adjust your arms to align in the center when you lift up your torso.",
".....hmmmm..... You haven't done any exercise, or we're not sure what exercise you did! Please Try Again!"]
var class_Sensor_Position_source = ["on head","on head","on head","on head","on head","on head","on arm","on arm","on arm","on arm","on arm","on arm","",""]
var class_Sensor_Image_Source = ['assets/headband_icon.png','assets/headband_icon.png','assets/headband_icon.png','assets/armband_icon.png','assets/armband_icon.png','assets/armband_icon.png','assets/headband_icon.png','assets/headband_icon.png','assets/headband_icon.png','assets/armband_icon.png','assets/armband_icon.png','assets/armband_icon.png','assets/were_not_sure.png','assets/exercise_icon.png']
var randomWelcomeText = ['TO FEEL THE BURN!', 'FOR TOTAL AWESOMENESS!', 'TO KICK IT!', 'FOR MAXIMUM EXERCISE!', 'FOR TOTAL VICTORY!', 'FOR EYE OF THE TIGER!']; //inspirational sayings when on home screen

var returnedPredictions = [-.11,(13-1)]; //vector that stores returned predictions from edge_impulse.js
var situpsCount = [0,0,0,0,0,0,0,0,0,0,0,0]; //[pulse correct, pulse incorrect, v correct, v incorrect]; initial state, none done
var mostDoneSitup = 9999; //initial state, error code
var mostDoneSitupType = 9999;
var situpStreak = [0,(13-1)]; //[count, class]latest most done situp, used for vibration messaging
var lastClass = (13-1); //check the last class categorized
var situpStreakAlertActive = false; //flag to prevent multiple popups
var elapsedTimePerClass = [0,0,0,0,0,0,0,0,0,0,0,0]; //running tally of seconds for each situp class.
var timeStampOfLastSitupAddition = 0;
var pulseSitupTotalTime = 0;
var vSitupTotalTime = 0;
var avgSecPerSitup = 0.0;
var totalCountPC = 9999; //count Pulse situp done correctly - initial state, error code
var totalCountPI = 9999; //count Pulse situp done WRONG - initial state, error code
var totalCountVC = 9999; //count V situp done correctly - initial state, error code
var totalCountVI = 9999; //count V situp done WRONG - initial state, error code


export default function App() {

  const [runSimulation, setrunSimulation] = useState(runSim); //set state of simulation
  const [isExercising, setIsExercising] = useState(false); //flag of "start exercising" running
  const [accData, setAccData] = useState({}); //latest transmission of current accelerometer data
  const [currentData, setCurrentData] = useState(0); //accelerometer data to SENT to classify
  const [accDataArray, setaccDataArray] = useState([]); //accelerometer data ready to send for classification
  const [currentClassification, setCurrentClassification] = useState([14-1]); //starting state 14, is blank
  const [elapsedTime, setelapsedTime] = useState(0); //elapsed time counter for each exercise
  const [returnedAnomaly, setreturnedAnomaly] = useState(0); //empty state for returned JSON
  const [returnedClass1, setreturnedClass1] = useState(0); //empty state for returned JSON
  const [returnedClass2, setreturnedClass2] = useState(0); //empty state for returned JSON
  const [returnedClass3, setreturnedClass3] = useState(0); //empty state for returned JSON
  const [returnedClass4, setreturnedClass4] = useState(0); //empty state for returned JSON
  const [returnedClass5, setreturnedClass5] = useState(0); //empty state for returned JSON
  const [returnedClass6, setreturnedClass6] = useState(0); //empty state for returned JSON
  const [returnedClass7, setreturnedClass7] = useState(0); //empty state for returned JSON
  const [returnedClass8, setreturnedClass8] = useState(0); //empty state for returned JSON
  const [returnedClass9, setreturnedClass9] = useState(0); //empty state for returned JSON
  const [returnedClass10, setreturnedClass10] = useState(0); //empty state for returned JSON
  const [returnedClass11, setreturnedClass11] = useState(0); //empty state for returned JSON
  const [returnedClass12, setreturnedClass12] = useState(0); //empty state for returned JSON
  const [returnedClassData, setreturnedClassData] = useState([]); //vector of returned data from EC2 Instance
  const [simulatedRawReturnData, setsimulatedRawReturnData] = useState([0.01359375,0.02546875,0.0378125,0.0434375,0.0534375,0.0646875,0.0771875,0.0846875,0.0946875,0.1034375,0.1178125,0.1278125]);
  var returnedSitupCount = 9999;
  var totalTimeExercising = 0;

  function selectPredictedClass(predictedVector) {
    var i;
    var max_class_percent = -0.01;
    var guessed_class = (13-1);
    for (i = 0; i < predictedVector.length; i++) {
      if (predictedVector[i] > max_class_percent) {
        max_class_percent = predictedVector[i];
        guessed_class = i;
      }
    }
    return [max_class_percent, guessed_class];
  }

  function returnUnclearPrediction() {
    //if we arent confident and think the prediction is unclear
    setCurrentClassification(currentClassification => (13-1)); //say we don't know (class 13)
  }

  function round(n) {
  if (!n) {
    return 0;
  }
  return Math.floor(n * 100) / 100;
  }

  function getRandomProbability() {
    return (Math.random() - 0.6); //random number from -.02 to 0.98
  }

  function getRandomClass() {
    return Math.floor(Math.random() * Math.floor(12));
  }

  function getRandomVector() {
    return [getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability()];
  }


  function extractProbabilities(rawData) { //import in text format
    //return vector of probabilities by class.
    //regular expressions:
    var splitData = rawData.replace(/(\.+|\:|\!|\?)(\"*|\'*|\)*|}*|]*)(\s|\n|\r|\r\n)/gm, "$1$2|").split(" ")     //split data into different lines
    var regExZero =  /\+?\d+/; //find empty zeros
    var regExDecimal = /\d+\.\d{0,4}/  //find decimal strings

    //empty dataframes
    var filteredData = [];
    var unorderedData = [];
    var probArray = [];
    var probString = [];
    var returnedClassifications = [];

    for (var linenum = 0; linenum < splitData.length; linenum++) {
      var regExResultZero = splitData[linenum].match(regExZero);
      var regExResultDec = splitData[linenum].match(regExDecimal);
      if (regExResultDec) { //if we extracted a decimal
          filteredData = filteredData.concat(regExResultDec);
      } else if (!regExResultDec && regExResultZero) { //if we didnt find a decimal, but found a zero
          filteredData = filteredData.concat(regExResultZero);
      }
    }

    filteredData.shift(); //get rid of the first value, which is 'anomaly'

    //remove the class labels, and export only the probabilities
    // DANGER: IF THEY ARE NOT IN NUMERICAL ORDER, WE WILL NOT KNOW WHICH CLASS IS WHICH!!!!
    for (var arrayItem = 0; arrayItem < filteredData.length; arrayItem++) {
      if (arrayItem % 2 != 0) {
       unorderedData = unorderedData.concat(filteredData[arrayItem]);
      }
    }

    //because the string comes out in alphabetical order, "10" comes after "1" not after "9"
    //therefore 10,11,12 must be moved to the end of the string, and the string rebuilt
    probArray[0] = unorderedData[0];
    for (var arrayItemss = 1; arrayItemss < 4; arrayItemss++) {
      probArray[arrayItemss+8] = unorderedData[arrayItemss];
    }
    for (var arrayItemzz = 4; arrayItemzz < 12; arrayItemzz++) {
      probArray[arrayItemzz-3] = unorderedData[arrayItemzz];
    }

    //turn the probabilities into a comma separated string, for ease of processing
    for (var arrayItemmm = 0; arrayItemmm < probArray.length; arrayItemmm++) {
      probString = probString.concat(probArray[arrayItemmm],", ");
    }

    return [probArray, probString]; //return an Array of probabilities, and an easy to print String)
  }


  function getMaximumCount(inputVector) {
    //returns the index of the maximum number (needed because react native doesnt have full math functions)
    var i;
    var max_Count = 0;
    var max_Value_Index = (13-1); //intial state, error code
    for (i = 0; i < inputVector.length; i++) {
      if (inputVector[i] > max_Count) {
        max_Count = inputVector[i];
        max_Value_Index = i;
      }
    }
    return max_Value_Index;
  }

  function printDigitalTimeDisplay(inputSeconds) {
    //intakes a count of elapsed seconds, and outputs a formatted elapsed time string
    //MM:SS:CC --> 05:22:12 --> 5 min 22.12 seconds
    var runningSubSec = inputSeconds % 1;
    var runningSec = ((inputSeconds - runningSubSec ) % 60);
    var runningMin = ((inputSeconds - runningSec - runningSubSec) / 60);
    runningSubSec = runningSubSec*100;
    if (runningMin < 10) {
      runningMin = "0" + round(runningMin);
    }
    if (runningSec < 10) {
      runningSec = "0" + round(runningSec);
    }
    if (runningSubSec < 10) {
      runningSubSec = "00";
    }
    var digitalDisplay = runningMin + ":" + runningSec + ":" + runningSubSec;
    return digitalDisplay;
  }

  function createVerbalTimeReadout(inputSeconds) {
    var timeString = "";
    if (inputSeconds < 60) {
        timeString = inputSeconds + " Seconds"
    } else if (inputSeconds < 120) {
        var sec = inputSeconds % 60;
        var min = ((inputSeconds - sec) / 60);
        timeString = min + " Minute, " + sec + " Seconds";
    } else {
        sec = inputSeconds % 60;
        min = ((inputSeconds - sec) / 60);
        timeString = min + " Minutes, " + sec + " Seconds";
    }
  return timeString;
  }

  //state based useEffects

  useEffect(() => {
    _Toggle();
  }, []);

  useEffect(() => {
    return () => {
      _unsubscribe();
    };
  }, []);


  // BELOW ARE REPEATING EVENTS AT A REGULAR INTERVAL (DATA COLLECTION, TRANSMISSION AND CLASSIFICATION)

  //this collects accelerometer data every 1/4 second
  useEffect(() => {
    let intervalCollectAccXYZ = null;
    if (isExercising) {
      intervalCollectAccXYZ = setInterval(() => { //quarter second interval
        setaccDataArray(accDataArray => accDataArray.concat(round(x*adjustment_factor),",",round(y*adjustment_factor),",",round(z*adjustment_factor),","));
        setelapsedTime(elapsedTime => elapsedTime + 0.25);
      }, collectionTimeDelta);
    }
    else if (!isExercising && currentData !== 0)
    {
      clearInterval(intervalCollectAccXYZ);
    }
    return () => clearInterval(intervalCollectAccXYZ);
  }, [isExercising, accDataArray, elapsedTime]);


//this feeds data into the edge impulse model every 2 seconds
  useEffect(() => {
    let intervalGatherAndSend= null;
    if (isExercising) {
        intervalGatherAndSend = setInterval(() => { //two second interval
        setCurrentData(currentData => accDataArray); //record 2 seconds of data
        currentData => accDataArray //record the data to display

        //POST DATA TO AWS
        //////////////////////////////////////////////////////////////////////////////
        if (!runSimulation) { //if actually sent to run
          var accDataSent = new FormData(); //newform
          var accDataSentFlat = ""; //blank string
          for (var value = 0; value < accDataArray.length; value++) { //flattening the array into a string
            accDataSentFlat = accDataSentFlat + accDataArray[value]
          }
          accDataSent.append('acc', accDataSentFlat); //adding the string to the formData
          fetch('http://ec2-54-162-148-238.compute-1.amazonaws.com:5000/accelerometer', {
            method: 'POST',
            body: accDataSent, //sending the formData
          }).then(response => {
            console.log('Post Connection Success!', response)
          }).catch(error => {
            console.error('Post Connection Error!', error);
          })
        }
        //////////////////////////////////////////////////////////////////////////////

        setaccDataArray(accDataArray => []); //clear the 2 second recording
      }, processTimeDelta);
    }
    else if (!isExercising && currentData !== 0)
    {
      clearInterval(intervalGatherAndSend);
    }
    return () => clearInterval(intervalGatherAndSend);
  }, [isExercising, runSimulation, currentData]);


//this processes classifications from edge impulse model every 4 seconds
useEffect(() => {
    let intervalReceiveAndReport = null;
    if (isExercising) {
        intervalReceiveAndReport = setInterval(() => { //four second interval

        if (!runSimulation) { //if actually sent to run
            //GET DATA FROM AWS:
            ///////////////////////////////////////////////////////////////////////////////

            //RECIEVE, JSON IN THIS FORMAT:
            //{
            //  anomaly: 0.000444,
            //  results: [
            //    { label: 'Class_1', value: 0.015319 },
            //    { label: 'Class_10', value: 0.006182 },
            //    { label: 'Class_11', value: 0.000444 },
            //    { label: 'Class_12', value: 0.000444 }
            //    { label: 'Class_2', value: 0.000444 },
            //    { label: 'Class_3', value: 0.006182 },
            //    { label: 'Class_4', value: 0.978056 },
            //    { label: 'Class_5', value: 0.015319 }.
            //    { label: 'Class_6', value: 0.000444 },
            //    { label: 'Class_7', value: 0.000444 },
            //    { label: 'Class_8', value: 0.006182 },
            //    { label: 'Class_9', value: 0.000444 },
            //  ]
            //}

            fetch('http://ec2-54-162-148-238.compute-1.amazonaws.com:5000/accelerometer', {
              method: 'GET',
            }).then(response => response.json())
              .then(responseJson => {
                  setreturnedAnomaly(returnedAnomaly => responseJson.anomaly),
                  setreturnedClass1(returnedClass1 => responseJson.results[0].value),
                  setreturnedClass2(returnedClass2 => responseJson.results[4].value),
                  setreturnedClass3(returnedClass3 => responseJson.results[5].value),
                  setreturnedClass4(returnedClass4 => responseJson.results[6].value),
                  setreturnedClass5(returnedClass5 => responseJson.results[7].value),
                  setreturnedClass6(returnedClass6 => responseJson.results[8].value),
                  setreturnedClass7(returnedClass7 => responseJson.results[9].value),
                  setreturnedClass8(returnedClass8 => responseJson.results[10].value),
                  setreturnedClass9(returnedClass9 => responseJson.results[11].value),
                  setreturnedClass10(returnedClass10 => responseJson.results[1].value),
                  setreturnedClass11(returnedClass11 => responseJson.results[2].value),
                  setreturnedClass12(returnedClass12 => responseJson.results[3].value),
                  console.log('GET JSON Connection Success!', responseJson)
            }).catch(error => {
              console.error('GET JSON Connection Error!', error);
            });

            setreturnedClassData(returnedClassData => [returnedClass1,returnedClass2,returnedClass3,returnedClass4,returnedClass5,returnedClass6,returnedClass7,returnedClass8,returnedClass9,returnedClass10,returnedClass11,returnedClass12]);

            console.log("Returned Anomaly:", returnedAnomaly)
            console.log("Returned Results", returnedClassData);

            //get classification
            returnedPredictions = selectPredictedClass(returnedClassData); //returnedPredictions is an array of [highest_probabily, guessedClass]
            //set classification
            setCurrentClassification(currentClassification => returnedPredictions[1]);
            //validate classification
            if (returnedPredictions[0] < predictionCutoff) { //if we arent at least 20% confident
              returnUnclearPrediction(); //set to class 13
            }
        }
        ///////////////////////////////////////////////////////////////////////////////

        //simulate return;

        if (runSimulation) { //if set to return
           setreturnedClassData(returnedClassData => simulatedRawReturnData);
           if (rapidRandom) {
             returnedPredictions = selectPredictedClass([getRandomVector()[0],getRandomVector()[1],getRandomVector()[2],getRandomVector()[3],getRandomVector()[4],getRandomVector()[5],getRandomVector()[6],getRandomVector()[7],getRandomVector()[8],getRandomVector()[9],getRandomVector()[10],getRandomVector()[11]]);
           } else {
             returnedPredictions = selectPredictedClass(returnedClassData); //returnedPredictions is an array of [highest_probabily, guessedClass]
           }
            //set classification
            setCurrentClassification(currentClassification => returnedPredictions[1]);
            //validate classification
            if (returnedPredictions[0] < predictionCutoff) { //if we arent at least 20% confident
               returnUnclearPrediction(); //set to class 13
            }
        }

        returnedSitupCount = simulatedReturnedSitupCount;
        ///////////////////////////////////////////////////////////////////////////////

        //FOLLOWING FUNCTION IS NOT NEEDED, AS WE EXTRACTED AND ORGANIZED VIA JSON ABOVE - DEPRICATED
        //clean text recieved into an array we can use  (extractProbabilities returns [probArray, probString], where probString is formatted)
        //var returnedClassArray = extractProbabilities(returnedClassData)[0]; //take only the first part of array, an inner array of class prediction probs

        //count situps
        if (currentClassification == (13-1)) { //if were unsure
            situpsCount[0] = situpsCount[0] + 0; //dont add anything (same as 'pass', or 'null')
        } else if (situpStreakAlertActive == false) {
          situpsCount[currentClassification] = situpsCount[currentClassification] + returnedSitupCount; //add to the total situp count
          elapsedTimePerClass[currentClassification] = elapsedTimePerClass[currentClassification] + (elapsedTime - timeStampOfLastSitupAddition);
          timeStampOfLastSitupAddition = elapsedTime;
        }

         ///////////////////////////////////////////////////////////////////////////////
        //CODE THAT CHECKS FOR A RECENT STREAK OF INCORRECT EXERCISE
        if (currentClassification != (1-1) && currentClassification != (4-1) && currentClassification != (7-1) && currentClassification != (10-1)) {
          if (situpStreakAlertActive == false) {
            if (lastClass == currentClassification) {
                situpStreak[0] = situpStreak[0] + 1;
                situpStreak[1] = currentClassification;
            }
          }
        } else {
          situpStreak[0] = 0;
        }

        if (currentClassification != (13-1)) { //if werenot unsure
          lastClass = currentClassification; //reset last class
        }
         ///////////////////////////////////////////////////////////////////////////////

      }, reportTimeDelta);
    }
    else if (!isExercising && currentData !== 0)
    {
      clearInterval(intervalReceiveAndReport);
      currentExerciseRoutine => "";
      displayImprovementFeedback => ""
    }
    return () => clearInterval(intervalReceiveAndReport);
  }, [isExercising, runSimulation, returnedClassData, currentClassification]);


    //this is for simulation only, a 16 second loop to randomly changes the simulatedClass vector
  useEffect(() => {
    let intervalTillNextRandomClass = null;
    if (isExercising) {
      if (runSimulation) {
        intervalTillNextRandomClass = setInterval(() => { //sixteen second interval
          setsimulatedRawReturnData([getRandomVector()[0],getRandomVector()[1],getRandomVector()[2],getRandomVector()[3],getRandomVector()[4],getRandomVector()[5],getRandomVector()[6],getRandomVector()[7],getRandomVector()[8],getRandomVector()[9],getRandomVector()[10],getRandomVector()[11]]); //create a random "fake" server return, for simulation)
        }, (timeTillNextRandomClass*1000));
      }
    }
    else if (!isExercising && currentData !== 0)
    {
      clearInterval(intervalTillNextRandomClass);
    }
    return () => clearInterval(intervalTillNextRandomClass);
  }, [isExercising, runSimulation, simulatedRawReturnData]);


  //STATE CONSTANTS
  const _Toggle = () => {
    if (this._subscription) {
      _unsubscribe();
    } else {
      _subscribe();
    }
  }

  var resetState = false;

  if (!isExercising && currentData == 0) {
    resetState = true;
  }

  //function of start buttons
  toggleEx = () => {
    setIsExercising(!isExercising);
  }

  resetEx = () => {
      //disable exercise state
      setIsExercising(false);

      //compile summary stats
      var sumOfAllEx = 0;
      for (var item=0; item<situpsCount.length; item++) { //get the sum of all situps done
        sumOfAllEx = sumOfAllEx + situpsCount[item]
      }
      if (sumOfAllEx == 0) { //if the sum of exercise is zero
        mostDoneSitup = (13-1); //error code
      } else {
        mostDoneSitup = getMaximumCount(situpsCount) //get the most done situp, the specific class (what and how).
      }
      totalCountPC = situpsCount[1-1] + situpsCount[4-1]; //pulse correct
      totalCountPI = situpsCount[2-1] + situpsCount[3-1] + situpsCount[5-1] + situpsCount[6-1]; //pulse incorrect
      totalCountVC = situpsCount[7-1] + situpsCount[10-1]; //V correct
      totalCountVI = situpsCount[8-1] + situpsCount[9-1] + situpsCount[11-1] + situpsCount[12-1]; //V incorrect

      //see most done situp by type
      if ((totalCountPC+totalCountPI) > (totalCountVC+totalCountVI)) {
          mostDoneSitupType = (1-1); //pulse
      } else if ((totalCountPC+totalCountPI) < (totalCountVC+totalCountVI)) {
          mostDoneSitupType = (7-1); //V
      } else if (mostDoneSitup == (13-1)) {
          mostDoneSitupType = (13-1); //we dont know
      } else {
          mostDoneSitupType = (1-1); //its a tie, just chose pulse
      }

      //see if positiveFeedback is needed (did they do some right but MORE wrong?)
      if (mostDoneSitup !=0 && mostDoneSitup!=3 && mostDoneSitup!=6 && mostDoneSitup!=9) { //if most popular was done incorrectly
        if ((totalCountPC + totalCountVC) > 0) { //if they did any correct situps, positive feedback should be given
          if (totalCountPC > totalCountVC) {
            positiveFeedback = "Pulse Situps are done really well, keep it up!\n\nSome " //positive feedback for pulse, before negative
          } else if (totalCountPC < totalCountVC) {
            positiveFeedback = "V Situps are done really well, keep it up!\n\nSome " //positive feedback for V, before negative
          } else {
            positiveFeedback = "Pulse Situps are done really well, keep it up!\n\nSome " //just pick the first one
          }
        }
      }

      avgSecPerSitup = round( (elapsedTimePerClass[0] + elapsedTimePerClass[1] + elapsedTimePerClass[2] + elapsedTimePerClass[3] + elapsedTimePerClass[4] + elapsedTimePerClass[5] + elapsedTimePerClass[6] + elapsedTimePerClass[7] + elapsedTimePerClass[8] + elapsedTimePerClass[9] + elapsedTimePerClass[10] + elapsedTimePerClass[11]) / (totalCountPC+totalCountPI+totalCountVC+totalCountVI) );

      //total elapsed time
      totalTimeExercising = createVerbalTimeReadout(elapsedTime)
      //totalTimeExercising = printElapsedTimeString(elapsedTime)

      //display summary stats
      if (elapsedTime > 10 || sumOfAllEx != 0) { //if the user has exercised for any length of time or done any situps at all
        showSummaryAlert(); //create a popup box with summary info
      }

      //reset counter states
      setCurrentData(0);
      setelapsedTime(0); //zero out elapsed time
      elapsedTimePerClass = [0,0,0,0,0,0,0,0,0,0,0,0]; //zero out elapsed time
      setCurrentClassification(14-1);
      situpsCount = [0,0,0,0,0,0,0,0,0,0,0,0]; //zero out situps counter
      positiveFeedback = "";
      situpStreak[0] = 0;
      situpStreak[1] = (13-1);
      welcomeTextIteration = randomWelcomeText[selectPredictedClass([getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability()])[1]];

      if (!runSimulation) { //if app actually connecting to server
        setreturnedClassData([]);
      }

      //BELOW IS TO RANDOMIZE DATA FOR TESTING - DISCONNECTED FOR FUNCTIONING APP - DELETE ME
      //simulatedRawReturnData = "{ anomaly: 0, results: [ { label: 'Class_1', value: " + randomReturn[0] + " }, { label: 'Class_10', value: " + randomReturn[9] + " }, { label: 'Class_11', value: " + randomReturn[10] + " }, { label: 'Class_12', value: " + randomReturn[11] + " }, { label: 'Class_2', value: " + randomReturn[1] + " }, { label: 'Class_3', value: " + randomReturn[2] + " }, { label: 'Class_4', value: " + randomReturn[3] + " }, { label: 'Class_5', value: " + randomReturn[4] + " }, { label: 'Class_6', value: " + randomReturn[5] + " }, { label: 'Class_7', value: " + randomReturn[6] + " }, { label: 'Class_8', value: " + randomReturn[7] + " }, { label: 'Class_9', value: " + randomReturn[8] + " }] }" //temporarily create random return string from AWS Node
      if (runSimulation) { //if app is simulating locally
        setsimulatedRawReturnData([getRandomVector()[0],getRandomVector()[1],getRandomVector()[2],getRandomVector()[3],getRandomVector()[4],getRandomVector()[5],getRandomVector()[6],getRandomVector()[7],getRandomVector()[8],getRandomVector()[9],getRandomVector()[10],getRandomVector()[11]]); //temporarily create random return string from AWS Node
        setreturnedClassData(returnedClassData);
      }
  }


  //function of accelerometer
  const _subscribe = () => {
    this._subscription = Accelerometer.addListener((accelerometerData) => {
      setAccData(accelerometerData);
    });
  };

  const _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };

  let { x, y, z } = accData;

  //set acceleromter data collection speed
  Accelerometer.setUpdateInterval(collectionTimeDelta);
  var adjustment_factor = 10; //multiplier for to make it match edge_impulse inputs scale


  //DISPLAY VARIABLE SETTINGS

  if (runSimulation && _subscribe) {
    if (simWarning && rapidRandom || simWarning && rapidSim) {
      connectedText = "DEMO RAPID SIMULATION MODE!";
    } else if (simWarning && !rapidRandom || simWarning && !rapidSim) {
      connectedText = "DEMO MODE!";
    } else if (!simWarning) {
      connectedText = "Connected";
    }
  } else if (!runSimulation && _subscribe) { //if the accelerometer is running
      connectedText = "Connected";
  } else { //if the accelerometer isnt running
      connectedText = "NOT CONNECTED!"; //cue default error codes
  }

  //If app is running, override the error text, and show results
  if (connectedText == "Connected" || connectedText == "DEMO MODE!" || connectedText == "DEMO RAPID SIMULATION MODE!") {
      currentExerciseRoutine = class_routine_text_source[currentClassification];
      if (currentClassification == (14-1)) {
        countOfExercise = "";
      } else {
        countOfExercise = "Pulse Situps | " + (situpsCount[0]+situpsCount[1]+situpsCount[2]+situpsCount[3]+situpsCount[4]+situpsCount[5]) + " count, " + pulseSitupTotalTime + " total\n\nV Situps | " + (situpsCount[6]+situpsCount[7]+situpsCount[8]+situpsCount[9]+situpsCount[10]+situpsCount[11])+" count, "+ vSitupTotalTime + " total";
      }
      displayImprovementFeedback = class_improvement_text_source[currentClassification];
      sensorPosition = class_Sensor_Position_source[currentClassification];
      accDataDump = currentData; //test this function.
  }


  //compile time counter displays
  runningTimeDisplay = printDigitalTimeDisplay(elapsedTime); //text string of digital elapsed time exercising

  //average length of time per situpelapsedTimePerClass
  pulseSitupTotalTime = createVerbalTimeReadout(elapsedTimePerClass[0] + elapsedTimePerClass[1] + elapsedTimePerClass[2] + elapsedTimePerClass[3] + elapsedTimePerClass[4] + elapsedTimePerClass[5]); //time doing pulses
  vSitupTotalTime =  createVerbalTimeReadout(elapsedTimePerClass[6] + elapsedTimePerClass[7] + elapsedTimePerClass[8] + elapsedTimePerClass[9] + elapsedTimePerClass[10] + elapsedTimePerClass[11]); //time doing v

  //POPUP ALERT DISPLAYS
  const showSummaryAlert = () =>
    Alert.alert(
      "Your Workout Summary!",
      "Great Job!\n\nYou worked out for "+totalTimeExercising+"!\n\nYou do a situp in "+ avgSecPerSitup +" seconds on average\n\nPulse Situps | "+(totalCountPC+totalCountPI)+" Total in "+pulseSitupTotalTime+"\nCorrect: "+totalCountPC+",  Incorrect: "+totalCountPI+"\n\nV Situps |  "+(totalCountVC+totalCountVI)+" Total in "+vSitupTotalTime+"\nCorrect: "+totalCountVC+",  Incorrect: "+totalCountVI+"\n\nMost Popular Workout: "+class_routine_text_source[mostDoneSitupType]+"\n\nMost Consistent Workout: "+class_routine_text_source[mostDoneSitup]+"\n\n\nWorkout Feedback:\nYour "+positiveFeedback+class_routine_text_source[mostDoneSitup]+ " " +class_summary_recommendary[mostDoneSitup],
      [
        { text: "Done", onPress: () => console.log("Summary Window Closed") }
      ],
      { cancelable: false }
    );

  const showWrongExerciseAlert = () =>
    Alert.alert(
      "Here's how you can improve!",
      "You have been doing your "+class_routine_text_source[situpStreak[1]]+" incorrectly.\n\nThey "+class_summary_recommendary[situpStreak[1]],
      [
        { text: "Thanks for the feedback!", onPress: () => (Vibration.cancel(), situpStreakAlertActive =  false) }
      ],
      { cancelable: false }
    );

  function createWrongExerciseAlert() {
      situpStreakAlertActive = true; //set flag to prevent more popups
      situpStreak[0] = 0; //reset streak count
      //start a vibration pattern
      Vibration.vibrate(ALERTPATTERN, true);
      //show an alert
      showWrongExerciseAlert(); //will turn off vibration and set flag to allow popups, with pressing ok.
  }

  //haptic feedback and vibration patterns
  const ONE_SECOND_IN_MS = 1000;
  const ALERTPATTERN = [
    0.10 * ONE_SECOND_IN_MS,
    0.25 * ONE_SECOND_IN_MS,
  ];
  const PATTERN_DESC =
    Platform.OS === "android"
      ? "wait 0.1s, vibrate 0.25s"
      : "wait 0.1s, vibrate";

    //display summary stats
  if (situpStreak[0] > 5) { //if the user has repeatedly done the same exercise wrong (correct classes 1, 4, 7, 10 arent added to this count)
    if (situpStreakAlertActive == false) {
      //start a vibration pattern and a summary pop up box
      createWrongExerciseAlert();
    }
  }

  //DISPLAY CODE GRAVEYARD- DELETE ME PRIOR TO MASTER
  //<Image source={{uri: 'https://static.thenounproject.com/png/637461-200.png'}} style={{ height:100, width:100}}/> //how to load remote images
  //<Image style={styles.logo} source={require('assets/headband_icon.png')}/>

  ///////////APP PRIMARY DISPLAY///////////////
  return (
    <View style={styles.backgroundContainer}>
      <View style={styles.outerContainer}>
        <Text style={styles.subtitletext}>
          {resetState ? 'S-14 Project - "West Coast Harvard"' : ''}
        </Text>
        <Text style={styles.superTitleText}>
          {resetState ? '' : 'HSweat'}
        </Text>
        <Text style={resetState ? styles.titletextred : styles.titletext}>
          {resetState ? 'HSweat' : runningTimeDisplay}
        </Text>
        <View style={styles.connectedStatusContainer}>
          <Text style={styles.deviceStatusText}>
            Device Status
          </Text>
          <Text style={styles.connecttext}>
            {connectedText} {sensorPosition}
          </Text>
        </View>
        <View style={styles.innerContainer}>
          <Text style={styles.primaryBoldText}>
            {resetState ? '' : 'Current Workout'}
          </Text>
          <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={null} style={resetState ? styles.dummyblankwhitebutton : styles.dummybuttonfortexthilight}>
            <Text style={styles.dummybuttonhilightedtext}>{resetState ? '' : currentExerciseRoutine}</Text>
          </TouchableOpacity>
          </View>
          <Text style={styles.primaryBoldText}>
            {resetState ? 'Hello!' : 'Workout Counts'}
          </Text>
          <Text style={styles.distext}>
            {resetState ? "HSweat wants to assist you to become healthier and stronger! We're your digital personal trainer: as you workout, we'll keep track of your progress and recommend ways you can improve.\n\nBefore you start your exercise, make sure you attach your device to measure the workout correctly." : countOfExercise}
          </Text>
          <Text style={styles.primaryBoldText}>
            {resetState ? '' : 'Recommendations'}
          </Text>
          <Text style={styles.distext}>
            {resetState ? '' : displayImprovementFeedback }
          </Text>
      </View>
      <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={this.toggleEx} style={styles.onoffbutton}>
            <Text style={styles.onoffbuttonfont}>{isExercising ? '> PAUSE <' : 'Start Workout'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.resetEx} style={resetState ? styles.endbuttongrey : styles.endbuttonblue}>
            <Text style={styles.endbuttonfont}> End </Text>
          </TouchableOpacity>
      </View>
    </View>
  </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: 'white',
    padding: 0,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
  },
  outerContainer: {
    marginTop: 0,
    paddingTop: 0,
    paddingHorizontal: 0,
    backgroundColor: 'white',
    borderRadius: 0,
  },
  connectedStatusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 6,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: '#E4F4FA',
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
    borderRadius: 0,
  },
  innerContainer: {
    padding: 6,
    backgroundColor: 'white',
    marginTop: 0,
    marginBottom: 5,
    borderRadius: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 0,
    paddingHorizontal: 0,
    marginBottom: 10,
  },
  onoffbutton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003370',
    padding: 27,
    margin: 5,
    marginTop: 0,
    borderRadius: 20,
  },
  endbuttongrey: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#CACACA',
    padding: 27,
    margin: 5,
    marginTop: 0,
    borderRadius: 20,
  },
  endbuttonblue: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#3AB1F3',
    padding: 27,
    margin: 5,
    marginTop: 0,
    borderRadius: 20,
  },
  onoffbuttonfont: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  endbuttonfont: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  dummybuttonfortexthilight: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#E4F4FA',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    margin: 0,
    marginTop: 0,
    marginLeft: 18,
    borderRadius: 15,
  },
  dummybuttonhilightedtext: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dummyblankwhitebutton: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlignVertical: 'center',
    backgroundColor: 'white',
    paddingLeft: 1,
    paddingRight: 1,
    paddingTop: 1,
    paddingBottom: 1,
    margin: 0,
    marginTop: 0,
    marginLeft: 18,
  },
  acctext: {
    marginBottom:2,
    textAlign: 'center',
  },
  webtext: {
    margin: 0,
    fontSize: 12,
    textAlign: 'left',
  },
  primaryBoldText: {
    margin: 10,
    marginTop: 5,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  distext: {
    margin: 10,
    marginTop: 0,
    fontSize: 16,
    textAlign: 'left',
  },
  distextblue: {
    margin: 10,
    marginTop: 0,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#2986c3',
  },
  minitext: {
    margin: 10,
    marginTop: 0,
    fontSize: 12,
    fontWeight: 'italic',
    textAlign: 'left',
  },
  subtitletext: {
    margin: 0,
    marginTop: 0,
    fontSize: 18,
    color: 'grey',
    textAlign: 'center',
  },
  superTitleText: {
    margin: 0,
    marginTop: 0,
    marginBottom: 0,
    fontSize: 18,
    color: 'crimson',
    textAlign: 'center',
  },
  titletext: {
    margin: 10,
    marginTop: 0,
    marginBottom: 10,
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2986c3',
  },
  titletextred: {
    margin: 10,
    marginTop: 0,
    marginBottom: 10,
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'crimson',
  },
  timetext: {
    margin: 2,
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  connecttext: {
    margin: 10,
    marginTop: 0,
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  deviceStatusText: {
    margin: 15,
    paddingTop: 0,
    paddingBottom: 5,
    marginTop: 0,
    marginBottom: 0,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  logo: {
    height: 60,
    width: 40,
    borderRadius: 10,
  },
    popupcontainer: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "left"
  }
});
