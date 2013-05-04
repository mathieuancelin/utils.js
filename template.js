if (typeof Mustache === 'undefined') {
  throw '[template.js] Mustache is needed to use template.js. Please import it';
}
var Template = (function() {
  var UNDEFINED = 'undefined';
  var STRING = 'string';
  var OBJECT = 'object';
  var isString    = function(obj) { return (typeof obj === STRING); };
  var isObject    = function(obj) { return (typeof obj === OBJECT); };
  var isUndefined = function(obj) { return (typeof obj === UNDEFINED); };
  var isNotString    = function(obj) { return !isString(obj); };
  var isNotObject    = function(obj) { return !isObject(obj); };
  var isNotUndefined = function(obj) { return !isUndefined(obj); };
  var firstSelector = 'template:first, script[type="text/html-template"]:first, [data-type=template]:first';
  var errorMessage = function(id) {
    return Mustache.render('[template.js] An error occured, template with id: "{{id}}" does not exist', {id:id});
  };
  var errorJquery = function(selector, id) {
    return Mustache.render('[template.js] An error occured while creating template: new Template("{{id}}"), possible wrong jQuery selector ( {{selector}} )', {id:id, selector:selector});
  };
  var idSelector = function(id) {
    return Mustache.render('template#{{id}}, script[type="text/html-template"]#{{id}}, [data-type=template]#{{id}}', {id: id});
  };
  var Template = function(id) {
    var errors = [];
    var htmlTemplate = '';
    if (isUndefined(id)) { 
      var asTemplate = [];
      try {
        asTemplate = $(firstSelector);
      } catch(e) { errors.push(errorJquery(firstSelector, id)); console.error(e); }
      if (asTemplate.length > 0) {
        htmlTemplate = asTemplate.first().html();
      } 
    } else if (isObject(id)) { 
      if (isNotUndefined(id.url)) { 
        $.ajax({ type: "GET", url: id.url, async: false, success: function(data) { htmlTemplate = data; } });
      } else if(isNotUndefined(id.templateContent)) { 
        htmlTemplate = id.templateContent;
      }
    } else {
      var jquerySelector = [];
      try { jquerySelector = $(id); } catch(e) { errors.push(errorJquery(id, id)); console.error(e); }
      if (jquerySelector.length > 0) {
        htmlTemplate = jquerySelector.first().html();
      } else {
        var asTemplate = [];
        var selector = idSelector(id);
        try {
          asTemplate = $(selector);
        } catch(e) { errors.push(errorJquery(selector, id)); console.error(e); }
        if (asTemplate.length > 0) {
          htmlTemplate = asTemplate.first().html();
        }
      }
    }
    if (0 === htmlTemplate.length && 0 === errors.length) { errors.push(errorMessage(id)); }
    if (errors.length > 0) { htmlTemplate = errors.join('<br/>'); }
    return {
      renderWith: function(view, partials) {
        return Mustache.render(htmlTemplate, view, partials);
      },
      compile: function() {
        return Mustache.compile(htmlTemplate);
      }
    };
  };

  if (isNotUndefined(jQuery)) { 
    (function($) {
      var errorTemplate = function(id) {
        return {
          renderWith: function() {
            return errorMessage(url);
          },
          appendWith: function() {
            return errorMessage(url);
          },
          prependWith: function() {
            return errorMessage(url);
          }
        };
      }
      $.fn.templateFrom = function(url) {
        var current = $(this);
        var theTemplate = errorTemplate(url);
        if (isUndefined(url)) { 
          theTemplate = Template();
        } else {
          theTemplate = Template({url: url});
        } 
        return {
          renderWith: function(view1, partials1) {
            return current.html(theTemplate.renderWith(view1, partials1));
          },
          appendWith: function(view1, partials1) {
            return current.append(theTemplate.renderWith(view1, partials1));
          },
          prependWith: function(view1, partials1) {
            return current.prepend(theTemplate.renderWith(view1, partials1));
          }
        };
      };
      $.fn.templateOf = function(template) {
        var current = $(this);
        var theTemplate = errorTemplate(template);
        if (isUndefined(template)) { 
          theTemplate = Template();
        } else {
          theTemplate = Template({templateContent: template});
        } 
        return {
          renderWith: function(view1, partials1) {
            return current.html(theTemplate.renderWith(view1, partials1));
          },
          appendWith: function(view1, partials1) {
            return current.append(theTemplate.renderWith(view1, partials1));
          },
          prependWith: function(view1, partials1) {
            return current.prepend(theTemplate.renderWith(view1, partials1));
          }
        };
      };
      $.fn.template = function(template, view, partials) {
        var current = $(this);
        var theTemplate = errorTemplate(template);
        if (isUndefined(template)) { 
          theTemplate = Template();
        } else if (isString(template)) {
          theTemplate = Template(template);
        } else {
          theTemplate = template;
        }
        if (isUndefined(view)) { 
          return {
            renderWith: function(view1, partials1) {
              return current.html(theTemplate.renderWith(view1, partials1));
            },
            appendWith: function(view1, partials1) {
              return current.append(theTemplate.renderWith(view1, partials1));
            },
            prependWith: function(view1, partials1) {
              return current.prepend(theTemplate.renderWith(view1, partials1));
            }
          };
        } else {
          return current.html(theTemplate.renderWith(view, partials));
        }
      };
    })(jQuery);
  }
  return Template;
})();