# Travhaller
A simple [HAL+JSON](http://stateless.co/hal_specification.html) API Client (Work in Progress)

[![NPM](https://nodei.co/npm/travhaller.png?downloads=true&stars=true)](https://nodei.co/npm/travhaller/)

## Install

travhaller is available as npm module:

```
npm install travhaller
```

It can be used in NodeJS or in browsers via browserify:

```javascript
var travhaller = require('travhaller');
```

## Usage

**Creating a Travhaller Node**


```javascript
travhaller.get(entryUrl)
```

You will have to do this once, to define your entry point. The URL needs to be the root of the API. if it is not, you have to specify the root explicitly:

```javascript
travhaller.get(entryUrl, rootUrl)
```

Creating a Node will automatically query the API, returning a Promise to a Travhaller Node.

*For example:*

```javascript
var rootEntryPointPromise = travhaller.get('http://api.amadev.org/maze');

var depperEntryPointPromise = travhaller.get(
	'http://api.amadev.org/maze/60/30/1868521123/576476861', 
    'http://api.amadev.org/maze'
);
```

**Using the Travhaller Node** 

Once you have a Node, you can start exploring the API:

The `getResource()` method allows you to get the actual API Response. With `follow()` you can follow a link of that node to get another Node. If an _embedded Resource with the given name exists, it will be used (unless the `useEmbedded` Parameter of `follow()` is set to false) instead of querying the server, as specified in the [HAL+JSON Draft](https://tools.ietf.org/html/draft-kelly-json-hal-06#section-8.3)

*For example:*

```javascript
// Get the Root Resource
travhaller.get('http://api.amadev.org/maze').then(function(rootNode) {
    console.log('Root Resource', rootNode.getResource());
    
    // Follow the Root Resource's 'start' link
    rootNode.follow('start'). then(function(anotherNode) {
        console.log('Start Resource', anotherNode.getResource());
    });
});
```

## Future Plans

Travhaller is very much work in progress and more of a concept study than actually useful, certainly not production ready. I do however intend to expand and add to this. The current version of Travhaller is read-only, but it won't stay that way. 

If you have any issues or suggestions feel free to let me know!