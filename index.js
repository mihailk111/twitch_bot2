const tmi = require('tmi.js');
const fs  = require('fs');
let channel = fs.readFileSync('channel.txt', 'utf-8').trim();
const client = new tmi.Client({
	options: { debug: true },
	connection: { reconnect: true },
	identity: {
		username: 'cnt_bot',
		password: 'oauth:blablabla123'
	},
	channels: [ channel ]
});
client.connect();
let bad_buys = [];
let COUNTING = false;
let C_GOAL = 0;
let c_next = 1;
let last_name = '';
client.on('chat', (channel, userstate, message, self) => {
	// Ignore echoed messages.
	if(self) return;
    message = message.trim();
    if (COUNTING) // IF WE COUNT
    {
        if (userstate.mod) // MODERATOR
        {
           if (/^!cstop/.test(message))
           {
                print_winner(last_name);
                stop();
                return;
           }
           if (/^!cnow/.test(message))
           {
                client.say(channel, `!!! Последнее число: ${c_next-1} Следующее: ${c_next} !!!`);
                return;
           }
           if (/^\d+$/.test(message))
           {
                let user_number = parseInt(message, 10); // entered
                if (user_number === c_next)
                {
                    last_name = userstate.username;
                    if (c_next%100 === 0){ 
                        client.say(channel , `!!! ${userstate.username} Досчитал до ${user_number}. Продолжаем !!!`); 
                    }
                    if (c_next === C_GOAL)
                    {
                        print_winner2(last_name);
                        stop();
                        
                    }
                    c_next ++;    
                }
                else
                {
                    client.deletemessage(channel, userstate.id);
                }
           }
        }
        else // USERS 
        {
            if (/^\d+$/.test(message)) // IF DIGIT
            {
                 // should be this
                let user_number = parseInt(message, 10); // entered
                if (user_number === c_next) // IF RIGHT DIGIT
                {
                    last_name = userstate.username;
                    
                    if (c_next%100 === 0){ client.say(channel, `!!! ${userstate.username} Досчитал до ${user_number}. Продолжаем !!!`); }

                    if (c_next === C_GOAL)
                    {
                        print_winner2(last_name);
                        stop();
            
                    }
                    c_next ++;
                }else // IF WRONG NUMBER
                {
                    client.deletemessage(channel, userstate.id);
                    
                    if (bad_buys.includes(userstate.username))
                    {
                        client.timeout(channel,userstate.username , 5 , "Неправильное число !");
                    }
                    else
                    {
                        bad_buys.push(userstate.username);
                    }
                }
            }else // USER NOT DIGIT
            {
                client.deletemessage(channel, userstate.id);
                if (bad_buys.includes(userstate.username))
                {
                    client.timeout(channel,userstate.username , 5 , "Только числа !");
                }
                else
                {
                    bad_buys.push(userstate.username);
                }
            }
        }
    }
    else // NOT COUNT 
    {
        if(userstate.mod)
        {
           if (/^!count \d+/.test(message))
           {
                COUNTING = true;
                C_GOAL = parseInt(message.match(/!count (\d+)/)[1], 10 );
                we_count(C_GOAL); 
                return;
           }

        }
    }


});
    
function stop()
{
    bad_buys = [];
    COUNTING = false;
    C_GOAL = 0;
    c_next = 1;
    last_name = '';
}
function print_winner(winner)
{
    client.say(channel, `!!! ${winner} ПОБЕДИЛ ДОСЧИТАВ ДО ${(c_next - 1)} !!!`);
    
}
function print_winner2(winner)
{
    client.say(channel, `!!! ${winner} ПОБЕДИЛ ДОСЧИТАВ ДО ${c_next} !!!`);
    
}
function we_count(goal) {
    client.say(channel, `!!! СЧИТАЕМ ДО ${goal} !!!`);
}

