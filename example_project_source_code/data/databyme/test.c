#include <unistd.h>
#include <stdio.h>
#include "fann.h"

int main()
{
	int i;
	float feature_1, feature_2, feature_3, feature_4;
	int output;

	float max;
	fann_type *calc_out;
	fann_type input[4];
	struct fann *ann;
	ann = fann_create_from_file("TEST.net");
	char buffer[1024];
	int num_line;
	FILE * in_file;
	if ((in_file = fopen("test_data.txt", "r")) == NULL)
	{
		printf("Error file, test_data.txt, cannot be opened\n");
		return;
	}
	fscanf(in_file, "%d", &num_line);
	int line;
	for (line = 0; line < num_line; line++)
	{
		max = -100;
		fscanf(in_file, "%f %f %f %f", &feature_1, &feature_2, &feature_3, &feature_4);
		input[0] = feature_1;
		input[1] = feature_2;
		input[2] = feature_3;
		input[3] = feature_4;

		calc_out = fann_run(ann, input);

		for (i = 0; i < 4; i++) {
			if (calc_out[i] > max) {
				max = calc_out[i];
				output = i;
			}
		}
		if(output == 0)
        {
            printf("feature 1: %f, feature 2: %f, feature 3: %f feature 4: %f\n", feature_1, feature_2, feature_3, feature_4);
            printf("\nYou lifted it too fast. Try using brute force instead of acceleration.\n");
        }
        else if(output == 1){
            printf("feature 1: %f, feature 2: %f, feature 3: %f feature 4: %f\n", feature_1, feature_2, feature_3, feature_4);
            printf("\nRight lifting motion! Keep it up!\n");
        }
        else if(output == 2){
            printf("feature 1: %f, feature 2: %f, feature 3: %f feature 4: %f\n", feature_1, feature_2, feature_3, feature_4);
            printf("\nWrong lifting motion, try lifting it higher!\n");
        }
        else if(output == 3){
            printf("feature 1: %f, feature 2: %f, feature 3: %f feature 4: %f\n", feature_1, feature_2, feature_3, feature_4);
            printf("\nBack/Shoulder motion detected! Try straightening your back while lifting.\n");
        }
	}
	fclose(in_file);
	fann_destroy(ann);
	return 0;
}


