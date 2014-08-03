#include <cstdio>
#include <vector>
#include <queue>
#include <stack>
#include <set>
#include <cstring>	

//seive of eratostenes
void seive(std::vector<long> &primeList, long upperBound);
std::vector<std::queue<long>> getLists(int upper, int lower, std::vector<long> &primeList);
void flipQueue(std::queue<long> *toFlip);

int main()
{
    int cases;
    int upper, lower;
	std::vector<long> primeList;

	seive(primeList, 10000000);//10 MILLION! change as needed by problem	
    // prime List established //

    std::scanf("%d", &cases);    //get cases and start solving
    while(cases--)
	{
    std::scanf("%d %d", &lower, &upper);  //get bounds
    std::vector<std::queue<long>> grimmList = getLists(upper, lower, primeList);    //get a list of lists for prime numbers
    //full grim list assembled
 
    //the money function
    std::set<long> tops;
	std::set<long> reserved;
    for(int i = 0, timesIterated = 0; timesIterated < grimmList.size(); timesIterated++, i++)   //make a set of all the tops
	{
        std::set<long>::iterator match = tops.find(grimmList[i%grimmList.size()].front());
		if(grimmList[i%grimmList.size()].size() == 1)
		{
			reserved.insert(grimmList[i%grimmList.size()].front());
		}
        else if(match == tops.end())                                 //if the number isn't already in there
            tops.insert(grimmList[i%grimmList.size()].front()); //go ahead and put it in, and keep going
		else if(reserved.find(grimmList[i%grimmList.size()].front() != reserved.end() && grimmList[i%grimmList.size()].size() > 1)
		{
			grimmList[i%grimmList.size()].pop();
			i--;
			timesIterated = 0;
		}
		else
		{
            tops.erase(match);              //otherwise get rid of match
            long temp = grimmList[i%grimmList.size()].front();  
            grimmList[i%grimmList.size()].pop();                //nudge the queue
			grimmList[i%grimmList.size()].push(temp);
            timesIterated = 0;              //restart the potentially endless loop
            i--;                            //re try this index
            /*
                remove the index that had a collision, if this index is only one digit 2/8 etc,
				it will re-add the 2 and hit the collision elsewhere on the next loop to change that index
                while keeping the highest possible values
            */
		}
	}

    for(unsigned int i = 0; i < grimmList.size(); i++)
		printf("%d\n", grimmList[i].front());
	}
	return 0;
}


void seive(std::vector<long> &primeList, long upperBound)	//can be quicker by using static memory
{
	bool *primes = new bool [upperBound];		//temp array to mark OFF multiples of primes discovered
	std::memset(primes, true, sizeof(primes));	//set the whole damn thing to true (prime)
	for(long i = 2; i < upperBound; i++)		//begin stepping through
	{
		if(primes[i])							//if current number/index is prime
		{
			for(long j = i+i; j < upperBound; j += i)
			{
				primes[j] = false;				//ALL multiples of the discovered prime to false
			}
			primeList.push_back(i);				//push the discovered prime to the stack
		}
	}
}

std::vector<std::queue<long>> getLists(int upper, int lower, std::vector<long> &primeList)
{
    std::vector<std::queue<long>> grimmList;
    std::queue<long> *temp;
    for(int i = lower + 1; i < upper; i++)
	{
        int newVal = i;
        // i is the thing we need to get all the primes for
        temp = new std::queue<long>;
        std::vector<long>::iterator iPoint = primeList.begin();
        while(newVal != 1)           //while something still to divide
		{
             //grab the divisors
            for(int div = *iPoint; *iPoint <= i/2; iPoint++) //start at begining and start nudging through
			{
                if(newVal % *iPoint == 0)    //if it's a divisor
				{
                    temp->push(*iPoint);    //add it to the 'prime' stack
                    while(newVal % *iPoint == 0)
					{
                        newVal /= *iPoint;  //divide it as many times as necessarry but only add it once
					}
				}
			}
		}
                            //if want in order of lowest possible "grimm string" '
                            //remove the flip queue function
        flipQueue(temp);    // queue now highest to lowest
        grimmList.push_back(*temp); //add the new list to the whole list
	}
    return grimmList;
}

void flipQueue(std::queue<long> *toFlip)
{
    std::stack<long> temp;
    while(!toFlip->empty())
	{
        temp.push(toFlip->front()); //get em all out
        toFlip->pop();
	}
	while(!temp.empty())
	{
        toFlip->push(temp.top());   //put em all back in
        temp.pop();
	}

}

