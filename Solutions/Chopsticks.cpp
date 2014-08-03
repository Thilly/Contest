//chopsticks

#include <algorithm>
#include <iostream>

	int tests;
	int sticks, diff, numPairs;
	int pile[100001];

int main()
{
	std::cin >> tests;
	while(tests--)
	{
		numPairs = 0;
		std::cin >> sticks >> diff;
		for(int i = 0; i < sticks; i++)
		{
			std::cin >> pile[i];
		}
		std::sort(pile, pile+sticks);
		for(int i = 0; i < sticks-1; i++)
		{
			if(pile[i+1] - pile[i] <= diff)
			{	
				numPairs++;
				i++;
			}
		}
		std::cout << numPairs << std::endl;
	}
	return 0;
}