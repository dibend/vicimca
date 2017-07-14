var req = require('request');
var express = require('express');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var emailValidator = require('email-validator');
var config = require('./config');
var app = express();

var mailer = nodemailer.createTransport(smtpTransport({
  host: config.ses_host,
  secureConnection: true,
  port: 465,
  auth: {
    user: config.ses_user,
    pass: config.ses_pass
  }
}));

app.get('/', function(request, response) {
  var lead = request.query;
  console.log(lead);
  var options = {
    url: config.mcaUrl,
    headers: {
      X_MCASUITE_APP_ID: config.mcaId,
      X_MCASUITE_APP_TOKEN: config.mcaToken
    },
    form: {
      firstName: lead.first_name,
      lastName: lead.last_name,
      businessPhone: lead.phone_number,
      mobilePhone: lead.alt_phone,
      email: lead.email,
      companyName: lead.address2
    }
  };
  
  if(options.form.businessPhone === '' || options.form.businessPhone == null) {
    response.status(404);
    response.send('404');
  } else {
    if(options.form.firstName === '' || options.form.firstName == null) {
      options.form.firstName = 'N/A';
    }

    if(options.form.lastName === '' || options.form.lastName == null) {
      options.form.lastName = 'N/A';
    }

    var agent = lead.agent_email;
    if (emailValidator.validate(agent)) {
      var emailText = 'Company Name:\n' + lead.address2 + 
      '\n\nBusiness Phone:\n' + lead.phone_number + 
      '\n\nCell Phone:\n' + lead.alt_phone + 
      '\n\nOwner:\n' + lead.first_name + ' ' + lead.middle_initial + ' ' + lead.last_name +
      '\n\nAddress 1:\n' + lead.address1 + 
      '\n\nAddress 3:\n' + lead.address3 + 
      '\n\nCity:\n' + lead.city + 
      '\n\nState:\n' + lead.state + 
      '\n\nProvince:\n' + lead.province + 
      '\n\nZip:\n' + lead.postal_code + 
      '\n\nGender:\n' + lead.gender +
      '\n\nComments:\n' + lead.comments; 

      var mailOptions = {
        from: config.from,
        to: agent,
        subject: 'Vicidial Lead',
        text: emailText
      };

      mailer.sendMail(mailOptions, function(err, res) {
        if(err) {
          console.log(err);
        }
        mailer.close();
      }); 
    }

    req.post(options, function(err, res, body) {
      response.send(body);
    });
  }
});

app.listen(8080, function () {
  console.log('app listening on port 8080')
});
