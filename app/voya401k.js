'use strict';

let request = require('request');
var XLSX = require('xlsx');

const VERSION = '1.0';

module.exports = function(req, res) {

    console.log('New request for the Voya 401k:\n', req.body);

    if (req.body.request.type === 'LaunchRequest') {
        console.log('In side LaunchRequest :\n', req.body.request.type);
		var dataRow = readData('1111');
		console.log('Excel First Name :\n', dataRow.FirstName);
		
		res.json(
            buildResponse(
                {},
                '<speak>Hi Sreeni, how can I help you with your Voya 401(K) Savings Plan today</speak>',
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
			buildResponse( { questionNo: '1' }, '<speak>Sure Sreeni, As of February 15, 2018, your account balance is $55,000. Your rate of return for the past 12 months is 20%, which is above the average portfolio benchmark for this period. Nice job making your money work for you! It looks like you are currently projected to have enough money to retire at age 70. Would you like to hear suggestions to be able retire a little sooner?</speak>', {}, false )
			);
    } else if (req.body.request.type === 'IntentRequest' &&
	   req.body.request.intent.name === 'VoyaYesIntent') {
		if (req.body.session.attributes && req.body.session.attributes.questionNo && req.body.session.attributes.questionNo == '1') {
			res.json( 
				buildResponse( { questionNo: '2' }, '<speak>You are doing a great job of saving 6% from your pay but if you increase your savings rate to 8% you could retire at age 67.  Would you like me to increase your savings rate by 2% now?</speak>', {}, false )
				);
		} else if (req.body.session.attributes && req.body.session.attributes.questionNo 
			&& (req.body.session.attributes.questionNo == '2' || req.body.session.attributes.questionNo == '3')) {
			res.json( 
				buildResponse( {}, '<speak>Ok, great. I’ve done that for you. Congratulations your future self will thank you!</speak>', {}, true )
				);
		}
    } else if (req.body.request.type === 'IntentRequest' &&
	   req.body.request.intent.name === 'VoyaNoIntent') {
		if (req.body.session.attributes && req.body.session.attributes.questionNo 
			&& (req.body.session.attributes.questionNo == '1' || req.body.session.attributes.questionNo == '3')) {
			res.json( 
				buildResponse( {}, '<speak>Ok Sreeni!, I understand thank you for using Voya 401k service, have a nice day!</speak>', {}, true )
				);
		} else if (req.body.session.attributes && req.body.session.attributes.questionNo && req.body.session.attributes.questionNo == '2') {
			res.json( 
				buildResponse( {questionNo: '3'}, '<speak>Ok, I understand.  Would you want to Save More in the future? I can sign you up to save 1% more a year from now?</speak>', {}, false )
				);
		}
    } else {
        console.error('Intent not implemented: ', req.body);
        res.status(504).json({ message: 'Intent Not Implemented' });
    }

};

function readData(id) {
	
	var workbook = XLSX.readFile('./Master.xlsx');
	var sheet_name_list = workbook.SheetNames;
	var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
	console.log(xlData);
	xlData.forEach(function(row) { 
		console.log(row.No);
		if (id == row.No) {
			return row;
		}
	});
    
}

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