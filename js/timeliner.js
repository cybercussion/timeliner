/*global document*/
/*
 * Timeliner.js
 * @version 1.6
 * @copyright Tarek Anandan (http://www.technotarek.com)
 * @modified By Mark Statkus to meet formatting specs and optimizations (less retyping)
 */
(function ($) {
    "use strict";
    /**
     * Start Timeliner
     * @param options {object}
     */
    function startTimeliner(options) {
        // Mark: I fixed this.  It's self documented code options and can be extended easily.
        var defaults = {
                timelineContainer: '#timelineContainer',
                startState       : 'closed',
                startOpen        :
                    [
                    ],
                baseSpeed        : 200,
                speed            : 4,
                fontOpen         : '1.2em',
                fontClosed       : '1em',
                expandAllText    : '+ expand all',
                collapseAllText  : '- collapse all'
            },
            settings = $.extend(defaults, options), // popular way to extend a existing set of data
            key,
            p,
            $value,
            $tlEvent = $(settings.timelineContainer + " " + ".timelineEvent");

        function openEvent(eventHeading, eventBody) {
            $(eventHeading).removeClass('closed').addClass('open').animate({ fontSize: settings.fontOpen }, settings.baseSpeed);
            $(eventBody).show(settings.speed * settings.baseSpeed);
        }

        function closeEvent(eventHeading, eventBody) {
            $(eventHeading).animate({ fontSize: settings.fontClosed }, 0).removeClass('open').addClass('closed');
            $(eventBody).hide(settings.speed * settings.baseSpeed);
        }


        if ($(settings.timelineContainer).data('started')) {
            return; // we already initialized this timelineContainer
        } // Mark: no need for a else
        $(settings.timelineContainer).data('started', true);
        $(settings.timelineContainer + " " + ".expandAll").html(settings.expandAllText);
        $(settings.timelineContainer + " " + ".collapseAll").html(settings.collapseAllText);

        // If startState option is set to closed, hide all the events; else, show fully expanded upon load
        if (settings.startState === 'closed') {
            // Close all items
            $tlEvent.hide();
            // Mark: Each statements are 91% slower (JSPerf)
            // Mark: Multiple $(value) selectors.. rolling up.  I also see duplicate uses below.
            // show startOpen events
            p = settings.startOpen; // shortener
            for (key in p) {
                if (p.hasOwnProperty(key)) {
                    $value = $(p[key]);
                    openEvent($value.parent(settings.timelineContainer + ' .timelineMinor').find('dt a'), $value);
                }
            }
        } else {
            // Open all items
            openEvent($(settings.timelineContainer + ' .timelineMinor').find('dt a'), $tlEvent);
        }

        // Minor Event Click
        $(settings.timelineContainer).on("click", ".timelineMinor dt", function () {
            var $this = $(this),
                currentId = $this.attr('id');
            // if the event is currently open
            if ($this.find('a').is('.open')) {
                closeEvent($("a", this), $("#" + currentId + "EX")); // missing semicolon
            } else { // if the event is currently closed
                openEvent($("a", this), $("#" + currentId + "EX"));
            }
        });

        // Major Marker Click
        $(settings.timelineContainer).on("click", ".timelineMajorMarker", function () {
            // Mark: Lots of retyping the same stuff.  Simplify (Less JQuery Churn).
            var $this = $(this),
                $tlMajor = $this.parents(".timelineMajor"),
                $tlMM = $tlMajor.find("dt a", "dl.timelineMinor"),
                $tlEvent = $tlMajor.find(".timelineEvent"),
                 // number of minor events under this major event
                numEvents = $tlMajor.find(".timelineMinor").length,
                numOpen = $tlMajor.find('.open').length; // number of minor events already open
            if (numEvents > numOpen) {
                openEvent($tlMM, $tlEvent);
            } else {
                closeEvent($tlMM, $tlEvent);
            }
        });

        // All Markers/Events
        $(settings.timelineContainer + " " + ".expandAll").click(function () {
            // Mark: Lots of retyping the same stuff.  Simplify (Less JQuery Churn).
            var $this = $(this), $tlC = $this.parents(settings.timelineContainer), $tlMinor = $tlC.find("dt a", "dl.timelineMinor"), $tlEvent = $tlC.find(".timelineEvent");
            if ($(this).hasClass('expanded')) {
                closeEvent($tlMinor, $tlEvent);
                $(this).removeClass('expanded').html(settings.expandAllText);
            } else {
                openEvent($tlMinor, $tlEvent);
                $(this).addClass('expanded').html(settings.collapseAllText);
            }
        });
    }

    /**
     * timeliner
     * Main JQuery API
     * @param options {object}
     */
    $.timeliner = function (options) {
        if ($.timeliners === undefined) { // prior was sloppy
            $.timeliners = { options: [] };
            $.timeliners.options.push(options);
        } else {
            $.timeliners.options.push(options);
        }
        $(document).ready(function () {
            var i = 0,
                len = $.timeliners.options.length;
            while (i < len) { // while is faster (JSPerf).
                startTimeliner($.timeliners.options[i]);
                i += 1;
            }
        });
    };
})(jQuery);
