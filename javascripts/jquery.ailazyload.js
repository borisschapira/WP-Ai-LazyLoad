/**
 * jQuery LazyLoad
 * 
 * 
 * Delays the loading of images in long wep pages by not loading immediatly
 * the images that are outside of the viewport (visible part of the web page.
 *
 * This work is partialy adapted from Mika Tuupola Lazy Load Script - Copyright (c) 2007-2009, 
 * licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 * Nevertheless, the script has been improved.
 *
 * @version 	0.4.1
 * @since 		2010-12-08
 * @author 		Boris Schapira <postmaster@borisschapira.com>
 * @requires 	jQuery 1.4.x, jQuery BASE64 Decoding functions
 * 
 * If HTML5 Doctype, you can have the image source in the data-src attribute :
 * <code type="text/javascript">
 *  	$('img').lazyload({html5Style:true});
 * </code>
 * <code type="text/html">
 * <img data-src="http://dummyimage.com/150x150/000/fff.jpg&amp;text=image&amp;var=6" src="" />
 * </code>
 *
 * If not HTML5 Doctype (default), URL must be encoded in a specific class, corresponding to a pattern :
 * <code type="text/javascript">
 *  	$('img').lazyload();
 * </code>
 * <code type="text/html">
 * <img class="src-aHR0cDovL2R1bW15aW1hZ2UuY29tLzE1MHgxNTAvMDAwL2ZmZi5qcGcmdGV4dD1wZHRJbWc2JnZhcj02" alt="" src=""/>
 * </code>
 */
(function ($) {
    $.fn.lazyload = function (options) {
        var settings = {
			/**
			 * How close the edge image should come 
			 * before it is loaded
			 * @type {integer}
			 */
            threshold: 0,
			
			/**
			 * After this number of image below the fold,
			 * plugin stops to search for new unloaded images.
			 * Number must be high if the HTML Code does not reflect
			 * the structure of your webdesign
			 * @type {type} TODO
			 */
            failurelimit: 0,
		
			/**
			 * Event that trigger loading
			 * @type {string}
			 */
            event: "scroll",
			
			/**
			 * Effect called once the image fully loaded
			 * See http://api.jquery.com/category/effects/
			 * for jQuery effects
			 * @type {string}
			 */
            effect: "show",
			
			/**
			 * Effect speed
			 * @type {string}
			 */
            effectspeed: 200,
			
			/**
			 * Element that contains the image
			 * @type {jQuery item}
			 */
            container: window,
			
			/**
			 * Url to a place holder image
			 * @type {url}
			 */
			placeholder: "",
			
		   /**
            * Pattern used to search & replace placeholders in redirectUri option
            * @type {RegExp}
            */
            urlPattern: /src-([a-zA-Z0-9\/=]+)/,
			
			/**
            * HTML5 compliant. If not, URL are stored in an encrypted class
            * @type boolean
            */
            html5Style: false
        };
		
        /**
        * Merge options
        */
        if(options) {
            $.extend(settings, options)
        }
		
		var elements = this;
        		
		/**
        * Position checking function
        */
        var checkPosition = function (element1, element2) {
            if (null == element1 || null == element2) {
                return false
            } else {
                var diff = element1.length - element2.length;
                return diff >= 0 && element1.lastIndexOf(element2) === diff
            }
        };
		
		/**
        * If "scroll" is the defined event
		* defines the onScroll function
        */
        if ("scroll" == settings.event) {
            $(settings.container).bind("scroll", function () {
                var counter = 0;
                elements.each(function () {
					// Nothing's done for items above of left to the fold
                    if (!$.abovethetop(this, settings) && !$.leftofbegin(this, settings)) { 
						// Show items in the viewport area
                        if (!$.belowthefold(this, settings) && !$.rightoffold(this, settings)) {
                            $(this).trigger("appear")
                        } else {
							// Failure limit control
                            if (counter++ > settings.failurelimit) {
                                return false
                            }
                        }
                    }
				});
				// Scan for unloaded images
                var unloadedImgs = $.grep(elements, function (item) {
                    return !item.loaded
                });
                elements = $(unloadedImgs)
            });
        }
		
		/**
		 * 
		 **/
        this.each(function () {
            var self = this;
			// Put the real src in the data storage
			if(settings.html5Style){
				// If the storage is data-src
				if (undefined == $(self).attr("data-src")) {
					$(self).attr("data-src", $(self).attr("src"))
				}
			}
			else {
				// If the storage is a custom class containing a hash of the URL
				if (!(true === settings.urlPattern.test($(self).attr('class')))) {
					$(self).addClass("src-" + $.base64Encode($(self).attr("src")))
				}				
			}
            
			if ("scroll" != settings.event || 
				undefined == $(self).attr("src") || 
				"" == $(self).attr("src") || 
				settings.placeholder == $(self).attr("src") || 
				($.abovethetop(self, settings) || 
				$.leftofbegin(self, settings) || 
				$.belowthefold(self, settings) || 
				$.rightoffold(self, settings))) 
			{
                if (settings.placeholder) {
                    $(self).attr("src", settings.placeholder)
                } else {
                    $(self).removeAttr("src")
                }
                self.loaded = false
            }
			else {
                self.loaded = true
            }
           
			// Bind the "appear" event to the OnAppear function
			$(self).one("appear", function () {
                if (!this.loaded) {
					var srcValue = "";
					if(settings.html5Style)
						srcValue = $(self).attr("data-src");
					else {
						$(self).attr('class').replace(settings.urlPattern, function (m, hash) {
							srcValue = $.base64Decode(hash)
						});
					}
                    $("<img />").bind("load", function () {
						var srcValue = "";
						if(settings.html5Style)
							srcValue = $(self).attr("data-src");
						else {
							$(self).attr('class').replace(settings.urlPattern, function (m, hash) {
								srcValue = $.base64Decode(hash)
							});
						}
						$(self).hide().attr("src", srcValue)[settings.effect](settings.effectspeed);
						self.loaded = true
					}).attr("src", srcValue)
                }
            });
            
			// Bind the custom event to the triggering of the "appear" event
			if ("scroll" != settings.event) {
                $(self).bind(settings.event, function () {
                    if (!self.loaded) {
                        $(self).trigger("appear")
                    }
                })
            }
        });
		
		// Finaly, triggers the event
        $(settings.container).trigger(settings.event);
        return this
    };
	
    $.belowthefold = function (element, settings) {
        if (settings.container === undefined || settings.container === window) {
            var fold = $(window).height() + $(window).scrollTop()
        } else {
            var fold = $(settings.container).offset().top + $(settings.container).height()
        }
        return fold <= $(element).offset().top - settings.threshold
    };
    $.rightoffold = function (element, settings) {
        if (settings.container === undefined || settings.container === window) {
            var B = $(window).width() + $(window).scrollLeft()
        } else {
            var B = $(settings.container).offset().left + $(settings.container).width()
        }
        return B <= $(element).offset().left - settings.threshold
    };
    $.abovethetop = function (element, settings) {
        if (settings.container === undefined || settings.container === window) {
            var B = $(window).scrollTop()
        } else {
            var B = $(settings.container).offset().top
        }
        return B >= $(element).offset().top + settings.threshold + $(element).height()
    };
    $.leftofbegin = function (element, settings) {
        if (settings.container === undefined || settings.container === window) {
            var B = $(window).scrollLeft()
        } else {
            var B = $(settings.container).offset().left
        }
        return B >= $(element).offset().left + settings.threshold + $(element).width()
    };
    $.extend($.expr[":"], {
        "below-the-fold": "$.belowthefold(a, {threshold : 0, container: window})",
        "above-the-fold": "!$.belowthefold(a, {threshold : 0, container: window})",
        "right-of-fold": "$.rightoffold(a, {threshold : 0, container: window})",
        "left-of-fold": "!$.rightoffold(a, {threshold : 0, container: window})"
    })
})(jQuery);
	