
/*
 * SensorTile file processing
 * 
 * Input files are produced by Dual_Sensor_Acquisition.c 
 * 
 * Typical usage is: ./sample_file_sync  <input_file_1> <input_file_2> <output file_1> <output_file_2>
 * 
 */


#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <math.h>

int 
main(int argc, char **argv)
{
        FILE           *fp, *fp_o;
        char           *ifile_1, *ifile_2, *ofile_1, *ofile_2;
        char           *line = NULL;
        size_t          len = 0;
        ssize_t         read;
        int             N_SAMPLES_1, N_SAMPLES_2, N_SAMPLES, N_SAMPLES_OFFSET;

        int             vector_length1, vector_length2, rv, i, j;

	float		*vector_1;
	float		*vector_2;
	

        if (argc != 5) {
                fprintf(stderr,
                        "Error - check usage\n"
                        );
                exit(EXIT_FAILURE);
        }

ifile_1 = argv[1];
ifile_2 = argv[2];
ofile_1 = argv[3];
ofile_2 = argv[4];

        fp = fopen(ifile_1, "r");
        if (fp == NULL) {
                fprintf(stderr,
                        "Failed to read from file \'%s\'.\n",
                        ifile_1
                        );
                exit(EXIT_FAILURE);
        }
        /* count the number of lines in the file */

        read = getline(&line, &len, fp);
        //discard header of file
                N_SAMPLES_1 = 0;
        while ((read = getline(&line, &len, fp)) != -1) {
                N_SAMPLES_1++;
        }

	fclose(fp);

        printf("Number of samples file 1:  %i\n", N_SAMPLES_1);

        fp = fopen(ifile_2, "r");
        if (fp == NULL) {
                fprintf(stderr,
                        "Failed to read from file \'%s\'.\n",
                        ifile_2
                        );
                exit(EXIT_FAILURE);
        }
        /* count the number of lines in the file */

        read = getline(&line, &len, fp);
        //discard header of file
                N_SAMPLES_2 = 0;
        while ((read = getline(&line, &len, fp)) != -1) {
                N_SAMPLES_2++;
        }
        
        printf("Number of samples file 2:  %i\n", N_SAMPLES_2);

	if (N_SAMPLES_1 <= N_SAMPLES_2){
		N_SAMPLES = N_SAMPLES_1;
		N_SAMPLES_OFFSET = N_SAMPLES_2 - N_SAMPLES_1;
	} else {
		N_SAMPLES = N_SAMPLES_2;
		N_SAMPLES_OFFSET = N_SAMPLES_1 - N_SAMPLES_2;
	}

	fclose(fp);


        if (N_SAMPLES_2 <= N_SAMPLES_1){

        fp = fopen(ifile_1, "r");
        if (fp == NULL) {
                fprintf(stderr,
                        "Failed to read from file \'%s\'.\n",
                        ifile_1
                        );
                exit(EXIT_FAILURE);
        }

        printf("Output file \'%s\'.\n", ofile_1);
        fp_o = fopen(ofile_1, "w");
        if (fp == NULL) {
                fprintf(stderr,
                        "Failed to read from file \'%s\'.\n",
                        ofile_1
                        );
                exit(EXIT_FAILURE);
        }

/*
 *	write header line
 */
	read = getline(&line, &len, fp);
	fprintf(fp_o,"%s",line);
/*
 *	write data
 */

	i = 0;
/*
 *	skip offset lines
 */
		while(i < N_SAMPLES_OFFSET){
		read = getline(&line, &len, fp);
		i++;
		}

		i=0;
		while(i < N_SAMPLES_2){
		read = getline(&line, &len, fp);
		fprintf(fp_o,"%s",line);
		i++;
		}
	fclose(fp);
        fclose(fp_o);
	return 0;
	}

        if (N_SAMPLES_1 <= N_SAMPLES_2){

        fp = fopen(ifile_2, "r");
        if (fp == NULL) {
                fprintf(stderr,
                        "Failed to read from file \'%s\'.\n",
                        ifile_2
                        );
                exit(EXIT_FAILURE);
        }

        printf("Output file \'%s\'.\n", ofile_2);
        fp_o = fopen(ofile_2, "w");
        if (fp == NULL) {
                fprintf(stderr,
                        "Failed to read from file \'%s\'.\n",
                        ofile_2
                        );
                exit(EXIT_FAILURE);
        }

/*
 *      write header line
 */
        read = getline(&line, &len, fp);
        fprintf(fp_o,"%s\n",line);
/*
 *      write data
 */

        i = 0;
/*
 *      skip offset lines
 */
                while(i < N_SAMPLES_OFFSET){
                read = getline(&line, &len, fp);
                i++;
                }

                i=0;
                while(i < N_SAMPLES_1){
                read = getline(&line, &len, fp);
                fprintf(fp_o,"%s",line);
                i++;
                }
        fclose(fp);
        fclose(fp_o);
        return 0;
        }
}
	

