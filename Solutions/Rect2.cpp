#include <iostream>
#include <cstdlib>
#include <cmath>

int getArea(int x1, int x2, int y1, int y2);

int main()
{

	int cases, lastX, lastY, nowX, nowY, area = 0;
	std::cin >> cases;
	std::cin >> lastX >> lastY;
	cases--;
	while(cases--)
	{
		std::cin >> nowX >> nowY;
		area += getArea(lastX, nowX, lastY, nowY);
		lastX = nowX;
		lastY = nowY;
	}
	std::cout << area << std::endl;
	return 0;
}

int getArea(int x1, int x2, int y1, int y2)
{
	return abs((x1-x2)*(y1-y2));

}