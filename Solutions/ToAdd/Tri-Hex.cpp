#include <iostream>
#include <fstream>
#include <queue>
#include <string>
#include <utility>
#include <vector>
/*
	http://www.codechef.com/problems/N4/
	Tri-Hexagonal Puzzle
	1.78Seconds 4.9MB
*/

struct myTurns
{
	bool currentState[13];
	std::vector<std::pair<int,int> > turns;
};
//my custom structure, holds the binary representation of the state and the 
//twists it has taken to get to where it is
std::string solution = "0001001011000";
bool checkAnswer(bool checking[]);
myTurns twist(myTurns initialState);
//function declarations

int main()
{
	int cases, caseNum = 0;
	//the amount of tests given by the problem

//	std::ifstream fileIn("HexCases.txt");
//	std::ofstream fileOut("HexAnswers.txt");

	myTurns firstArray, answer;
	//a struct to grab the initial positioning and also the final answer with the path to get there
	std::string initialState;
	std::cin >> cases;//get number of test cases
//	fileIn >> cases;
	while(cases--)//as long as there are more cases to check
	{
		caseNum++;
		std::cin >> initialState; //get the initial position
//		fileIn >> initialState;
		if(initialState == solution)
		{
			std::cout << "0" << std::endl;
		}
		else
		{
			for(int i = 0; i < 13; i++) //translate the string from console to a bool array
			{
				if(initialState[i] == '0')
					firstArray.currentState[i] = false;
				else
					firstArray.currentState[i] = true;
			}
			answer = twist(firstArray);	//send it to be twisted
			//retrieve the answer from the twister

			//display the metrics associated with the solution, how many twists, and in what order
			std::cout << answer.turns.size() << std::endl;
//			fileOut << "Case- " << caseNum << " " << answer.turns.size() << std::endl;
			for(unsigned int i = 0; i < answer.turns.size(); i++)
			{
				//for each twist, display which ring(first) and what direction(second) it was twisted
				std::cout << answer.turns[i].first << " ";
				std::cout << answer.turns[i].second << std::endl;
//				fileOut << answer.turns[i].first << " ";
//				fileOut << answer.turns[i].second << "   ";
			}
		}
//		fileOut << std::endl;
	}//if more cases, do it again
	//otherwise GTFO :D

//	fileIn.close();
//	fileOut.close();
	return 0;
}

/*
	This function does the 'work' of the program. It needs to use a BFS approach to finding the solution.
	gets: The initial state of the puzzle.
	does: It takes a current puzzle state and twists it in the six different directions. After each 'twist', the
			new state is checked for completion. If the current state is correct, the twist function ends and the
			answer is submitted. Otherwise the method of twist and the current state is pushed onto the queue of
			possible solutions.
	returns: The steps needed to get to the correct answer.
*/
myTurns twist(myTurns initialState)
{
	std::queue<myTurns> bigQueue;
	//the datastructure of possible solutions

	myTurns myAnswer, currentWorking;
	//one var to hold the answer
	//and another to hold the state that will be twisted
	
	bool temp;
	//a place holder to carry over the last position after it's been overwritten
	
	bigQueue.push(initialState);
	//put the initial state into the queue then start the twisting

	while(true) //keep working until a solution is found
	{
		currentWorking = bigQueue.front();//set the current state to the top of the list
		bigQueue.pop();//get rid of the old state

//turn topLeft clockWise
		myAnswer = currentWorking;//to preserve the state that is still being 'twisted'
		if(myAnswer.turns.size() == 0 || !(myAnswer.turns.back().first == 0 && myAnswer.turns.back().second == 0)) //if I'm just undoing the last twist, dont do it
		{
			temp = myAnswer.currentState[0]; //save the first position

			//shifting each spot over by one
			myAnswer.currentState[0] = myAnswer.currentState[2];
			myAnswer.currentState[2] = myAnswer.currentState[5];
			myAnswer.currentState[5] = myAnswer.currentState[8];
			myAnswer.currentState[8] = myAnswer.currentState[6];
			myAnswer.currentState[6] = myAnswer.currentState[3];

			myAnswer.currentState[3] = temp; //since first position is already different

			myAnswer.turns.push_back(std::make_pair(0,1));//push the current twist to the path

			if(checkAnswer(myAnswer.currentState))//if solution found
				break;	//end the loop
			else
				bigQueue.push(myAnswer);//otherwise add the current twist to the queue and get another off the top
			//then repeat for the other five twists, and repeat six times each for those six twists, and again... until a solution is found.
		}

//turn topLeft counterClockWise
		myAnswer = currentWorking;
		if(myAnswer.turns.size() == 0 || !(myAnswer.turns.back().first == 0 && myAnswer.turns.back().second == 1))
		{
			temp = myAnswer.currentState[0]; 
			myAnswer.currentState[0] = myAnswer.currentState[3];
			myAnswer.currentState[3] = myAnswer.currentState[6];
			myAnswer.currentState[6] = myAnswer.currentState[8];
			myAnswer.currentState[8] = myAnswer.currentState[5];
			myAnswer.currentState[5] = myAnswer.currentState[2];
			myAnswer.currentState[2] = temp;
			myAnswer.turns.push_back(std::make_pair(0,0));
			if(checkAnswer(myAnswer.currentState))
				break;
			else
				bigQueue.push(myAnswer);
		}

//turn topRight clockWise
		myAnswer = currentWorking;
		if(myAnswer.turns.size() == 0 || !(myAnswer.turns.back().first == 1 && myAnswer.turns.back().second == 0))
		{
			temp = myAnswer.currentState[1]; 
			myAnswer.currentState[1] = myAnswer.currentState[3];
			myAnswer.currentState[3] = myAnswer.currentState[6];
			myAnswer.currentState[6] = myAnswer.currentState[9];
			myAnswer.currentState[9] = myAnswer.currentState[7];
			myAnswer.currentState[7] = myAnswer.currentState[4];
			myAnswer.currentState[4] = temp;
			myAnswer.turns.push_back(std::make_pair(1,1));
			if(checkAnswer(myAnswer.currentState))
				break;
			else
				bigQueue.push(myAnswer);
		}

//turn topRight counterClockWise
		myAnswer = currentWorking;
		if(myAnswer.turns.size() == 0 || !(myAnswer.turns.back().first == 1 && myAnswer.turns.back().second == 1))
		{
			temp = myAnswer.currentState[1]; 
			myAnswer.currentState[1] = myAnswer.currentState[4];
			myAnswer.currentState[4] = myAnswer.currentState[7];
			myAnswer.currentState[7] = myAnswer.currentState[9];
			myAnswer.currentState[9] = myAnswer.currentState[6];
			myAnswer.currentState[6] = myAnswer.currentState[3];
			myAnswer.currentState[3] = temp;
			myAnswer.turns.push_back(std::make_pair(1,0));
			if(checkAnswer(myAnswer.currentState))
				break;
			else
				bigQueue.push(myAnswer);
		}

//turn bottom clockWise
		myAnswer = currentWorking;
		if(myAnswer.turns.size() == 0 || !(myAnswer.turns.back().first == 2 && myAnswer.turns.back().second == 0))
		{
			temp = myAnswer.currentState[6]; 
			myAnswer.currentState[6] = myAnswer.currentState[8];
			myAnswer.currentState[8] = myAnswer.currentState[10];
			myAnswer.currentState[10] = myAnswer.currentState[12];
			myAnswer.currentState[12] = myAnswer.currentState[11];
			myAnswer.currentState[11] = myAnswer.currentState[9];
			myAnswer.currentState[9] = temp;
			myAnswer.turns.push_back(std::make_pair(2,1));
			if(checkAnswer(myAnswer.currentState))
				break;
			else
				bigQueue.push(myAnswer);
		}

//turn bottom counterClockWise
		myAnswer = currentWorking;
		if(myAnswer.turns.size() == 0 || !(myAnswer.turns.back().first == 2 && myAnswer.turns.back().second == 1))
		{
			temp = myAnswer.currentState[6]; 
			myAnswer.currentState[6] = myAnswer.currentState[9];
			myAnswer.currentState[9] = myAnswer.currentState[11];
			myAnswer.currentState[11] = myAnswer.currentState[12];
			myAnswer.currentState[12] = myAnswer.currentState[10];
			myAnswer.currentState[10] = myAnswer.currentState[8];
			myAnswer.currentState[8] = temp;
			myAnswer.turns.push_back(std::make_pair(2,0));
			if(checkAnswer(myAnswer.currentState))
				break;
			else
				bigQueue.push(myAnswer);
		}
	}

	return myAnswer;
	//only way out of the loop is by having a correct answer, return it
}

/*
	A Simple utility function to check if puzzle is solved:
	gets: A string representing the current state of the puzzle
	does: Compares the string with the correct solution
	returns: If the strings match, the function returns true, otherwise false
*/
bool checkAnswer(bool checking[])
{
	if(checking[3] && checking[6] && checking[8] && checking[9])	//does the current state equal the solution, is the puzzle solved?
		return true;	//yes
	return false;		//no
}