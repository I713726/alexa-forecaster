'use strict';

let request = require('request');
var XLSX = require('xlsx');
const inputId = '2222';
const VERSION = '1.0';

module.exports = function(req, res) {

    console.log('New request for the Voya 401k:\n', req.body);

    if (req.body.request.type === 'LaunchRequest') {
        //console.log('In side LaunchRequest :\n', req.body.request.type);
		//var dataRow = readData(inputId);
		//console.log('datRow :', dataRow );
		//console.log('Excel First Name :\n', dataRow.FirstName);
		
		res.json(
            buildResponse(
                {},
                '<speak>Welcome to Voya 401k service, to get started please say the four digit PIN you setup to enabling the skill? </speak>',
                {},
				'<speak>to get started please say the four digit PIN you setup to enabling the skill?</speak>',
                false
            )
        );

    } else if (req.body.request.type === 'SessionEndedRequest') {
		//console.log('In side SessionEndedRequest :\n', req.body.request.type);
       if (req.body.request.reason === 'ERROR') {
           console.error('Alexa ended the session due to an error');
       }
       /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        Per Alexa docs, we shouldn't send ANY response here... weird, I know.
        * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    } else if (req.body.request.type === 'IntentRequest' ) {
		
		if (req.body.request.intent.name === 'VoyaPINIntent' && req.body.request.intent.slots.pin && req.body.request.intent.slots.pin.value) {
			var dataRow = readData(req.body.request.intent.slots.pin.value);
			if (dataRow) {
				var timeGreeting = "";
				var currentTime = new Date();
				if(currentTime.getHours()<12)
					timeGreeting = "Good Morning!!";
				else if(currentTime.getHours()<17)
					timeGreeting = "Good Afternoon!!";
				else 
					timeGreeting = "Good Evening!!";
				res.json(
					buildResponse(
						{voayPin : dataRow.No},
						'<speak>Hi '+dataRow.FirstName+' '+timeGreeting+' how can I help you with your ' +dataRow.PlanName+ ' today</speak>',
						{},
						'<speak>You can say, things like tell me how my account is doing? </speak>',
						false
					)
				);
			} else {
				res.json(
					buildResponse(
						{},
						'<speak>Invalid PIN or No Account setup!</speak>',
						{},
						'',
						true
					)
				);
			}
		} else if ( req.body.session.attributes && req.body.session.attributes.voayPin ) {
			var dataRow = readData(req.body.session.attributes.voayPin);
			if (req.body.request.intent.name === 'VoyaHowMyAccountIntent') {
				var value = new Date();
				var dateVal =  value.getMonth()+1 + "/" + value.getDate() + "/" + value.getFullYear();
				res.json( 
					buildResponse( 
						{ questionNo: '1', voayPin : dataRow.No }, 
						'<speak>Sure '+dataRow.FirstName+', As of '+dateVal+', your account balance is '+dataRow.Accountbalance+'. Your rate of return for the past 12 months is '+dataRow.PersonalRateofReturn+', which is above the average portfolio benchmark for this period. Nice job making your money work for you! It looks like you are currently projected to have enough money to retire at age '+dataRow.ActualAge+'. Would you like to hear suggestions to be able retire a little sooner?</speak>', 
						{}, 
						'<speak>Would you like to hear suggestions to be able retire a little sooner?</speak>',
						false )
					);
			} else if (req.body.request.intent.name === 'VoyaYesIntent') {
				if (req.body.session.attributes && req.body.session.attributes.questionNo && req.body.session.attributes.questionNo == '1') {
					res.json( 
						buildResponse( 
							{ questionNo: '2', voayPin : dataRow.No}, 
							'<speak>You are doing a great job of saving '+dataRow.CurrentSaving+' from your pay but if you increase your savings rate to '+dataRow.IncreaseSaving+' you could retire at age '+dataRow.RetireAge+'.  Would you like me to increase your savings rate by '+dataRow.SavingsRate+' now?</speak>', 
							{}, 
							'<speak>Would you like me to increase your savings rate by '+dataRow.SavingsRate+' now?</speak>',
							false )
						);
				} else if (req.body.session.attributes && req.body.session.attributes.questionNo 
					&& (req.body.session.attributes.questionNo == '2' || req.body.session.attributes.questionNo == '3')) {
					res.json( 
						buildResponse( 
							{}, 
							'<speak>Ok, great. I’ve done that for you. Congratulations your future self will thank you!</speak>', 
							{}, 
							'',
							true )
						);
				}
			} else if (req.body.request.intent.name === 'VoyaNoIntent') {
				if (req.body.session.attributes && req.body.session.attributes.questionNo 
					&& (req.body.session.attributes.questionNo == '1' || req.body.session.attributes.questionNo == '3')) {
					res.json( 
						buildResponse( 
							{}, 
							'<speak>Ok '+dataRow.FirstName+'!, I understand thank you for using Voya 401k service, have a nice day!</speak>', 
							{}, 
							'',
							true )
						);
				} else if (req.body.session.attributes && req.body.session.attributes.questionNo && req.body.session.attributes.questionNo == '2') {
					res.json( 
						buildResponse( 
							{questionNo: '3', voayPin : dataRow.No}, 
							'<speak>Ok, I understand.  Would you want to Save More in the future? I can sign you up to save '+dataRow.SavingsRateAgain+' more a year from now?</speak>', 
							{}, 
							'<speak>can sign you up to save 1% more a year from now?</speak>',
							false )
						);
				}
			} else if (req.body.request.type === 'HelpIntent') {
				res.json(
					buildResponse(
						{},
						'<speak>Welcome to Voya 401k service, you can ask me in different ways like Please tell me how my account is doing?</speak>',
						{},
						'',
						false
					)
				);

			} else if (req.body.request.type === 'StopIntent' || req.body.request.type === 'CancelIntent') {
				res.json(
					buildResponse(
						{},
						'<speak>Ok, thank you for using Voya 401k service, have a nice day! </speak>',
						{},
						'',
						true
					)
				);

			} else {
				res.json( 
					buildResponse( 
						{}, 
						'<speak>Ok, thank you for using Voya 401k service, have a nice day!</speak>', 
						{}, 
						'',
						true )
				);
			}
		} else {
			res.json(
				buildResponse(
					{},
					'<speak>Invalid PIN or No Account setup!</speak>',
					{},
					'',
					true
				)
			);
		}
    } else {
        console.error('Intent not implemented: ', req.body);
        res.status(504).json({ message: 'Intent Not Implemented' });
    }

};

function readData(id) {
	//console.log('id: ', id);
	var workbook = XLSX.readFile('./Master.xlsx');
	var sheet_name_list = workbook.SheetNames;
	var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
	//console.log(xlData);
	var outData;
	xlData.forEach(function(row) { 
		//console.log(row.No);
		if (id == row.No) {
			//console.log('inside loop:', row.No);
			outData = row;
		}
	});
	
	return outData;
    
}

function buildResponse(session, speech, card, reprompt, end) {
    return {
        version: VERSION,
        sessionAttributes: session,
        response: {
            outputSpeech: {
                type: 'SSML',
                ssml: speech
            },
			reprompt : {
				outputSpeech: {
					type: 'SSML',
					ssml: reprompt
				}
			},
            //card: card,
            shouldEndSession: !!end
        }
    };
}