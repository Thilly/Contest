//BILLIARDS
#include <iostream>
#include <cstdlib>

int main()
{
	int rounds, sets;
	int player1, player2, lead = 0, winner=2;

	std::cin >> sets;
	while(sets--)
	{	
		std::cin >> rounds;
		while(rounds--)
		{
			std::cin >> player1 >>  player2;
			if(lead <=abs(player1-player2))
			{
				lead = abs(player1-player2);
				winner = (player1 > player2) ? 1 : 2;
			}
		}
			std::cout << winner << " " << lead << std::endl;
	}
	return 0;
}