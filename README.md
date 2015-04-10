Telepathic Black Panther
---------

[![Build Status](https://travis-ci.org/tmaiaroto/telepathic-black-panther.svg?branch=master)](https://travis-ci.org/tmaiaroto/telepathic-black-panther) [![Test Coverage](https://codeclimate.com/github/tmaiaroto/telepathic-black-panther/badges/coverage.svg)](https://codeclimate.com/github/tmaiaroto/telepathic-black-panther) [![Code Climate](https://codeclimate.com/github/tmaiaroto/telepathic-black-panther/badges/gpa.svg)](https://codeclimate.com/github/tmaiaroto/telepathic-black-panther)

This handy JavaScript utility can be easily placed on your web pages to automatically report various events and extra detail to Google (universal) Analytics. 

It's "telepathic" in the sense that it uses logic to understand your web site and user behavior. It knows what you and your visitors are thinking. 
Then of course what do black panthers do best? Stalk! We're talking about analytics and tracking after all.

In all seriousness, this script should provide you with a great set of basic events and then will also serve as a convenient wrapper around 
Google (universal) Analytics so you can easily track even more information specific to your needs.

### Common events tracked

There are some basic events out of the box that will be tracked if your page meets the requirements. They are as follows:

* **read** If a visitor has actually read the content on your page, this event gets logged. Telepathic?! No, we watch the amount of time spent 
on the page along with how far down the visitor scrolled.
* **scroll %** How far down the page a visitor has scrolled at set intervals, 25%, 50%, 75%, and 100%.
* **form abandonment** If a visitor starts filling out a form, but then doesn't finish before leaving.
* **slow form response** If a vistor takes a long time to fill out a form. This could mean they are debating something or having trouble for some reason.
* **exit to** Shows where visitors are exiting to (determined by last outbound link they clicked).
* **outbound** Links being clicked that aren't your site's pages.

### How do I get my own Telepathic Black Panther?

Well, there's already a distribution waiting for you in the ```dist``` directory. Simply include that on your page. You can use Bower of course:

```bower install telepathic-black-panther```

Then add the script to your site pages.

```<script type="text/javascript" src="telepathic-black-panther.js"></script>```

Instantiate it after your Google Analytics embed code at the bottom of your pages.

```<script type="text/javascript">var panther = new Tbp();</script>```

You of course need to be using Google Analytics and it is recommended to include this script at the bottom of your page after Google Analytics. 
That's it! You have a basic implementation ready to go. Take a look at your Google Analytics real-time data and you should see some custom events 
coming in depending on what actions you take on your web page.

### Configuration

TBD

### The API

TBD