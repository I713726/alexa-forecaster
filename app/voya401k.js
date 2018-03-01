'use strict';

let request = require('request');

const VERSION = '1.0';

module.exports = function(req, res) {

    console.log('New request for the Voya 401k:\n', req.body);

    if (req.body.request.type === 'LaunchRequest') {
        console.log('In side LaunchRequest :\n', req.body.request.type);
		res.json(
            buildResponse(
                { dateRequested: true },
                '<speak>Hi Tom, how can I help you with your Voya 401(K) Savings Plan today</speak>',
                {},
                false
            )
        );

    } else if (req.body.request.type === 'SessionEndedRequest') {
		console.log('In side SessionEndedRequest :\n', req.body.request.type);
       if (req.body.request.reason === 'ERROR') {
           console.error('Alexa ended the session due to an error');
       }
       /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        Per Alexa docs, we shouldn't send ANY response here... weird, I know.
        * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    } else if (req.body.request.type === 'IntentRequest' &&
               req.body.request.intent.name === 'VoyaHowMyAccountIntent') {
				res.json( 
					buildResponse( {}, '<speak>Sure Tom, As of February 15, 2018, your account balance is $55,000. Your rate of return for the past 12 months is 20%, which is above the average portfolio benchmark for this period. Nice job making your money work for you! It looks like you are currently projected to have enough money to retire at age 70. Would you like to hear suggestions to be able retire a little sooner?</speak>', {}, true )
					);
    } else {
        console.error('Intent not implemented: ', req.body);
        res.status(504).json({ message: 'Intent Not Implemented' });
    }

};


function buildResponse(session, speech, card, end) {
    return {
        version: VERSION,
        sessionAttributes: session,
        response: {
            outputSpeech: {
                type: 'SSML',
                ssml: speech
            },
            //card: card,
            shouldEndSession: !!end
        }
    };
}