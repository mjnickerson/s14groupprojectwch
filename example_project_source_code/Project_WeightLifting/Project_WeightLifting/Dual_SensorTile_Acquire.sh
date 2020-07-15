#!/bin/bash
#
# Usage sensor_sample.sh -t <TIME IN SECONDS> 
#
#
while getopts t: option
do
	case "${option}"
	in
 		   t) TIME_OFFSET=${OPTARG};;
        esac
done

CURRENT_TIME=$(date +%s)

echo Current Time: $CURRENT_TIME
TRIGGER_TIME=$(($CURRENT_TIME+$TIME_OFFSET))
echo Trigger Time: $TRIGGER_TIME

TRIGGER_TIME2=$((TRIGGER_TIME + 1))
echo Trigger Time2: $TRIGGER_TIME2

./Acquire_LowPass_Continuous_1 0.1 $TRIGGER_TIME 1 &
./Acquire_LowPass_Continuous_2 0.1 $TRIGGER_TIME2 1 &

sleep_time=$(($TIME_OFFSET+12))
sleep $sleep_time

cp motion_data_output_1.csv temp1
cp motion_data_output_2.csv temp2

./sample_file_sync temp1 temp2 motion_data_output_1.csv motion_data_output_2.csv 

rm temp1
rm temp2

./sensorExtract
./test
