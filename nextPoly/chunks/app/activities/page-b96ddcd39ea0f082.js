(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[18], {
    3136: function(e, t, n) {
        Promise.resolve().then(n.bind(n, 6225))
    },
    8864: function(e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
        Object.defineProperty(t, "default", {
            enumerable: !0,
            get: function() {
                return c
            }
        });
        let r = n(1024);
        n(2265);
        let a = r._(n(533));
        function i(e) {
            return {
                default: (null == e ? void 0 : e.default) || e
            }
        }
        function c(e, t) {
            let n = a.default
              , r = {
                loading: e => {
                    let {error: t, isLoading: n, pastDelay: r} = e;
                    return null
                }
            };
            "function" == typeof e && (r.loader = e),
            Object.assign(r, t);
            let c = r.loader;
            return n({
                ...r,
                loader: () => null != c ? c().then(i) : Promise.resolve(i( () => null))
            })
        }
        ("function" == typeof t.default || "object" == typeof t.default && null !== t.default) && void 0 === t.default.__esModule && (Object.defineProperty(t.default, "__esModule", {
            value: !0
        }),
        Object.assign(t.default, t),
        e.exports = t.default)
    },
    3699: function(e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
        function(e, t) {
            for (var n in t)
                Object.defineProperty(e, n, {
                    enumerable: !0,
                    get: t[n]
                })
        }(t, {
            suspense: function() {
                return a
            },
            NoSSR: function() {
                return i
            }
        }),
        n(1024),
        n(2265);
        let r = n(7669);
        function a() {
            let e = Error(r.NEXT_DYNAMIC_NO_SSR_CODE);
            throw e.digest = r.NEXT_DYNAMIC_NO_SSR_CODE,
            e
        }
        function i(e) {
            let {children: t} = e;
            return t
        }
    },
    533: function(e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
        Object.defineProperty(t, "default", {
            enumerable: !0,
            get: function() {
                return c
            }
        });
        let r = n(1024)
          , a = r._(n(2265))
          , i = n(3699)
          , c = function(e) {
            let t = Object.assign({
                loader: null,
                loading: null,
                ssr: !0
            }, e);
            function n(e) {
                let n = t.loading
                  , r = a.default.createElement(n, {
                    isLoading: !0,
                    pastDelay: !0,
                    error: null
                })
                  , c = t.ssr ? a.default.Fragment : i.NoSSR
                  , s = t.lazy;
                return a.default.createElement(a.default.Suspense, {
                    fallback: r
                }, a.default.createElement(c, null, a.default.createElement(s, e)))
            }
            return t.lazy = a.default.lazy(t.loader),
            n.displayName = "LoadableComponent",
            n
        }
    },
    6225: function(e, t, n) {
        "use strict";
        n.r(t),
        n.d(t, {
            default: function() {
                return d
            }
        });
        var r = n(7437);
        n(8864);
        var a = n(2265)
          , i = e => {
            let {activity: t, handleActivityClick: n} = e;
            return (0,
            r.jsx)(r.Fragment, {
                children: (0,
                r.jsx)("div", {
                    onClick: () => n(t),
                    className: "flex justify-center items-center m-3",
                    children: (0,
                    r.jsx)("div", {
                        className: "w-full max-w-md md:max-w-lg ",
                        children: (0,
                        r.jsx)("div", {
                            className: "flex items-center rounded bg-white bg-opacity-80  cursor-pointer min-h-14 p-2 hover:bg-opacity-50",
                            children: (0,
                            r.jsxs)("div", {
                                className: "flex flex-col justify-center pl-4 pr-4",
                                children: [(0,
                                r.jsx)("span", {
                                    className: "text-sm font-medium font-milligram",
                                    children: t.name
                                }), (0,
                                r.jsxs)("span", {
                                    className: "opacity-60 text-xs font-pitch",
                                    children: [t.type, " \xb7 ", Number(t.distance / 1e3).toFixed(2), " ", "km \xb7 ", (e => {
                                        let t = Math.floor(e / 3600);
                                        return "".concat(t ? "".concat(t, "h") : "", " ").concat(String(Math.floor(e % 3600 / 60)).padStart(2, "0"), "m ").concat(String(e % 60).padStart(2, "0"), "s")
                                    }
                                    )(t.moving_time)]
                                })]
                            })
                        })
                    })
                })
            })
        }
        ;
        n(1396);
        var c = n(9957)
          , s = n(4033);
        n(6691);
        var o = n(9499)
          , l = n(8806)
          , u = () => {
            let e = (0,
            s.useRouter)()
              , {activities: t, activitiesLoading: n, fetchActivities: u} = (0,
            c.Z)()
              , d = t => {
                e.push("/activity?activityId=".concat(t.id), t.id)
            }
            ;
            return (0,
            a.useEffect)( () => {
                u()
            }
            , []),
            (0,
            r.jsxs)(r.Fragment, {
                children: [(0,
                r.jsx)("div", {
                    children: (0,
                    r.jsx)(o.Z, {})
                }), (0,
                r.jsxs)("div", {
                    className: "mt-16",
                    children: [(0,
                    r.jsx)("div", {
                        className: "text-2xl text-gray-900 font-bold px-6 md:px-40 py-8 text-center font-milligram",
                        children: "Your Recent Activities"
                    }), !n && (null == t ? void 0 : t.length) === 0 && (0,
                    r.jsx)("div", {
                        className: "flex items-center justify-center py-2 ",
                        children: (0,
                        r.jsx)("p", {
                            className: "text-md text-gray-900",
                            children: "No activities found"
                        })
                    }), null == t ? void 0 : t.map(e => (0,
                    r.jsx)(i, {
                        activity: e,
                        handleActivityClick: d
                    }, e.id)), n && (0,
                    r.jsx)(l.Z, {})]
                })]
            })
        }
        ;
        function d(e) {
            let {} = e;
            return (0,
            r.jsx)(u, {})
        }
    },
    8806: function(e, t, n) {
        "use strict";
        n.d(t, {
            Z: function() {
                return c
            }
        });
        var r = n(7437)
          , a = n(6691)
          , i = n.n(a);
        function c() {
            return (0,
            r.jsx)("div", {
                children: (0,
                r.jsx)(i(), {
                    src: "/assets/polymer-symbol.svg",
                    width: 50,
                    height: 50,
                    className: "w-12 h-12 animate-pulse"
                })
            })
        }
    },
    9957: function(e, t, n) {
        "use strict";
        n.d(t, {
            Z: function() {
                return l
            }
        });
        var r = n(4033)
          , a = n(2265);
        console.log("%c Made with ❤️ by codiyan!", "background: #222; color: #bada55"),
        console.log("https://codiyan.com");
        var i = n(4810)
          , c = n(4660)
          , s = n(2601);
        let o = (0,
        c.Ue)((0,
        i.tJ)(e => ({
            currentTokens: null,
            setCurrentTokens: t => e({
                currentTokens: t
            }),
            activities: [],
            setActivities: t => e({
                activities: t
            })
        }), {
            name: "strava-activities-storage",
            getStorage: () => localStorage
        }));
        function l() {
            let {} = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
              , e = (0,
            r.useSearchParams)()
              , t = ( () => {
                try {
                    return JSON.parse(e.get("tokens"))
                } catch (e) {
                    return console.error(e),
                    null
                }
            }
            )()
              , n = e.get("code")
              , i = (0,
            r.useRouter)()
              , [c,l] = (0,
            a.useState)(!1)
              , u = o(e => e.currentTokens)
              , d = o(e => e.setCurrentTokens)
              , f = o(e => e.activities)
              , h = o(e => e.setActivities);
            (0,
            a.useEffect)( () => {
                if (t)
                    try {
                        d(t)
                    } catch (e) {
                        console.error(e)
                    }
            }
            , [t]);
            let p = async e => {
                if (!s.env.NEXT_PUBLIC_STRAVA_SECRET && e) {
                    i.replace("/strava-callback?code=".concat(e));
                    return
                }
                let t = await fetch("https://www.strava.com/api/v3/oauth/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        client_id: 112199,
                        client_secret: s.env.NEXT_PUBLIC_STRAVA_SECRET,
                        code: e,
                        grant_type: "authorization_code"
                    })
                })
                  , n = await t.json();
                return n.errors || d(n),
                n
            }
              , m = async () => {
                let {refresh_token: e} = u;
                if (!s.env.NEXT_PUBLIC_STRAVA_SECRET) {
                    i.replace("/strava-refresh?refresh_token=".concat(e));
                    return
                }
                let t = await fetch("https://www.strava.com/api/v3/oauth/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        client_id: 112199,
                        client_secret: s.env.NEXT_PUBLIC_STRAVA_SECRET,
                        refresh_token: e,
                        grant_type: "refresh_token"
                    })
                })
                  , n = await t.json();
                return n.errors || d(n),
                n
            }
              , v = async function() {
                arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
                try {
                    if (n)
                        return p(n).then(e => (i.replace("/activities"),
                        e));
                    let e = t || u;
                    if (e && e.expires_at > Date.now() / 1e3)
                        return e;
                    return m(e.refresh_token)
                } catch (e) {
                    return console.error(e),
                    {}
                }
            }
              , y = async () => {
                l(!0);
                let e = (await v()).access_token;
                if (!e) {
                    console.error("No access token"),
                    l(!1);
                    return
                }
                try {
                    let t = await fetch("https://www.strava.com/api/v3/athlete/activities", {
                        headers: {
                            Authorization: "Bearer ".concat(e)
                        }
                    }).then(e => e.json());
                    h(t),
                    l(!1)
                } catch (e) {
                    console.error(e),
                    l(!1)
                }
            }
              , _ = async e => {
                let t = (await v()).access_token;
                if (!t) {
                    console.error("No access token");
                    return
                }
                try {
                    let n = await fetch("https://www.strava.com/api/v3/activities/".concat(e), {
                        headers: {
                            Authorization: "Bearer ".concat(t)
                        }
                    }).then(e => e.json());
                    return n
                } catch (e) {
                    console.error(e)
                }
            }
            ;
            return {
                activities: f,
                activitiesLoading: c,
                getValidAccessTokens: v,
                fetchActivities: y,
                fetchActivityById: _,
                getAuthUrl: () => {
                    let e = window.location.origin + "/strava-callback";
                    s.env.NEXT_PUBLIC_STRAVA_SECRET && (e = window.location.origin + "/activities");
                    let t = "https://www.strava.com/oauth/authorize?client_id=".concat("112199", "&response_type=code&redirect_uri=").concat(e, "&approval_prompt=force&scope=activity:read_all");
                    return t
                }
            }
        }
    },
    9499: function(e, t, n) {
        "use strict";
        n.d(t, {
            Z: function() {
                return l
            }
        });
        var r = n(7437)
          , a = n(6691)
          , i = n.n(a)
          , c = n(1396)
          , s = n.n(c)
          , o = n(3159)
          , l = function(e) {
            let {backToSite: t=!0, backToSiteText: n="Back to Site"} = e;
            return (0,
            r.jsxs)("nav", {
                className: "flex justify-between items-center relative mt-10 mb-8  lg:max-w-[500px] m-auto w-[90%]",
                children: [(0,
                r.jsxs)("div", {
                    onClick: e => {
                        e.preventDefault(),
                        window.history.back()
                    }
                    ,
                    className: "font-pitch uppercase text-xs flex items-center gap-2 cursor-pointer",
                    children: [(0,
                    r.jsx)(o.bUI, {}), "Back"]
                }), (0,
                r.jsx)("div", {
                    className: "absolute left-1/2 transform -translate-x-1/2",
                    children: (0,
                    r.jsx)(s(), {
                        href: "/",
                        children: (0,
                        r.jsx)(i(), {
                            src: "/assets/polymer-name-logo.png",
                            height: 50,
                            width: 100,
                            style: {
                                objectFit: "contain"
                            },
                            unoptimized: !0
                        })
                    })
                }), (0,
                r.jsx)(s(), {
                    href: "https://polymer.ws",
                    className: "font-pitch uppercase text-xs flex items-center gap-2",
                    children: "Back to Site"
                })]
            })
        }
    }
}, function(e) {
    e.O(0, [420, 780, 345, 971, 596, 744], function() {
        return e(e.s = 3136)
    }),
    _N_E = e.O()
}
]);
