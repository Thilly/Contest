//Travel

#include <iostream>
#include <map>
#include <vector>
#include <utility>
#include <algorithm>

int roads[50][50];
std::map<std::string, int> cities;
std::vector<std::string> route;
int inputNum, citiesToVisit, mileage;
std::string city, from, to;
bool error;


int main()
{
	std::cin >> inputNum;//num of cities
	for(int i = 0; i < 50; i++)
		for(int j = 0; j < 50; j++)
			roads[i][j] = 0;
			
	for(int i = 0; i < inputNum; i++)
	{
		std::cin >> city;
		cities.insert(std::pair<std::string,int>(city, i));//make city/int map
	}
	
	std::cin >> inputNum; //number of roads
	while(inputNum--)
	{
		std::cin >> from >> to >> mileage;//build grid of road/cities
		roads[cities.at(from)][cities.at(to)] = mileage;
	}
	
	std::cin >> inputNum;//number of Routes
	while(inputNum--)
	{
		route.clear();
		mileage = 0;
		std::cin >> citiesToVisit;//cities along the route
		std::cin >> from;//get first city on route
		route.push_back(from);
		citiesToVisit--;
		error = false;
		while(citiesToVisit--)
		{
			std::cin >> to;//gotta clear the row no matter what
			if(!error)
			{
				if((cities.find(from) == cities.end()) || (cities.find(to) == cities.end()))//are the cities 'real' cities?
					error = true;
				else if(roads[cities.at(from)][cities.at(to)])//if a road exists between the two cities
					mileage += roads[cities.at(from)][cities.at(to)];
				else
					error = true;
				
				if(std::find(route.begin(), route.end(), to) != route.end())//if the city was already visited
					error = true;
				else
				{
					route.push_back(to);
					from = to;
				}
			}
		}
		if(error)
			std::cout << "ERROR" << std::endl;
		else
			std::cout << mileage << std::endl;
	}


	return 0;
}