#include <iostream>
void bounds(int &lowX, int &lowY, int &highX, int &highY);
void addArea(int lowX, int lowY, int highX, int highY, int grid[][201]);

int main()
{
	int grid[201][201];
	int cases, lowX, highX, lowY, highY;
	int lastX, lastY, nowX, nowY;
	
	for(int i = 0; i < 201; i++)
		for(int j = 0; j < 201; j++)
			grid[i][j] = 0;
			
	std::cin >> cases;
	std::cin >> lastX >> lastY;
	cases--;
	while(cases--)
	{
		lowX = lastX;
		lowY = lastY;
		std::cin >> nowX >> nowY;
		highX = nowX;
		highY = nowY;
		bounds(lowX, lowY, highX, highY);
		addArea(lowX, lowY, highX, highY, grid);
		lastX = nowX;
		lastY = nowY;
	
	}
	int total = 0;
	for(int i = 0; i < 201; i++)
		for(int j = 0; j < 201; j++)
			total += grid[i][j];
	
	std::cout << total << std::endl;
	
	return 0;
}

void bounds(int &lowX, int &lowY, int &highX, int &highY)
{
	if(highX < lowX)
	{
		int temp = highX;
		highX = lowX;
		lowX = temp;	
	}
	if(highY < lowY)
	{
		int temp = highY;
		highY = lowY;
		lowY = temp;	
	}
}

void addArea(int lowX, int lowY, int highX, int highY, int grid[][201])
{
	for(int i = lowX; i < highX; i++)
		for(int j = lowY; j < highY; j++)
			grid[i+100][j+100] = 1;
}