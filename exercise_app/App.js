import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert, ActivityIndicator } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import Constants from 'expo-constants';


//TEMPORARY VARIABLES FOR COUNTER - DELETE ME
var simulatedRawReturnData = "{ anomaly: 0, results: [ { label: 'Class_1', value: 0.01359375 }, { label: 'Class_10', value: 0.1034375 }, { label: 'Class_11', value: 0.1178125 }, { label: 'Class_12', value: 0.1278125 }, { label: 'Class_2', value: 0.02546875 }, { label: 'Class_3', value: 0.0378125 }, { label: 'Class_4', value: 0.0434375 }, { label: 'Class_5', value: 0.0534375 }, { label: 'Class_6', value: 0.0646875 }, { label: 'Class_7', value: 0.0771875 }, { label: 'Class_8', value: 0.0846875 }, { label: 'Class_9', value: 0.0946875 }] }"
//var simulatedReturnClasses = [(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12)];
var simulatedReturnedSitupCount = 1;
var randomReturn = [];
var testForceClassGuess = (14-1);


//declare static variables and routines
//time variables
var collectionTimeDelta = (0.25 * 1000); // every one quarter second, 250 milliseconds
var processTimeDelta = (2 * 1000); //every 2 seconds, 2000 milliseconds
var reportTimeDelta = (4 * 1000); //every 4 seconds, 4000 milliseconds

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
"V Sit ups","V Sit ups","V Sit ups","V Sit ups","V Sit ups","Ummm.....","",];
var class_improvement_text_source = ["Great job!\nYou are doing the Pulse sit up correctly. Keep up the good workout! (1)",
"Needs Improvement!\nTry to adjust your head to align in the center when you are in a sitting position. (2)",
"Needs Improvement!\nTry to adjust your head to align in the center when you are in a sitting position. (3)",
"Great job!\nYou are doing the Pulse sit up correctly. Keep up the good workout! (4)",
"Needs Improvement!\nYour arms are way too high. Stretch your arms straight when you lift up your torso. (5)",
"Needs Improvement!\nYour arms are way too low. Try to stretch your arms straight when you lift up your torso. (6)",
"Great job!\nYou are doing the V sit up correctly. Keep up the good workout! (7)",
"Needs Improvement!\nTry to adjust your form to align in the center when you lift up your torso. (8)",
"Needs Improvement!\nTry to adjust your form to align in the center when you lift up your torso. (9)",
"Great job!\nYou are doing the V sit up correctly. Keep up the good workout! (10)",
"Needs Improvement!\nTry to adjust your arms to align in the center when you lift up your torso. (11)",
"Needs Improvement!\nTry to adjust your arms to align in the center when you lift up your torso. (12)",
"Sorry!\nWe're unsure what kind of exercise you're doing -\n Please Try again! (13)",
""];
//below can be modified from strings above to simplify if time allows --> would be easy to just modify the start of the string!
var class_summary_recommendary = ["are done super well!\nYou are doing the Pulse sit up correctly. Keep up the good workout! (1)",
"need improvement!\nTry to adjust your head to align in the center when you are in a sitting position. (2)",
"need improvement!\nTry to adjust your head to align in the center when you are in a sitting position. (3)",
"are done very well!\nYou are doing the Pulse sit up correctly. Keep up the good workout! (4)",
"need improvement!\nYour arms are way too high. Stretch your arms straight when you lift up your torso. (5)",
"need improvement!\nYour arms are way too low. Try to stretch your arms straight when you lift up your torso. (6)",
"are done very well!\nYou are doing the V sit up correctly. Keep up the good workout! (7)",
"need improvement!\nTry to adjust your form to align in the center when you lift up your torso. (8)",
"need improvement!\nTry to adjust your form to align in the center when you lift up your torso. (9)",
"are done super well!\nYou are doing the V sit up correctly. Keep up the good workout! (10)",
"need improvement!\nTry to adjust your arms to align in the center when you lift up your torso. (11)",
"need improvement!\nTry to adjust your arms to align in the center when you lift up your torso. (12)",
".....hmmmm..... You haven't done any exercise, or we're not sure what exercise you did! Please Try Again! (13)"]
var class_Sensor_Position_source = ["Head","Head","Head","Head","Head","Head","Arm","Arm","Arm","Arm","Arm","Arm","Not Sure...",""]
var class_Sensor_Image_Source = ['assets/headband_icon.png','assets/headband_icon.png','assets/headband_icon.png','assets/armband_icon.png','assets/armband_icon.png','assets/armband_icon.png','assets/headband_icon.png','assets/headband_icon.png','assets/headband_icon.png','assets/armband_icon.png','assets/armband_icon.png','assets/armband_icon.png','assets/were_not_sure.png','assets/exercise_icon.png']
var randomWelcomeText = ['TO FEEL THE BURN!', 'FOR TOTAL AWESOMENESS!', 'TO KICK IT!', 'FOR MAXIMUM EXERCISE!', 'FOR TOTAL VICTORY!', 'FOR EYE OF THE TIGER!']; //inspirational sayings when on home screen

var returnedPredictions = [-.11,(13-1)]; //vector that stores returned predictions from edge_impulse.js
var situpsCount = [0,0,0,0,0,0,0,0,0,0,0,0]; //[pulse correct, pulse incorrect, v correct, v incorrect]; initial state, none done
var mostDoneSitup = 9999; //initial state, error code
var totalCountPC = 9999; //count Pulse situp done correctly - initial state, error code
var totalCountPI = 9999; //count Pulse situp done WRONG - initial state, error code
var totalCountVC = 9999; //count V situp done correctly - initial state, error code
var totalCountVI = 9999; //count V situp done WRONG - initial state, error code


//CODE BELOW IS FOR NETWORKING, POSTS AND FETCH
export class FetchData extends React.Component {

  constructor(props) {
    super(props);
    this.state = { isLoading: true };
  }

  //emulating  this: curl -d "acc=TestpostText" http://ec2-54-162-148-238.compute-1.amazonaws.com:5000/accelerometer

  //mount external communication
  componentDidMount() {
    var returnedDataAnomaly = {};
    var returnedDataResults = {};
    return fetch('http://ec2-54-162-148-238.compute-1.amazonaws.com:5000/accelerometer')
      .then(response => response.json())
      .then(responseJson => {
        this.setState(
          {
            isLoading: false,
            returnedDataAnomaly: responseJson.anomaly,
            returnedDataResults: responseJson.results,
          },
          function() {}
        );
      })
      .catch(error => {
        console.error('WCH componentDidMount Get Error!',error);
      });
  }
  render() {
    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, padding: 20 }}>
          <ActivityIndicator />
        </View>
      );
    }

    //console.log(this.state.dataSource);

    //for (var i=0; i < 12; i++) {
    //  console.log(this.state.dataSource[i]);
    //  console.log(this.state.dataSource[i].label);
    //  console.log(this.state.dataSource[i].value);
    //}

    var completeValues = [];
    var completeLabels = [];
    var anomalyValue = this.state.returnedDataAnomaly;
    completeValues = [this.state.returnedDataResults[0].value, this.state.returnedDataResults[4].value, this.state.returnedDataResults[5].value, this.state.returnedDataResults[6].value, this.state.returnedDataResults[7].value, this.state.returnedDataResults[8].value, this.state.returnedDataResults[9].value, this.state.returnedDataResults[10].value, this.state.returnedDataResults[11].value, this.state.returnedDataResults[1].value, this.state.returnedDataResults[2].value, this.state.returnedDataResults[3].value]

    completeLabels = [this.state.returnedDataResults[0].label, this.state.returnedDataResults[4].label, this.state.returnedDataResults[5].label, this.state.returnedDataResults[6].label, this.state.returnedDataResults[7].label, this.state.returnedDataResults[8].label, this.state.returnedDataResults[9].label, this.state.returnedDataResults[10].label, this.state.returnedDataResults[11].label, this.state.returnedDataResults[1].label, this.state.returnedDataResults[2].label, this.state.returnedDataResults[3].label]
  }
}

export default function App() {

  const [isExercising, setIsExercising] = useState(false); //flag of "start exercising" running
  const [accData, setAccData] = useState({}); //latest transmission of current accelerometer data
  const [currentData, setCurrentData] = useState(0); //accelerometer data to SENT to classify
  const [accDataArray, setaccDataArray] = useState([]); //accelerometer data ready to send for classification
  const [currentClassification, setCurrentClassification] = useState([14-1]); //starting state 14, is blank
  const [maxClassPercent, setmaxClassPercent] = useState(-0.1); //default to negative 100% //may not use this or need this
  const [guessedClass, setguessedClass] = useState(13); //starting state 13, we dont know //may not use this or need this
  const [elapsedTime, setelapsedTime] = useState(0); //elapsed time counter for each exercise
  var returnedClassData = []; //vector of returned data from EC2 Instance
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

  function printElapsedTimeString(inputSeconds) {
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
    var runningTimeDisplay = runningMin + ":" + runningSec + ":" + runningSubSec;
    return runningTimeDisplay;
  }

  //TRY OUT FETCHDATA CLASS HERE - HOW DOES IT DEPLOY AND HOW CAN WE GET ACCESS TO THE VARIABLES WHEN WE CREATE AN INSTANCE OF IT

  //console.log(FetchData.render);

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
    let intervalQuarterSec = null;
    if (isExercising) {
      intervalQuarterSec = setInterval(() => { //quarter second interval
        setaccDataArray(accDataArray => accDataArray.concat(round(x*adjustment_factor),",",round(y*adjustment_factor),",",round(z*adjustment_factor),","));
        setelapsedTime(elapsedTime => elapsedTime + 0.25);
      }, collectionTimeDelta);
    }
    else if (!isExercising && currentData !== 0)
    {
      clearInterval(intervalQuarterSec);
    }
    return () => clearInterval(intervalQuarterSec);
  }, [isExercising, accDataArray, elapsedTime]);


//this feeds data into the edge impulse model every 2 seconds
  useEffect(() => {
    let intervalTwoSec = null;
    if (isExercising) {
        intervalTwoSec = setInterval(() => { //two second interval
        setCurrentData(currentData => accDataArray); //record 2 seconds of data
        countOfExercise => currentData;

        //POST DATA TO AWS
        //////////////////////////////////////////////////////////////////////////////
        fetch('http://ec2-54-162-148-238.compute-1.amazonaws.com:5000/accelerometer', {
          method: 'POST', // or 'PUT'
          body: currentData,
        })
        .then(response => response.json())
        .then(currentData => {
          console.log('Success:', currentData);
        })
        .catch((error) => {
          console.error('WCH App Post Error!', error);
        });
        //////////////////////////////////////////////////////////////////////////////

        setaccDataArray(accDataArray => []); //clear the 2 second recording
      }, processTimeDelta);
    }
    else if (!isExercising && currentData !== 0)
    {
      clearInterval(intervalTwoSec);
    }
    return () => clearInterval(intervalTwoSec);
  }, [isExercising, currentData]);


//this 'processes classifications from edge impulse model every 4 seconds
useEffect(() => {
    let intervalFourSec = null;
    if (isExercising) {
        intervalFourSec = setInterval(() => { //four second interval

        //GET DATA FROM AWS:
        ///////////////////////////////////////////////////////////////////////////////
        fetch('http://ec2-54-162-148-238.compute-1.amazonaws.com:5000/accelerometer')
          .then(response => response.json())
          .then(responseJson => {
            this.setState(
              {
                returnedDataAnomaly: responseJson.anomaly,
                returnedDataResults: responseJson.results,
              },
              function() {}
            );
          })
          .catch(error => {
            console.error('WCH App Get Post Error!', error);
          });

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
        ///////////////////////////////////////////////////////////////////////////////

        //simulate return;
        returnedClassData = simulatedRawReturnData;
        returnedSitupCount = simulatedReturnedSitupCount;


        //clean text recieved into an array we can use  (extractProbabilities returns [probArray, probString], where probString is formatted)
        var returnedClassArray = extractProbabilities(returnedClassData)[0]; //take only the first part of array, an inner array of class prediction probs
        //get classification
        returnedPredictions = selectPredictedClass(returnedClassArray); //returnedPredictions is an array of [highest_probabily, guessedClass]
        //set classification
        setCurrentClassification(currentClassification => returnedPredictions[1]);
        //validate classification
        if (returnedPredictions[0] < 0.20) { //if we arent at least 20% confident
          returnUnclearPrediction(); //set to class 13
        }

        if (currentClassification == (13-1)) { //if were unsure
          situpsCount[0] = situpsCount[0] + 0; //dont add anything (same as 'pass', or 'null')
        } else {
          situpsCount[currentClassification] = situpsCount[currentClassification] + returnedSitupCount; //add to the total situp count
        }

        //HERE INSERT CODE THAT CHECKS FOR A RECENT STREAK OF INCORRECT EXERCISES
        //ACTIVATES HAPTIC VIBRATION PATTERN TO ALERT USER IT NEEDS ATTENTION!
        //VIBRATION FUNCTION IS CHECKED TO BE ACTIVATED EVERY 4 SECONDS
        //NEEDS A POP UP WINDOW THAT CAN BE CLOSED TO TURN THE VIBRATION OFF

      }, reportTimeDelta);
    }
    else if (!isExercising && currentData !== 0)
    {
      clearInterval(intervalFourSec);
      currentExerciseRoutine => "";
      displayImprovementFeedback => ""
    }
    return () => clearInterval(intervalFourSec);
  }, [isExercising, currentClassification]);

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
        mostDoneSitup = getMaximumCount(situpsCount) //get the most done situp.
      }
      totalCountPC = situpsCount[1-1] + situpsCount[4-1]; //pulse correct
      totalCountPI = situpsCount[2-1] + situpsCount[3-1] + situpsCount[5-1] + situpsCount[6-1]; //pulse incorrect
      totalCountVC = situpsCount[7-1] + situpsCount[10-1]; //V correct
      totalCountVI = situpsCount[8-1] + situpsCount[9-1] + situpsCount[11-1] + situpsCount[12-1]; //V incorrect

      //see if positiveFeedback is needed (did they do some right but MORE wrong?)
      if (mostDoneSitup !=0 && mostDoneSitup!= 3 && mostDoneSitup!= 6 && mostDoneSitup!= 9) { //if most popular was done incorrectly
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

      //compile time summary
      if (elapsedTime < 60) {
          totalTimeExercising = elapsedTime + " Seconds"
      } else {
          var sec = elapsedTime % 60;
          var min = ((elapsedTime - sec) / 60);
          totalTimeExercising = min + " Minutes, " + sec + " Seconds";
      }

      //display summary stats
      if (elapsedTime != 0) { //if the user has exercised for any length of time
        createSummaryAlert(); //create a popup box with summary info
      }

      //reset counter states
      setCurrentData(0);
      setelapsedTime(0);
      setCurrentClassification(14-1);
      setmaxClassPercent(-0.1);
      setguessedClass(14-1);
      situpsCount = [0,0,0,0,0,0,0,0,0,0,0,0]; //zero out situps counter
      positiveFeedback = "";
      welcomeTextIteration = randomWelcomeText[selectPredictedClass([getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability()])[1]];

      //simulatedReturnClasses = getRandomVector(); //temporary to randomize function data
      randomReturn = getRandomVector(); //temporary to randomize function data
      simulatedRawReturnData = "{ anomaly: 0, results: [ { label: 'Class_1', value: " + randomReturn[0] + " }, { label: 'Class_10', value: " + randomReturn[9] + " }, { label: 'Class_11', value: " + randomReturn[10] + " }, { label: 'Class_12', value: " + randomReturn[11] + " }, { label: 'Class_2', value: " + randomReturn[1] + " }, { label: 'Class_3', value: " + randomReturn[2] + " }, { label: 'Class_4', value: " + randomReturn[3] + " }, { label: 'Class_5', value: " + randomReturn[4] + " }, { label: 'Class_6', value: " + randomReturn[5] + " }, { label: 'Class_7', value: " + randomReturn[6] + " }, { label: 'Class_8', value: " + randomReturn[7] + " }, { label: 'Class_9', value: " + randomReturn[8] + " }] }" //temporarily create random return string from AWS Node
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

  if (_subscribe) { //if the accelerometer is running
      connectedText = "CONNECTED!";
  } else { //if the accelerometer isnt running
      connectedText = "DISCONNECTED!"; //cue default error codes
  }

  if (connectedText == "CONNECTED!") {
      currentExerciseRoutine = class_routine_text_source[currentClassification];
      if (currentClassification == (14-1)) {
        countOfExercise = "";
      } else {
        countOfExercise = "Pulse Situps: " + (situpsCount[0]+situpsCount[1]+situpsCount[2]+situpsCount[3]+situpsCount[4]+situpsCount[5]) + ";  V Situps: " + (situpsCount[6]+situpsCount[7]+situpsCount[8]+situpsCount[9]+situpsCount[10]+situpsCount[11]) +";";
      }
      displayImprovementFeedback = class_improvement_text_source[currentClassification];
      sensorPosition = class_Sensor_Position_source[currentClassification];
      accDataDump = currentData; //test this function.
      returnClassDataDump = extractProbabilities(simulatedRawReturnData)[1]; //test this function.
  }


  //compile time counter displays
  runningTimeDisplay = printElapsedTimeString(elapsedTime)

  //POPUP ALERT DISPLAYS

  const createSummaryAlert = () =>
    Alert.alert(
      "Your Workout Summary!",
      "Great Job!\n\nYou worked out for "+totalTimeExercising+"!\n\nPulse Situps: "+(totalCountPC+totalCountPI)+"\nCorrect: "+totalCountPC+",  Incorrect: "+totalCountPI+"\n\nV Situps: "+(totalCountVC+totalCountVI)+"\nCorrect: "+totalCountVC+",  Incorrect: "+totalCountVI+"\n\nMost Popular Workout: "+class_routine_text_source[mostDoneSitup]+"\n\n\nWorkout Feedback:\nYour "+positiveFeedback+class_routine_text_source[mostDoneSitup]+ " " +class_summary_recommendary[mostDoneSitup],
      [
        { text: "Feel the Burn!", onPress: () => console.log("Summary Window Closed") }
      ],
      { cancelable: false }
    );

  //APP PRIMARY DISPLAY

  //DISPLAY CODE GRAVEYARD- DELETE ME PRIOR TO MASTER
  //<Image source={{uri: 'https://static.thenounproject.com/png/637461-200.png'}} style={{ height:100, width:100}}/> //how to load remote images

  return (
    <View style={styles.backgroundContainer}>
      <Text style={styles.subtitletext}>
        {resetState ? 'S-14 Project - "West Coast Harvard"' : ''}
      </Text>
      <Text style={styles.titletext}>
        {resetState ? 'Home Exercise Application' : ''}
      </Text>
      <View style={styles.outerContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={this.toggleEx} style={styles.onoffbutton}>
            <Text>{isExercising ? '> PAUSE EXERCISE <' : 'Start Exercising!'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.resetEx} style={styles.endbutton}>
            <Text>{isExercising ? runningTimeDisplay : 'End Exercise'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.innerContainer}>
          <Text style={styles.paragraph}>
            {resetState ? '' : 'Current Exercise Routine'}
          </Text>
          <Text style={styles.distext}>
            {currentExerciseRoutine}
          </Text>
          <Text style={styles.paragraph}>
            {resetState ? 'GET READY' : 'Exercise Rep Count'}
          </Text>
          <Text style={styles.distext}>
            {countOfExercise}
          </Text>
          <Text style={styles.paragraph}>
            {resetState ? welcomeTextIteration : 'Recommended Improvement'}
          </Text>
          <Text style={styles.distext}>
            {displayImprovementFeedback}
          </Text>
          <Text>
            {resetState ? '' : 'Sensor Position'}
          </Text>
          <Text style={styles.positiontext}>
            {sensorPosition}
          </Text>
          <Image style={styles.logo} source={require('assets/headband_icon.png')}/>
          <Text>
            Device Status
          </Text>
          <Text style={styles.connecttext}>
            {connectedText}
          </Text>
      </View>
      <Text style={styles.acctext}>
          ACC_X: {round(x*adjustment_factor)}     ACC_Y: {round(y*adjustment_factor)}     ACC_Z: {round(z*adjustment_factor)}
      </Text>
    </View>
    <Text style={styles.minitext}>
        Accelerometer Data - Output: {accDataDump}
    </Text>
        <Text style={styles.minitext}>
        Returned Classifications - Input: {returnClassDataDump}
    </Text>
  </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: 'skyblue',
    padding: 20,
    marginBottom: 0,
  },
  outerContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: 'lightblue',
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 20,
  },
  onoffbutton: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgreen',
    padding: 20,
    margin: 5,
    borderRadius: 10,
  },
  resetbutton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
  endbutton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'pink',
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
  acctext: {
    marginBottom:2,
    textAlign: 'center',
  },
  webtext: {
    margin: 0,
    fontSize: 12,
    textAlign: 'center',
  },
  paragraph: {
    margin: 10,
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  distext: {
    margin: 10,
    marginTop: 0,
    fontSize: 16,
    fontWeight: 'italic',
    textAlign: 'center',
  },
  minitext: {
    margin: 10,
    marginTop: 0,
    fontSize: 12,
    fontWeight: 'italic',
    textAlign: 'center',
  },
  subtitletext: {
    margin: 10,
    marginTop: 0,
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  timetext: {
    margin: 2,
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titletext: {
    margin: 10,
    marginTop: 0,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  connecttext: {
    margin: 10,
    marginTop: 0,
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
  },
  positiontext: {
    margin: 10,
    marginTop: 0,
    marginBottom: 0,
    fontSize: 16,
    color: 'blue',
    textAlign: 'center',
  },
  logo: {
    height: 80,
    width: 60,
    borderRadius: 10, 
  },
    popupcontainer: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center"
  }
});
