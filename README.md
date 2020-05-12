## Location Lookup Function

Demonstrates calling the Google GeoCode API from AWS Lambda and taking an input address embedded in an Amazon Connect contact record.

The system deploys one Lambda function:

## Location Lookup Function

This function expects a simple formatted address like:

	18 Bent Street Indooroopilly QLD Australia
	
It expects this in a contact record attribute:

	contactRecord.Details.ContactData.Attributes.Address
	
It returns a location in this format:
	
	{
	  "status": "OK",
	  "confidence": 6,
	  "queryAddress": "18 Bent Street Indooroopilly QLD Australia",
	  "longitude": 152.9802263,
	  "latitude": -27.484103,
	  "locationAddress": "18 Bent St, Toowong QLD 4066, Australia",
	  "locationType": "RANGE_INTERPOLATED"
	}

In this example the suburb has been reported incorrectly, Indooroopilly instead of Toowong and thus the confidence is lower (6/10)

Confidence is in the range [0-10] with 10/10 being the highest accuracy.

Approximate and interpolated locations are given a lower score.

## Pre deployment

Run teh following command to download the required node modules:

	npm install

## Deployment

Deploy using serverless:

	serverless deploy --profile <profilename> --stage <stage name>

## Post deployment tasks

After successful deployment, edit the environment variable on the Lambda function, inserting an API key that will be usable from AWS Lambda.

	GOOGLE_API_KEY

## Testing the service

Choose the default Connect Contact Record request from the Lambda test messages and add an Address to the Attributes element:

	{
	  "Name": "ContactFlowEvent",
	  "Details": {
	    "ContactData": {
	      "Attributes": {
	        "Address": "18 Bent Street Indooroopilly QLD Australia"
	      },
	      "Channel": "VOICE",
	      "ContactId": "5ca32fbd-8f92-46af-92a5-6b0f970f0efe",
	      "CustomerEndpoint": {
	        "Address": "+11234567890",
	        "Type": "TELEPHONE_NUMBER"
	      },
	      ...
	    } 
	    "Parameters": {}
	  }
	}