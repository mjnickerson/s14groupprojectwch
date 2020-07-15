
all: Acquire_LowPass_Continuous_1 Acquire_LowPass_Continuous_2

Acquire_LowPass_Continuous_1: Acquire_LowPass_Continuous_1.c
	 	gcc -o Acquire_LowPass_Continuous_1 Acquire_LowPass_Continuous_1.c -lm -lc -lliquid -lrt	

Acquire_LowPass_Continuous_2: Acquire_LowPass_Continuous_2.c
		gcc -o Acquire_LowPass_Continuous_2 Acquire_LowPass_Continuous_2.c -lm -lc -lliquid -lrt

clean:
		rm -rf Acquire_LowPass_Continuous_1
		rm -rf Acquire_LowPass_Continuous_2

