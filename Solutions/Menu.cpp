//MENU
#include <iostream>

int main()
{

	int cases, money, items, cost;
	std::cin >> cases;
	while(cases--)
	{
		items = 0;

		std::cin >> money;

		for(int i = 11; money > 0; i--)
		{
			if((1 << i) <= money)
			{
				items++;
				money -= 1 << i;
				i++;
			}
		}
		std::cout << items << std::endl;
	}
	return 0;
}