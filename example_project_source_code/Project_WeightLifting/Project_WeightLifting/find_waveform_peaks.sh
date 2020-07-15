#!/bin/sh

#
# Usagei: enter input file name and peak find threshold values for X and Y axes 
#


if [ "$#" -ne 3 ]; then
	    echo "Enter Input File Name and X and Y axis peak find threshold"
	    exit
    fi

./waveform_peak_find $1 waveform_peaks_output_x.csv waveform_gnuplot_x.csv waveform_peaks_output_y.csv waveform_gnuplot_y.csv $2 $3
gnuplot waveform_gnuplot_script
sudo cp waveform_plot.png /var/www/html/graphics 
echo "If no error is reported, view the plot image at http://<Beaglebone IP Address>:8080/graphics/waveform_plot.png"

