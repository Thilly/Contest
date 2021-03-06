#include <queue>
#include <utility>
#include <stdio.h>

int chestNum;					//numbering and keeping track of the chests
int startX, startY;				//starting position for each attempt
int tryX, tryY;					//the neighboring positions to try
//used during the iterative checking with stepX and stepY

bool solution;		//has a solution been found?
int stepsTaken;		//how many steps taken to get to current position
int chestsFound;	//will be used as a binary flag
/*
example, if there is 4 chests, the binary flag for finding them all would be 1111
or 15. When a chest is found, its binary displace ment is binarily 'or'ed with the 
current number of chests.
	1<<chestNum-1 = the binary position of the flag.
	finding chest 2 out of 4 would set 0010, when all of the chests are found, 
	chestsFound will equal, (1<<number of chests)-1
	binary (1111) = 10000 - 1 or (01111)
	instead of keeping an array of 13 true / false values with each attempt
*/

typedef std::pair<int,int> info;//a handle to be queued up
//this is kinda esoteric, we will discuss the implications of it

int stepX[]={-1,1,0,0};			//possible steps left or right
int stepY[]={0,0,1,-1};			//possible steps up or down
//setting up so I can make iterative attempts

int chestMap[14][14];			//where the chests will be located
char myMap[14][14];				//the treasure map that will be read from the file

int ***visit;
//will be the array that tracks what has been visited and what hasn't been on each
//path or attempt, crazy large memory usage, but better than keeping track of over
//50k arrays of true/false flags

int main()
{
	int cases;
	scanf("%d",&cases);	//get number of cases
	while(cases--)	//while there is still a case to be tested
	{

		int bound;
		scanf("%d",&bound);//get how big this treasure map will be
		solution = false; //assume the solution cant be found
		chestNum = 1;	//start at 1 for numbering chests
		for(int i = 0; i < bound; i++)	//get each line from the in-stream
		{
			scanf("%s", myMap[i]);
			//get the locations of the chests as the strings are read in
			for(int j = 0; j < bound; j++)
				if(myMap[i][j]=='*')	//find each chest
				{
					chestMap[i][j] = chestNum;//record chest number
					chestNum += 1;		//increment the chests
				}
		//treasure map is now written to 'myMap' and
		//each chest has been numbered and has it's location put into chestMap
		//the numbers of each chest is important for using the cheap binary flag to make sure
		//each chest has been hit, not just the right number of chests
		}

		//creating the 3 dimensional array to track how the cells are visited
		visit = new int **[bound];	//x part of array
		for(int i = 0; i < bound; i++)
		{
			visit[i] = new int *[bound];	//y part of array
			for(int j = 0; j < bound; j++)
			{
				visit[i][j] = new int [1<<chestNum];	//attempt part of array
				for(int k = 0; k < 1<<chestNum; k++)
					visit[i][j][k] = 0;
			}
		}
	
		//end of setup.
		
		// treasure map read, chests plotted, visited array created, inital variables declared, lets do this:


		std::queue<std::pair<info,info> > myQueue;//create a queue to keep track of each 'attempt'
		/*
			each entry will carry four items (steps taken) (chests found) (currentX) (currentY)
			so each attempt can possibly push 3 additional attempts to the queue. 
			The resulting solution will bubble up by being the first one(least number of steps) 
			to meet the solution criteria.
		*/

		startX = 0; startY = 0;	//begin searching from the top left (0,0)
		myQueue.push(make_pair(info(0, 0), info(startX, startY)));//push the very first position to the queue
		visit[startX][startY][0] = 1;//set starting position to visited
		std::pair<info, info> Attempt;//current attempt
		while(!myQueue.empty())	//as long as there is an avenue available, try it.
		{
			Attempt = myQueue.front();	//set the current attempt to the attempt on the top of the queue
			myQueue.pop();				//remove the current attempt from the queue

			stepsTaken = Attempt.first.first;	//how many steps have been taken since this attempt/path was ran
			chestsFound = Attempt.first.second;	//how many chests have been found on this attempt/path

			startX = Attempt.second.first;	//start position X for this attempt
			startY = Attempt.second.second;	//start position Y for this attempt

			if( (chestsFound == ((1 << (chestNum - 1)) - 1)) //if all of the chests have been found
				&& startX == bound - 1		//and this attempt is at the exit
				&& startY == bound - 1)	
			{
				solution = true;			//leave with the solution being found
				break;
			}
			//as mentioned earlier, the first attempt/path to meet these conditions will conviently be the shortest path


			//if the solution has not been found yet, begin looking at the neighboring cells
			for(int i = 0; i < 4; i++)	//four different checks on each attempt
			{							//checking left, right, down, up
				tryX = startX + stepX[i];//0-left, 1-right
				tryY = startY + stepY[i];//2-down, 3-up
				//stepX = {-1, 1, 0, 0}
				//stepY = {0, 0, 1, -1}
				//so for each iteration of the loop, the neighbor is checked for the following:
				if(tryX >= 0 && tryX < bound //is it out of bounds left or right?
				&& tryY >= 0 && tryY < bound //is it out of bounds up or down?
				&& myMap[tryX][tryY] != '#' //is it a wall?
				&& visit[tryX][tryY][chestsFound] == 0)//has it already been visited by this attempt/path?
				{
					//if it meets all of the conditions
					visit[tryX][tryY][chestsFound] = 1;	//set the current position, on the current path to visited
					//then
					if( myMap[tryX][tryY] == '*')//if this neighbor is a chest
					{
						myQueue.push(//add to the bottom of the queue
						make_pair(info(stepsTaken + 1,(chestsFound|(1<<(chestMap[tryX][tryY] - 1)))),
						//first pair is the updated of number of steps taken to get to this neighbor cell
						//and the chestsFound flag is updated with the binary flag

						info(tryX, tryY)));//the second pair is simply the now-current location for when it comes back to the top of the stack
					}
					else
					{
						myQueue.push(//add to the bottom of the queue
						make_pair(//the 2 pairs of information
						info(stepsTaken + 1, chestsFound),//the steps taken on this attempt/path so far and how many chests found
						info(tryX, tryY)));//also the now-current location
					}
				}
			}
		}
		if(solution)
			printf("%d\n", stepsTaken);//print the steps taken on the first one to finish
		else
			printf("%d\n", -1);
	}
	return 0;
}
