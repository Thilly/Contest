// subgame
#include <iostream>

int main()
{
	int cases, count;
	long numbers[1001];
	long bigger = 0, smaller = 0, idx;
	bool same = false, twoFound = false, oneFound = false;
	std::cin >> cases;
	while(cases--)
	{
		std::cin >> count;
		idx = count;
		while(idx--)
		{
			std::cin >> numbers[idx];	//get all numbers
		}
		same = false;
		while(!same)
		{
			oneFound = false;
			bigger = 0;
			smaller = 0;
			idx = 0;
			for(int i = 0; i < count; i++)
			{
				if(numbers[i] > bigger)
				{
					bigger = numbers[i];
					idx = i;
				}
			}
			for(int i = 0; i < count; i++)
				if((numbers[i] > smaller) && (numbers[i] != bigger))
				{
					smaller = numbers[i];
					oneFound = true;
				}
			if(oneFound)
				numbers[idx] = bigger -= smaller; 
			else
			{
				bigger = numbers[0];
				same = true;
			}
				if(bigger == 2)
				{
					for(int j = 0; j < count; j++)
					{
						if(numbers[j]%2==1)	//if we have a two and an odd number, we know answer is 1
						{
							bigger = 1;
							count = j;
						}
						else
							numbers[j] = 2;	//possibly all even numbers
					}
				}
				if(bigger == 1)	//if we have any 1 we know answer is 1
				{
					same = true;
				}
		}//end of game loop
		std::cout << bigger << std::endl;
	}//end of test case
	return 0;
}