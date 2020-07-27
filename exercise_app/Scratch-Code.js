import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import Constants from 'expo-constants';

export default function App() {
  const [data, setData] = useState({});

  useEffect(() => {
    _toggle();
  }, []);

  useEffect(() => {
    return () => {
      _unsubscribe();
    };
  }, []);

  const _toggle = () => {
    if (this._subscription) {
      _unsubscribe();
    } else {
      _subscribe();
    }
  };

  const _slow = () => {
    Accelerometer.setUpdateInterval(1000);
  };

  const _fast = () => {
    Accelerometer.setUpdateInterval(16);
  };

  const _subscribe = () => {
    this._subscription = Accelerometer.addListener((accelerometerData) => {
      setData(accelerometerData);
    });
  };

  const _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };

  let { x, y, z } = data;

  let { currentExerciseRoutine, countOfExercise, displayImprovementFeedback } = 0;

  return (
    <View style={styles.outerContainer}>
      <View style={styles.sensor}>
        <Text style={styles.text}>
          Accelerometer: (in Gs where 1 G = 9.81 m s^-2)
        </Text>
        <Text style={styles.text}>
          x: {round(x)} y: {round(y)} z: {round(z)}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={_toggle} style={styles.button}>
            <Text>Start Exercise!</Text>
          </TouchableOpacity>
          //<TouchableOpacity
          //  onPress={_slow}
          //  style={[styles.button, styles.middleButton]}>
          //  <Text>Slow</Text>
          //</TouchableOpacity>
          //<TouchableOpacity onPress={_fast} style={styles.button}>
          //  <Text>Fast</Text>
          //</TouchableOpacity>
        </View>
        <View style={styles.summaryContainer}>
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
            {countOfExercise}
          </Text>
          <Text style={styles.paragraph}>
            Recommended Improvement
          </Text>
          <Text style={styles.distext}>
            {displayImprovementFeedback}
          </Text>    
          <Image style={styles.logo} source={require('assets/headband_icon.png')} />
          <Text>
            Device Status
          </Text>
          <Text style={styles.connecttext}>
            CONNECTED!
          </Text> 
      </View>
    </View>
  </View>   
  );
}

function round(n) {
  if (!n) {
    return 0;
  }

  return Math.floor(n * 100) / 100;
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: 'skyblue',
    padding: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  sensor: {
    marginTop: 45,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  text: {
    textAlign: 'center',
  },
  summaryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'lightblue',
  },
  paragraph: {
    margin: 24,
    marginTop: 0,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  distext: {
    margin: 24,
    marginTop: 0,
    fontSize: 16,
    fontWeight: 'italic',
    textAlign: 'center',
  },
  connecttext: {
    margin: 24,
    marginTop: 0,
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
  },
  logo: {
    height: 150,
    width: 200,
  }
});
