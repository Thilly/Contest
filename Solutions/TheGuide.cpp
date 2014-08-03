//GUIDE
#include <iostream>

int main()
{
	int input;
	while(std::cin >> input)
		if(input==42)
			break;
		else
			std::cout << input << std::endl;

	return 0;
}