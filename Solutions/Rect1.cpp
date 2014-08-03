#include <iostream>
#include <cstdlib>

int getArea(int x1, int x2, int y1, int y2);

int main()
{

	int cases, x1, y1, x2, y2;
	std::cin >> cases;
	while(cases--)
	{
		std::cin >> x1 >> y1 >> x2 >> y2;
		std::cout << getArea(x1, x2, y1, y2) << std::endl;	
	}
	return 0;
}

int getArea(int x1, int x2, int y1, int y2)
{
	return abs((x1-x2)*(y1-y2));

}