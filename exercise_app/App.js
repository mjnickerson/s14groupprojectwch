import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import Constants from 'expo-constants';


//TEMPORARY VARIABLES FOR COUNTER - DELETE ME
var simulatedReturnClasses = [(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12),(1/12)];
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
var accDataDump = "<no raw data>"

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
var class_Sensor_Position_source = ["Head","Head","Head","Head","Head","Head","Arm","Arm","Arm","Arm","Arm","Arm","Not Sure...",""]
var class_Sensor_Image_Source = ['assets/headband_icon.png','assets/headband_icon.png','assets/headband_icon.png','assets/armband_icon.png','assets/armband_icon.png','assets/armband_icon.png','assets/headband_icon.png','assets/headband_icon.png','assets/headband_icon.png','assets/armband_icon.png','assets/armband_icon.png','assets/armband_icon.png','assets/were_not_sure.png','assets/exercise_icon.png']

var returnedPredictions = [-.11,(13-1)];

export default function App() {

  const [isExercising, setIsExercising] = useState(false); //flag of "start exercising" running
  const [accData, setAccData] = useState({}); //latest transmission of current accelerometer data
  const [currentData, setCurrentData] = useState(0); //accelerometer data to SENT to classify
  const [accDataArray, setaccDataArray] = useState([]); //accelerometer data ready to send for classification
  const [currentClassification, setCurrentClassification] = useState([14-1]); //starting state 14, is blank
  const [situpsCount, setsitupsCount] = useState([0,0]); //vector that records count of exercises done
  const [maxClassPercent, setmaxClassPercent] = useState(-0.1); //default to negative 100% //may not use this or need this
  const [guessedClass, setguessedClass] = useState(13); //starting state 13, we dont know //may not use this or need this

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
      }, collectionTimeDelta); 
    }
    else if (!isExercising && currentData !== 0)
    {
      clearInterval(intervalQuarterSec);
    }
    return () => clearInterval(intervalQuarterSec);
  }, [isExercising, accDataArray]);

//this feeds data into the edge impulse model every 2 seconds 
  useEffect(() => {
    let intervalTwoSec = null;
    if (isExercising) {
        intervalTwoSec = setInterval(() => { //two second interval
        setCurrentData(currentData => accDataArray); //record 2 seconds of data
        countOfExercise => currentData; 
        //here to send to run_impulse.js function //pass it to run_impulse.js
        setaccDataArray(accDataArray => []); //clear the 2 second recording
      }, processTimeDelta);
    }
    else if (!isExercising && currentData !== 0)
    {
      clearInterval(intervalTwoSec);
    }
    return () => clearInterval(intervalTwoSec);
  }, [isExercising, currentData]); 


//this 'processes classifications from edge impulse model every 2 seconds
useEffect(() => {
    let intervalFourSec = null;
    if (isExercising) {
        intervalFourSec = setInterval(() => { //two second interval

        //get classification 
        returnedPredictions = selectPredictedClass(simulatedReturnClasses); //returnedPredictions is an array of [highest_probabily, guessedClass]

        setCurrentClassification(currentClassification => returnedPredictions[1]); //set classification

        if (returnedPredictions[0] < 0.20) { //if we arent at least 20% confident
          returnUnclearPrediction();
        }

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
  };

  //function of start buttons
  toggleEx = () => {
    setIsExercising(!isExercising);
  }
  
  resetEx = () => {
      setCurrentData(0);
      setIsExercising(false);
      setCurrentClassification(14-1);
      setmaxClassPercent(-0.1)
      setguessedClass(14-1);
      setsitupsCount([0,0]);
      simulatedReturnClasses = getRandomVector(); //temporary to randomize function data
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
      accDataDump = currentData;
      countOfExercise = situpsCount;
      currentExerciseRoutine = class_routine_text_source[currentClassification];
      displayImprovementFeedback = class_improvement_text_source[currentClassification];
      sensorPosition = class_Sensor_Position_source[currentClassification];
  }

  //APP DISPLAY

  return (
    <View style={styles.backgroundContainer}>
      <Text style={styles.subtitletext}>
        S-14 Project - 'West Coast Harvard'
      </Text> 
      <Text style={styles.titletext}>
        Home Exercise Application
      </Text>
      <View style={styles.outerContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={this.toggleEx} style={styles.onoffbutton}>
            <Text>{isExercising ? '> Stop Exercise <' : 'Start Exercising!'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.resetEx} style={styles.resetbutton}>
            <Text>Reset</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.text}>
          ACC_X: {round(x*adjustment_factor)}     ACC_Y: {round(y*adjustment_factor)}     ACC_Z: {round(z*adjustment_factor)}
        </Text>
        <View style={styles.innerContainer}>
          <Text style={styles.paragraph}>
            Current Exercise Routine
          </Text>
          <Text style={styles.distext}>
            {currentExerciseRoutine}
          </Text>
          <Text style={styles.paragraph}>
            Exercise Rep Count  
          </Text>
          <Text style={styles.distext}>
            {countOfExercise} Situps
          </Text>
          <Text style={styles.paragraph}>
            Recommended Improvement
          </Text>
          <Text style={styles.distext}>
            {displayImprovementFeedback}
          </Text>
          <Text>
            Sensor Position
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
    </View>
    <Text style={styles.distext}>
        Accelerometer Data Dump: {accDataDump}
    </Text>
  </View>   
  );
}

function round(n) {
  if (!n) {
    return 0;
  }
  return Math.floor(n * 100) / 100;
}

function getRandomProbability() {
  return (Math.random() - 0.02); //random number from -.02 to 0.98
}

function getRandomVector() {
  return [getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability(),getRandomProbability()];
}

function getRandomClass() {
  return Math.floor(Math.random() * Math.floor(12));
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
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#def1fc',
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
  text: {
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
  subtitletext: {
    margin: 10,
    marginTop: 0,
    fontSize: 18,
    color: 'red',
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
  }
});
