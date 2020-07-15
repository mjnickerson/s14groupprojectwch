//
//  Based on Autofilter.c
//  Created by Charles Zaloom on 1/28/18.
//
//
//  Execute:
//  ./Acquire_LowPass_Continuous 0.2 <POSIX_TIME> 1
//  Argument 1 for Low Pass filter is filter cutoff frequency
//  Argument 2 for POSIX time stamp for scheduled execution of data acquisition
//  Argument 3 for enabling filter (value 1) or disabling filter (value 2)
//
//  Compile:
//
//  gcc -o Acquire_LowPass_Continuous_1 Acquire_LowPass_Continuous_1.c -lm -lc -lliquid -lrt
//
//
//  Relies on gatttool interface to BLE Motion system on SensorTile developed by Xu Zhang
//
//
//  Requires motion_data.sh shell script
//
//  Requires that proper device MAC Address be entered into gatttool command in
//  motion_data.sh shell script
//
//  Produces output data file: motion_data_output.csv
//


#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <math.h>
#include <complex.h>
#include <liquid/liquid.h>
#include <unistd.h>
#include <time.h>
#include <signal.h>
#include <pthread.h>
#include <errno.h>

const int BUFF_MAX = 256;

#define OUTPUT_FILE "motion_data_output_1.csv"

#define SAMPLE_PERIOD 0.050

const char SIGNAL_AX[] = "tempfile_ax_1.txt";
const char SIGNAL_AY[] = "tempfile_ay_1.txt";
const char SIGNAL_AZ[] = "tempfile_az_1.txt";

const char SIGNAL_GX[] = "tempfile_gx_1.txt";
const char SIGNAL_GY[] = "tempfile_gy_1.txt";
const char SIGNAL_GZ[] = "tempfile_gz_1.txt";

const char SIGNAL_MX[] = "tempfile_mx_1.txt";
const char SIGNAL_MY[] = "tempfile_my_1.txt";
const char SIGNAL_MZ[] = "tempfile_mz_1.txt";

int char_to_decimal(char letter){

	switch(letter){
		case '0':
			return 0;
		case '1':
			return 1;
		case '2':
			return 2;
		case '3':
			return 3;
		case '4':
			return 4;
		case '5':
			return 5;
		case '6':
			return 6;
		case '7':
			return 7;
		case '8':
			return 8;
		case '9':
			return 9;
		case 'a':
			return 10;
		case 'b':
			return 11;
		case 'c':
			return 12;
		case 'd':
			return 13;
		case 'e':
			return 14;
		case 'f':
			return 15;
		default:
			return -1;
	}
}

int hex_to_decimal_4bit(char seq[4]){//, int twos_comp){
	int sum = char_to_decimal(seq[1]);
	sum += (char_to_decimal(seq[0])*16);
	sum += (char_to_decimal(seq[3])*16*16);
	sum += (char_to_decimal(seq[2])*16*16*16);

	if(sum > 32767) sum = sum - 65536; //twos_comp == 1 &&

	return sum;
}

int hex_to_decimal_time(char seq[4]){
	int sum2 = char_to_decimal(seq[1]);
	sum2 += (char_to_decimal(seq[0])*16);
	int sum1 = char_to_decimal(seq[3]);
	sum1 += (char_to_decimal(seq[2])*16);
	sum1 = (sum1 * 1000) + sum2;
	return sum1;
}

int stream_parser(char raw[BUFF_MAX]){
	int i = 0;
	while(i < BUFF_MAX && raw[i] != ':'){ ++i; }
	i += 2;
	char *ptr = &raw[i];

	int iter = 0;
	char data[40];
	int lock = 0;
	while(iter < 40 && ptr != NULL && *ptr != '\0' && *ptr != '\n'){
		if(lock < 40 && *ptr != ' '){
			data[iter] = *ptr;
			++lock;
			++iter;
		}
        ptr++;
    }

    FILE * out_ax = fopen(SIGNAL_AX,"a");
    FILE * out_ay = fopen(SIGNAL_AY,"a");
    FILE * out_az = fopen(SIGNAL_AZ,"a");

    FILE * out_gx = fopen(SIGNAL_GX,"a");
    FILE * out_gy = fopen(SIGNAL_GY,"a");
    FILE * out_gz = fopen(SIGNAL_GZ,"a");

    FILE * out_mx = fopen(SIGNAL_MX,"a");
    FILE * out_my = fopen(SIGNAL_MY,"a");
    FILE * out_mz = fopen(SIGNAL_MZ,"a");

    int y;
	int index;
   	index = 0;
    for(y = 0; y < 10; y++){
		switch(y){
			case 0:
				//sensortile.timestamp = hex_to_decimal_time(&data[y]);
				break;
			case 1:
				fprintf(out_ax, "%f\n", (float)(hex_to_decimal_4bit(&data[index])));
				break;
			case 2:
				fprintf(out_ay, "%f\n", (float)(hex_to_decimal_4bit(&data[index])));
				break;
			case 3:
				fprintf(out_az, "%f\n", (float)(hex_to_decimal_4bit(&data[index])));
				break;
			case 4:
				fprintf(out_gx, "%f\n", (float)(hex_to_decimal_4bit(&data[index])));
				break;
			case 5:
				fprintf(out_gy, "%f\n", (float)(hex_to_decimal_4bit(&data[index])));
				break;
			case 6:
				fprintf(out_gz, "%f\n", (float)(hex_to_decimal_4bit(&data[index])));
				break;
			case 7:
				fprintf(out_mx, "%f\n", (float)(hex_to_decimal_4bit(&data[index])));
				break;
			case 8:
				fprintf(out_my, "%f\n", (float)(hex_to_decimal_4bit(&data[index])));
				break;
			case 9:
				fprintf(out_mz, "%f\n", (float)(hex_to_decimal_4bit(&data[index])));
				break;
			default:
				return 0;
    	}
	index = index + 4;
    }

    fclose(out_ax);
    fclose(out_ay);
    fclose(out_az);

    fclose(out_gx);
    fclose(out_gy);
    fclose(out_gz);

    fclose(out_mx);
    fclose(out_my);
    fclose(out_mz);

    return 1;
}

unsigned int BLE_parse(const char *inFile){
	FILE* ble_file;
	ble_file = fopen(inFile, "r");

	char raw[BUFF_MAX];

	//
	// Advance line over first line of file
	// since first line of file may be concatenated
	// or may contain header
	//

	fgets(raw, BUFF_MAX, ble_file);

	// Read motion data

	unsigned int iter = 0;
	while(fgets(raw, BUFF_MAX, ble_file)){
		if(stream_parser(raw) == 0) return 0;
		iter++;
	}
	//
	// Decrement iter to ensure that last line of file is eliminated
	// since last line may be concatenated in data transfer
	//

	return iter--;
}

struct filter_options {
	// options
    	unsigned int order; 					//=   4;       // filter order
    	float        fc;    					//=   0.1f;    // cutoff frequency
    	float        f0;    					//=   0.0f;    // center frequency
    	float        Ap;    					//=   1.0f;    // pass-band ripple
    	float        As;    					//=   40.0f;   // stop-band attenuation
    	liquid_iirdes_filtertype ftype;  		//= LIQUID_IIRDES_ELLIP;
    	liquid_iirdes_bandtype   btype; 		//= LIQUID_IIRDES_LOWPASS;
    	liquid_iirdes_format     format; 		//= LIQUID_IIRDES_SOS;
};

void filter(const char *signal, unsigned int n_samples, struct filter_options options){
    	iirfilt_crcf q = iirfilt_crcf_create_prototype(options.ftype, options.btype, options.format, options.order, options.fc, options.f0, options.Ap, options.As);

    	//iirfilt_crcf_print(q);

    	float complex x[n_samples];
    	float complex y[n_samples];

    	FILE *fp = fopen(signal,"r");
    	if(fp == 0){
        	printf("INVALID FILE (filter)\n");
        return;
    	}

    	unsigned int i;
    	for (i=0; i<n_samples; i++){
        	float num;
        	fscanf(fp,"%f",&num);
        	x[i] = num;
        	iirfilt_crcf_execute(q, x[i], &y[i]);
    	}
    	fclose(fp);

    	iirfilt_crcf_destroy(q);

    	FILE *frewrite = fopen(signal,"w");
    	for(i=0; i < n_samples; ++i){
    		fprintf(frewrite, "%f\n", crealf(y[i]));
    	}
    	fclose(frewrite);
}

void makeCSV(unsigned int size){
	FILE *output = fopen(OUTPUT_FILE, "w");
	fprintf(output, "Sample Time, Accel_x,Accel_y,Accel_z,Gyro_x,Gyro_y,Gyro_z,Magneto_x,Magneto_y,Magneto_z\n");

	FILE * out_ax = fopen(SIGNAL_AX,"r");
    	FILE * out_ay = fopen(SIGNAL_AY,"r");
    	FILE * out_az = fopen(SIGNAL_AZ,"r");

    	FILE * out_gx = fopen(SIGNAL_GX,"r");
    	FILE * out_gy = fopen(SIGNAL_GY,"r");
    	FILE * out_gz = fopen(SIGNAL_GZ,"r");

    	FILE * out_mx = fopen(SIGNAL_MX,"r");
    	FILE * out_my = fopen(SIGNAL_MY,"r");
    	FILE * out_mz = fopen(SIGNAL_MZ,"r");

    	unsigned int i;
    	float ax,ay,az,gx,gy,gz,mx,my,mz,sample_time;
    	for(i=0; i<size; ++i){

        sample_time = i*SAMPLE_PERIOD;

		fscanf(out_ax,"%f",&ax);
		fscanf(out_ay,"%f",&ay);
		fscanf(out_az,"%f",&az);

		fscanf(out_gx,"%f",&gx);
		fscanf(out_gy,"%f",&gy);
		fscanf(out_gz,"%f",&gz);

		fscanf(out_mx,"%f",&mx);
		fscanf(out_my,"%f",&my);
		fscanf(out_mz,"%f",&mz);

    		fprintf(output, "%f,%f,%f,%f,%f,%f,%f,%f,%f,%f\n",sample_time, ax,ay,az,gx,gy,gz,mx,my,mz);
    	}
    		fclose(output);

    		fclose(out_ax);
    		fclose(out_ay);
    		fclose(out_az);

    		fclose(out_gx);
    		fclose(out_gy);
    		fclose(out_gz);

    		fclose(out_mx);
    		fclose(out_my);
    		fclose(out_mz);
	}

void rms_comp(const char *signal, unsigned int n_samples, float * t_start, float * t_stop, float * rms_signal) {

	float x[n_samples];
	float num;
	unsigned int i;
	float sample_time;
	float sample_period;
	float signal_mean;
	int sample_count;

	sample_period = SAMPLE_PERIOD;

	FILE *fp = fopen(signal,"r");

        if(fp == 0){
                printf("INVALID FILE (filter)\n");
                return;
        }

	sample_time = 0;
	signal_mean = 0;
	sample_count = 0;
	//
	// Compute mean signal
	//
        for (i=0; i<n_samples; i++){
                sample_time = sample_time + sample_period;
		if (sample_time > * t_start && sample_time < * t_stop){
			fscanf(fp,"%f",&num);
                	x[sample_count] = num;
			signal_mean = signal_mean + x[sample_count];
			sample_count++;
		}
	}

	sample_count--;

	if(sample_count > 0){
		signal_mean = signal_mean / sample_count;
	}

	//
	// Compute rms of zero mean signal within time window
	//

	*rms_signal = 0;
        for (i=0; i<sample_count; i++){
		x[i] = x[i] - signal_mean;
		*rms_signal = *rms_signal + x[i]*x[i];
        }

	*rms_signal = (float)(*rms_signal)/sample_count;
	*rms_signal = (float)sqrt(*rms_signal);
        fclose(fp);
}


void cleanup(){

	if (remove(SIGNAL_AX) != 0)
      		printf("Unable to delete tempfile_ax.txt");
 	if (remove(SIGNAL_AY) != 0)
    		printf("Unable to delete tempfile_ay.txt");
    	if (remove(SIGNAL_AZ) != 0)
    		printf("Unable to delete tempfile_az.txt");

    	if (remove(SIGNAL_GX) != 0)
      		printf("Unable to delete tempfile_gx.txt");
 	if (remove(SIGNAL_GY) != 0)
    		printf("Unable to delete tempfile_gy.txt");
    	if (remove(SIGNAL_GZ) != 0)
    		printf("Unable to delete tempfile_gz.txt");

    	if (remove(SIGNAL_MX) != 0)
      		printf("Unable to delete tempfile_mx.txt");
 	if (remove(SIGNAL_MY) != 0)
    		printf("Unable to delete tempfile_my.txt");
    	if (remove(SIGNAL_MZ) != 0)
    		printf("Unable to delete tempfile_mz.txt");
}


void sig_handler_data_acq_1(int handler_val)
{
			struct timespec handler_exec_time;
			clock_gettime(CLOCK_REALTIME, &handler_exec_time);
			//printf("Current POSIX time at start of data acquisition 1 seconds %i\n",handler_exec_time.tv_sec);
			//printf("Current POSIX time at start of data acquisition 1 nanoseconds %i\n",handler_exec_time.tv_nsec);
			printf("Start lifting for 10 seconds now\n");
			system("bash motion_data_sensortile_1.sh -t 10 -f sensor_data_stream_1.dat");
}

int main(int argc, char *argv[]) {

	float norm_cutoff;
	float norm_centerf;
	float t_start, t_stop;
	float rms_signal;
	unsigned int size;
	char * input_file;
	int n_cycles;
	int cycle_count;
	int filter_enable;
	struct timespec current_time;
	struct itimerspec timer_input_1, timer_output_1;
	int timer_posix_value;
	int return_value_1;
	struct sigevent sig_1;
	timer_t data_acq_timer_1;
	FILE *fp;
	char * sample_count_file;

	if(argc != 4 ){
		printf("Please provide cutoff frequency, POSIX start time, and enable filter setting\n");
		return 0;
		}

	norm_cutoff = atof(argv[1]);
	norm_centerf = 0.0;
	timer_posix_value  = atoi(argv[2]);

	sig_1.sigev_notify = SIGEV_SIGNAL;
	sig_1.sigev_signo = SIGUSR1;
	signal(SIGUSR1, sig_handler_data_acq_1);

	return_value_1 = timer_create(CLOCK_REALTIME, &sig_1, &data_acq_timer_1);
	if (return_value_1 != 0){
			printf("Timer create error:  %d\n", errno);
			timer_delete(data_acq_timer_1);
			return 0;
	}


	printf("POSIX data acq time %i\n",timer_posix_value);

	timer_input_1.it_value.tv_sec = timer_posix_value;
	timer_input_1.it_value.tv_nsec = 0;
	timer_input_1.it_interval.tv_sec = 0;
	timer_input_1.it_interval.tv_nsec = 0;


/*
 * 	Start timer
 */

	return_value_1 = timer_settime(data_acq_timer_1, 1, &timer_input_1, &timer_output_1);

	if (return_value_1 == 0)
		sleep(15);
		else {
		printf("Timer create error:  %d\n", errno);
		timer_delete(data_acq_timer_1);
		return 0;
	}

	system("tail -n 199 sensor_data_stream_1.dat > motion_data_1.dat");

	input_file = "motion_data_1.dat";

	size = BLE_parse(input_file);
	if(size == 0){
			printf("ERROR (stream_parser): BLE Data formatted incorrectly.\n");
		    	return 0;
    	}

	sample_count_file = "sample_count_1.dat";

        fp = fopen(sample_count_file, "w");
	        if (fp == NULL) {
			fprintf(stderr,
			      "Failed to open file \'%s\'.\n",
	                      sample_count_file
	                      );
	                exit(EXIT_FAILURE);
							        }

	printf(" Number of samples acquired task 1 =  %i \n", size);
	fprintf(fp,"%i\n",size);
	fclose(fp);


    	// Filter Documentation:
    	// http://liquidsdr.org/doc/iirdes/

    	struct filter_options butter;
	butter.order =   2;       // filter order
	butter.fc    =   norm_cutoff;    // cutoff frequency
	butter.f0    =   norm_centerf;    // center frequency
	butter.Ap    =   1.0f;    // pass-band ripple
	butter.As    =   60.0f;   // stop-band attenuation
	butter.ftype  = LIQUID_IIRDES_BUTTER;
	butter.btype  = LIQUID_IIRDES_LOWPASS;
	butter.format = LIQUID_IIRDES_SOS;

	if(filter_enable == 1){
	   	filter(SIGNAL_AX,size,butter);
	    	filter(SIGNAL_AY,size,butter);
	    	filter(SIGNAL_AZ,size,butter);
	}

	t_start = SAMPLE_PERIOD;;
	t_stop  = size*SAMPLE_PERIOD;

	rms_comp(SIGNAL_AX,size,&t_start, &t_stop, &rms_signal);

	//printf(" RMS signal amplitude over time window t_start %f to t_step %f = %f\n", t_start, t_stop, rms_signal);

	makeCSV(size);

	//printf(" Filtered motion data for cycle written to output data file\n");

	cleanup();


    	return 0;
}
