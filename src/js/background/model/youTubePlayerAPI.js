//  Provides an interface to the YouTube iFrame.
//  Starts up Player object after receiving a ready response from the YouTube API.
define(function () {
	'use strict';

	var YouTubePlayerAPI = Backbone.Model.extend({
		defaults: {
			ready: false,
			inserted: false
		},

		load: function () {
			if (this.get('inserted')) {
				var error = new Error('API script already inserted');
				Streamus.channels.error.commands.trigger('log:error', error);
				return;
			}

			//  This function will be called when the API is fully loaded. Needs to be exposed globally so YouTube can call it.
			window.onYouTubeIframeAPIReady = this._onYouTubeIframeAPIReady.bind(this);

			this._loadIframeAPI();
			this.set('inserted', true);
		},
		
		_onYouTubeIframeAPIReady: function () {
			this.set('ready', true);
		},
		
		//  This code is from https://www.youtube.com/iframe_api. I pull it in locally as to not need to relax content_security_policy.
		_loadIframeAPI: function() {
			/* jshint ignore:start */
			if (!window['YT']) {
				window.YT = {
					loading: 0,
					loaded: 0
				};
			}

			if (!window['YTConfig']) {
				window.YTConfig = {
					//  NOTE: I modified this from http to https because extensions do not care much for http.
					'host': 'https://www.youtube.com'
				};
			}

			if (!YT.loading) {
				YT.loading = 1;
				var l = [];
					
				YT.ready = function (f) {
					if (YT.loaded) {
						f();
					} else {
						l.push(f);
					}
				};
					
				window.onYTReady = function () {
					YT.loaded = 1;
					for (var i = 0; i < l.length; i++) {
						try {
							l[i]();
						} catch (e) {
						}
					}
				};
					
				YT.setConfig = function (c) {
					for (var k in c) {
						if (c.hasOwnProperty(k)) {
							YTConfig[k] = c[k];
						}
					}
				};

				this._loadWidgetAPI();
			}
			/* jshint ignore:end */
		},
		
		//  This code is from https://s.ytimg.com/yts/jsbin/www-widgetapi-vflBfDu58/www-widgetapi.js. I pull it in locally as to not need to relax content_security_policy.
		//  NOTE: I have patched a bug in this code. It is documented here: https://code.google.com/p/gdata-issues/issues/detail?id=6402
		_loadWidgetAPI: function() {
			/* jshint ignore:start */
			var g, h = window;

			function l(a) {
				a = a.split(".");
				for (var b = h, c; c = a.shift() ;)
					if (null != b[c]) b = b[c];
					else return null;
				return b;
			}

			function aa() { }

			function m(a) {
				var b = typeof a;
				if ("object" == b)
					if (a) {
						if (a instanceof Array) return "array";
						if (a instanceof Object) return b;
						var c = Object.prototype.toString.call(a);
						if ("[object Window]" == c) return "object";
						if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";
						if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function";
					} else return "null";
				else if ("function" == b && "undefined" == typeof a.call) return "object";
				return b;
			}

			function n(a) {
				return "string" == typeof a;
			}

			function ba(a) {
				var b = typeof a;
				return "object" == b && null != a || "function" == b;
			}
			var p = "closure_uid_" + (1E9 * Math.random() >>> 0),
				ca = 0;

			function da(a) {
				return a.call.apply(a.bind, arguments);
			}

			function ea(a, b) {
				if (!a) throw Error();
				if (2 < arguments.length) {
					var d = Array.prototype.slice.call(arguments, 2);
					return function () {
						var c = Array.prototype.slice.call(arguments);
						Array.prototype.unshift.apply(c, d);
						return a.apply(b, c);
					};
				}
				return function () {
					return a.apply(b, arguments);
				};
			}

			function q() {
				q = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? da : ea;
				return q.apply(null, arguments);
			}

			function r(a, b) {
				var c = a.split("."),
					d = h;
				c[0] in d || !d.execScript || d.execScript("var " + c[0]);
				for (var e; c.length && (e = c.shift()) ;) c.length || void 0 === b ? d[e] ? d = d[e] : d = d[e] = {} : d[e] = b;
			}

			function s(a, b) {
				function c() { }
				c.prototype = b.prototype;
				a.I = b.prototype;
				a.prototype = new c;
				a.base = function (a, c) {
					return b.prototype[c].apply(a, Array.prototype.slice.call(arguments, 2));
				};
			}
			Function.prototype.bind = Function.prototype.bind || function (a, b) {
				if (1 < arguments.length) {
					var c = Array.prototype.slice.call(arguments, 1);
					c.unshift(this, a);
					return q.apply(null, c);
				}
				return q(this, a);
			};
			var fa = String.prototype.trim ? function (a) {
				return a.trim();
			} : function (a) {
				return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
			};

			function t(a, b) {
				return a < b ? -1 : a > b ? 1 : 0;
			};
			var v = Array.prototype,
				ga = v.indexOf ? function (a, b, c) {
					return v.indexOf.call(a, b, c);
				} : function (a, b, c) {
					c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
					if (n(a)) return n(b) && 1 == b.length ? a.indexOf(b, c) : -1;
					for (; c < a.length; c++)
						if (c in a && a[c] === b) return c;
					return -1;
				},
				w = v.forEach ? function (a, b, c) {
					v.forEach.call(a, b, c);
				} : function (a, b, c) {
					for (var d = a.length, e = n(a) ? a.split("") : a, f = 0; f < d; f++) f in e && b.call(c, e[f], f, a);
				};

			function ha(a, b) {
				var c;
				t: {
					c = a.length;
					for (var d = n(a) ? a.split("") : a, e = 0; e < c; e++)
						if (e in d && b.call(void 0, d[e], e, a)) {
							c = e;
							break t;
						}
					c = -1;
					}
				return 0 > c ? null : n(a) ? a.charAt(c) : a[c];
			}

			function ia() {
				return v.concat.apply(v, arguments);
			}

			function ja(a) {
				var b = a.length;
				if (0 < b) {
					for (var c = Array(b), d = 0; d < b; d++) c[d] = a[d];
					return c;
				}
				return [];
			}

			function ka(a, b, c) {
				return 2 >= arguments.length ? v.slice.call(a, b) : v.slice.call(a, b, c);
			};

			function la(a) {
				var b = x,
					c;
				for (c in b)
					if (a.call(void 0, b[c], c, b)) return c;
			};
			var y;
			t: {
				var ma = h.navigator;
				if (ma) {
					var na = ma.userAgent;
					if (na) {
						y = na;
						break t;
					}
				}
				y = "";
				};
			var z = -1 != y.indexOf("Opera") || -1 != y.indexOf("OPR"),
				A = -1 != y.indexOf("Trident") || -1 != y.indexOf("MSIE"),
				B = -1 != y.indexOf("Gecko") && -1 == y.toLowerCase().indexOf("webkit") && !(-1 != y.indexOf("Trident") || -1 != y.indexOf("MSIE")),
				C = -1 != y.toLowerCase().indexOf("webkit");

			function oa() {
				var a = h.document;
				return a ? a.documentMode : void 0;
			}
			var D = function () {
				var a = "",
					b;
				if (z && h.opera) return a = h.opera.version, "function" == m(a) ? a() : a;
				B ? b = /rv\:([^\);]+)(\)|;)/ : A ? b = /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/ : C && (b = /WebKit\/(\S+)/);
				b && (a = (a = b.exec(y)) ? a[1] : "");
				return A && (b = oa(), b > parseFloat(a)) ? String(b) : a;
			}(),
				pa = {};

			function E(a) {
				var b;
				if (!(b = pa[a])) {
					b = 0;
					for (var c = fa(String(D)).split("."), d = fa(String(a)).split("."), e = Math.max(c.length, d.length), f = 0; 0 == b && f < e; f++) {
						var k = c[f] || "",
							u = d[f] || "",
							kb = RegExp("(\\d*)(\\D*)", "g"),
							lb = RegExp("(\\d*)(\\D*)", "g");
						do {
							var M = kb.exec(k) || ["", "", ""],
								N = lb.exec(u) || ["", "", ""];
							if (0 == M[0].length && 0 == N[0].length) break;
							b = t(0 == M[1].length ? 0 : parseInt(M[1], 10), 0 == N[1].length ? 0 : parseInt(N[1], 10)) || t(0 == M[2].length, 0 == N[2].length) || t(M[2], N[2]);
						} while (0 == b);
					}
					b = pa[a] = 0 <= b;
				}
				return b;
			}
			var qa = h.document,
				ra = qa && A ? oa() || ("CSS1Compat" == qa.compatMode ? parseInt(D, 10) : 5) : void 0;
			!B && !A || A && A && 9 <= ra || B && E("1.9.1");
			A && E("9");

			function sa(a) {
				var b, c, d, e;
				b = document;
				if (b.querySelectorAll && b.querySelector && a) return b.querySelectorAll("" + (a ? "." + a : ""));
				if (a && b.getElementsByClassName) {
					var f = b.getElementsByClassName(a);
					return f;
				}
				f = b.getElementsByTagName("*");
				if (a) {
					e = {};
					for (c = d = 0; b = f[c]; c++) {
						var k = b.className,
							u;
						if (u = "function" == typeof k.split) u = 0 <= ga(k.split(/\s+/), a);
						u && (e[d++] = b);
					}
					e.length = d;
					return e;
				}
				return f;
			}

			function ta(a, b) {
				for (var c = 0; a;) {
					if (b(a)) return a;
					a = a.parentNode;
					c++;
				}
				return null;
			};

			function ua(a) {
				a = String(a);
				if (/^\s*$/.test(a) ? 0 : /^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g, "@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g, ""))) try {
					return eval("(" + a + ")");
																																																																					} catch (b) { }
				throw Error("Invalid JSON string: " + a);
			}

			function va() { }

			function F(a, b, c) {
				switch (typeof b) {
					case "string":
						wa(b, c);
						break;
					case "number":
						c.push(isFinite(b) && !isNaN(b) ? b : "null");
						break;
					case "boolean":
						c.push(b);
						break;
					case "undefined":
						c.push("null");
						break;
					case "object":
						if (null == b) {
							c.push("null");
							break;
						}
						if ("array" == m(b)) {
							var d = b.length;
							c.push("[");
							for (var e = "", f = 0; f < d; f++) c.push(e), F(a, b[f], c), e = ",";
							c.push("]");
							break;
						}
						c.push("{");
						d = "";
						for (e in b) Object.prototype.hasOwnProperty.call(b, e) && (f = b[e], "function" != typeof f && (c.push(d), wa(e, c), c.push(":"), F(a, f, c), d = ","));
						c.push("}");
						break;
					case "function":
						break;
					default:
						throw Error("Unknown type: " + typeof b);
				}
			}
			var xa = {
				'"': '\\"',
				"\\": "\\\\",
				"/": "\\/",
				"\b": "\\b",
				"\f": "\\f",
				"\n": "\\n",
				"\r": "\\r",
				"\t": "\\t",
				"\x0B": "\\u000b"
			},
				ya = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;

			function wa(a, b) {
				b.push('"', a.replace(ya, function (a) {
					if (a in xa) return xa[a];
					var b = a.charCodeAt(0),
						e = "\\u";
					16 > b ? e += "000" : 256 > b ? e += "00" : 4096 > b && (e += "0");
					return xa[a] = e + b.toString(16);
				}), '"');
			};

			function G() {
				this.j = this.j;
				this.o = this.o;
			}
			G.prototype.j = !1;
			G.prototype.dispose = function () {
				this.j || (this.j = !0, this.H());
			};
			G.prototype.H = function () {
				if (this.o)
					for (; this.o.length;) this.o.shift()();
			};

			function H() {
				G.call(this);
				this.d = [];
				this.g = {};
			}
			s(H, G);
			g = H.prototype;
			g.O = 1;
			g.B = 0;
			g.subscribe = function (a, b, c) {
				var d = this.g[a];
				d || (d = this.g[a] = []);
				var e = this.O;
				this.d[e] = a;
				this.d[e + 1] = b;
				this.d[e + 2] = c;
				this.O = e + 3;
				d.push(e);
				return e;
			};

			function za(a, b, c) {
				var d = I;
				if (a = d.g[a]) {
					var e = d.d;
					(a = ha(a, function (a) {
						return e[a + 1] == b && e[a + 2] == c;
					})) && Aa(d, a);
				}
			}

			function Aa(a, b) {
				if (0 != a.B) a.k || (a.k = []), a.k.push(b);
				else {
					var c = a.d[b];
					if (c) {
						if (c = a.g[c]) {
							var d = ga(c, b);
							0 <= d && v.splice.call(c, d, 1);
						}
						delete a.d[b];
						delete a.d[b + 1];
						delete a.d[b + 2];
					}
				}
			}
			g.R = function (a) {
				var c = this.g[a];
				if (c) {
					this.B++;
					for (var d = ka(arguments, 1), e = 0, f = c.length; e < f; e++) {
						var k = c[e];
						this.d[k + 1].apply(this.d[k + 2], d);
					}
					this.B--;
					if (this.k && 0 == this.B)
						for (; c = this.k.pop() ;) Aa(this, c);
					return 0 != e;
				}
				return false;
			};
			g.H = function () {
				H.I.H.call(this);
				delete this.d;
				delete this.g;
				delete this.k;
			};
			var Ba = /^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;

			function Ca(a) {
				if (Da) {
					Da = false;
					var b = h.location;
					if (b) {
						var c = b.href;
						if (c && (c = (c = Ca(c)[3] || null) ? decodeURI(c) : c) && c != b.hostname) throw Da = !0, Error();
					}
				}
				return a.match(Ba);
			}
			var Da = C;

			function Ea(a, b, c) {
				if ("array" == m(b))
					for (var d = 0; d < b.length; d++) Ea(a, String(b[d]), c);
				else null != b && c.push("&", a, "" === b ? "" : "=", encodeURIComponent(String(b)));
			}
			var Fa = /#|$/;
			var Ga = {};

			function Ha(a) {
				return Ga[a] || (Ga[a] = String(a).replace(/\-([a-z])/g, function (a, c) {
					return c.toUpperCase();
				}));
			};
			var Ia = l("yt.dom.getNextId_");
			if (!Ia) {
				Ia = function () {
					return ++Ja;
				};
				r("yt.dom.getNextId_", Ia);
				var Ja = 0;
			};
			var J = window.yt && window.yt.config_ || {};
			r("yt.config_", J);
			r("yt.tokens_", window.yt && window.yt.tokens_ || {});
			r("yt.msgs_", window.yt && window.yt.msgs_ || {});

			function Ka() {
				var b = arguments;
				if (1 < b.length) {
					var c = b[0];
					J[c] = b[1];
				} else
					for (c in b = b[0], b) J[c] = b[c];
			}

			function La(a) {
				"function" == m(a) && (a = Ma(a));
				return window.setInterval(a, 250);
			}

			function Ma(a) {
				return a && window.yterr ? function () {
					try {
						return a.apply(this, arguments);
					} catch (b) {
						var c = b;
						if (window && window.yterr) {
							var d = l("yt.www.errors.log");
							d ? d(c, void 0) : (d = ("ERRORS" in J ? J.ERRORS : void 0) || [], d.push([c, void 0]), Ka("ERRORS", d));
						}
						throw b;
					}
				} : a;
			};

			function Na(a) {
				if (a = a || window.event) {
					for (var b in a) b in Oa || (this[b] = a[b]);
					(b = a.target || a.srcElement) && 3 == b.nodeType && (b = b.parentNode);
					this.target = b;
					if (b = a.relatedTarget) try {
						b = b.nodeName ? b : null;
												} catch (c) {
						b = null;
												} else "mouseover" == this.type ? b = a.fromElement : "mouseout" == this.type && (b = a.toElement);
					this.relatedTarget = b;
					this.clientX = void 0 != a.clientX ? a.clientX : a.pageX;
					this.clientY = void 0 != a.clientY ? a.clientY : a.pageY;
					this.keyCode = a.keyCode ? a.keyCode : a.which;
					this.charCode = a.charCode || ("keypress" == this.type ?
						this.keyCode : 0);
					this.altKey = a.altKey;
					this.ctrlKey = a.ctrlKey;
					this.shiftKey = a.shiftKey;
					"MozMousePixelScroll" == this.type ? (this.wheelDeltaX = a.axis == a.HORIZONTAL_AXIS ? a.detail : 0, this.wheelDeltaY = a.axis == a.HORIZONTAL_AXIS ? 0 : a.detail) : window.opera ? (this.wheelDeltaX = 0, this.wheelDeltaY = a.detail) : 0 == a.wheelDelta % 120 ? "WebkitTransform" in document.documentElement.style ? window.chrome && 0 == navigator.platform.indexOf("Mac") ? (this.wheelDeltaX = a.wheelDeltaX / -30, this.wheelDeltaY = a.wheelDeltaY / -30) : (this.wheelDeltaX =
						a.wheelDeltaX / -1.2, this.wheelDeltaY = a.wheelDeltaY / -1.2) : (this.wheelDeltaX = 0, this.wheelDeltaY = a.wheelDelta / -1.6) : (this.wheelDeltaX = a.wheelDeltaX / -3, this.wheelDeltaY = a.wheelDeltaY / -3);
				}
			}
			g = Na.prototype;
			g.type = "";
			g.target = null;
			g.relatedTarget = null;
			g.currentTarget = null;
			g.data = null;
			g.keyCode = 0;
			g.charCode = 0;
			g.altKey = !1;
			g.ctrlKey = !1;
			g.shiftKey = !1;
			g.clientX = 0;
			g.clientY = 0;
			g.wheelDeltaX = 0;
			g.wheelDeltaY = 0;
			var Oa = {
				stopImmediatePropagation: 1,
				stopPropagation: 1,
				preventMouseEvent: 1,
				preventManipulation: 1,
				preventDefault: 1,
				layerX: 1,
				layerY: 1,
				scale: 1,
				rotation: 1
			};
			var x = l("yt.events.listeners_") || {};
			r("yt.events.listeners_", x);
			var Pa = l("yt.events.counter_") || {
				count: 0
			};
			r("yt.events.counter_", Pa);

			function Qa(a, b, c) {
				return la(function (d) {
					return d[0] == a && d[1] == b && d[2] == c && 0 == d[4];
				});
			}

			function Ra(a, b, c) {
				if (a && (a.addEventListener || a.attachEvent)) {
					var d = Qa(a, b, c);
					if (!d) {
						var d = ++Pa.count + "",
							e = !("mouseenter" != b && "mouseleave" != b || !a.addEventListener || "onmouseenter" in document),
							f;
						f = e ? function (d) {
							d = new Na(d);
							if (!ta(d.relatedTarget, function (b) {
									return b == a;
							})) return d.currentTarget = a, d.type = b, c.call(a, d);
						} : function (b) {
							b = new Na(b);
							b.currentTarget = a;
							return c.call(a, b);
						};
						f = Ma(f);
						x[d] = [a, b, c, f, !1];
						a.addEventListener ? "mouseenter" == b && e ? a.addEventListener("mouseover", f, !1) : "mouseleave" == b && e ? a.addEventListener("mouseout",
							f, !1) : "mousewheel" == b && "MozBoxSizing" in document.documentElement.style ? a.addEventListener("MozMousePixelScroll", f, !1) : a.addEventListener(b, f, !1) : a.attachEvent("on" + b, f);
					}
				}
			}

			function Sa(a) {
				a && ("string" == typeof a && (a = [a]), w(a, function (a) {
					if (a in x) {
						var c = x[a],
							d = c[0],
							e = c[1],
							f = c[3],
							c = c[4];
						d.removeEventListener ? d.removeEventListener(e, f, c) : d.detachEvent && d.detachEvent("on" + e, f);
						delete x[a];
					}
				}));
			};

			function Ta(a) {
				var b = [],
					c;
				for (c in a) Ea(c, a[c], b);
				b[0] = "";
				return b.join("");
			};
			var K = {},
				Ua = [],
				I = new H,
				Va = {};

			function Wa() {
				w(Ua, function (a) {
					a();
				});
			}

			function Xa(a) {
				var b = ja(document.getElementsByTagName("yt:" + a));
				a = "yt-" + a;
				var c = document;
				a = c.querySelectorAll && c.querySelector ? c.querySelectorAll("." + a) : sa(a);
				a = ja(a);
				return ia(b, a);
			}

			function L(a, b) {
				return "yt:" == a.tagName.toLowerCase().substr(0, 3) ? a.getAttribute(b) : a ? a.dataset ? a.dataset[Ha(b)] : a.getAttribute("data-" + b) : null;
			}

			function Ya() {
				I.R.apply(I, arguments);
			};

			function O(a, b, c) {
				this.g = b;
				this.o = this.d = null;
				this.G = this[p] || (this[p] = ++ca);
				this.j = 0;
				this.F = !1;
				this.D = [];
				this.k = null;
				this.L = c;
				this.M = {};
				b = document;
				if (a = n(a) ? b.getElementById(a) : a)
					if ("iframe" != a.tagName.toLowerCase() && (b = Za(this, a), this.o = a, (c = a.parentNode) && c.replaceChild(b, a), a = b), this.d = a, this.d.id || (b = a = this.d, b = b[p] || (b[p] = ++ca), a.id = "widget" + b), K[this.d.id] = this, window.postMessage) {
						this.k = new H;
						$a(this);
						a = P(this.g, "events");
						for (var d in a) a.hasOwnProperty(d) && this.addEventListener(d, a[d]);
						for (var e in Va) ab(this,
							e);
					}
			}
			g = O.prototype;
			g.Y = function (a, b) {
				this.d.width = a;
				this.d.height = b;
				return this;
			};
			g.X = function () {
				return this.d;
			};
			g.P = function (a) {
				this.v(a.event, a);
			};
			g.addEventListener = function (a, b) {
				var c = b;
				"string" == typeof b && (c = function () {
					window[b].apply(window, arguments);
				});
				this.k.subscribe(a, c);
				bb(this, a);
				return this;
			};

			function ab(a, b) {
				var c = b.split(".");
				if (2 != !c.length) {
					var d = c[1];
					a.L == c[0] && bb(a, d);
				}
			}
			g.destroy = function () {
				this.d.id && (K[this.d.id] = null);
				var a = this.k;
				a && "function" == typeof a.dispose && a.dispose();
				if (this.o) {
					var a = this.d,
						b = a.parentNode;
					b && b.replaceChild(this.o, a);
				} else (a = this.d) && a.parentNode && a.parentNode.removeChild(a);
				Q && (Q[this.G] = null);
				this.g = null;
				var a = this.d,
					c;
				for (c in x) x[c][0] == a && Sa(c);
				this.o = this.d = null;
			};
			g.C = function () {
				return {};
			};

			function R(a, b, c) {
				c = c || [];
				c = Array.prototype.slice.call(c);
				b = {
					event: "command",
					func: b,
					args: c
				};
				a.F ? a.J(b) : a.D.push(b);
			}
			g.v = function (a, b) {
				if (!this.k.j) {
					var c = {
						target: this,
						data: b
					};
					this.k.R(a, c);
					Ya(this.L + "." + a, c);
				}
			};

			function Za(a, b) {
				for (var c = document.createElement("iframe"), d = b.attributes, e = 0, f = d.length; e < f; e++) {
					var k = d[e].value;
					null != k && "" != k && "null" != k && c.setAttribute(d[e].name, k);
				}
				c.setAttribute("frameBorder", 0);
				c.setAttribute("allowfullscreen", 1);
				c.setAttribute("title", "YouTube " + P(a.g, "title"));
				(d = P(a.g, "width")) && c.setAttribute("width", d);
				(d = P(a.g, "height")) && c.setAttribute("height", d);
				var u = a.C();
				u.enablejsapi = window.postMessage ? 1 : 0;
				window.location.host && (u.origin = window.location.protocol + "//" + window.location.host);
				window.location.href && w(["debugjs", "debugcss"], function (a) {
					var b;
					b = window.location.href;
					var c = b.search(Fa),
						d;
					i: {
						d = 0;
						for (var e = a.length; 0 <= (d = b.indexOf(a, d)) && d < c;) {
							var f = b.charCodeAt(d - 1);
							if (38 == f || 63 == f)
								if (f = b.charCodeAt(d + e), !f || 61 == f || 38 == f || 35 == f) break i;
							d += e + 1;
						}
						d = -1;
						}
					if (0 > d) b = null;
					else {
						e = b.indexOf("&", d);
						if (0 > e || e > c) e = c;
						d += a.length + 1;
						b = decodeURIComponent(b.substr(d, e - d).replace(/\+/g, " "));
					}
					null === b || (u[a] = b);
				});
				c.src = P(a.g, "host") + a.K() + "?" + Ta(u);
				return c;
			}
			g.N = function () {
				this.d && this.d.contentWindow ? this.J({
					event: "listening"
				}) : window.clearInterval(this.j);
			};

			function $a(a) {
				cb(a.g, a, a.G);
				a.j = La(q(a.N, a));
				Ra(a.d, "load", q(function () {
					window.clearInterval(this.j);
					this.j = La(q(this.N, this));
					if (window.initialDeliveryComplete) {
						clearInterval(this.j);
					}
				}, a));
			}

			function bb(a, b) {
				a.M[b] || (a.M[b] = !0, R(a, "addEventListener", [b]));
			}
			g.J = function (a) {
				a.id = this.G;
				var b = [];
				F(new va, a, b);
				a = b.join("");
				var b = this.g,
					c, d = Ca(this.d.src);
				c = d[1];
				var e = d[2],
					f = d[3],
					d = d[4],
					k = "";
				c && (k += c + ":");
				f && (k += "//", e && (k += e + "@"), k += f, d && (k += ":" + d));
				c = k;
				b = 0 == c.indexOf("https:") ? [c] : b.d ? [c.replace("http:", "https:")] : b.j ? [c] : [c, c.replace("http:", "https:")];
				for (c = 0; c < b.length; c++) {
					this.d.contentWindow.postMessage(a, b[c]);
				}
			};
			var db = "StopIteration" in h ? h.StopIteration : Error("StopIteration");

			function eb() { }
			eb.prototype.next = function () {
				throw db;
			};
			eb.prototype.g = function () {
				return this;
			};
			A && E("9");
			!C || E("528");
			B && E("1.9b") || A && E("8") || z && E("9.5") || C && E("528");
			B && !E("8") || A && E("9");
			var fb, gb, hb, ib, jb, mb, nb;
			nb = mb = jb = ib = hb = gb = fb = !1;
			var S = y;
			S && (-1 != S.indexOf("Firefox") ? fb = !0 : -1 != S.indexOf("Camino") ? gb = !0 : -1 != S.indexOf("iPhone") || -1 != S.indexOf("iPod") ? hb = !0 : -1 != S.indexOf("iPad") ? ib = !0 : -1 != S.indexOf("Chrome") ? mb = !0 : -1 != S.indexOf("Android") ? jb = !0 : -1 != S.indexOf("Safari") && (nb = !0));
			var ob = fb,
				pb = gb,
				qb = hb,
				rb = ib,
				sb = jb,
				tb = mb,
				ub = nb;
			var vb = "corp.google.com googleplex.com youtube.com youtube-nocookie.com youtubeeducation.com prod.google.com sandbox.google.com docs.google.com drive.google.com mail.google.com plus.google.com play.google.com googlevideo.com talkgadget.google.com survey.g.doubleclick.net youtube.googleapis.com vevo.com".split(" "),
				wb = "";

			function xb() { }
			new xb;
			new xb;
			var T = y,
				T = T.toLowerCase();
			if (-1 != T.indexOf("android") && !T.match(/android\D*(\d\.\d)[^\;|\)]*[\;\)]/)) {
				var yb = {
					cupcake: 1.5,
					donut: 1.6,
					eclair: 2,
					froyo: 2.2,
					gingerbread: 2.3,
					honeycomb: 3,
					"ice cream sandwich": 4,
					jellybean: 4.1
				},
					zb = [],
					Ab = 0,
					Bb;
				for (Bb in yb) zb[Ab++] = Bb;
				T.match("(" + zb.join("|") + ")");
			};
			var Cb = l("yt.net.ping.workerUrl_") || null;
			r("yt.net.ping.workerUrl_", Cb);
			var U = window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance || {};
			q(U.clearResourceTimings || U.webkitClearResourceTimings || U.mozClearResourceTimings || U.msClearResourceTimings || U.oClearResourceTimings || aa, U);
			var Db;
			var Eb = y,
				Fb = Eb.match(/\((iPad|iPhone|iPod)( Simulator)?;/);
			if (!Fb || 2 > Fb.length) Db = void 0;
			else {
				var Gb = Eb.match(/\((iPad|iPhone|iPod)( Simulator)?; (U; )?CPU (iPhone )?OS (\d_\d)[_ ]/);
				Db = Gb && 6 == Gb.length ? Number(Gb[5].replace("_", ".")) : 0;
			}
			0 <= Db && 0 <= y.search("Safari") && y.search("Version");

			function V(a) {
				return (a = a.exec(y)) ? a[1] : "";
			} (function () {
				if (ob) return V(/Firefox\/([0-9.]+)/);
				if (A || z) return D;
				if (tb) return V(/Chrome\/([0-9.]+)/);
				if (ub) return V(/Version\/([0-9.]+)/);
				if (qb || rb) {
					var a;
					if (a = /Version\/(\S+).*Mobile\/(\S+)/.exec(y)) return a[1] + "." + a[2];
				} else {
					if (sb) return (a = V(/Android\s+([0-9.]+)/)) ? a : V(/Version\/([0-9.]+)/);
					if (pb) return V(/Camino\/([0-9.]+)/);
				}
				return "";
			})();

			function Hb() { };

			function Ib() { }
			s(Ib, Hb);

			function W(a) {
				this.d = a;
			}
			s(W, Ib);
			W.prototype.isAvailable = function () {
				if (!this.d) return !1;
				try {
					return this.d.setItem("__sak", "1"), this.d.removeItem("__sak"), !0;
				} catch (a) {
					return !1;
				}
			};
			W.prototype.g = function (a) {
				var b = 0,
					c = this.d,
					d = new eb;
				d.next = function () {
					if (b >= c.length) throw db;
					var d;
					d = c.key(b++);
					if (a) return d;
					d = c.getItem(d);
					if (!n(d)) throw "Storage mechanism: Invalid value was encountered";
					return d;
				};
				return d;
			};
			W.prototype.key = function (a) {
				return this.d.key(a);
			};

			function Jb() {
				var a = null;
				try {
					a = window.localStorage || null;
				} catch (b) { }
				this.d = a;
			}
			s(Jb, W);

			function Kb() {
				var a = null;
				try {
					a = window.sessionStorage || null;
				} catch (b) { }
				this.d = a;
			}
			s(Kb, W);
			(new Jb).isAvailable();
			(new Kb).isAvailable();

			function Lb(a) {
				return (0 == a.search("cue") || 0 == a.search("load")) && "loadModule" != a;
			}

			function Mb(a) {
				return 0 == a.search("get") || 0 == a.search("is");
			};

			function X(a) {
				this.g = a || {};
				this.defaults = {};
				this.defaults.host = "http://www.youtube.com";
				this.defaults.title = "";
				this.j = this.d = !1;
				a = document.getElementById("www-widgetapi-script");
				if (this.d = !!("https:" == document.location.protocol || a && 0 == a.src.indexOf("https:"))) {
					a = [this.g, window.YTConfig || {}, this.defaults];
					for (var b = 0; b < a.length; b++) a[b].host && (a[b].host = a[b].host.replace("http://", "https://"));
				}
			}
			var Q = null;

			function P(a, b) {
				for (var c = [a.g, window.YTConfig || {}, a.defaults], d = 0; d < c.length; d++) {
					var e = c[d][b];
					if (void 0 != e) return e;
				}
				return null;
			}

			function cb(a, b, c) {
				Q || (Q = {}, Ra(window, "message", q(a.k, a)));
				Q[c] = b;
			}
			X.prototype.k = function (a) {
				var b;
				(b = a.origin == P(this, "host")) || ((b = a.origin) && b == wb ? b = true : (new RegExp("^(https?:)?//([a-z0-9-]{1,63}\\.)*(" + vb.join("|").replace(/\./g, ".") + ")(:[0-9]+)?([/?#]|$)", "i")).test(b) ? (wb = b, b = !0) : b = !1);
				if (b) {
					var c;
					try {
						c = ua(a.data);
					} catch (d) {
						return;
					}
					this.j = !0;
					this.d || 0 != a.origin.indexOf("https:") || (this.d = true);
					if (a = Q[c.id]) a.F = !0, a.F && (w(a.D, a.J, a), a.D.length = 0), a.P(c);
				}
			};

			function Nb(a) {
				X.call(this, a);
				this.defaults.title = "video player";
				this.defaults.videoId = "";
				this.defaults.width = 640;
				this.defaults.height = 360;
			}
			s(Nb, X);

			function Y(a, b) {
				var c = new Nb(b);
				O.call(this, a, c, "player");
				this.A = {};
				this.t = {};
			}
			s(Y, O);

			function Ob(a) {
				if ("iframe" != a.tagName.toLowerCase()) {
					var b = L(a, "videoid");
					if (b) {
						var c = L(a, "width"),
							d = L(a, "height");
						new Y(a, {
							videoId: b,
							width: c,
							height: d
						});
					}
				}
			}
			g = Y.prototype;
			g.K = function () {
				return "/embed/" + P(this.g, "videoId");
			};
			g.C = function () {
				var a;
				if (P(this.g, "playerVars")) {
					a = P(this.g, "playerVars");
					var b = {},
						c;
					for (c in a) b[c] = a[c];
					a = b;
				} else a = {};
				return a;
			};
			g.P = function (a) {
				var b = a.event;
				a = a.info;
				switch (b) {
					case "apiInfoDelivery":
						if (ba(a))
							for (var c in a) this.t[c] = a[c];
						break;
					case "infoDelivery":
						Pb(this, a);
						break;
					case "initialDelivery":
						window.clearInterval(this.j);
						window.initialDeliveryComplete = true;
						this.A = {};
						this.t = {};
						Qb(this, a.apiInterface);
						Pb(this, a);
						break;
					default:
						this.v(b, a);
				}
			};

			function Pb(a, b) {
				if (ba(b))
					for (var c in b) a.A[c] = b[c];
			}

			function Qb(a, b) {
				w(b, function (a) {
					this[a] || (Lb(a) ? this[a] = function () {
						this.A = {};
						this.t = {};
						R(this, a, arguments);
						return this;
					} : Mb(a) ? this[a] = function () {
						var b = 0;
						0 == a.search("get") ? b = 3 : 0 == a.search("is") && (b = 2);
						return this.A[a.charAt(b).toLowerCase() + a.substr(b + 1)];
					} : this[a] = function () {
						R(this, a, arguments);
						return this;
					});
				}, a);
			}
			g.aa = function () {
				var a = this.d.cloneNode(false),
					b = this.A.videoData,
					c = P(this.g, "host");
				a.src = b && b.video_id ? c + "/embed/" + b.video_id : a.src;
				b = document.createElement("div");
				b.appendChild(a);
				return b.innerHTML;
			};
			g.$ = function (a) {
				return this.t.namespaces ? a ? this.t[a].options || [] : this.t.namespaces || [] : [];
			};
			g.Z = function (a, b) {
				if (this.t.namespaces && a && b) return this.t[a][b];
			};

			function Rb(a) {
				X.call(this, a);
				this.defaults.title = "Thumbnail";
				this.defaults.videoId = "";
				this.defaults.width = 120;
				this.defaults.height = 68;
			}
			s(Rb, X);

			function Z(a, b) {
				var c = new Rb(b);
				O.call(this, a, c, "thumbnail");
			}
			s(Z, O);

			function Sb(a) {
				if ("iframe" != a.tagName.toLowerCase()) {
					var b = L(a, "videoid");
					if (b) {
						b = {
							videoId: b,
							events: {}
						};
						b.width = L(a, "width");
						b.height = L(a, "height");
						b.thumbWidth = L(a, "thumb-width");
						b.thumbHeight = L(a, "thumb-height");
						b.thumbAlign = L(a, "thumb-align");
						var c = L(a, "onclick");
						c && (b.events.onClick = c);
						new Z(a, b);
					}
				}
			}
			Z.prototype.K = function () {
				return "/embed/" + P(this.g, "videoId");
			};
			Z.prototype.C = function () {
				return {
					player: 0,
					thumb_width: P(this.g, "thumbWidth"),
					thumb_height: P(this.g, "thumbHeight"),
					thumb_align: P(this.g, "thumbAlign")
				};
			};
			Z.prototype.v = function (a, b) {
				Z.I.v.call(this, a, b ? b.info : void 0);
			};

			function Tb(a) {
				X.call(this, a);
				this.defaults.host = "https://www.youtube.com";
				this.defaults.title = "upload widget";
				this.defaults.width = 640;
				this.defaults.height = .67 * P(this, "width");
			}
			s(Tb, X);

			function $(a, b) {
				var c = new Tb(b);
				O.call(this, a, c, "upload");
			}
			s($, O);
			g = $.prototype;
			g.K = function () {
				return "/upload_embed";
			};
			g.C = function () {
				var a = {},
					b = P(this.g, "webcamOnly");
				null != b && (a.webcam_only = b);
				return a;
			};
			g.v = function (a, b) {
				$.I.v.call(this, a, b);
				"onApiReady" == a && R(this, "hostWindowReady");
			};
			g.S = function () {
				R(this, "setVideoDescription", arguments);
			};
			g.U = function () {
				R(this, "setVideoKeywords", arguments);
			};
			g.V = function () {
				R(this, "setVideoPrivacy", arguments);
			};
			g.T = function () {
				R(this, "setVideoDraftPrivacy", arguments);
			};
			g.W = function () {
				R(this, "setVideoTitle", arguments);
			};
			r("YT.PlayerState.UNSTARTED", -1);
			r("YT.PlayerState.ENDED", 0);
			r("YT.PlayerState.PLAYING", 1);
			r("YT.PlayerState.PAUSED", 2);
			r("YT.PlayerState.BUFFERING", 3);
			r("YT.PlayerState.CUED", 5);
			r("YT.UploadWidgetEvent.API_READY", "onApiReady");
			r("YT.UploadWidgetEvent.UPLOAD_SUCCESS", "onUploadSuccess");
			r("YT.UploadWidgetEvent.PROCESSING_COMPLETE", "onProcessingComplete");
			r("YT.UploadWidgetEvent.STATE_CHANGE", "onStateChange");
			r("YT.UploadWidgetState.IDLE", 0);
			r("YT.UploadWidgetState.PENDING", 1);
			r("YT.UploadWidgetState.ERROR", 2);
			r("YT.UploadWidgetState.PLAYBACK", 3);
			r("YT.UploadWidgetState.RECORDING", 4);
			r("YT.UploadWidgetState.STOPPED", 5);
			r("YT.get", function (a) {
				return K[a];
			});
			r("YT.scan", Wa);
			r("YT.subscribe", function (a, b, c) {
				I.subscribe(a, b, c);
				Va[a] = true;
				for (var d in K) ab(K[d], a);
			});
			r("YT.unsubscribe", function (a, b, c) {
				za(a, b, c);
			});
			r("YT.Player", Y);
			r("YT.Thumbnail", Z);
			r("YT.UploadWidget", $);
			O.prototype.destroy = O.prototype.destroy;
			O.prototype.setSize = O.prototype.Y;
			O.prototype.getIframe = O.prototype.X;
			O.prototype.addEventListener = O.prototype.addEventListener;
			Y.prototype.getVideoEmbedCode = Y.prototype.aa;
			Y.prototype.getOptions = Y.prototype.$;
			Y.prototype.getOption = Y.prototype.Z;
			$.prototype.setVideoDescription = $.prototype.S;
			$.prototype.setVideoKeywords = $.prototype.U;
			$.prototype.setVideoPrivacy = $.prototype.V;
			$.prototype.setVideoTitle = $.prototype.W;
			$.prototype.setVideoDraftPrivacy = $.prototype.T;
			Ua.push(function () {
				var a = Xa("player");
				w(a, Ob);
			});
			Ua.push(function () {
				var a = Xa("thumbnail");
				w(a, Sb);
			});
			YTConfig.parsetags && "onload" != YTConfig.parsetags || Wa();
			var Ub = l("onYTReady");
			Ub && Ub();
			var Vb = l("onYouTubeIframeAPIReady");
			Vb && Vb();
			var Wb = l("onYouTubePlayerAPIReady");
			Wb && Wb();

			/* jshint ignore:end */
		}
	});

	return YouTubePlayerAPI;
});