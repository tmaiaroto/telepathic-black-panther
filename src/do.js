/**
 * "do" is one of Telepathic Black Panther's coolest features.
 * While TBP can just run by itself without the user having to write any complex code or do anyhting at all really...
 * It's understood that some users will want to be more hands on.
 *
 * It is possible to work with TBP. Not just through the panther bus, but also through this semantic interface here.
 * To be clear, you can obtain the same results by listening to the bus though. This is just a faster way to do 
 * some common things.
 * 
 * For example:
 * panther.do.onPageVisit(10).action(function(visitorEvents){
 * 	// Your code here is executed when a visitor has come to your page for the 10th time
 * });
 *
 * ...Or if you want the 10th visit to the entire site:
 * panther.do.onSiteVisit(10).action(function(visitorEvents){...});
 *
 * You'll notice `visitorEvents` being passed to your callback. This contains all events triggered by the user.
 * Ever. Since the very first time they came to your site (provided TBP was in use then).
 *
 * This relies heavily upon cookies and localstorage. It is of course possible for the visitor clear their cookies
 * and localstorage, so this is only as accurate as possible.
 *
 * This also allows the idea of "plugins" or extensions to be used here. All one need do is extend the "do" object.
 * For example, someone might add a plugin that displays a modal with configurable content when some visitor takes
 * a series of actions. Such things are outside the scope of Telepathic Black Panther, but TBP could drive that.
 * 
 * TODO
 * 
 */