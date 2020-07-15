/*
 * 	waveform_peak_find.c applies search algorithm for detection of
 * 	waveform excursions corresponding to peak and trough values.
 *
 * 	Waveform excursion algorithm selects maxima and minima in 
 * 	waveforms that meet the condition that the associated excursion
 * 	in signal level between maxima and minima exceed a threshold
 *
 *	Compile with:
 *
 *	gcc -o waveform_peak_find waveform_peak_find.c -lm
 *
 *	Usage command line arguments include:
 *
 *	1) Input data filename provided by Acquire_LowPass_Continuous.c or similar format
 *	2) Waveform peaks data file for X axis
 *	3) Waveform data file for gnuplot processing containing X axis data
 *	4) Waveform peaks data file for Y axis
 *	5) Waveform data file for gnuplot processing containing Y axis data
 *	6) Peak search threshold for X axis data
 *	7) Peak search threshold for Y axis data
 *
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <math.h>

#define BUFF_SIZE 1024

/*
 * sets first <n> values in <*arr> to <val>
 */

void clear_buffer(float *arr, float val, int n) 
{
	int i;
	for (i = 0; i < n; i++) {
		arr[i] = val;
	}
}

/*
 * Calculates mean of first <n> samples in <*arr>
 */
float calculate_mean(float *arr, int n)
{
	float total;
	int i;

	total = 0.0f;
	for (i = 0; i < n; i++) {
		total += arr[i];
	}

	return total/((float) n);
}

int 
find_peaks_and_troughs(
		float *arr, 	// signal 
		int n_samples, 	// number of samples present in the signal
		float E, 	// threshold for peak detection
		// arrays that will store the indicies of the located
		// peaks and troughs
		float *P, float *T,
		// number of peaks (n_P) and number of troughs (n_T)
		// found in the data set *arr
		int *n_P, int *n_T
		)
{
	int a, b, i, d, _n_P, _n_T;

	i = -1; d = 0; a = 0; b = 0;
	_n_P = 0; _n_T = 0;

	clear_buffer(P, 0.0f, n_samples);
	clear_buffer(T, 0.0f, n_samples);

	while (i != n_samples) {
		i++;
		if (d == 0) {
			if (arr[a] >= (arr[i] + E)) {
				d = 2;
			} else if (arr[i] >= (arr[b] + E)) {
				d = 1;
			}
			if (arr[a] <= arr[i]) {
				a = i;
			} else if (arr[i] <= arr[b]) {
				b = i;
			}
		} else if (d == 1) {
			if (arr[a] <= arr[i]) {
				a = i;
			} else if (arr[a] >= (arr[i] + E)) {
				/*
				 * Peak has been detected.
				 * Add index at detected peak
				 * to array of peak indicies
				 * increment count of peak indicies
				 */
				P[_n_P] = a;
				_n_P++;
				b = i;
				d = 2;
			}
		} else if (d == 2) {
			if (arr[i] <= arr[b]) {
				b = i;
			} else if (arr[i] >= (arr[b] + E)) {
				/*
				 * Trough has been detected.
				 * Add index at detected trough
				 * to array of trough indicies
				 * increment count of trough indicies
				 */
				T[_n_T] = b;
				_n_T++;
				a = i;
				d = 1;
			}
		}
	}

	(*n_P) = _n_P;
	(*n_T) = _n_T;
	return 0;
}

int main(int argc, char **argv)
{
	int i, idx;
	int rv;
	/* Variables for reading file line by line */
	char *ifile_name, *x_ofile_pt_name, *x_ofile_st_name, *y_ofile_pt_name, *y_ofile_st_name;
	FILE *fp;
	char *line = NULL;
	size_t len = 0;
	ssize_t read;
	int N_SAMPLES;

	/* Variables for storing the data and storing the return values */
	float *t, *x, *y, *z; 	// variables for data collected from input file
	float pk_threshold_x, pk_threshold_y;		// pk-threshold value
       	/* Variables for peak-trough detection */	
	float *P_i_x, *P_i_y; 	// indicies of each peak found by peak detection
	float *T_i_x, *T_i_y; 	// indicies of each trough found by trough detection
	int n_P_x, n_P_y; 	// number of peaks
	int n_T_x, n_T_y; 	// number of troughs

	/*
	 * Check if the user entered the correct command line arguments
	 * Usage: 
	 * ./extract_stride_data <ifile_name> <output_peaks_x> <output_waveform_y> 
	 * <output_peaks_y> <output_waveform_y> <threshold_value>
	 */



	        if (argc != 8) {
	               fprintf(stderr, 
	                      "Error - check usage\n"
			      );
		  	exit(EXIT_FAILURE);
		}


		ifile_name = argv[1];
                x_ofile_pt_name = argv[2];
                x_ofile_st_name = argv[3];
		y_ofile_pt_name = argv[4];
		y_ofile_st_name = argv[5];

                pk_threshold_x = atof(argv[6]);
		pk_threshold_y = atof(argv[7]);


	/* open the input file */
	printf(" Input file \'%s\'.\n", ifile_name);
	fp = fopen(ifile_name, "r");
	if (fp == NULL) {
		fprintf(stderr, 
				"Failed to read from file \'%s\'.\n", 
				ifile_name
		       );
		exit(EXIT_FAILURE);
	}

	/* count the number of lines in the file */
	read = getline(&line, &len, fp); //discard header of file
	N_SAMPLES = 0;
	while ((read = getline(&line, &len, fp)) != -1) {
		N_SAMPLES++;
	}

	/* go back to the start of the file so that the data can be read */
	rewind(fp);
	read = getline(&line, &len, fp); //discard header of file

	/* start reading the data from the file into the data structures */
	i = 0;
	t = (float *) malloc(sizeof(float) * N_SAMPLES);
	x = (float *) malloc(sizeof(float) * N_SAMPLES);
	y = (float *) malloc(sizeof(float) * N_SAMPLES);
	z = (float *) malloc(sizeof(float) * N_SAMPLES);
	while ((read = getline(&line, &len, fp)) != -1) {
		/* parse the data */
		rv = sscanf(line, "%f,%f,%f,%f\n", &t[i], &x[i], &y[i], &z[i]);
		if (rv != 4) {
			fprintf(stderr,
					"%s %d \'%s\'. %s.\n",
					"Failed to read line",
					i,
					line,
					"Exiting"
			       );
			exit(EXIT_FAILURE);
		}
		i++;
	}
	fclose(fp);


	/* 
	 * From selected thresholds, 
	 * find indicies of peaks
	 * find indicies of troughs
	 */
	printf("Thresholds for X axis signal: %f and Y axis signal: %f\n", pk_threshold_x, pk_threshold_y);
	P_i_x = (float *) malloc(sizeof(float) * N_SAMPLES);
	T_i_x = (float *) malloc(sizeof(float) * N_SAMPLES);
	rv = find_peaks_and_troughs(
			x, 
			N_SAMPLES, 
			pk_threshold_y, 
			P_i_x, T_i_x, 
			&n_P_x, &n_T_x);
	if (rv < 0) {
		fprintf(stderr, "find_peaks_and_troughs failed\n");
		exit(EXIT_FAILURE);
	}

        P_i_y = (float *) malloc(sizeof(float) * N_SAMPLES);
        T_i_y = (float *) malloc(sizeof(float) * N_SAMPLES);
        rv = find_peaks_and_troughs(
                        y, 
                        N_SAMPLES, 
                        pk_threshold_y, 
                        P_i_y, T_i_y, 
                        &n_P_y, &n_T_y);
        if (rv < 0) {
        fprintf(stderr, "find_peaks_and_troughs failed\n");
                exit(EXIT_FAILURE);
        }
/*
 * 	Write X Axis data
 */

	printf("X-Axis peaks data output file \'%s\'.\n", x_ofile_pt_name);
	fp = fopen(x_ofile_pt_name, "w");
	if (fp == NULL) {
		fprintf(stderr, 
				"Failed to write to file \'%s\'.\n", 
				x_ofile_pt_name
		       );
		exit(EXIT_FAILURE);
	}

	fprintf(fp, "Peak-Trough-X-%0.1f\n",pk_threshold_x);
	for (i = 0; i < n_P_x || i < n_T_x; i++) {
		/* Only peak data if there is peak data to write */
		if (i < n_P_x) {
			idx = (int) P_i_x[i];
			fprintf(fp, "%lf,  %lf\n",
					t[idx],
					x[idx]
			       );
		} else {
			fprintf(fp, ",,,");
		}

		/* Only trough data if there is trough data to write */
		if (i < n_T_x) {
			idx = (int) T_i_x[i];
			fprintf(fp, "%lf,  %lf \n",
					t[idx],
					x[idx]
			       );
		} else {
			fprintf(fp, ",,\n");
		}
	}
	fclose(fp);

	/* open the output file to write the x axis data */
	printf("X-Axis plot data file \'%s\'.\n", x_ofile_st_name);
	fp = fopen(x_ofile_st_name, "w");
	if (fp == NULL) {
		fprintf(stderr, 
				"Failed to write to file \'%s\'.\n", 
				x_ofile_st_name
		       );
		exit(EXIT_FAILURE);
	}


	fprintf(fp, "X-Waveform\n");
	for (i = 0; i < N_SAMPLES; i++) {
		fprintf(fp, "%lf, %lf\n",
				t[i],
				x[i]
		       );
	}
	fclose(fp);

/*
 * 	Write Y Axis data
 *
 */
 
	printf("Y-Axis peaks data file: \'%s\'.\n", y_ofile_pt_name);
	fp = fopen(y_ofile_pt_name, "w");
	if (fp == NULL) {
		fprintf(stderr,
				"Failed to write to file \'%s\'.\n", 
				y_ofile_pt_name
			       );
		exit(EXIT_FAILURE);
		}

	fprintf(fp, "Peak-Trough-Y-%0.1f\n",pk_threshold_y);
	for (i = 0; i < n_P_y || i < n_T_y; i++) {

	/* 
	 * Only peak data if there is peak data to write 
	 */
	if (i < n_P_y) {
		idx = (int) P_i_y[i];
		fprintf(fp, "%lf,  %lf\n",
				t[idx],
				y[idx]
		       );
		} else {
		fprintf(fp, ",,,");
	}

	/* Only trough data if there is trough data to write */
	if (i < n_T_y) {
		idx = (int) T_i_y[i];
		fprintf(fp, "%lf,  %lf \n",
				t[idx],
				y[idx]
		       );
		} else {
		fprintf(fp, ",,\n");
		}
	}
	fclose(fp);

	/* open the output file to write the y axis data */
	printf("Y-Axis plot data file: \'%s\'.\n", y_ofile_st_name);
	fp = fopen(y_ofile_st_name, "w");
	if (fp == NULL) {
			fprintf(stderr, 
			"Failed to write to file \'%s\'.\n", 
			y_ofile_st_name
       			);
	exit(EXIT_FAILURE);
	}


	fprintf(fp, "Y-Waveform\n");
	for (i = 0; i < N_SAMPLES; i++) {
	fprintf(fp, "%lf, %lf\n",
			t[i],
			y[i]
	       );
	}
	fclose(fp);


	return 0;
}
