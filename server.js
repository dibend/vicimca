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

    if (emailValidator.validate(lead.agent_email)) {
      var contact = {
        'Company Name': lead.address2,
        'Business Phone': lead.phone_number,
        'Cell Phone': lead.alt_phone,
        'Owner': lead.first_name + ' ' + lead.middle_initial + ' ' + lead.last_name,
        'Address 1': lead.address1,
        'Address 3': lead.address3, 
        'City': lead.city,
        'State': lead.state, 
        'Province': lead.province, 
        'Zip': lead.postal_code,
        'Gender': lead.gender,
        'Comments': lead.comments,
        'Agent': lead.fullname
      }
      var emailText = '';
      for(dp in contact) {
        if(contact[dp] !== '') {
          emailText += dp + ':\n' + contact[dp] + '\n\n';
        }
      }

      var mailOptions = {
        from: config.from,
        to: lead.agent_email,
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
      response.redirect('https://standard.mcasuite.com/contactStage/search?offset=0&max=99999');
    });
  }
});

app.listen(8080, function () {
  console.log('app listening on port 8080');
});
