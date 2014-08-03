//
//
//

#include <stdio.h>
#include <utility>
#include <algorithm>
#include <vector>
bool sorter(const std::pair<int, int> &left, const std::pair<int,int> &right);
bool intSort(const int &left, const int &right);

int main()
{
	int shows, groups, arrivals;
	std::string outPut = "";
	std::vector<std::pair<int, int> > show;
	
	scanf("%d", &shows);//get number of shows
	while(shows--)
	{
		std::pair<int,int> temp;
		scanf("%d", &temp.first);//start
		scanf("%d", &temp.second);	//stop
		show.push_back(temp);//shove em in vector
	}
	
	std::sort(show.begin(), show.end(), sorter);//sort the vector of pair on my function(sorter)
	
	scanf("%d", &groups);//get number of alien groups
	
	int downloads = 0, alienTime;//initalize stuff
	std::vector<int> aliens;	
	std::vector<std::pair<int,int> >::iterator showTime;
	std::vector<int>::iterator arrivalTime;
	
	while(groups--)//for each group of aliens
	{
		downloads = 0;
		aliens.clear();
		scanf("%d", &arrivals);//how may are coming?
		
		while(arrivals--)//for each one coming in this group
		{
			scanf("%d", &alienTime);//get his arrival time
			aliens.push_back(alienTime);//add to list
		}
		
		std::sort(aliens.begin(), aliens.end(), intSort);//sort em on my function(intSort)
		showTime = show.begin();
		arrivalTime = aliens.begin();//set up some pointers

		while(showTime != show.end() && aliens.size() > 0)//while not at the end of shows and aliens still left
		{
			if((showTime->first) <= *arrivalTime)//if alien is after start time
			{
				if((showTime->second) >= *arrivalTime)//but before end time
					downloads++;//he can download the show
			}
			else//if starttimes are after this alien, fuckem hes done
			{
				aliens.erase(arrivalTime);//pop
				arrivalTime = aliens.begin();//re-point
			}

			showTime++;//nudge to next show
		}
		printf("%d\n", downloads);//how many downloads from this group?
		
	/*	90k shows, 5k groups of aliens 20 aliens per group

		
		only one vector built for 90k things iterate over that while
		build/sort/iterate/decomposing 5k vectors of roughly 20 things each
		
		worst case scenario
			go through 90k things 5k times
		450,000,000 comparisons/operations on top of all that stuff.
		doesn't seem to terribly shitty, but still takes 12sec ><	
		even using stdio, instead of streams
	*/
		
	}
	return 0;
}

bool sorter(const std::pair<int, int> &left, const std::pair<int,int> &right)
{
	return left.first < right.first;

}
bool intSort(const int &left, const int &right)
{
	return left < right;
}