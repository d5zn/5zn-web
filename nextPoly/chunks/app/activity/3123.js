(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[263], {
    6576: function(e, t, a) {
        Promise.resolve().then(a.bind(a, 5563))
    },
    8806: function(e, t, a) {
        "use strict";
        a.d(t, {
            Z: function() {
                return n
            }
        });
        var i = a(7437)
          , r = a(6691)
          , s = a.n(r);
        function n() {
            return (0,
            i.jsx)("div", {
                children: (0,
                i.jsx)(s(), {
                    src: "/assets/polymer-symbol.svg",
                    width: 50,
                    height: 50,
                    className: "w-12 h-12 animate-pulse"
                })
            })
        }
    },
    9957: function(e, t, a) {
        "use strict";
        a.d(t, {
            Z: function() {
                return c
            }
        });
        var i = a(4033)
          , r = a(2265);
        console.log("%c Made with ❤️ by codiyan!", "background: #222; color: #bada55"),
        console.log("https://codiyan.com");
        var s = a(4810)
          , n = a(4660)
          , l = a(2601);
        let o = (0,
        n.Ue)((0,
        s.tJ)(e => ({
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
        function c() {
            let {} = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
              , e = (0,
            i.useSearchParams)()
              , t = ( () => {
                try {
                    return JSON.parse(e.get("tokens"))
                } catch (e) {
                    return console.error(e),
                    null
                }
            }
            )()
              , a = e.get("code")
              , s = (0,
            i.useRouter)()
              , [n,c] = (0,
            r.useState)(!1)
              , d = o(e => e.currentTokens)
              , h = o(e => e.setCurrentTokens)
              , m = o(e => e.activities)
              , u = o(e => e.setActivities);
            (0,
            r.useEffect)( () => {
                if (t)
                    try {
                        h(t)
                    } catch (e) {
                        console.error(e)
                    }
            }
            , [t]);
            let g = async e => {
                if (!l.env.NEXT_PUBLIC_STRAVA_SECRET && e) {
                    s.replace("/strava-callback?code=".concat(e));
                    return
                }
                let t = await fetch("https://www.strava.com/api/v3/oauth/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        client_id: 112199,
                        client_secret: l.env.NEXT_PUBLIC_STRAVA_SECRET,
                        code: e,
                        grant_type: "authorization_code"
                    })
                })
                  , a = await t.json();
                return a.errors || h(a),
                a
            }
              , f = async () => {
                let {refresh_token: e} = d;
                if (!l.env.NEXT_PUBLIC_STRAVA_SECRET) {
                    s.replace("/strava-refresh?refresh_token=".concat(e));
                    return
                }
                let t = await fetch("https://www.strava.com/api/v3/oauth/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        client_id: 112199,
                        client_secret: l.env.NEXT_PUBLIC_STRAVA_SECRET,
                        refresh_token: e,
                        grant_type: "refresh_token"
                    })
                })
                  , a = await t.json();
                return a.errors || h(a),
                a
            }
              , p = async function() {
                arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
                try {
                    if (a)
                        return g(a).then(e => (s.replace("/activities"),
                        e));
                    let e = t || d;
                    if (e && e.expires_at > Date.now() / 1e3)
                        return e;
                    return f(e.refresh_token)
                } catch (e) {
                    return console.error(e),
                    {}
                }
            }
              , x = async () => {
                c(!0);
                let e = (await p()).access_token;
                if (!e) {
                    console.error("No access token"),
                    c(!1);
                    return
                }
                try {
                    let t = await fetch("https://www.strava.com/api/v3/athlete/activities", {
                        headers: {
                            Authorization: "Bearer ".concat(e)
                        }
                    }).then(e => e.json());
                    u(t),
                    c(!1)
                } catch (e) {
                    console.error(e),
                    c(!1)
                }
            }
              , v = async e => {
                let t = (await p()).access_token;
                if (!t) {
                    console.error("No access token");
                    return
                }
                try {
                    let a = await fetch("https://www.strava.com/api/v3/activities/".concat(e), {
                        headers: {
                            Authorization: "Bearer ".concat(t)
                        }
                    }).then(e => e.json());
                    return a
                } catch (e) {
                    console.error(e)
                }
            }
            ;
            return {
                activities: m,
                activitiesLoading: n,
                getValidAccessTokens: p,
                fetchActivities: x,
                fetchActivityById: v,
                getAuthUrl: () => {
                    let e = window.location.origin + "/strava-callback";
                    l.env.NEXT_PUBLIC_STRAVA_SECRET && (e = window.location.origin + "/activities");
                    let t = "https://www.strava.com/oauth/authorize?client_id=".concat("112199", "&response_type=code&redirect_uri=").concat(e, "&approval_prompt=force&scope=activity:read_all");
                    return t
                }
            }
        }
    },
    5563: function(e, t, a) {
        "use strict";
        a.r(t),
        a.d(t, {
            default: function() {
                return C
            }
        });
        var i = a(7437)
          , r = a(2265)
          , s = a(4004);
        a(8033),
        a(722);
        var n = a(4301)
          , l = a(4660);
        let o = (0,
        l.Ue)(e => ({
            postStyle: "portrait",
            canvasWidth: "desktop",
            fontColor: "white",
            title: "TITLE",
            eyeSlash: "/assets/eye-slash.svg",
            titleVisible: {
                visible: !0,
                src: "/assets/eye-slash.svg"
            },
            imagesArray: [],
            image: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg",
            RideData: [{
                dataName: "Distance",
                data: "132km",
                visible: !0
            }, {
                dataName: "Elevation",
                data: "4350hm",
                visible: !0
            }, {
                dataName: "MovingTime",
                data: "04:32:21",
                visible: !0
            }],
            speedData: [{
                dataName: "KM/Max",
                data: "98.2",
                visible: !0
            }, {
                dataName: "KM/H",
                data: "62.2",
                visible: !0
            }, {
                dataName: "KM/Min",
                data: "32.2",
                visible: !0
            }],
            date: "Sep 11,2023 at 8:00AM",
            setPostStyle: t => e( () => ({
                postStyle: t
            })),
            setCanvasWidth: t => e( () => ({
                canvasWidth: t
            })),
            setFontColor: t => e( () => ({
                fontColor: t
            })),
            setTitle: t => e( () => ({
                title: t
            })),
            setTitleVisible: t => e( () => ({
                titleVisible: t
            })),
            setImagesArray: t => e( () => ({
                imagesArray: t
            })),
            setImage: t => e( () => ({
                image: t
            })),
            setActivity: t => {
                e(e => ({
                    title: t.name,
                    date: function(e) {
                        let t = new Date(e);
                        return (0,
                        n.Z)(t, "MMMM d, HH:mm")
                    }(t.start_date_local),
                    RideData: function(e) {
                        let t = [{
                            dataName: "Distance",
                            data: "".concat(Number(e.distance / 1e3).toFixed(2), "km"),
                            visible: !0
                        }, {
                            dataName: "Elevation",
                            data: "".concat(e.total_elevation_gain, "hm"),
                            visible: !0
                        }, {
                            dataName: "Time",
                            data: function(e) {
                                let t = Math.floor(e / 3600)
                                  , a = e % 60;
                                return "".concat(t ? "".concat(t, "h") : "", " ").concat(String(Math.floor(e % 3600 / 60)).padStart(2, "0"), "m ").concat(a && !t ? "".concat(String(a).padStart(2, "0"), "s") : "")
                            }(e.moving_time),
                            visible: !0
                        }];
                        return t
                    }(t),
                    speedData: function(e) {
                        let t = [e.average_watts && {
                            dataName: "Power/avg",
                            data: "".concat(e.average_watts.toFixed(1), " W"),
                            visible: !0
                        }, {
                            dataName: "Speed/avg",
                            data: "".concat((3.6 * e.average_speed).toFixed(1), " km/h"),
                            visible: !0
                        }].filter(Boolean);
                        return t
                    }(t)
                }))
            }
            ,
            triggerDownload: () => {
                e( () => ({
                    download: {
                        downloadNow: !0
                    }
                }))
            }
            ,
            toggleVisibility: (t, a) => {
                try {
                    e(e => {
                        let i = e[t].map(e => e.dataName === a ? {
                            ...e,
                            visible: !e.visible
                        } : e);
                        return {
                            [t]: i.filter(e => !0)
                        }
                    }
                    )
                } catch (e) {
                    console.log(e)
                }
            }
        }));
        var c = function(e) {
            let {activity: t} = e
              , a = o(e => e.postStyle)
              , s = o(e => e.setPostStyle)
              , n = o(e => e.fontColor)
              , l = o(e => e.setFontColor)
              , c = o(e => e.setTitle)
              , d = o(e => e.title)
              , h = o(e => e.setImage)
              , m = o(e => e.imagesArray)
              , u = o(e => e.RideData)
              , g = o(e => e.speedData)
              , f = o(e => e.titleVisible)
              , p = o(e => e.setTitleVisible)
              , x = o(e => e.toggleVisibility)
              , v = o(e => e.setActivity);
            return (0,
            r.useEffect)( () => {
                t && v(t)
            }
            , [t]),
            (0,
            i.jsx)(i.Fragment, {
                children: (0,
                i.jsx)("div", {
                    className: "post-settings-container  h-full",
                    children: (0,
                    i.jsxs)("div", {
                        className: "flex flex-col gap-2",
                        children: [(0,
                        i.jsxs)("h2", {
                            className: "font-milligram font-bold text-center",
                            children: ["Adjust Design! ", (0,
                            i.jsx)("span", {
                                className: "text-gray-400"
                            })]
                        }), (0,
                        i.jsxs)("div", {
                            className: "type-div",
                            children: [(0,
                            i.jsx)("h4", {
                                className: "font-milligram",
                                children: "Type"
                            }), (0,
                            i.jsxs)("div", {
                                className: "flex rounded-md shadow-sm",
                                role: "group",
                                children: [(0,
                                i.jsx)("button", {
                                    onClick: () => s("portrait"),
                                    type: "button",
                                    className: ["flex-1 px-4 py-4 text-sm font-medium font-pitch uppercase text-gray-900  border border-gray-200 rounded-l-lg hover:bg-gray-100 ", "portrait" === a ? " text-white bg-gray-900 hover:bg-gray-900 hover:text-white " : "bg-white text-gray-900"].join(" "),
                                    children: "Portrait"
                                }), (0,
                                i.jsx)("button", {
                                    onClick: () => s("stories"),
                                    type: "button",
                                    className: ["flex-1 px-4 py-4 text-sm font-medium font-pitch uppercase text-gray-900 border border-gray-200 rounded-r-md hover:bg-gray-100 ", "stories" === a ? "bg-gray-900 text-white hover:bg-gray-900 hover:text-white" : "bg-white text-gray-900"].join(" "),
                                    children: "Stories"
                                })]
                            })]
                        }), (0,
                        i.jsxs)("div", {
                            className: "flex flex-col py-2",
                            children: [(0,
                            i.jsx)("div", {
                                className: "font-milligram",
                                children: "Text color"
                            }), (0,
                            i.jsxs)("div", {
                                className: "inline-flex rounded-md ",
                                role: "group",
                                children: [(0,
                                i.jsx)("button", {
                                    onClick: () => {
                                        l("white")
                                    }
                                    ,
                                    type: "button",
                                    className: ["px-4 py-2 text-sm font-medium font-pitch uppercase border border-gray-200 rounded-l-lg hover:bg-gray-100 ", "white" === n ? "bg-black text-white hover:bg-gray-900 hover:text-white" : "bg-white text-gray-900"].join(" "),
                                    children: "Light"
                                }), (0,
                                i.jsx)("button", {
                                    onClick: () => {
                                        l("black")
                                    }
                                    ,
                                    type: "button",
                                    className: ["px-4 py-2 text-sm font-medium font-pitch uppercase border border-gray-200 rounded-r-md hover:bg-gray-100 ", "black" === n ? "bg-black text-white hover:bg-gray-900 hover:text-white" : "bg-white text-gray-900"].join(" "),
                                    children: "Dark"
                                })]
                            })]
                        }), (0,
                        i.jsx)("div", {
                            className: "title-div",
                            children: (0,
                            i.jsxs)("div", {
                                children: [(0,
                                i.jsxs)("label", {
                                    for: "first_name",
                                    class: " mb-2 text-sm font-medium font-milligram text-gray-900 dark:text-white flex justify-between items-center",
                                    children: ["Title", (0,
                                    i.jsx)("img", {
                                        className: "eye-img",
                                        src: f.src,
                                        style: {
                                            width: "20px",
                                            height: "20px"
                                        },
                                        onClick: () => {
                                            let e = {
                                                ...f
                                            };
                                            f.visible ? (e.src = "/assets/eye.svg",
                                            e.visible = !1) : (e.src = "/assets/eye-slash.svg",
                                            e.visible = !0),
                                            p(e)
                                        }
                                    })]
                                }), (0,
                                i.jsx)("input", {
                                    type: "text",
                                    id: "first_name",
                                    class: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ",
                                    placeholder: "John",
                                    required: !0,
                                    value: d,
                                    onChange: e => c(e.target.value)
                                })]
                            })
                        }), (0,
                        i.jsxs)("div", {
                            className: "choose-file-div",
                            children: [(0,
                            i.jsx)("div", {
                                className: "flex flex-row items-center justify-start w-full p-2 rounded-md border border-gray-300",
                                children: m.map( (e, t) => (0,
                                i.jsx)("img", {
                                    className: "image",
                                    src: e,
                                    alt: "",
                                    onClick: () => {
                                        h(e)
                                    }
                                }, "img" + e))
                            }), (0,
                            i.jsx)("div", {
                                className: "add-file",
                                children: (0,
                                i.jsxs)("label", {
                                    htmlFor: "image-input",
                                    className: "choose-file-input font-pitch uppercase",
                                    onDrop: e => {
                                        e.preventDefault();
                                        let t = e.dataTransfer.files[0];
                                        t && h(URL.createObjectURL(t))
                                    }
                                    ,
                                    onDragOver: e => {
                                        e.preventDefault()
                                    }
                                    ,
                                    children: ["+ Add photo", (0,
                                    i.jsx)("input", {
                                        type: "file",
                                        name: "image-input",
                                        id: "image-input",
                                        hidden: !0,
                                        onChange: e => {
                                            let t = e.target.files[0];
                                            t && h(URL.createObjectURL(t))
                                        }
                                    })]
                                })
                            })]
                        }), (0,
                        i.jsxs)("div", {
                            className: "data-div font-milligram font-sm",
                            children: [u.map( (e, t) => (0,
                            i.jsxs)("div", {
                                className: "data",
                                children: [(0,
                                i.jsxs)("p", {
                                    className: "inline-flex",
                                    children: [e.dataName, (0,
                                    i.jsx)("img", {
                                        className: "eye-img",
                                        src: e.visible ? "/assets/eye-slash.svg" : "/assets/eye.svg",
                                        onClick: () => {
                                            x("RideData", e.dataName)
                                        }
                                    })]
                                }), (0,
                                i.jsx)("p", {
                                    children: (0,
                                    i.jsx)("strong", {
                                        children: e.data
                                    })
                                })]
                            }, t)), g.map( (e, t) => (0,
                            i.jsxs)("div", {
                                className: "data",
                                children: [(0,
                                i.jsxs)("p", {
                                    className: "inline-flex",
                                    children: [e.dataName, (0,
                                    i.jsx)("img", {
                                        className: "eye-img",
                                        src: e.visible ? "/assets/eye-slash.svg" : "/assets/eye.svg",
                                        onClick: () => {
                                            x("speedData", e.dataName)
                                        }
                                    })]
                                }), (0,
                                i.jsx)("p", {
                                    children: (0,
                                    i.jsx)("strong", {
                                        children: e.data
                                    })
                                })]
                            }, t))]
                        })]
                    })
                })
            })
        }
          , d = a(1377)
          , h = a.n(d);
        function m(e, t) {
            let[a,i] = e
              , {width: r=400, height: s=400} = t;
            return {
                x: (i + 180) * (r / 360),
                y: (-1 * a + 90) * (s / 180)
            }
        }
        let u = (e, t, a) => {
            let {encodedPolyline: i, fillColor: r="white", bounds: n={}} = a
              , l = (0,
            s.decode)(i)
              , o = {
                width: t.width,
                height: t.width
            }
              , c = m(l[0], o)
              , d = [[c.x, c.y]];
            for (let e = 1; e < l.length; e++) {
                let t = m(l[e], o);
                d.push([t.x, t.y])
            }
            (function(e, t, a) {
                let {points: i, top: r, bottom: s, left: n, right: l, fillColor: o} = a
                  , c = l - n
                  , d = s - r
                  , h = Math.min(c, d)
                  , m = function(e, t) {
                    let {padding: a=0, width: i, height: r, offsetX: s=0, offsetY: n=0} = t
                      , l = 1 / 0
                      , o = 1 / 0
                      , c = -1 / 0
                      , d = -1 / 0;
                    e.forEach(e => {
                        let[t,a] = e;
                        l = Math.min(l, t),
                        o = Math.min(o, a),
                        c = Math.max(c, t),
                        d = Math.max(d, a)
                    }
                    );
                    let h = c - l
                      , m = d - o
                      , u = Math.min((i - 2 * a) / h, (r - 2 * a) / m)
                      , g = (c + l) / 2
                      , f = (d + o) / 2
                      , p = e.map(e => {
                        let[t,a] = e;
                        return [(t - g) * u + i / 2 + s, (a - f) * u + r / 2 + n]
                    }
                    );
                    return p
                }(i, {
                    width: h,
                    height: h,
                    padding: .15 * h
                })
                  , u = n + c / 2 - h / 2
                  , g = r + d / 2 - h / 2;
                e.beginPath(),
                e.moveTo(m[0][0] + u, m[0][1] + g);
                for (let t = 1; t < m.length; t++) {
                    let a = m[t];
                    e.lineTo(a[0] + u, a[1] + g)
                }
                e.lineCap = "round",
                e.lineJoin = "round",
                e.lineWidth = 6,
                e.strokeStyle = o,
                e.stroke(),
                e.restore()
            }
            )(e, 0, {
                points: d,
                top: 0,
                bottom: t.height,
                left: 0,
                right: t.width,
                ...n,
                fillColor: r
            }),
            e.restore()
        }
        ;
        function g(e, t, a, i, r, s) {
            for (var n = t.split(" "), l = "", o = 0; o < n.length; o++) {
                var c = l + n[o] + " ";
                e.measureText(c).width > r && o > 0 ? (e.fillText(l, a, i),
                l = n[o] + " ",
                i += s) : l = c
            }
            return e.fillText(l, a, i),
            i + s
        }
        let f = (e, t, a) => {
            let {title: i, subTitle: r, fontFamily: s, fontFamilyBold: n, top: l=40} = a
              , o = t.width / 1e3
              , c = 35 * o
              , d = 24 * o;
            e.font = "".concat(c, "px ").concat(n);
            let h = g(e, i, 40, l, t.width, c);
            return e.font = "".concat(d, "px ").concat(s),
            {
                top: l,
                bottom: h = g(e, r, 40, h + 10, t.width, d),
                left: 0,
                right: 0
            }
        }
        ;
        function p(e, t) {
            let {text: a, fontFamily: i, bottom: r, fontSize: s=35} = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}
              , n = t.width
              , l = t.width / 1e3
              , o = s * l;
            e.font = "".concat(o, "px ").concat(i);
            let c = e.measureText(a)
              , d = n / 2 - c.width / 2
              , h = r - o;
            return e.fillText(a, d, h),
            {
                top: h,
                bottom: h + o,
                left: d,
                right: d + c.width
            }
        }
        let x = (e, t, a) => {
            let {dataArray: i, fontFamily: r, fontFamilyBold: s, bottom: n} = a
              , l = t.width;
            t.height;
            let o = t.width / 1e3
              , c = 20 * o
              , d = 32 * o
              , h = l / i.length
              , m = h / 2
              , u = n
              , g = u
              , f = c + d + 20;
            for (let t = 0; t < i.length; t++) {
                e.font = "".concat(c, "px ").concat(r);
                let a = e.measureText(i[t].dataName);
                e.font = "".concat(d, "px ").concat(s);
                let l = e.measureText(i[t].data);
                a.width,
                l.width;
                let o = n - f;
                u = Math.min(u, o),
                g = Math.max(g, o + f),
                e.font = "".concat(c, "px ").concat(r),
                e.fillText(i[t].dataName, m - e.measureText(i[t].dataName).width / 2, o),
                e.font = "".concat(d, "px ").concat(s),
                e.fillText(i[t].data, m - e.measureText(i[t].data).width / 2, o + d + 8),
                m += h
            }
            let p = m - h / 2 - l / 2
              , x = u
              , v = g
              , w = h / 2 - l / 2;
            return {
                top: x,
                bottom: v,
                left: w,
                right: p,
                width: p - w,
                height: v - x
            }
        }
        ;
        var v = a(6691)
          , w = a.n(v)
          , y = a(8806)
          , b = (0,
        r.forwardRef)(function(e, t) {
            let a, s, {polyline: n, loading: l} = e, c = o(e => e.postStyle), d = o(e => e.canvasWidth), m = o(e => e.setCanvasWidth), g = o(e => e.image), v = o(e => e.title), w = o(e => e.date), b = o(e => e.titleVisible), j = o(e => e.RideData), N = o(e => e.speedData), k = o(e => e.fontColor), S = (0,
            r.useRef)(null), [T,_] = (0,
            r.useState)(!1);
            (0,
            r.useEffect)( () => {
                h().load({
                    custom: {
                        families: ["Milligram-Regular", "Milligram-Bold"],
                        urls: ["/fonts/Milligram.woff2"]
                    },
                    active: () => {
                        _(!0)
                    }
                    ,
                    inactive: () => {
                        console.error("Font loading failed!")
                    }
                }),
                window.innerWidth <= 600 ? m("mobile") : m("desktop")
            }
            , []);
            let[C,E] = (0,
            r.useState)(!0)
              , [R,A] = (0,
            r.useState)(new Image)
              , [M,D] = (0,
            r.useState)(new Image);
            (0,
            r.useEffect)( () => {
                E(!0);
                let e = new Image;
                e.src = g,
                e.crossOrigin = "anonymous",
                e.onload = () => {
                    E(!1)
                }
                ,
                e.onerror = () => {
                    E(!1)
                }
                ,
                A(e);
                let t = new Image;
                t.src = "/assets/polymer-symbol.svg",
                t.crossOrigin = "anonymous",
                D(t)
            }
            , [g]),
            (0,
            r.useEffect)( () => {
                if (!T)
                    return;
                a = "Milligram-Regular",
                s = "Milligram-Bold";
                let e = S.current;
                if (null === e)
                    return;
                let t = e.getContext("2d")
                  , i = window.devicePixelRatio || 1
                  , r = Math.floor(e.clientWidth * i)
                  , l = Math.floor(e.clientHeight * i);
                if (e.width = r,
                e.height = l,
                e.width < 800) {
                    let t = 800 * e.height / e.width;
                    e.width = 800,
                    e.height = t
                }
                let o = e.width
                  , d = e.height
                  , h = () => {
                    t.clearRect(0, 0, o, d),
                    t.fillStyle = k,
                    function(e, t, a) {
                        let i = Math.max(a.width / t.width, a.height / t.height)
                          , r = a.width / 2 - t.width / 2 * i
                          , s = a.height / 2 - t.height / 2 * i;
                        e.drawImage(t, r, s, t.width * i, t.height * i)
                    }(t, R, e),
                    function(e, t, a) {
                        let i = document.createElement("canvas");
                        i.width = t.width,
                        i.height = t.height;
                        let r = i.getContext("2d");
                        "white" === a ? r.fillStyle = "rgba(90, 90, 90, 0.5)" : r.fillStyle = "rgba(255, 255, 255, 0.5)",
                        r.fillRect(0, 0, i.width, i.height),
                        e.drawImage(i, 0, 0, t.width, t.height)
                    }(t, e, k);
                    let i = 0
                      , r = e.height;
                    r = p(t, e, {
                        fontFamily: a,
                        fontFamilyBold: s,
                        text: "REGISTERED TRADEMARK",
                        bottom: r - .05 * d,
                        fontSize: 20
                    }).top,
                    r = p(t, e, {
                        fontFamily: a,
                        fontFamilyBold: s,
                        fontSize: 20,
                        text: "DESIGNED BY POLYMER WORKSHOP\xa0",
                        bottom: r - .005 * d
                    }).top;
                    let l = x(t, e, {
                        dataArray: N.filter(e => !0 === e.visible),
                        fontFamily: a,
                        fontFamilyBold: s,
                        bottom: r - .02 * d
                    });
                    r = l.top;
                    let h = x(t, e, {
                        dataArray: j.filter(e => !0 === e.visible),
                        fontFamily: a,
                        fontFamilyBold: s,
                        bottom: r - .01 * d
                    });
                    if (r = h.top,
                    b.visible) {
                        let r = f(t, e, {
                            title: v,
                            subTitle: w,
                            fontFamily: a,
                            fontFamilyBold: s,
                            top: 10,
                            top: "portrait" === c ? .05 * e.height : .15 * e.height
                        });
                        i = r.bottom
                    }
                    u(t, e, {
                        encodedPolyline: n,
                        fillColor: k,
                        bounds: {
                            top: i + .01 * d,
                            bottom: r - .01 * d
                        }
                    })
                }
                ;
                return h(),
                window.addEventListener("resize", h),
                () => {
                    window.removeEventListener("resize", h)
                }
            }
            , [T, C, R, n, c, d, k, g, w, v, b, j, N]);
            let I = () => -1 != navigator.userAgent.indexOf("Safari") && -1 == navigator.userAgent.indexOf("Chrome")
              , P = () => -1 != navigator.userAgent.indexOf("iPhone") || -1 != navigator.userAgent.indexOf("iPad")
              , O = () => !!(I() || P())
              , B = () => {
                let e = S.current;
                e.toBlob(t => {
                    if (navigator.share) {
                        let e = O();
                        navigator.share({
                            ...e ? {} : {
                                title: "Ride with #polymer-workshop",
                                text: "Check out my ride with #polymer-workshop"
                            },
                            files: [new File([t],"polymer.jpeg",{
                                type: "image/jpeg",
                                lastModified: new Date().getTime()
                            })]
                        }).then( () => {}
                        ).catch(console.error)
                    } else {
                        let t = document.createElement("a");
                        t.download = "polymer.ws - ".concat(v, ".jpeg"),
                        t.href = e.toDataURL(),
                        t.click()
                    }
                }
                )
            }
            ;
            return (0,
            r.useImperativeHandle)(t, () => ({
                shareImage: B
            })),
            (0,
            i.jsxs)(i.Fragment, {
                children: [T && !l ? (0,
                i.jsx)("canvas", {
                    className: "canvas rounded shadow-lg",
                    ref: S,
                    width: 400,
                    height: "square" === c ? 400 : 1400,
                    style: {
                        maxWidth: "100%",
                        maxHeight: "95%",
                        margin: "auto",
                        aspectRatio: "portrait" === c ? "4/5" : "9/16",
                        transition: "height 0.3s ease-out , transform 0.3s ease-out"
                    }
                }) : null, C || l || !T ? (0,
                i.jsx)("div", {
                    className: "flex items-center justify-center absolute top-0 left-0 w-full h-full pointer-events-none",
                    children: (0,
                    i.jsx)(y.Z, {})
                }) : null]
            })
        })
          , j = a(4033)
          , N = a(9957)
          , k = a(9499)
          , S = a(7431);
        let T = function(e) {
            let t = document.createElement("canvas");
            t.width = 100,
            t.height = 100;
            let a = t.getContext("2d");
            a.fillStyle = e,
            a.fillRect(0, 0, t.width, t.height);
            let i = t.toDataURL("image/png");
            return i
        }("#e5e7eb")
          , _ = ["/assets/default-1.jpeg", "/assets/default-2.jpeg", T];
        var C = function(e) {
            let {searchParams: t} = e;
            (0,
            j.useRouter)();
            let a = t.activityId
              , s = (0,
            r.useRef)(null)
              , {activities: n, fetchActivityById: l} = (0,
            N.Z)();
            o(e => e.imagesArray);
            let d = o(e => e.setImagesArray)
              , h = o(e => e.setImage)
              , [m,u] = (0,
            r.useState)(!1)
              , [g,f] = (0,
            r.useState)(!1)
              , [p,x] = (0,
            r.useState)(!1)
              , v = (0,
            r.useMemo)( () => a ? null == n ? void 0 : n.find(e => e.id === Number(a)) : null, [n, a])
              , [y,T] = (0,
            r.useState)(null);
            return (0,
            r.useEffect)( () => {
                d(_),
                h(_[0]),
                a && (u(!0),
                l(a).then(e => {
                    var t, a, i, r;
                    T(e);
                    let {photos: s} = e
                      , n = (null == s ? void 0 : null === (a = s.primary) || void 0 === a ? void 0 : null === (t = a.urls) || void 0 === t ? void 0 : t[600]) || (null == s ? void 0 : null === (r = s.primary) || void 0 === r ? void 0 : null === (i = r.urls) || void 0 === i ? void 0 : i[300])
                      , l = [n ? "/strava-activity-photo?url=".concat(encodeURIComponent(n)) : null, ..._].filter(Boolean);
                    d(l),
                    h(l[0])
                }
                ).finally( () => {
                    u(!1)
                }
                ))
            }
            , [a]),
            (0,
            r.useEffect)( () => {
                x(!0);
                let e = setTimeout( () => {
                    x(!1)
                }
                , 400);
                return () => {
                    clearTimeout(e)
                }
            }
            , [g]),
            (0,
            i.jsx)("div", {
                className: "flex flex-col h-[100vh]",
                children: (0,
                i.jsxs)("div", {
                    className: "flex-1 flex items-stretch overflow-hidden",
                    children: [(0,
                    i.jsxs)("div", {
                        className: "flex flex-col w-full h-full overflow-hidden",
                        onClick: () => f(!1),
                        children: [g && window.innerWidth < 930 ? (0,
                        i.jsx)(S.yoF, {
                            onClick: () => f(!1),
                            className: "my-4 mx-auto"
                        }) : (0,
                        i.jsx)(k.Z, {}), (0,
                        i.jsx)("div", {
                            className: "flex-1 flex items-center justify-center max-w-[500px] w-[90%] h-full max-h-[100%] m-auto  overflow-hidden",
                            children: v && (0,
                            i.jsx)(b, {
                                ref: s,
                                polyline: v.map.summary_polyline,
                                loading: m
                            })
                        }), !m && (0,
                        i.jsxs)("div", {
                            className: "flex items-center justify-center gap-2 mt-4 py-2",
                            children: [(0,
                            i.jsxs)("button", {
                                className: "flex items-center gap-2 z-10 p-2 rounded  text-gray-900 w-[max-content] font-pitch uppercase",
                                onClick: e => {
                                    e.stopPropagation(),
                                    x(!0),
                                    f(e => !e)
                                }
                                ,
                                children: [(0,
                                i.jsx)(S.__X, {}), " Adjust"]
                            }), (0,
                            i.jsxs)("button", {
                                className: "flex items-center gap-2  z-10 p-2 rounded text-gray-900  w-[max-content] font-pitch uppercase",
                                onClick: () => {
                                    var e;
                                    null === (e = s.current) || void 0 === e || e.shareImage()
                                }
                                ,
                                children: [(0,
                                i.jsx)(S.jis, {}), " Share"]
                            })]
                        }), (0,
                        i.jsxs)("div", {
                            className: "flex items-center justify-center gap-2 mt-4 py-2 font-pitch uppercase",
                            children: [(0,
                            i.jsx)(w(), {
                                src: "/assets/polymer-name-standalone.png",
                                width: 100,
                                height: 70,
                                unoptimized: !0
                            }), "\xa9 2023"]
                        })]
                    }), (0,
                    i.jsx)("div", {
                        className: " activity-layout overflow-y-auto bg-white top-0 right-0 z-30 transition-transform border-l-2 border-gray-200 duration-400  h-[100vh] min-h-[100%] sm:w-[90vw] sm:max-w-[400px] sm:min-w-[300px] lg:w-[50%] lg:max-w-[500px]",
                        style: {
                            transform: g ? "translateX(0)" : "translateX(100%)",
                            maxWidth: g ? "100%" : "0%",
                            minWidth: g ? "300px" : "0px"
                        },
                        children: (0,
                        i.jsx)(c, {
                            activity: y
                        })
                    })]
                })
            })
        }
    },
    9499: function(e, t, a) {
        "use strict";
        a.d(t, {
            Z: function() {
                return c
            }
        });
        var i = a(7437)
          , r = a(6691)
          , s = a.n(r)
          , n = a(1396)
          , l = a.n(n)
          , o = a(3159)
          , c = function(e) {
            let {backToSite: t=!0, backToSiteText: a="Back to Site"} = e;
            return (0,
            i.jsxs)("nav", {
                className: "flex justify-between items-center relative mt-10 mb-8  lg:max-w-[500px] m-auto w-[90%]",
                children: [(0,
                i.jsxs)("div", {
                    onClick: e => {
                        e.preventDefault(),
                        window.history.back()
                    }
                    ,
                    className: "font-pitch uppercase text-xs flex items-center gap-2 cursor-pointer",
                    children: [(0,
                    i.jsx)(o.bUI, {}), "Back"]
                }), (0,
                i.jsx)("div", {
                    className: "absolute left-1/2 transform -translate-x-1/2",
                    children: (0,
                    i.jsx)(l(), {
                        href: "/",
                        children: (0,
                        i.jsx)(s(), {
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
                i.jsx)(l(), {
                    href: "https://polymer.ws",
                    className: "font-pitch uppercase text-xs flex items-center gap-2",
                    children: "Back to Site"
                })]
            })
        }
    },
    722: function() {}
}, function(e) {
    e.O(0, [420, 982, 780, 345, 776, 971, 596, 744], function() {
        return e(e.s = 6576)
    }),
    _N_E = e.O()
}
]);
