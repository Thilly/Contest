/*
Nick Evans
Thilly.net
16 Jan 2014
*/

var testing ={//object to hold the actual testing data
	tests: [],		//an array for all the testing functions
	interval: 1500,	//interval for the tests to be run at
	numTests: 0,	//running total of tests completed
	testLoop: '',	//the actual interval of the testing loop
	overTime: ''	//timeout for overtime testing
	}

window.onload = startTestingLoop();//start the testing loop

socket.on('disconnect', function()
{//to prevent the testing client from over-running itself, make restart easy
	clearInterval(testing.overTime);//clear any pending overtime intervals
	clearInterval(testing.testLoop);//clear the testing interval
	alert('DISCONNECTED');
});

function startTestingLoop()
{//allocate all the tests into the testing array and start the intervalFunction
	testing.tests[0] = function(){
		testChat('Testing chat');
		};//test chat
	
	testing.tests[1] = function(){
		selectProblem();
		};//test problem selection
		
	testing.tests[2] = function(){
		goodTurnin();
		};//test good turnin
	
	testing.tests[3] = function(){
		badCompile();
		};//test a bad compile

	testing.tests[4] = function(){
		wrongAnswer();
		};//test a wrong answer
		
	testing.tests[5] = function(){
		badRuntime();
		};//test a runtime error
	
	testing.tests[6] = function(){
		badInput();
		};//test taking bad input	
		
	testing.tests[7] = function(){
		overTime();
		};//test taking bad input
		
	var testNames = ['Chat', 'ListSelection', 'SuccessTurnin', 'BadCompile', 'WrongAnswer', 'RuntimeError', 'BadInput', 'OverTime'];
	//names of the various tests
	
	testing.testLoop = setInterval(function(){
	//assign to test, a random test from the available tests each time the interval comes up
	var testNum = testing.numTests%testing.tests.length;
	test = testing.tests[testNum];
		test();//run that test
		testChat('Testing ' + testNames[testNum] + ' #' + testing.numTests++);
	}, testing.interval);
}

function overTime()
{//submit a program that will time out
			
	var code = '#include <iostream>\nusing namespace std;\n\n';
	code += 'int main()\n{\n\tint temp=0;\n\twhile(true)\n\ttemp++;\n\treturn 0;\n}';
	document.getElementById('code').value = code;//fill code with stuff that wont ever finish
	sendSub();//send long submission
	clearInterval(testing.testLoop);//halt the test loop
	testing.overTime = setTimeout(function(){startTestingLoop();},5000 + testing.interval);//restart it after this timeouts
}

function badInput()
{//submit a program that will close before reading in all test data
	var list = document.getElementById('problem');
	for(var i = 0; i < list.childNodes.length; i++)
		if(list.childNodes[i].value == 'ALIENS')//grab aliens since has miles of input
			list.selectedIndex = i;
	var code = '#include <iostream>\nusing namespace std;\n\n';
	code += 'int main()\n{\n\tint temp;\n\tcin>>temp;\n\tcout<<temp;\n\treturn 0;\n}';
	document.getElementById('code').value = code;//fill code with stuff that wont take all input
	sendSub();
}

function wrongAnswer()
{//submit a program to fail on answer
	var code = '#include <iostream>\nusing namespace std;\n\n';
	code += 'int main()\n{\n\tcout<<"The Wrong Answer"<<endl;\n\treturn 0;\n}';
	document.getElementById('code').value = code;//fill code with stuff that is a wrong answer for anything
	sendSub();//submit the compiling source, but watch failure on answer
}

function badRuntime()
{//submit a program to fail during runtime
	var code = '#include <iostream>\n#include <string>\nusing namespace std;\n\n';
	code += 'int main()\n{\n\t*(char *)0=0;\n\treturn 0;\n}';
	document.getElementById('code').value = code;//fill code with stuff that should segfault
	sendSub();//submit the compiling source, but watch failure on runtime
}

function badCompile()
{//submit a program to fail on compile, doesn't matter which program submitting on
	var code = '#include <iostream>\nusing namespace std;\n\n';
	code += 'int main()\n{\n\tcout<<"I wont compile"<<endl\n\treturn 0;\n}';
	document.getElementById('code').value = code;//fill code with stuff that wont compile
	sendSub();//submit the non-compiling source, watch failure
}		

function goodTurnin()
{//submit a program to complete successfully
	var list = document.getElementById('problem');
	for(var i = 0; i < list.childNodes.length; i++)
		if(list.childNodes[i].value == 'TEST')//grab test
			list.selectedIndex = i;
			
	checkSelect();//take the freebie code
	socket.once('problemText', function(){
	sendSub();//submit the source, when recieve the free code
	});
}

function selectProblem()
{//select a problem from the available list
	var list = document.getElementById('problem');
	console.log(list.childNodes.length);
	list.selectedIndex = Math.floor(Math.random()*list.childNodes.length);
	checkSelect();
}

function testChat(message)
{//send a message to the chat, logging and testing
	document.getElementById('inputChat').value = message;//set the message like the user typed it in
	var temp = { keyCode: 13}//pretend that enter was pressed
	chatSend(temp);//call the 'enter' function
}

function testerLogout()
{//when a tester logs out
	var head = document.getElementsByTagName('head')[0];//get the head block
	for(var i = 0; i < head.childNodes.length; i++)
		if(head.childNodes[i].id == 'admin.js' || head.childNodes[i].id == 'testing.js')
		{//if the node is an admin or testing script
			var child = head.childNodes[i];
			head.removeChild(child);//remove it
			console.log('Removed :' + child);
		}

	clearInterval(testing.overTime);//clear any pending overtime intervals
	clearInterval(testing.testLoop);//clear the testing interval
}