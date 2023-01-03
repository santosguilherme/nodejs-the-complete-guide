# Notes

## Debugging

- https://nodejs.org/en/docs/guides/debugging-getting-started/
- https://www.jetbrains.com/help/webstorm/running-and-debugging-node-js.html#nodemon

## Templating Engines

Useful resources:

- Pug Docs: https://pugjs.org/api/getting-started.html
- Handlebars Docs: https://handlebarsjs.com/
- EJS Docs: http://ejs.co/#docs

## DBs

- Node MySQL2: Learn more about the Node MySQL Package: https://github.com/sidorares/node-mysql2
- Sequelize: Official Docs: http://docs.sequelizejs.com/
- When using Sequelize, the official docs describe how to add
  pagination: https://sequelize.org/master/manual/model-querying-basics.html
- MongoDB NodeJS Driver: https://github.com/mongodb/node-mongodb-native
- Mongoose Official Docs: https://mongoosejs.com/docs/

## Sessions

- Express-session Official Docs: https://github.com/expressjs/session

## Security

### Password

- Bcrypt Official Docs: https://github.com/dcodeIO/bcrypt.js

### CSRF

https://www.acunetix.com/websitesecurity/csrf-attacks/

#### csurf() Alternatives

Unfortunately, the csurf package, which is used in some sections of this course, is no longer maintained at this time.
The development team recently deprecated this popular package, saying that it should no longer be
used (https://github.com/expressjs/csurf#deprecated).

The purpose of the corresponding course lectures is to explain the general principle of CSRF attacks. You can still
safely use the deprecated package for learning purposes, since attacks are only simulated locally in our code.

However, in practice you should now choose a different package (https://www.npmjs.com/search?q=express%20csrf). You may,
for example, consider using this package (which has a different API than
csurf()): https://www.npmjs.com/package/csrf-csrf.

Please understand that support in this course currently still focuses on the csurf API, as shown in the course videos
and code snapshots.

And most importantly, the general principle explained in this course is package independent.

## Emails

- Nodemailer Official Docs: https://nodemailer.com/about/
- SendGrid Official Docs: https://sendgrid.com/docs/

## Validation

- Express-Validator Docs: https://express-validator.github.io/docs/
- Validator.js (which is used behind the scenes) Docs: https://github.com/chriso/validator.js

## Error Handling

- Error Handling in Express.js - Official Docs: https://expressjs.com/en/guide/error-handling.html
- HTTP Status: https://httpstatuses.com/

## Files

- Multer Official Docs: https://github.com/expressjs/multer
- Streaming Files: https://medium.freecodecamp.org/node-js-streams-everything-you-need-to-know-c9141306be93
- Generating PDFs with PDFKit: http://pdfkit.org/docs/getting_started.html

## Payments

- Official Stripe.js Docs: https://stripe.com/docs
