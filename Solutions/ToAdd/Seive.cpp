#include <cstdio>
#include <vector>
#include <cstring>	//for memset

//seive of eratostenes
void seive(std::vector<long> &primeList, long upperBound);

/*
	fastest easily implementable thing for getting primes
	using a 10,000,000 max bound starts printing in about 1ish sec
*/
int main()
{

	std::vector<long> primeList;
	seive(primeList, 1000000000);//10 MILLION! :D


	for(; iPoint != primeList.end(); iPoint++)					//counting entire way each time would be terrible
		printf("%d\n", *iPoint);//slowest part of whole damn thing
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


