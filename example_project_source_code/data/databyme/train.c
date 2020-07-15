#include "fann.h"
int main()
{
	const unsigned int num_input = 4;
const unsigned int num_output = 4;

const unsigned int num_layers = 3;
const unsigned int num_neurons_hidden = 20;

const float desired_error = (const float) 0.0001;
const unsigned int max_epochs = 5000;
const unsigned int epochs_between_reports = 100;

struct fann *ann = fann_create_standard(num_layers, num_input,
	num_neurons_hidden, num_output);

fann_set_activation_function_hidden(ann, FANN_SIGMOID_SYMMETRIC);
fann_set_activation_function_output(ann, FANN_SIGMOID_SYMMETRIC);

fann_train_on_file(ann, "train_data.txt", max_epochs,
	epochs_between_reports, desired_error);

fann_save(ann, "TEST.net");

fann_destroy(ann);

return 0;
}

