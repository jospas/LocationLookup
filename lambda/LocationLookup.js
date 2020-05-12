/**
 * Lambda function that uses the Google GeoCode API to lookup
 * a geographic location for an address, takes a Connect contact record
 * and expects the address to be encoded in the Attributes.address line
 */

const axios = require('axios');

exports.handler = async function(event, context) 
{
  console.log('[INFO] received request: %s', JSON.stringify(event, null, "  "));

  try
  {
    var address = getAddress(event);
    return await getLocation(address);
  }
  catch (error)
  {
    console.log('[ERROR] failed to lookup location', error);
    throw error;
  }
  
};

/**
 * Fetches the an address line from custom attributes:
 *  event.Details.ContactData.Attributes.Address
 */
function getAddress(contactRecord)
{
  if (!contactRecord.Details || 
      !contactRecord.Details.ContactData || 
      !contactRecord.Details.ContactData.Attributes ||
      !contactRecord.Details.ContactData.Attributes.Address)
  {
    throw new Error('Invalid input contact record, could not locate Details.ContactData.Attributes.Address');
  }

  return contactRecord.Details.ContactData.Attributes.Address;
}

/**
 * Looks up a location using the Google GeoCode service
 */
async function getLocation(address)
{
  try
  {
    var url = 'https://maps.googleapis.com/maps/api/geocode/json' + 
      '?key=' + process.env.GOOGLE_API_KEY + 
      '&address=' + address;

    var response = await axios.get(url);

    if (response.status == 200)
    {    
      var responseData = response.data;

      console.log('[INFO] GeoCode response: %s', JSON.stringify(responseData, null, '  '));

      var result = {};
      result.status = responseData.status;
      result.confidence = 0;
      result.queryAddress = address;

      if (responseData.status == 'OK' && 
          responseData.results &&
          responseData.results.length > 0)
      {
        result.longitude = responseData.results[0].geometry.location.lng;
        result.latitude = responseData.results[0].geometry.location.lat;
        result.locationAddress = responseData.results[0].formatted_address;
        result.locationType = responseData.results[0].geometry.location_type;

        switch (responseData.results[0].geometry.location_type)
        {
          case 'ROOFTOP':
            result.confidence = 10;
            break;
          case 'RANGE_INTERPOLATED':
            result.confidence = 6;
            break;
          case 'GEOMETRIC_CENTER':
            result.confidence = 5;
            break;            
          case 'APPROXIMATE':
            result.confidence = 1;
            break; 
          default:
            result.confidence = 0;           
        }
      }
      else if (responseData.error_message)
      {
        result.errorMessage = responseData.error_message;
      }

      return result;
    }
    else
    {
      console.log('[ERROR] received error for request: %s with response: %s', url, JSON.stringify(response, null, '  '));
      throw new Error('GeoCode service error: ' + response.status);
    }
  }
  catch (error)
  {
    console.log('[ERROR] failed to invoke Google GeoCode service', error);
    throw error;
  }

}