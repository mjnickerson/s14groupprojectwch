#!/bin/bash
#
#
# This script removes the entries for two MAC addresses
#
# Edit this script to replace the MAC addresses below with 
# those of your SensorTile devices
#
# This script also restarts the bluetooth interface
#

#
# Remove addresses
#

address1=C0:83:41:31:39:48
address2=C0:83:32:31:48:48
bluetoothctl << eof
remove $address1
remove $address2
exit
eof

#
# Restart the bluetooth controller
#

sudo /etc/init.d/bluetooth restart
sleep 1

