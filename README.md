Telepathic Black Panther
---------

[![Build Status](https://travis-ci.org/tmaiaroto/telepathic-black-panther.svg?branch=master)](https://travis-ci.org/tmaiaroto/telepathic-black-panther) [![Test Coverage](https://codeclimate.com/github/tmaiaroto/telepathic-black-panther/badges/coverage.svg)](https://codeclimate.com/github/tmaiaroto/telepathic-black-panther) [![Code Climate](https://codeclimate.com/github/tmaiaroto/telepathic-black-panther/badges/gpa.svg)](https://codeclimate.com/github/tmaiaroto/telepathic-black-panther)

This handy JavaScript utility can be easily placed on your web pages to automatically report various events and extra detail to Google (universal) Analytics, 
a dataLayer, or just for you to capture and handle yourself in your own JavaScript. 

The name? Well, it's "telepathic" in the sense that it uses logic to understand your web site and user behavior. Then of course what do black panthers do best? 
Stalk! We're talking about analytics and tracking after all.

In all seriousness, this script should provide you with a great set of basic events and the ability to listen for them and changes to a dataLayer should you 
be working with one. By deafult it's going to report to Google Analytics so you shouldn't have to do much to set it up.

### Common events tracked

There are some basic events out of the box that will be tracked if your page meets the requirements. They are as follows:

* **read** If a visitor has actually read the content on your page, this event gets logged. Telepathic?! No, we watch the amount of time spent 
on the page along with how far down the visitor scrolled.
* **scroll %** How far down the page a visitor has scrolled at set intervals, 25%, 50%, 75%, and 100%.
* **form abandonment** If a visitor starts filling out a form, but then doesn't finish before leaving.
* **slow form response** If a vistor takes a long time to fill out a form. This could mean they are debating something or having trouble for some reason.
* **outbound** Links being clicked that aren't your site's pages.
* **hashbang change** Links on site that perhaps link to an anchor farther down the page or for single-page JavaScript apps.
* **history change** When visitors click backward/forward on their browser.
* **mouseleave** When visitors move their mouse outside of an element on the page (can be the page itself).
* **inactivity** When visitors have been inactive for defined periods of time (1, 3, and 5 minutes by default).


### How do I get my own Telepathic Black Panther?

Well, there's already a distribution waiting for you in the ```dist``` directory. Simply include that on your page. You can use Bower of course:

```bower install telepathic-black-panther```

Then add the script to your site pages.

```<script type="text/javascript" src="telepathic-black-panther.js"></script>```

Instantiate it after your Google Analytics embed code at the bottom of your pages.

```<script type="text/javascript">var panther = new Tbp();</script>```

The use of Google Analytics is optional, but it is recommended to include this script at the bottom of your page after Google Analytics. 
That's it! You have a basic implementation ready to go. Take a look at your Google Analytics real-time data and you should see some custom events 
coming in depending on what actions you take on your web page.

### Configuration

TBD

### The API

Telepahtic Black Panther is well documented, but one of the most important things about it is it's message bus. The panther bus will emit all 
events and also emit an event when the dataLayer has something new pushed on to it. So if you are using a dataLayer for Google Tag Manager or 
any other purpose, you can listen in to it. Note that should you need more advanced dataLayer functions, you can take a look at: 
https://github.com/google/data-layer-helper

It's not the goal of this project to add a whole ton of functionality around the dataLayer, but you can certainly catch any event that's pushed 
onto it with ease. You may even find it easier than adding a listener with the data-layer-helper. So if that's all you need, then you're ok 
with Telepathic Black Panther alone. To do that, you can use:

```
var panther = new Tbp();

panther.bus.on("dataLayer", function(event, theDataLayer) {
	// `event` will be the data pushed on to the dataLayer array    
	// `theDataLayer` will be the entire array    
});
```

Again, Telepathic Black Panther will push onto the ```dataLayer``` if it is set on the page before ```new Tbp();``` is instantiated. If you named 
your dataLayer something else you can pass that in the options. Likewise, you can pass ```false``` to the ```dataLayer``` option and not have anything 
pushed on to the dataLayer from Telepathic Black Panther. You can also pass ```false``` to the ```ga``` option for that mattter and have nothing pushed 
to Google Analytics. See more under the configuration section.

You can also watch the panther bus for all events like so:

```
var panther = new Tbp();

panther.bus.on("event", function(event) {
});
```

Each event from Telephatic Black Panther is going to follow Google Analytic's event format so it will have a ```category```, ```action```, and ```label```. 
Each event will also contain the time when it occurred (under ```_occurred```), the internal function used from Telepathic Black Panther (under ```_method```), 
the time since the visitor's first visit to the site (under ```_firstVisit```), as well as all of the options for the method. Many of these will be ignored 
by Google Analytics, but you may find them useful.

For example, you can present the user with different content or a modal that automatically displays if it's been a week since the visitor first came to your site 
and they have scrolled down 50% on some page. There's a lot you can do with the events, but most importantly you can use them in your Google Analytics reporting 
to help create segments and such.

Telepathic Black Panther uses minibus (https://github.com/axelpale/minibus), so you may be interested in looking through it's API for additional functions.

You can get the number of milliseconds since Telepathic Black Panther has loaded too (the current page session) by calling: 

```
panther.timeSinceLoad();
```

You can also get the time (in milliseconds) since loaded from the property: 

```
panther.loadTime;
```

Again, you may find these values useful when dislpaying content to a visitor based on certain conditions.

