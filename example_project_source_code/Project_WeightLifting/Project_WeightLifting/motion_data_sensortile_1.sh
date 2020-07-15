#!/bin/bash
#
# Enter Device MAC Address and output file name as required
#
# Note 10 second acquisition period
#

gatttool -b C0:83:41:31:39:48 -t random --char-write-req --handle=0x0012 --value=0100 --listen > sensor_data_stream_1.dat

#sleep 10 

# pkill gatttool

