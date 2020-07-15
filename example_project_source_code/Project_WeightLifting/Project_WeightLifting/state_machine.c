#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <sys/time.h>
#include <unistd.h>
/*
#define BUFFERSIZE  100

#define DELAY 1

int detection_stat;
int ret;
*/
enum {
	START,
	DATAACQUISTION,
	FEATURE_EXTRACT,
	TEST,
	FINISH
} state;

char *state_start = "State Start ";
char *state_da = "State Data Acquisition";
char *state_feature = "State Feature Extraction";
char *state_test = "State Test Classifier";
char *state_finish = "State Finish";

int main(void)
{
    char answer;
    int run = 0;
	state = START;
	while(run == 0){
        switch (state) {
		case START:
		    printf("\nWelcome to Resistance Training on Proper Lifting Program\n");
			printf("Would you like to start lifting? (y/n)\n");
			scanf(" %c", &answer);
			if(answer == 'y'){
                state = DATAACQUISTION;
			}
			else{
                printf("Good Bye!\n");
                run++;
                return 0;
			}
			break;
		case DATAACQUISTION:
		    system("sh reset_bluetooth.sh");
			system("sh Dual_SensorTile_Acquire.sh -t 1");
			state = FINISH;
			break;
		case FEATURE_EXTRACT:
			state = TEST;
			break;
		case TEST:
			state= FINISH;
			break;
        case FINISH:
			printf("\nWould you like to try again? (y/n)\n");
			scanf(" %c", &answer);
			if(answer == 'y'){
                state = DATAACQUISTION;
			}
			else{
                printf("Good Bye!\n");
                run++;
                break;
			}
        }
	}
	return 0;
}
