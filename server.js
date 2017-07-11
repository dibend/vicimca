var req = require('request');
var express = require('express');
var config = require('./config');
var app = express();

app.get('/', function(request, response) {
  var lead = request.query;
  var options = {
    url: config.mcaUrl,
    headers: {
      X_MCASUITE_APP_ID: config.mcaId,
      X_MCASUITE_APP_TOKEN: config.mcaToken
    },
    form: {
      firstName: lead.first_name,
      lastName: lead.last_name,
      middleName: lead.middle_initial,
      companyAddress: {
        city: lead.city,
        street1: lead.address1,
        street2: lead.address2,
        state: lead.state,
        zip: lead.postal_code
      },
      businessPhone: lead.phone_number,
      title: lead.title,
      email: lead.email,
      country: lead.country_code,
      companyName: lead.address2
    }
  };
  
  if(options.form.firstName === '' || options.form.firstName == null) {
    options.form.firstName = 'N/A';
  }

  if(options.form.lastName === '' || options.form.lastName == null) {
    options.form.lastName = 'N/A';
  }

  req.post(options, function(err, res, body) {
    console.log(body);
    response.send(body);
  });
});

app.listen(8080, function () {
  console.log('app listening on port 8080')
});
