#include <iostream>
#include <cstdlib>

int main()
{
	srand(13);
	int x, y;
	for(int i = 0; i < 601; i++)
	{
	x = (rand() % 202) - 100;
	y = (rand() % 202) - 100;
	std::cout << x << ' ' << y << std::endl;
	
	}
	return 0;
}