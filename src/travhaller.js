var Q = require('q');

/**
 * @param url       an API Url to query
 * @param apiRoot   (optional) the Root of the API, in case it differs from the <url> given
 */
var createNode = function(url, apiRoot) {
    var _apiRoot = apiRoot || url;
    var _response = {};
    var _resource = {};
    var _data = undefined;

    var promise = Q.Promise(function(resolve, reject, notify) {
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onload = onSuccess;
        request.onerror = onError;
        request.onprogress = onProgress;
        request.send();

        function onSuccess() {
            _response = request;
            if (_response.status >= 200 && _response.status < 300) {
                _resource = JSON.parse(request.responseText);
                (resolve||function(){})(_resource);
            } else {
                (reject||function(){})(new Error("[Travhaller] API Request to " + url + " failed with Status code " + _response.status));
            }
        }

        function onError() {
            (reject||function(){})(new Error("Can't XHR " + JSON.stringify(url)));
        }

        function onProgress(event) {
            (notify||function(){})(event.loaded / event.total);
        }

    });

    return {
        then: function(resolve, reject, notify) {
            return promise.then(function() {
                (resolve||function(){})({
                    getApiRoot: function()  {
                      return _apiRoot;
                    },

                    setApiRoot: function(apiRoot) {
                        _apiRoot = apiRoot;
                        return this;
                    },

                    follow: function(linkname) {
                        var url = _resource._links[linkname].href;
                        return createNode(_apiRoot + url, _apiRoot);
                    },

                    getResource: function() {
                        return _resource;
                    }
                });
            }, function(error) {
                console.error(error.message);
                (reject||function(){})(error);
            }, function(status) {
                (notify||function(){})(status);
            });
        }
    };
};

exports.get = createNode;