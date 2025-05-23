// Polyfill for Object.keys (IE8+)
if (!Object.keys) {
Object.keys = function(obj) {
    if (obj !== Object(obj)) {
    throw new TypeError('Object.keys called on a non-object');
    }
    var keys = [], key;
    for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
        keys.push(key);
    }
    }
    return keys;
};
}

// Polyfill for Array.prototype.forEach (IE8+)
if (!Array.prototype.forEach) {
Array.prototype.forEach = function(callback, thisArg) {
    if (this == null) {
    throw new TypeError('Array.prototype.forEach called on null or undefined');
    }
    var T, k;
    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) {
    T = thisArg;
    }
    k = 0;
    while (k < len) {
    var kValue;
    if (k in O) {
        kValue = O[k];
        callback.call(T, kValue, k, O);
    }
    k++;
    }
};
}

// Polyfill for Element.prototype.classList (IE9+)
if (!("classList" in document.createElement("_"))) {
(function(el) {
    Object.defineProperty(el.prototype, "classList", {
    get: function() {
        var self = this;
        function update(fn) {
        return function(value) {
            var classes = self.className.split(/\s+/),
            index = classes.indexOf(value);
            fn(classes, index, value);
            self.className = classes.join(" ");
        };
        }
        var ret = {
        add: update(function(classes, index, value) {
            ~index || classes.push(value);
        }),
        remove: update(function(classes, index) {
            ~index && classes.splice(index, 1);
        }),
        toggle: update(function(classes, index, value) {
            ~index ? classes.splice(index, 1) : classes.push(value);
        }),
        contains: function(value) {
            return !!~self.className.split(/\s+/).indexOf(value);
        }
        };
        return ret;
    }
    });
})(Element);
}

// Polyfill for HTMLTemplateElement.content (IE11 and below)
(function() {
if (typeof HTMLTemplateElement !== 'undefined' && 'content' in document.createElement('template')) {
    return;
}

// Define HTMLTemplateElement if it doesn't exist
if (typeof HTMLTemplateElement === 'undefined') {
    window.HTMLTemplateElement = function() {};
}

// Add a polyfill for the 'content' property
Object.defineProperty(HTMLTemplateElement.prototype, 'content', {
    get: function() {
    const fragment = document.createDocumentFragment();
    let child = this.firstChild;
    while (child) {
        fragment.appendChild(child.cloneNode(true));
        child = child.nextSibling;
    }
    return fragment;
    }
});
})();

// Polyfill for NodeList.prototype.forEach (IE11 and below)
if (window.NodeList && !NodeList.prototype.forEach) {
NodeList.prototype.forEach = Array.prototype.forEach;
}

// Polyfill for Element.prototype.addEventListener (IE8+)
if (!Element.prototype.addEventListener) {
Element.prototype.addEventListener = function(type, listener) {
    var self = this;
    self.attachEvent("on" + type, function(e) {
    e.target = e.srcElement;
    e.currentTarget = self;
    listener.call(self, e);
    });
};
}

// Polyfill for String.prototype.trim (IE9+)
if (!String.prototype.trim) {
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
};
}

// Polyfill for Array.prototype.map (IE8+)
if (!Array.prototype.map) {
Array.prototype.map = function(callback, thisArg) {
    if (this == null) {
    throw new TypeError('Array.prototype.map called on null or undefined');
    }
    var T, A, k;
    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) {
    T = thisArg;
    }
    A = new Array(len);
    k = 0;
    while (k < len) {
    var kValue, mappedValue;
    if (k in O) {
        kValue = O[k];
        mappedValue = callback.call(T, kValue, k, O);
        A[k] = mappedValue;
    }
    k++;
    }
    return A;
};
}

// Polyfill for Array.prototype.filter (IE9+)
if (!Array.prototype.filter) {
Array.prototype.filter = function(func, thisArg) {
    if (!((typeof func === 'Function' || typeof func === 'function') && this)) {
    throw new TypeError();
    }
    var len = this.length >>> 0,
    res = new Array(len),
    t = this,
    c = 0,
    i = -1;
    if (thisArg === undefined) {
    while (++i !== len) {
        if (i in this) {
        if (func(t[i], i, t)) {
            res[c++] = t[i];
        }
        }
    }
    } else {
    while (++i !== len) {
        if (i in this) {
        if (func.call(thisArg, t[i], i, t)) {
            res[c++] = t[i];
        }
        }
    }
    }
    res.length = c;
    return res;
};
}