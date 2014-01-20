Ember + Sass + Express App Kit
==============================

![Alt](https://lh6.googleusercontent.com/-A6yCTan8L18/UtHxPg9U1gI/AAAAAAAADzw/Ov1P-8oymx4/w500-h376-no/logo-235e394c.png)
![Alt](https://lh6.googleusercontent.com/-NteYFnZZGKI/UtHxPT7EqLI/AAAAAAAADzc/Wmyj-FmIp7E/w500-h148-no/MongoDB_Logo.png)
![Alt](https://lh6.googleusercontent.com/-_z1-DOIYRGo/UtHxPt_tfxI/AAAAAAAADzs/S9dNTRV6fnQ/w500-h250-no/nodejs_logo.png)
![Alt](https://lh4.googleusercontent.com/-tO81OpzrRLQ/UtHxPi-wUgI/AAAAAAAADzk/yOe91cZHLvU/w500-h190-no/emberjs.png)
![Alt](https://lh3.googleusercontent.com/-Psns_TAmzm8/UtYN7pVi5vI/AAAAAAAAD1s/6-NsXyupKNs/w500-h152-no/687474703a2f2f662e636c2e6c792f6974656d732f30563253316e304b3169337931633132326730342f53637265656e25323053686f74253230323031322d30342d31312532306174253230392e35392e3432253230414d2e706e67.png)
## Overview
This project provides a starting point for your Ember apps with Express web framework serving as a RESTful API  back-end. Directory structure is heavily influenced by [ember-tools](https://github.com/rpflorence/ember-tools) and [Ember App Kit](https://github.com/stefanpenner/ember-app-kit). In fact it is designed to work with ember-tools for quickly scaffolding models, views, template, routes and controllers. Here is an example from ember-tools's github page:

![Alt](https://lh3.googleusercontent.com/-953Nn0wsC_E/UtICtjFhYII/AAAAAAAAD0M/4TzndfztrP4/w1200-h694-no/687474703a2f2f636c2e6c792f696d6167652f32473078333233753135306d2f656d6265722e676966-3.gif)

Thanks to Ember's *Convention-over-Configuration* we are quickly able to generate application files with a simple command. That is a huge time saver in the long run.

## Screenshots
![Alt](https://lh3.googleusercontent.com/-hulAr-HrmHI/UtzRvqli0AI/AAAAAAAAD3U/xlQAZnFiTR0/w1084-h828-no/Screenshot+2014-01-20+02.30.58.png)
![Alt](https://lh6.googleusercontent.com/-wwvL98Pjf-4/UtzRvaI2D4I/AAAAAAAAD3M/ljiEIf1i40A/w1084-h828-no/Screenshot+2014-01-20+02.31.49.png)
![Alt](https://lh3.googleusercontent.com/-G3vNxLcLoIk/UtzRwGTa_9I/AAAAAAAAD3k/e-8zx9axDS4/w1084-h828-no/Screenshot+2014-01-20+02.32.11.png)

<hr />
**Versions:** Ember 1.3, Ember Data 1.0b5, Handlebars 1.1.2, jQuery 2.0.3
<hr />

## Prerequisites
- Node.js `http://nodejs.org`
- MongoDB `brew install mongodb`
- ember-tools: `sudo npm install -g ember-tools`

## Usage
Click on **Download ZIP** button in the right sidebar.
Extract and navigate to the directory in terminal. Then to install all the dependencies run:
```
npm install
```
To start a web server, run `node app.js`. **Note**: MongoDB must be running or else the server won't start. Then visit `http://localhost:3000`. There are no server-side views, thus you will not see `res.render` anywhere in the code. The `index.html` is loaded implicitly from the `/public` folder. And `index.html` in turn loads the entire Ember application.

Updating *.scss stylesheets will automatically result in generating a proper css file, as long as the Express server is running. This ability is provided by the `node-sass` library.

For Ember source files you will use **ember-tools** to build and watch for file changes. Simply run `ember build` in the project root directory to compile all javascript files into `application.js`. If you want ember-tools to automatically run build command when files change, run `ember build -w`. Simple as that.

To recap: Make sure MognoDB is running. Run `node app.js`. Then in a separate terminal tab run `ember build -w`. And you are all set.

For generating models, views, controllers, templates, routes please refer to ember-tools [github page](https://github.com/rpflorence/ember-tools).

## TODO
- ~~Authentication (Local + Facebook)~~
- ~~Express Middleware~~
- Offline.js
- Notification when server is shut down
- ~~Bootstrap navbar~~


## Tests
There are currently no actual Ember tests, but I plan to add QUnit tests in the future. Why QUnit and not Mocha or Jasmine? QUnit is the default testing framework in Ember, and I have no preference for any testing framework, so I chose to stick with the defaults. But of course feel free to swap it for something else.

## Contributing
Please feel free to submit a bug, propose an enhancement, send pull requests. This project is definitely not set in stone, and I plan to keep always improving it as I learn better practices from Ember and Node.js communities.

## License
The MIT License (MIT)

Copyright (c) 2013 Sahat Yalkabov

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
