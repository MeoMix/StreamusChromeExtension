/*
@author Dan Gidman (danatcofo at gmail dot com)
released under GNU General Public License v3
http://www.gnu.org/licenses/gpl.html
version 2.4
*/
(function ($) {

    // #region Constants

    // data keys
    var k = "$autoscroll", ek = "$tAutoscroll", ik = "$autoscrollInterval", lk = "$edgeAutoscroll", mk = "$lastEdgeAutoscroll",

    // angle enum
    G = { up: 90.0, left: 180.0, right: 360.0, upleft: 135.0, upright: 45.0, downleft: 225.0, downright: 315.0, leftup: 135.0, rightup: 45.0, leftdown: 225.0, rightdown: 315.0, down: 270.0 },

    // #endregion

    // #region Methods

    // available M defaults to init
    M = {
        init: function (s) {
            return this.each(function () {
                if (d(this)) $(this).data(k, V($.extend(d(this), s)));
                else {
                    $(this).data(k, V($.extend({ e: false, fr: false }, $.fn.autoscroll.defaults.settings, s)));
                    $(this).hover(function () {
                        var c = d(this);
                        if (c) {
                            if (c.scroll) {
                                _I(this);
                                $(this).stop(true);
                            }
                            c.e = true;
                        }
                    }, function () {
                        var c = d(this);
                        if (c && c.e) {
                            if (c.scroll) I(this);
                            c.e = false;
                        }
                    });
                    I(this);
                }
            });
        },
        destroy: function () {
            return this.each(function () {
                if (d(this)) {
                    _I(this);
                    $(this).stop(true).data(ik, null).data(k, null).data(ek, null);
                }
            });
        },
        delay: function (t) {
            return this.each(function () {
                var c = d(this);
                if (c && c.scroll) {
                    $(this).autoscroll("pause")
                    $(this).oneTime(t || $.fn.autoscroll.defaults.delay, k, function () {
                        $(this).autoscroll("resume");
                    });
                }
            });
        },
        fastforward: function (s) { return FR(this, "f", s); },
        rewind: function (s) { return FR(this, "r", s); },
        pause: function () {
            return this.each(function () {
                var c = d(this);
                if (c && c.scroll) {
                    c.scroll = false;
                    $(this).stop(true);
                    _I(this);
                }
            });
        },
        resume: function () {
            return this.each(function () {
                var c = d(this);
                if (c) {
                    c.scroll = true;
                    I(this);
                }
            });
        },
        reverse: function () {
            return this.each(function () {
                var c = d(this);
                if (c && (c.direction += 180.0) > 360.0) c.direction -= 360.0;
                $(this).stop(true);
            });
        },
        toggle: function () {
            return this.each(function () {
                var c = d(this);
                if (c)
                    if (c.scroll) $(this).autoscroll("pause");
                    else $(this).autoscroll("resume");
            });
        },
        get: function () {
            return this.each(function () {
                if (d(this)) return d(this);
            });
        },
        addpausesource: function (e) {
            if (typeof e == "undefined") return this;
            if (!(e instanceof jQuery))
                if ((e = $(e)).length == 0) return this;
            var s = this.selector;
            e.each(function () {
                $(this).hover(function () {
                    $(s).each(function () {
                        var c = d(this);
                        if (c) {
                            if (c.scroll) {
                                _I(this);
                                $(this).stop(true);
                            }
                            c.e = true;
                        }
                    });
                }, function () {
                    $(s).each(function () {
                        var c = d(this);
                        if (c && c.e) {
                            if (c.scroll) I(this);
                            c.e = false;
                        }
                    });
                });
            });
            return this;
        }
    },

    // #endregion

    // #region Utilities

    // interval handler
    I = function (e) {
        $(e).data(ik, setInterval(function () {
            var l, c = d(e);
            if (c) {
                if (typeof c.onEvaluate == "function") c.onEvaluate.apply(e);
                if (!D(e)) {
                    if (c.scroll && !c.e && !c.fr) {
                        if ((l = $(e).data(ek)) && !E(l, c)) $(e).stop(true).animate(S(c.step, c.direction, e), 1000, "linear");
                        else $(e).animate(S(c.step, c.direction), 1000, "linear");
                    }
                }
                $(e).data(ek, $.extend(true, {}, c));
            }
        }, 50));
    },

    _I = function (e) {
        clearInterval($(e).data(ik));
    },

    // get data
    d = function (e) { return $(e).data(k); },

    // step equality
    E = function (a, b) { return a.step === b.step && a.direction === b.direction && a.scroll === b.scroll; },

    // ff and rw handler
    FR = function (a, r, s) {
        var f = V($.extend($.fn.autoscroll.defaults.ffrw, s));
        return a.each(function () {
            var c = d(this);
            if (c) {
                var scroll = c.scroll, b = c.direction;
                c.fr = true;
                if (r == "r" && (b += 180.0) > 360.0) b -= 360.0;
                if (c.scroll) _I(this);
                $(this).stop(true).animate(S(f.step, b), f.speed, "swing", function () { d(this).fr = false; if (c.scroll) I(this); });
            }
        });
    },

    // validation
    V = function (s) {
        if ($.inArray(typeof s.scroll, ["undefined", "boolean"]) < 0)
            $.error("scroll is not a boolean");
        if ($.inArray(typeof s.step, ["undefined", "number"]) < 0 && isNaN(s.step = Number(s.step)))
            $.error("step is not a valid number");
        if (s.direction) s.direction = A(s.direction);
        return s;
    },

    // conversions
    d2r = function (a) { return a * Math.PI / 180.0; },

    // angle handler
    A = function (a) {
        if (typeof a === "string" && isNaN(Number(a)))
            if (G[a]) a = G[a];
            else if (a.indexOf("rad") == a.length - 3 && !isNaN(a = Number(a.substring(0, a.length - 3)))) a = a * 180.0 / Math.PI;
        if (isNaN(a = Number(a))) $.error("Invalid direction on jQuery.autoscroll");
        while (a < 0.0) a += 360.0;
        return a;
    },

    // step handler
    S = function (s, a) {
        var x = Math.round(s * Math.cos(a = d2r(a))),
            y = Math.round(s * Math.sin(a)) * -1,
            $t = arguments[2];
        return ($t && $($t).length > 0) ?
            { scrollTop: $t.scrollTop + y, scrollLeft: $t.scrollLeft + x } :
            { scrollTop: ((y < 0) ? "-=" : "+=") + Math.abs(y), scrollLeft: ((x < 0) ? "-=" : "+=") + Math.abs(x) };
    },

    // edge handler
    D = function (e) {
        var c = d(e);
        if (c && typeof c.onEdge == "function") {
            var c2 = $(e).data(lk) || { x: null, y: null },
                s = c.step,
                l = e.scrollLeft,
                v = d2r(c.direction),
                x = Math.round(s * Math.cos(v)),
                nl = l + x,
                t = e.scrollTop,
                y = Math.round(s * Math.sin(v)) * -1
            nt = t + y,
                _e = $(e).data(mk);
            // left edge
            if (l > nl && l == 0) {
                if (!c2.x || c2.x != "left") c2.x = "left";
            }
                // right edge
            else if (l < nl && l == e.scrollWidth - e.clientWidth) {
                if (!c2.x || c2.x != "right") c2.x = "right";
            }
            else c2.x = null;

            // top edge
            if (t > nt && t == 0) {
                if (!c2.y || c2.y != "top") c2.y = "top";
            }
                // bottom edge
            else if (t < nt && t == e.scrollHeight - e.clientHeight) {
                if (!c2.y || c2.y != "bottom") c2.y = "bottom";
            }
            else c2.y = null;

            try {
                if (!_e || (c2.x && c2.x != _e.x) || (c2.y && c2.y != _e.y)) {
                    c.onEdge.apply(e, [c2]);
                    return true;
                }
            }
            catch ($e) { throw $e; }
            finally {
                $(e).data(mk, $.extend(true, {}, c2)).data(lk, c2);
            }
        }
        return false;
    };

    // #endregion

    // #region Public

    // main
    $.fn.autoscroll = function (a, b) {
        /// <summary>Autoscroll scrollable elements.</summary>
        if (M[a]) return M[a].apply(this, Array.prototype.slice.call(arguments, 1));
        else if (typeof a === 'object' || !a) return M.init.apply(this, arguments);
        else $.error('Method ' + a + ' does not exist on jQuery.autoscroll');
    };

    // defaults
    $.fn.autoscroll.defaults = { settings: { step: 50, scroll: true, direction: "down" }, delay: 5000, ffrw: { speed: "fast", step: 100 } };

    // #endregion

})(jQuery);