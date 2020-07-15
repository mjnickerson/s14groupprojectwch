
#!/bin/sh

#
# Usage: enter input filenames for cross correlation computation and sampling rate (Hz)
#


if [ "$#" -ne 3 ]; then
	echo "Enter Input File Names and Sampling Rate(Hz)"
	    exit
    fi

./waveform_feature_xcorr $1 $2 xcorr_output.csv $3
gnuplot xcorr_autocorr_gnuplot_script
sudo cp xcorr_autocorr_plot.png /var/www/html/graphics 
echo "If no error reported, view image at http://beaglebone.local:8080/graphics/xcorr_autocorr_plot.png"
gnuplot xcorr_cross_corr_gnuplot_script
sudo cp xcorr_cross_corr_file_1_x_axis-file_2_y_axis_plot.png /var/www/html/graphics
echo "If no error reported, view image at http://beaglebone.local:8080/graphics/xcorr_cross_corr_file_1_x_axis-file_2_y_axis_plot.png"
sudo cp xcorr_cross_corr_file_1_x_axis-file_2_y_axis_plot.png /var/www/html/graphics
echo "If no error reported, view image at http://beaglebone.local:8080/graphics/xcorr_cross_corr_file_1_y_axis-file_2_x_axis_plot.png"
