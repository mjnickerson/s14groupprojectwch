/*
gcc -o sensor2Extract sensor2Extract.c -lm
*/
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <math.h>
#define BUFF_SIZE 1024
FILE *test_file;

/*
 * sets first <n> values in <*arr> to <val>
 */

void clear_buffer(float *arr, float val, int n)
{
	int i;
	for(i = 0; i < n; i++) {
		arr[i] = val;
	}
}

int find_maximum(float *arr, int samples)
{
    int i;
   float maximum = arr[0];
   for( i=1 ; i<samples; i++)
   {
       if(arr[i]>maximum){
        maximum = arr[i];
       }
   }
   return maximum;
}

int find_minumum(float *arr, int samples)
{
    int i;
    float minimum = arr[0];
   for (i=1 ; i<samples; i++)
   {
       if(arr[i]<minimum){
        minimum = arr[i];
       }
   }
   return minimum;

}

int main()
{
	int i, idx;
	int rv;
	/* Variables for reading file line by line */
	char *ifile_name;
	FILE *fp;
	char *line = NULL;
	size_t len = 0;
	ssize_t read;
	int N_SAMPLES;

	/* Variables for storing the data and storing the return values */
	float *t, *x, *y, *z, *gx; 	// variables for data collected from input file
    ifile_name = "motion_data_output_2.csv";
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
	gx = (float *) malloc(sizeof(float) * N_SAMPLES);
	while ((read = getline(&line, &len, fp)) != -1) {
		/* parse the data */
		rv = sscanf(line, "%f,%f,%f,%f,%f\n", &t[i], &x[i], &y[i], &z[i], &gx[i]);
		if (rv != 5) {
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

	float accex = find_minumum(x, N_SAMPLES);
	float accey = find_minumum(y, N_SAMPLES);
	float gyrox = find_maximum(gx, N_SAMPLES);
    test_file = fopen("test_data.txt", "w");
                if (test_file == NULL) {
                    printf("Comm file, cannot be opened\n");
                    exit(-1);
                    }
    fprintf(test_file, "%f\n ", gyrox);
	return 0;
}
