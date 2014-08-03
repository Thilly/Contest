//Rects4
#include <iostream>
#include <vector>
#include <cstdlib>
#include <queue>
#include <cmath>


void drawArea();

struct myRect{

	int height;
	int width;
	
	myRect(int rx1, int ry1, int rx2, int ry2)
	{
		width = abs(rx1 - rx2);
		height = abs(ry1 - ry2);
	};
};

std::vector<myRect> rectangles;
int rx1, ry1, rx2, ry2;

const int dimensions = 20;


int area[dimensions][dimensions] = {0};
int cases, rects, totalAreaI;
float totalAreaF = 0;

int main()
{
	std::cin >> cases;
	while(cases--)
	{
		std::cin >> rects;
		while(rects--)
		{
			std::cin >> rx1 >> ry1 >> rx2 >> ry2;
			myRect *temp = new myRect(rx1, ry1, rx2, ry2);
			rectangles.push_back(*temp);
		}
		
		for(int i = 0; i < rectangles.size(); i++)
		{
			for(int h = 0; h < rectangles[i].height; h++)
				for(int w = 0; w < rectangles[i].width; w++)
				{
					area[h][w] = 8;
					totalAreaF++;
				}
		}
		totalAreaF = std::sqrt(totalAreaF);
		if(totalAreaF-(int)totalAreaF > 0)
			std::cout << "cant be squared";
		else
			std::cout << "can be squared";
			
		std::cout << std::endl;
		
		drawArea();
		
		
	}
	return 0;
}

void drawArea()
{
	for(int h = 0; h < dimensions; h++)
	{
		for(int w = 0; w < dimensions; w++)
			std::cout << area[h][w];
		std::cout << std::endl;
	}
	
}