var Q = require('q');

/**
 * @param url       an API Url to query
 * @param rootUrl   (optional) the Root of the API, in case it differs from the <url> given
 * @return Promise
 */
var createTravhallerNodePromise = function (url, rootUrl) {
    var _rootUrl = rootUrl || url;
    var _response = {};
    var _resource = {};

    return Q.Promise(function (resolve, reject) {
        resolve = (resolve || function() {});
        reject = (reject || function() {});

        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onload = onSuccess;
        request.onerror = onError;
        request.send();

        function onSuccess() {
            _response = request;
            if (_response.status >= 200 && _response.status < 300) {
                _resource = JSON.parse(request.responseText);
                resolve(new TravhallerNode(_rootUrl, _resource));

            } else {
                throwError("API Request to '" + url + "' failed with Status code " + _response.status);
            }
        }

        function onError() {
            throwError("Can't XHR " + JSON.stringify(url));
        }

        function throwError(errorMsg) {
            errorMsg = "[Travhaller] " + errorMsg;
            console.warn(errorMsg);
            reject(new Error(errorMsg));
        }

    });
};

var TravhallerNode = function(rootUrl, resource) {
    var _rootUrl = rootUrl;
    var _resource = resource;

    /**
     * @param linkname
     * @returns Promise
     */
    this.follow = function (linkname) {
        var embedded = _resource._embedded || {};
        var links = _resource._links || {};

        // use embedded resource
        if (embedded[linkname] !== undefined) {
            return Q.Promise(function(resolve) {
                resolve(new TravhallerNode(rootUrl, embedded[linkname]));
            });

            // use link
        } else if (links[linkname] !== undefined) {
            var linkUrl = _rootUrl + links[linkname].href;
            return createTravhallerNodePromise(linkUrl, _rootUrl);
        } else {
            return TravhallerError("Can't follow link '" + linkname + "' because it does not exist in current resource.");
        }
    };

    /**
     * @returns {*}
     */
    this.getResource = function () {
        return _resource;
    };

    this.getRootUrl = function() {
        return _rootUrl;
    };

    this.setRootUrl = function(rootUrl) {
        _rootUrl = rootUrl;
        return this;
    };

    this.refresh = function() {

        var url = _resource._links.self.href;
        return createTravhallerNodePromise(_rootUrl + url, _rootUrl);
    };

    return this;
};

var TravhallerError = function(errorMsg) {
    errorMsg = "[Travhaller] " + errorMsg;
    console.warn(errorMsg);
    return Q.Promise(function(resolve, reject){
        reject(new Error(errorMsg));
    });
};

exports.get = createTravhallerNodePromise;