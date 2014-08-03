//MAXCOUNT
#include <iostream>

int main()
{
	int cases, size, idx, max, num;
	int input[10001];

	std::cin >> cases;
	while (cases--)
	{
		for(int i = 0; i < 10001; i++)
			input[i] = 0;

		max = 0;

		std::cin >> size;
		while(size--)
		{
			std::cin >> idx;
			input[idx]++;
		}	

		for(int i = 0; i < 10001; i++)
		{
			if(input[i] > max)
			{
				max = input[i];
				num = i;
			}
		}
		std::cout << num << " " << max << std::endl;

	}


	return 0;
}