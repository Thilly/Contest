//CUPCAKES
#include <iostream>
int main()
{
	int cases;
	long cupcakes;
	std::cin >> cases;
	while(cases--)
	{
		std::cin >> cupcakes;
		std::cout << cupcakes/2+1 << std::endl;
	}

	return 0;
}