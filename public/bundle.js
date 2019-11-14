
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    const has_prop = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    let running = false;
    function run_tasks() {
        tasks.forEach(task => {
            if (!task[0](now())) {
                tasks.delete(task);
                task[1]();
            }
        });
        running = tasks.size > 0;
        if (running)
            raf(run_tasks);
    }
    function loop(fn) {
        let task;
        if (!running) {
            running = true;
            raf(run_tasks);
        }
        return {
            promise: new Promise(fulfil => {
                tasks.add(task = [fn, fulfil]);
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment && $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function bind(component, name, callback) {
        if (has_prop(component.$$.props, name)) {
            name = component.$$.props[name] || name;
            component.$$.bound[name] = callback;
            callback(component.$$.ctx[name]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, props) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : prop_values;
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    var isarray = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]';
    };

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
      // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
      '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {String} str
     * @return {Array}
     */
    function parse (str) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var res;

      while ((res = PATH_REGEXP.exec(str)) != null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          continue
        }

        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = '';
        }

        var prefix = res[2];
        var name = res[3];
        var capture = res[4];
        var group = res[5];
        var suffix = res[6];
        var asterisk = res[7];

        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        var delimiter = prefix || '/';
        var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

        tokens.push({
          name: name || key++,
          prefix: prefix || '',
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          pattern: escapeGroup(pattern)
        });
      }

      // Match any characters still remaining.
      if (index < str.length) {
        path += str.substr(index);
      }

      // If the path exists, push it onto the end.
      if (path) {
        tokens.push(path);
      }

      return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {String}   str
     * @return {Function}
     */
    function compile (str) {
      return tokensToFunction(parse(str))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);

      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^' + tokens[i].pattern + '$');
        }
      }

      return function (obj) {
        var path = '';
        var data = obj || {};

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === 'string') {
            path += token;

            continue
          }

          var value = data[token.name];
          var segment;

          if (value == null) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to be defined')
            }
          }

          if (isarray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
            }

            if (value.length === 0) {
              if (token.optional) {
                continue
              } else {
                throw new TypeError('Expected "' + token.name + '" to not be empty')
              }
            }

            for (var j = 0; j < value.length; j++) {
              segment = encodeURIComponent(value[j]);

              if (!matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
              }

              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }

            continue
          }

          segment = encodeURIComponent(value);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += token.prefix + segment;
        }

        return path
      }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {String} str
     * @return {String}
     */
    function escapeString (str) {
      return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {String} group
     * @return {String}
     */
    function escapeGroup (group) {
      return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    /**
     * Attach the keys as a property of the regexp.
     *
     * @param  {RegExp} re
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function attachKeys (re, keys) {
      re.keys = keys;
      return re
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {String}
     */
    function flags (options) {
      return options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {RegExp} path
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function regexpToRegexp (path, keys) {
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          });
        }
      }

      return attachKeys(path, keys)
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {Array}  path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function arrayToRegexp (path, keys, options) {
      var parts = [];

      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }

      var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

      return attachKeys(regexp, keys)
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {String} path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function stringToRegexp (path, keys, options) {
      var tokens = parse(path);
      var re = tokensToRegExp(tokens, options);

      // Attach keys back to the regexp.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] !== 'string') {
          keys.push(tokens[i]);
        }
      }

      return attachKeys(re, keys)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {Array}  tokens
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function tokensToRegExp (tokens, options) {
      options = options || {};

      var strict = options.strict;
      var end = options.end !== false;
      var route = '';
      var lastToken = tokens[tokens.length - 1];
      var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          route += escapeString(token);
        } else {
          var prefix = escapeString(token.prefix);
          var capture = token.pattern;

          if (token.repeat) {
            capture += '(?:' + prefix + capture + ')*';
          }

          if (token.optional) {
            if (prefix) {
              capture = '(?:' + prefix + '(' + capture + '))?';
            } else {
              capture = '(' + capture + ')?';
            }
          } else {
            capture = prefix + '(' + capture + ')';
          }

          route += capture;
        }
      }

      // In non-strict mode we allow a slash at the end of match. If the path to
      // match already ends with a slash, we remove it for consistency. The slash
      // is valid at the end of a path match, not in the middle. This is important
      // in non-ending mode, where "/test/" shouldn't match "/test//route".
      if (!strict) {
        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
      }

      if (end) {
        route += '$';
      } else {
        // In non-ending mode, we need the capturing groups to match as much as
        // possible by using a positive lookahead to the end or next path segment.
        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
      }

      return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(String|RegExp|Array)} path
     * @param  {Array}                 [keys]
     * @param  {Object}                [options]
     * @return {RegExp}
     */
    function pathToRegexp (path, keys, options) {
      keys = keys || [];

      if (!isarray(keys)) {
        options = keys;
        keys = [];
      } else if (!options) {
        options = {};
      }

      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys)
      }

      if (isarray(path)) {
        return arrayToRegexp(path, keys, options)
      }

      return stringToRegexp(path, keys, options)
    }

    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    /**
       * Module dependencies.
       */

      

      /**
       * Short-cuts for global-object checks
       */

      var hasDocument = ('undefined' !== typeof document);
      var hasWindow = ('undefined' !== typeof window);
      var hasHistory = ('undefined' !== typeof history);
      var hasProcess = typeof process !== 'undefined';

      /**
       * Detect click event
       */
      var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

      /**
       * To work properly with the URL
       * history.location generated polyfill in https://github.com/devote/HTML5-History-API
       */

      var isLocation = hasWindow && !!(window.history.location || window.location);

      /**
       * The page instance
       * @api private
       */
      function Page() {
        // public things
        this.callbacks = [];
        this.exits = [];
        this.current = '';
        this.len = 0;

        // private things
        this._decodeURLComponents = true;
        this._base = '';
        this._strict = false;
        this._running = false;
        this._hashbang = false;

        // bound functions
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
      }

      /**
       * Configure the instance of page. This can be called multiple times.
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.configure = function(options) {
        var opts = options || {};

        this._window = opts.window || (hasWindow && window);
        this._decodeURLComponents = opts.decodeURLComponents !== false;
        this._popstate = opts.popstate !== false && hasWindow;
        this._click = opts.click !== false && hasDocument;
        this._hashbang = !!opts.hashbang;

        var _window = this._window;
        if(this._popstate) {
          _window.addEventListener('popstate', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('popstate', this._onpopstate, false);
        }

        if (this._click) {
          _window.document.addEventListener(clickEvent, this.clickHandler, false);
        } else if(hasDocument) {
          _window.document.removeEventListener(clickEvent, this.clickHandler, false);
        }

        if(this._hashbang && hasWindow && !hasHistory) {
          _window.addEventListener('hashchange', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('hashchange', this._onpopstate, false);
        }
      };

      /**
       * Get or set basepath to `path`.
       *
       * @param {string} path
       * @api public
       */

      Page.prototype.base = function(path) {
        if (0 === arguments.length) return this._base;
        this._base = path;
      };

      /**
       * Gets the `base`, which depends on whether we are using History or
       * hashbang routing.

       * @api private
       */
      Page.prototype._getBase = function() {
        var base = this._base;
        if(!!base) return base;
        var loc = hasWindow && this._window && this._window.location;

        if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
          base = loc.pathname;
        }

        return base;
      };

      /**
       * Get or set strict path matching to `enable`
       *
       * @param {boolean} enable
       * @api public
       */

      Page.prototype.strict = function(enable) {
        if (0 === arguments.length) return this._strict;
        this._strict = enable;
      };


      /**
       * Bind with the given `options`.
       *
       * Options:
       *
       *    - `click` bind to click events [true]
       *    - `popstate` bind to popstate [true]
       *    - `dispatch` perform initial dispatch [true]
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.start = function(options) {
        var opts = options || {};
        this.configure(opts);

        if (false === opts.dispatch) return;
        this._running = true;

        var url;
        if(isLocation) {
          var window = this._window;
          var loc = window.location;

          if(this._hashbang && ~loc.hash.indexOf('#!')) {
            url = loc.hash.substr(2) + loc.search;
          } else if (this._hashbang) {
            url = loc.search + loc.hash;
          } else {
            url = loc.pathname + loc.search + loc.hash;
          }
        }

        this.replace(url, null, true, opts.dispatch);
      };

      /**
       * Unbind click and popstate event handlers.
       *
       * @api public
       */

      Page.prototype.stop = function() {
        if (!this._running) return;
        this.current = '';
        this.len = 0;
        this._running = false;

        var window = this._window;
        this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
        hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
        hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
      };

      /**
       * Show `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} dispatch
       * @param {boolean=} push
       * @return {!Context}
       * @api public
       */

      Page.prototype.show = function(path, state, dispatch, push) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        if (false !== dispatch) this.dispatch(ctx, prev);
        if (false !== ctx.handled && false !== push) ctx.pushState();
        return ctx;
      };

      /**
       * Goes back in the history
       * Back should always let the current route push state and then go back.
       *
       * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
       * @param {Object=} state
       * @api public
       */

      Page.prototype.back = function(path, state) {
        var page = this;
        if (this.len > 0) {
          var window = this._window;
          // this may need more testing to see if all browsers
          // wait for the next tick to go back in history
          hasHistory && window.history.back();
          this.len--;
        } else if (path) {
          setTimeout(function() {
            page.show(path, state);
          });
        } else {
          setTimeout(function() {
            page.show(page._getBase(), state);
          });
        }
      };

      /**
       * Register route to redirect from one path to other
       * or just redirect to another route
       *
       * @param {string} from - if param 'to' is undefined redirects to 'from'
       * @param {string=} to
       * @api public
       */
      Page.prototype.redirect = function(from, to) {
        var inst = this;

        // Define route from a path to another
        if ('string' === typeof from && 'string' === typeof to) {
          page.call(this, from, function(e) {
            setTimeout(function() {
              inst.replace(/** @type {!string} */ (to));
            }, 0);
          });
        }

        // Wait for the push state and replace it with another
        if ('string' === typeof from && 'undefined' === typeof to) {
          setTimeout(function() {
            inst.replace(from);
          }, 0);
        }
      };

      /**
       * Replace `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} init
       * @param {boolean=} dispatch
       * @return {!Context}
       * @api public
       */


      Page.prototype.replace = function(path, state, init, dispatch) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        ctx.init = init;
        ctx.save(); // save before dispatching, which may redirect
        if (false !== dispatch) this.dispatch(ctx, prev);
        return ctx;
      };

      /**
       * Dispatch the given `ctx`.
       *
       * @param {Context} ctx
       * @api private
       */

      Page.prototype.dispatch = function(ctx, prev) {
        var i = 0, j = 0, page = this;

        function nextExit() {
          var fn = page.exits[j++];
          if (!fn) return nextEnter();
          fn(prev, nextExit);
        }

        function nextEnter() {
          var fn = page.callbacks[i++];

          if (ctx.path !== page.current) {
            ctx.handled = false;
            return;
          }
          if (!fn) return unhandled.call(page, ctx);
          fn(ctx, nextEnter);
        }

        if (prev) {
          nextExit();
        } else {
          nextEnter();
        }
      };

      /**
       * Register an exit route on `path` with
       * callback `fn()`, which will be called
       * on the previous context when a new
       * page is visited.
       */
      Page.prototype.exit = function(path, fn) {
        if (typeof path === 'function') {
          return this.exit('*', path);
        }

        var route = new Route(path, null, this);
        for (var i = 1; i < arguments.length; ++i) {
          this.exits.push(route.middleware(arguments[i]));
        }
      };

      /**
       * Handle "click" events.
       */

      /* jshint +W054 */
      Page.prototype.clickHandler = function(e) {
        if (1 !== this._which(e)) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

        // ensure link
        // use shadow dom when available if not, fall back to composedPath()
        // for browsers that only have shady
        var el = e.target;
        var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

        if(eventPath) {
          for (var i = 0; i < eventPath.length; i++) {
            if (!eventPath[i].nodeName) continue;
            if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
            if (!eventPath[i].href) continue;

            el = eventPath[i];
            break;
          }
        }

        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase()) return;

        // check if link is inside an svg
        // in this case, both href and target are always inside an object
        var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

        // ensure non-hash for the same path
        var link = el.getAttribute('href');
        if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

        // Check for mailto: in the href
        if (link && link.indexOf('mailto:') > -1) return;

        // check target
        // svg target is an object and its desired value is in .baseVal property
        if (svg ? el.target.baseVal : el.target) return;

        // x-origin
        // note: svg links that are not relative don't call click events (and skip page.js)
        // consequently, all svg links tested inside page.js are relative and in the same origin
        if (!svg && !this.sameOrigin(el.href)) return;

        // rebuild path
        // There aren't .pathname and .search properties in svg links, so we use href
        // Also, svg href is an object and its desired value is in .baseVal property
        var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

        path = path[0] !== '/' ? '/' + path : path;

        // strip leading "/[drive letter]:" on NW.js on Windows
        if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
          path = path.replace(/^\/[a-zA-Z]:\//, '/');
        }

        // same page
        var orig = path;
        var pageBase = this._getBase();

        if (path.indexOf(pageBase) === 0) {
          path = path.substr(pageBase.length);
        }

        if (this._hashbang) path = path.replace('#!', '');

        if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
          return;
        }

        e.preventDefault();
        this.show(orig);
      };

      /**
       * Handle "populate" events.
       * @api private
       */

      Page.prototype._onpopstate = (function () {
        var loaded = false;
        if ( ! hasWindow ) {
          return function () {};
        }
        if (hasDocument && document.readyState === 'complete') {
          loaded = true;
        } else {
          window.addEventListener('load', function() {
            setTimeout(function() {
              loaded = true;
            }, 0);
          });
        }
        return function onpopstate(e) {
          if (!loaded) return;
          var page = this;
          if (e.state) {
            var path = e.state.path;
            page.replace(path, e.state);
          } else if (isLocation) {
            var loc = page._window.location;
            page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
          }
        };
      })();

      /**
       * Event button.
       */
      Page.prototype._which = function(e) {
        e = e || (hasWindow && this._window.event);
        return null == e.which ? e.button : e.which;
      };

      /**
       * Convert to a URL object
       * @api private
       */
      Page.prototype._toURL = function(href) {
        var window = this._window;
        if(typeof URL === 'function' && isLocation) {
          return new URL(href, window.location.toString());
        } else if (hasDocument) {
          var anc = window.document.createElement('a');
          anc.href = href;
          return anc;
        }
      };

      /**
       * Check if `href` is the same origin.
       * @param {string} href
       * @api public
       */

      Page.prototype.sameOrigin = function(href) {
        if(!href || !isLocation) return false;

        var url = this._toURL(href);
        var window = this._window;

        var loc = window.location;
        return loc.protocol === url.protocol &&
          loc.hostname === url.hostname &&
          loc.port === url.port;
      };

      /**
       * @api private
       */
      Page.prototype._samePath = function(url) {
        if(!isLocation) return false;
        var window = this._window;
        var loc = window.location;
        return url.pathname === loc.pathname &&
          url.search === loc.search;
      };

      /**
       * Remove URL encoding from the given `str`.
       * Accommodates whitespace in both x-www-form-urlencoded
       * and regular percent-encoded form.
       *
       * @param {string} val - URL component to decode
       * @api private
       */
      Page.prototype._decodeURLEncodedURIComponent = function(val) {
        if (typeof val !== 'string') { return val; }
        return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
      };

      /**
       * Create a new `page` instance and function
       */
      function createPage() {
        var pageInstance = new Page();

        function pageFn(/* args */) {
          return page.apply(pageInstance, arguments);
        }

        // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
        pageFn.callbacks = pageInstance.callbacks;
        pageFn.exits = pageInstance.exits;
        pageFn.base = pageInstance.base.bind(pageInstance);
        pageFn.strict = pageInstance.strict.bind(pageInstance);
        pageFn.start = pageInstance.start.bind(pageInstance);
        pageFn.stop = pageInstance.stop.bind(pageInstance);
        pageFn.show = pageInstance.show.bind(pageInstance);
        pageFn.back = pageInstance.back.bind(pageInstance);
        pageFn.redirect = pageInstance.redirect.bind(pageInstance);
        pageFn.replace = pageInstance.replace.bind(pageInstance);
        pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
        pageFn.exit = pageInstance.exit.bind(pageInstance);
        pageFn.configure = pageInstance.configure.bind(pageInstance);
        pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
        pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

        pageFn.create = createPage;

        Object.defineProperty(pageFn, 'len', {
          get: function(){
            return pageInstance.len;
          },
          set: function(val) {
            pageInstance.len = val;
          }
        });

        Object.defineProperty(pageFn, 'current', {
          get: function(){
            return pageInstance.current;
          },
          set: function(val) {
            pageInstance.current = val;
          }
        });

        // In 2.0 these can be named exports
        pageFn.Context = Context;
        pageFn.Route = Route;

        return pageFn;
      }

      /**
       * Register `path` with callback `fn()`,
       * or route `path`, or redirection,
       * or `page.start()`.
       *
       *   page(fn);
       *   page('*', fn);
       *   page('/user/:id', load, user);
       *   page('/user/' + user.id, { some: 'thing' });
       *   page('/user/' + user.id);
       *   page('/from', '/to')
       *   page();
       *
       * @param {string|!Function|!Object} path
       * @param {Function=} fn
       * @api public
       */

      function page(path, fn) {
        // <callback>
        if ('function' === typeof path) {
          return page.call(this, '*', path);
        }

        // route <path> to <callback ...>
        if ('function' === typeof fn) {
          var route = new Route(/** @type {string} */ (path), null, this);
          for (var i = 1; i < arguments.length; ++i) {
            this.callbacks.push(route.middleware(arguments[i]));
          }
          // show <path> with [state]
        } else if ('string' === typeof path) {
          this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
          // start [options]
        } else {
          this.start(path);
        }
      }

      /**
       * Unhandled `ctx`. When it's not the initial
       * popstate then redirect. If you wish to handle
       * 404s on your own use `page('*', callback)`.
       *
       * @param {Context} ctx
       * @api private
       */
      function unhandled(ctx) {
        if (ctx.handled) return;
        var current;
        var page = this;
        var window = page._window;

        if (page._hashbang) {
          current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
        } else {
          current = isLocation && window.location.pathname + window.location.search;
        }

        if (current === ctx.canonicalPath) return;
        page.stop();
        ctx.handled = false;
        isLocation && (window.location.href = ctx.canonicalPath);
      }

      /**
       * Escapes RegExp characters in the given string.
       *
       * @param {string} s
       * @api private
       */
      function escapeRegExp(s) {
        return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
      }

      /**
       * Initialize a new "request" `Context`
       * with the given `path` and optional initial `state`.
       *
       * @constructor
       * @param {string} path
       * @param {Object=} state
       * @api public
       */

      function Context(path, state, pageInstance) {
        var _page = this.page = pageInstance || page;
        var window = _page._window;
        var hashbang = _page._hashbang;

        var pageBase = _page._getBase();
        if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
        var i = path.indexOf('?');

        this.canonicalPath = path;
        var re = new RegExp('^' + escapeRegExp(pageBase));
        this.path = path.replace(re, '') || '/';
        if (hashbang) this.path = this.path.replace('#!', '') || '/';

        this.title = (hasDocument && window.document.title);
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
        this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
        this.params = {};

        // fragment
        this.hash = '';
        if (!hashbang) {
          if (!~this.path.indexOf('#')) return;
          var parts = this.path.split('#');
          this.path = this.pathname = parts[0];
          this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
          this.querystring = this.querystring.split('#')[0];
        }
      }

      /**
       * Push state.
       *
       * @api private
       */

      Context.prototype.pushState = function() {
        var page = this.page;
        var window = page._window;
        var hashbang = page._hashbang;

        page.len++;
        if (hasHistory) {
            window.history.pushState(this.state, this.title,
              hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Save the context state.
       *
       * @api public
       */

      Context.prototype.save = function() {
        var page = this.page;
        if (hasHistory) {
            page._window.history.replaceState(this.state, this.title,
              page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Initialize `Route` with the given HTTP `path`,
       * and an array of `callbacks` and `options`.
       *
       * Options:
       *
       *   - `sensitive`    enable case-sensitive routes
       *   - `strict`       enable strict matching for trailing slashes
       *
       * @constructor
       * @param {string} path
       * @param {Object=} options
       * @api private
       */

      function Route(path, options, page) {
        var _page = this.page = page || globalPage;
        var opts = options || {};
        opts.strict = opts.strict || page._strict;
        this.path = (path === '*') ? '(.*)' : path;
        this.method = 'GET';
        this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
      }

      /**
       * Return route middleware with
       * the given callback `fn()`.
       *
       * @param {Function} fn
       * @return {Function}
       * @api public
       */

      Route.prototype.middleware = function(fn) {
        var self = this;
        return function(ctx, next) {
          if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
          next();
        };
      };

      /**
       * Check if this route matches `path`, if so
       * populate `params`.
       *
       * @param {string} path
       * @param {Object} params
       * @return {boolean}
       * @api private
       */

      Route.prototype.match = function(path, params) {
        var keys = this.keys,
          qsIndex = path.indexOf('?'),
          pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
          m = this.regexp.exec(decodeURIComponent(pathname));

        if (!m) return false;

        for (var i = 1, len = m.length; i < len; ++i) {
          var key = keys[i - 1];
          var val = this.page._decodeURLEncodedURIComponent(m[i]);
          if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
            params[key.name] = val;
          }
        }

        return true;
      };


      /**
       * Module exports.
       */

      var globalPage = createPage();
      var page_js = globalPage;
      var default_1 = globalPage;

    page_js.default = default_1;

    const dateToDatabaseDate = date => {
    	const day = trailingZero(date.getDate()),
    		month = trailingZero((date.getMonth() + 1)),
    		year = date.getFullYear();
    	return parseInt(year + '' + month + '' + day)
    };


    const dateStringToDate = string => {
      const tmp = string.split('-');
      return new Date(parseInt(tmp[0]), parseInt(tmp[1]) - 1, parseInt(tmp[2]) )
    };


    const dateGetHours = duration => Math.floor(duration / (60 * 60));


    const dateGetMinutes = duration => {
      const minutes = Math.floor(duration / 60);
      const hours = Math.floor(minutes / 60);

      const leftMinutes = minutes - hours * 60;
      const stringifiedMinutes = leftMinutes < 10 ? '0' + leftMinutes : leftMinutes;

      return stringifiedMinutes
    };


    const dateGetSeconds = duration => {
      const minutes = Math.floor(duration / 60);
      const seconds = duration - minutes * 60;
      const stringifiedSeconds = seconds < 10 ? '0' + seconds : seconds;
      return stringifiedSeconds
    };


    const trailingZero = number => {
    	return number < 10 ? '0' + number : number
    };


    const getWindowWidth = () => {
    	const w = window,
    	    d = document,
    	    e = d.documentElement,
    	    g = d.getElementsByTagName('body')[0],
    	    x = w.innerWidth || e.clientWidth || g.clientWidth,
    	    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    	    return x
    };


    const getUrlParameter = (attr, url) => {
        attr = attr.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        const regexS = "[\\?&]" + attr + "=([^&#]*)",
        	regex = new RegExp(regexS),
        	results = regex.exec( url );
        return results == null ? null : results[1]
    };

    const routerStore = writable({
      view: 'index',
      subview: null
    });


    page_js({
    	hashbang: true
    });

    page_js('/', () => page_js('/-/tasks/TES/'));

    page_js('/:team/', data => 
    	routerStore.set({
    		team: data.params.team,
    		view: data.params.view,
    		project: data.params.project,
    		subview: data.params.subview,
    		detail: data.params.detail
    	})
    );

    page_js('/:team/:view/', data => 
    	routerStore.set({
    		team: data.params.team,
    		view: data.params.view,
    		project: data.params.project,
    		subview: data.params.subview,
    		detail: data.params.detail
    	})
    );

    page_js('/:team/:view/:project/', data => 
    	routerStore.set({
    		team: data.params.team,
    		view: data.params.view,
    		project: data.params.project,
    		subview: data.params.subview || '-',
    		detail: data.params.detail
    	})
    );

    page_js('/:team/:view/:project/:subview/', data =>
    	routerStore.set({
    		team: data.params.team,
    		view: data.params.view,
    		project: data.params.project,
    		subview: data.params.subview,
    		detail: data.params.detail
    	})
    );

    page_js('/:team/:view/:project/:subview/:detail/', data =>
    	routerStore.set({
    		team: data.params.team,
    		view: data.params.view,
    		project: data.params.project,
    		subview: data.params.subview,
    		detail: data.params.detail
    	})
    );

    page_js('/sign-up/:key/:email/', data => {
    	routerStore.set({
    		view: 'sign-up',
    		key: data.params.key,
    		email: data.params.email
    	});
    });


    page_js();

    let swsServer = {};



    let sws;
    const setSWS = swsToSet => sws = swsToSet;



    swsServer.init = async ({ promiseId, models, server }) => {

    	await swsServer.db.init(models).catch(err => {
    		console.log(err);
    	});
    	
    	swsServer.gateway.init(server);
    	swsServer.auth.init();

    	swsServer.bridge.answer({
    		promiseId,
    		answer: {}
    	});
    };



    swsServer.auth = {


    	serverKnowsAuth: false,


    	init: async () => {
    		const authData = await swsServer.store.get('authData');
    		if(authData) {
    			swsServer.auth.updateAuth(authData.user, authData.jwt, false);
    		} else {
    			swsServer.auth.updateAuth(null, null, false);
    		}
    	},


    	newConnection: async () => {
    		const authData = await swsServer.store.get('authData');
    		if(authData) {
    			swsServer.gateway.send({
    				action: 'signInWithToken',
    				jwt: authData.jwt
    			}).then(res => {
    				swsServer.auth.serverKnowsAuth = true;
    				swsServer.db.__sync();
    			}).catch(err => {
    				// TODO: Re-Sign In? Sign Out?
    				if(err.code === 'safety-token-not-equal') {
    					swsServer.store.set('authData', null);
    					window.location.reload();
    				}
    			});
    		}
    	},


    	signUp: ({ promiseId, email, password, code }) => {

    		swsServer.gateway.send({
    			action: 'signUp',
    			email,
    			password,
    			code
    		}).then(res => {
    			swsServer.bridge.answer({
    				promiseId,
    				answer: res
    			});
    		}).catch(err => {
    			swsServer.bridge.answer({
    				promiseId,
    				err
    			});
    		});
    	},


    	signIn: json => {
    		swsServer.gateway.send({
    			action: 'signIn',
    			email: json.email,
    			password: json.password
    		}).then(res => {
    			swsServer.auth.newConnection();
    			swsServer.bridge.answer({
    				promiseId: json.promiseId,
    				answer: res
    			});
    		}).catch(err => {
    			swsServer.bridge.answer({
    				promiseId: json.promiseId,
    				err
    			});
    		});
    	},


    	signOut: async json => {
    		indexedDB.deleteDatabase('database');
    		await swsServer.store.set('authData', null);
    		setTimeout(() => {
    			swsServer.bridge.answer({
    				promiseId: json.promiseId
    			});
    		});
    	},


    	sendPasswordMail: json => {
    		swsServer.gateway.send({
    			action: 'sendPasswordMail',
    			email: json.email
    		}).then(res => {
    			swsServer.bridge.answer({
    				promiseId: json.promiseId,
    				answer: res
    			});
    		}).catch(err => {
    			swsServer.bridge.answer({
    				promiseId: json.promiseId,
    				err
    			});
    		});
    	},


    	updateAuth: (user, jwt, shouldSet) => {

    		const authData = {
    			user,
    			jwt
    		};

    		if(shouldSet) {
    			swsServer.store.set('authData', authData);
    		}

    		swsServer.bridge.answer({
    			action: 'updateAuth',
    			answer: authData
    		});
    	},


    	updateTeams: async team => {

    		let teamData = await swsServer.store.get('teamData');
    		
    		if(!teamData) {
    			teamData = {};
    		}

    		teamData[team.id] = team;

    		await swsServer.store.set('teamData', teamData);


    		swsServer.bridge.answer({
    			action: 'updateTeams',
    			answer: teamData
    		});
    	},


    	setTeamTitle: ({ promiseId, id, title }) => {
    		swsServer.gateway.send({
    			action: 'setTeamTitle',
    			id,
    			title
    		}).then(res => {
    			swsServer.bridge.answer({
    				promiseId: promiseId,
    				answer: res
    			});
    		}).catch(err => {
    			swsServer.bridge.answer({
    				promiseId: promiseId,
    				err
    			});
    		});
    	},


    	inviteMember: ({ promiseId, teamId, email, name }) => {
    		swsServer.gateway.send({
    			action: 'inviteMember',
    			teamId,
    			email,
    			name
    		}).then(res => {
    			swsServer.bridge.answer({
    				promiseId: promiseId,
    				answer: res
    			});
    		}).catch(err => {
    			swsServer.bridge.answer({
    				promiseId: promiseId,
    				err
    			});
    		});
    	}
    };


    swsServer.db = {

    	models: {},
    	objectStores: {},
    	hooks: {},


    	createIndex: (objStore, index) => {
    		index = index.sort();
    		const objStoreIndex = index.length === 1 ? index[0] : index;
    		objStore.createIndex(index.join(','), objStoreIndex, {
    			unique: false
    		});
    	},


    	getNewId: () => {
    		var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    		return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
    			return (Math.random() * 16 | 0).toString(16)
    		}).toLowerCase()
    	},


    	init: models => {
    		return new Promise((resolve, reject) => {
    			swsServer.db.models = models;

    			const req = indexedDB.open('database', 1);

    			req.onsuccess = e => {
    				swsServer.db.db = e.target.result;
    				swsServer.db.__sync();
    				resolve();
    			};

    			req.onerror = err => reject(err);

    			req.onupgradeneeded = e => {
    				swsServer.db.db = e.target.result;

    				Object.values(swsServer.db.models).forEach(model => {
    					swsServer.db.objectStores[model.col] = swsServer.db.db.createObjectStore(model.col, { keyPath: 'id' });
    					swsServer.db.createIndex(swsServer.db.objectStores[model.col], ['__sync']);

    					model.indexes.forEach(val => {
    						swsServer.db.createIndex(swsServer.db.objectStores[model.col], val);
    					});
    				});

    				swsServer.db.db.createObjectStore('keyvalue');
    			};
    		})
    	},


    	__sync: () => {
    		if(swsServer.auth.serverKnowsAuth) {
    			Object.keys(swsServer.db.models).forEach(col => {
    				const req = swsServer.db.db.transaction(col, 'readonly').objectStore(col).index('__sync').get(1);
    				req.onsuccess = e => {
    					if(req.result) {
    						swsServer.gateway.send({
    							action: 'syncToServer',
    							col,
    							data: req.result
    						}).then(res => {
    							const req2 = swsServer.db.db.transaction(col).objectStore(col).get(req.result.id);
    							req2.onsuccess = e => {
    								req2.result.__sync = 0;
    								const req3 = swsServer.db.db.transaction(col, 'readwrite').objectStore(col).put(req2.result);
    								req3.onsuccess = e => {
    									setTimeout(() => {
    										swsServer.db.__sync();
    									}, 1000);
    								};
    							};
    						}).catch(err => {
    							console.log('ERR', err);
    							setTimeout(() => {
    								swsServer.db.__sync();
    							}, 1000);
    						});
    					}
    				};

    			});
    		}
    	},


    	new: ({ promiseId, col, data, id = swsServer.db.getNewId() }) => {

    		const date = new Date();

    		let obj = {
    			id: id,
    			createdAt: date,
    			updatedAt: date,
    			__deleted: false,
    			__updates: {
    				__deleted: date
    			},
    			__sync: 1
    		};

    		Object.keys(swsServer.db.models[col].attributes).forEach(attr => {
    			obj[attr] = data[attr] ? data[attr] : swsServer.db.models[col].attributes[attr];
    			obj.__updates[attr] = date;
    		});

    		const req = swsServer.db.db.transaction(col, 'readwrite').objectStore(col).put(obj);

    		req.onerror = err => {
    			swsServer.bridge.answer({
    				promiseId,
    				err
    			});
    		};

    		req.onsuccess = e => {
    			swsServer.bridge.answer({
    				promiseId,
    				answer: obj
    			});

    			swsServer.db.__processHooks(col, obj);
    			swsServer.db.__sync();
    		};

    	},


    	update: ({ promiseId, col, id, data }) => {

    		const date = new Date(),
    			req = swsServer.db.db.transaction(col).objectStore(col).get(id);

    		req.onerror = err => {
    			swsServer.bridge.answer({
    				promiseId,
    				err
    			});
    		};

    		req.onsuccess = e => {
    			if (!req.result) {
    				swsServer.bridge.answer({
    					promiseId,
    					err: {
    						code: 'obj-not-found'
    					}
    				});
    			}

    			let obj = req.result;

    			Object.keys(data).forEach(key => {
    				if (swsServer.db.models[col].attributes.hasOwnProperty(key) || key === '__deleted') {
    					obj[key] = data[key];
    					obj.__updates[key] = date;
    					obj.updatedAt = date;
    					obj.__sync = 1;
    				}
    			});

    			const req2 = swsServer.db.db.transaction(col, 'readwrite').objectStore(col).put(obj);

    			req2.onerror = err => {
    				swsServer.bridge.answer({
    					promiseId,
    					err
    				});
    			};

    			req2.onsuccess = e => {
    				swsServer.bridge.answer({
    					promiseId,
    					answer: obj
    				});

    				swsServer.db.__processHooks(col, obj);
    				swsServer.db.__sync();
    			};
    		};

    	},


    	query: ({ promiseId, col, query }) => {

    		const index = (Object.keys(query).sort()).join(','),
    			values = (Object.keys(query).sort()).map(key => query[key]),
    			req = swsServer.db.db.transaction(col, 'readonly').objectStore(col).index(index).getAll(values.length === 1 ? values[0] : values);
    	
    		req.onerror = err => {
    			swsServer.bridge.answer({
    				promiseId,
    				err
    			});
    		};

    		req.onsuccess = e => {
    			swsServer.bridge.answer({
    				promiseId,
    				answer: req.result.filter(val => !val.__deleted)
    			});
    		};
    	},


    	get: ({ promiseId, col, id }) => {
    		const req = swsServer.db.db.transaction(col, 'readonly').objectStore(col).get(id);

    		req.onerror = err => {
    			swsServer.bridge.answer({
    				promiseId,
    				err
    			});
    		};

    		req.onsuccess = e => {
    			if (req.result) {
    				if(!req.result.__deleted) {
    					delete req.result.__deleted;
    					delete req.result.__updates;
    					delete req.result.__sync;

    					swsServer.bridge.answer({
    						promiseId,
    						answer: req.result
    					});
    				} else {
    					swsServer.bridge.answer({
    						promiseId,
    						answer: null
    					});
    				}
    			} else {
    				swsServer.bridge.answer({
    					promiseId,
    					answer: null
    				});
    			}
    		};
    	},


    	hook: ({ col, query, hook }) => {
    		swsServer.db.hooks[hook] = {
    			col,
    			query
    		};
    	},


    	unhook: ({ hook }) => {
    		delete swsServer.db.hooks[hook];
    	},


    	getReportData: async ({ promiseId, team, dates, filterTasks }) => {

    		const data = await Promise.all(
    			Object.keys(dates).map(async date =>
    				new Promise((resolve, reject) => {
    					const req = swsServer.db.db.transaction('times', 'readonly').objectStore('times').index('day,team').getAll([parseInt(date), team]);
    					req.onerror = err => resolve({
    						date,
    						entries: []
    					}); 
    					req.onsuccess = e => resolve({
    						date,
    						entries: req.result
    					});
    				})
    			)
    		);

    		let chartData = {
    			total: 0,
    			tasks: {},
    			totalDayMax: 0,
    			days: {}
    		};

    		const allTasks = filterTasks.length === 0;

    		data.forEach(dayData => {

    			chartData.days[dayData.date] = {
    				total: 0,
    				tasks: {}
    			};

    			dayData.entries.forEach(time => {
    				const { task, duration } = time;

    				if(allTasks || filterTasks.includes(task) ) {
    					chartData.total += duration;
    					chartData.days[dayData.date].total += duration;

    					if(!chartData.days[dayData.date].tasks[task]) {
    						chartData.days[dayData.date].tasks[task] = 0;
    					}
    					chartData.days[dayData.date].tasks[task] += duration;

    					if(!chartData.tasks[task]) {
    						chartData.tasks[task] = 0;
    					}

    					chartData.tasks[task] += duration;
    				}
    			});
    			chartData.totalDayMax = Math.max( chartData.totalDayMax, chartData.days[dayData.date].total );
    		});

    		chartData.totalDayMax = Math.ceil(chartData.totalDayMax / 3600) * 3600;


    		swsServer.bridge.answer({
    			promiseId,
    			answer: chartData
    		});
    	},


    	__processHooks: (col, obj) => {
    		Object.keys(swsServer.db.hooks).forEach(key => {
    			const hook = swsServer.db.hooks[key];
    			if(hook.col === col) {

    				let matches = true;
    				Object.keys(hook.query).forEach(key => {
    					if(obj[key] != hook.query[key]) {
    						matches = false;
    					}
    				});

    				if(matches) {
    					swsServer.bridge.answer({
    						action: 'processHook',
    						answer: {
    							hook: key,
    							obj
    						}
    					});
    				}
    			}
    		});
    	},


    	__syncToClient: async (col, objs) => {

    		let lastDate = new Date(2000, 0, 0),
    			lastId = null;

    		await Promise.all(
    			objs.map(async obj => {
    				obj.id = obj._id;
    				delete obj._id;
    				lastDate = new Date(obj.updatedAt);
    				lastId = obj.id;
    				return swsServer.db.__syncObjToClient(col, obj)
    			})
    		).catch(err => {
    			console.log('PROMISE ALL ERR', err);
    		});

    		swsServer.gateway.send({
    			action: 'verifySyncToClient',
    			col,
    			date: lastDate,
    			id: lastId
    		});
    	},


    	__syncObjToClient: (col, obj) => {
    		return new Promise((resolve, reject) => {
    			obj.__sync = 0;

    			const req = swsServer.db.db.transaction(col).objectStore(col).get(obj.id);

    			req.onerror = err => {
    				console.log('ERR', err);
    			};

    			req.onsuccess = e => {
    				if (!req.result) {
    					const req2 = swsServer.db.db.transaction(col, 'readwrite').objectStore(col).put(obj);

    					req2.onerror = err => {
    						console.log('ERR', err);
    					};

    					req2.onsuccess = e => {	
    						swsServer.db.__processHooks(col, obj);
    						resolve(true);
    					};
    				} else {
    					let objInDb = req.result;

    					Object.keys(obj).forEach(key => {
    						if (swsServer.db.models[col].attributes.hasOwnProperty(key) || key === '__deleted') {
    							if(new Date(obj.__updates[key]) > new Date(objInDb.__updates[key])) {
    								objInDb[key] = obj[key];
    								objInDb.__updates[key] = obj.__updates[key];
    							}
    						}
    					});

    					if(obj.updatedAt > objInDb.updatedAt) {
    						objInDb.updatedAt = obj.updatedAt;
    					}

    					const req2 = swsServer.db.db.transaction(col, 'readwrite').objectStore(col).put(objInDb);

    					req2.onerror = err => {
    						console.log('ERR', err);
    					};

    					req2.onsuccess = e => {
    						swsServer.db.__processHooks(col, objInDb);
    						resolve(true);
    					};
    				}
    			};
    		})
    	}
    };



    swsServer.gateway = {

    	connected: false,
    	promises: {},
    	ws: null,


    	init: serverUrl => {

    		swsServer.gateway.serverUrl = serverUrl;
    		swsServer.gateway.ws = new WebSocket(swsServer.gateway.serverUrl);

    		swsServer.gateway.ws.onopen = () => {
    			swsServer.gateway.connected = true;

    			swsServer.auth.newConnection();
    		};

    		swsServer.gateway.ws.onclose = () => {
    			swsServer.gateway.connected = false;

    			setTimeout(() => {
    				swsServer.gateway.init(swsServer.gateway.serverUrl);
    			}, 1000);
    		};

    		swsServer.gateway.ws.onmessage = message => {

    			const json = JSON.parse(message.data);

    			if(json && swsServer.gateway.promises[json.promiseId]) {
    				swsServer.gateway.promises[json.promiseId][json.err ? 'reject' : 'resolve'](json.err ? json.err :json.answer);
    			} else {
    				switch(json.action) {
    					case 'updateAuth':
    						swsServer.auth.updateAuth(json.user, json.jwt, true);
    						break;
    					case 'syncToClient':
    						swsServer.db.__syncToClient(json.col, json.objects);
    						break;
    					case 'updateTeams':
    						swsServer.auth.updateTeams(json.team, true);
    						break;
    				}
    			}
    		}; 

    		swsServer.gateway.ws.onerror = err => {
    			console.log('ERR', err);
    		};
    	},


    	send: json => {
    		json.promiseId = Math.floor(Math.random() * 1000000000000);

    		return new Promise((resolve, reject) => {
    			swsServer.gateway.promises[json.promiseId] = {
    				resolve,
    				reject
    			};

    			if(swsServer.gateway.connected) {
    				swsServer.gateway.ws.send(JSON.stringify(json));
    			} else {
    				reject({
    					code: 'not-connected'
    				});
    			}
    		})
    	}
    };



    swsServer.bridge = {


    	functionMap: {
    		init: swsServer.init,

    		signUp: swsServer.auth.signUp,
    		signIn: swsServer.auth.signIn,
    		signOut: swsServer.auth.signOut,
    		sendPasswordMail: swsServer.auth.sendPasswordMail,
    		setTeamTitle: swsServer.auth.setTeamTitle,
    		inviteMember: swsServer.auth.inviteMember,

    		new: swsServer.db.new,
    		query: swsServer.db.query,
    		hook: swsServer.db.hook,
    		unhook: swsServer.db.unhook,
    		get: swsServer.db.get,
    		update: swsServer.db.update,
    		getReportData: swsServer.db.getReportData
    	},


    	postMessage: jsonString => {
    		const json = JSON.parse(jsonString);
    		swsServer.bridge.functionMap[json.action](json);
    	},


    	answer: json => {
    		sws.bridge.postMessage(JSON.stringify(json));
    	}
    };



    swsServer.store = {


    	set: (key, val) => {
    		return new Promise((resolve, reject) => {
    			const req = swsServer.db.db.transaction('keyvalue', 'readwrite').objectStore('keyvalue').put(val, key);
    			req.onerror = e => reject(e);
    			req.onsuccess = e => resolve(e);
    		})
    	},
    	 

    	get: key => {
    		return new Promise((resolve, reject) => {
    			const req = swsServer.db.db.transaction('keyvalue', 'readonly').objectStore('keyvalue').get(key);
    			req.onerror = e => reject(e);
    			req.onsuccess = e => resolve(req.result);
    		})
    	}
    };

    let sws$1 = {};

    setSWS(sws$1);



    sws$1.init = async ({ server, models }) => {
    	return sws$1.bridge.send({
    		action: 'init',
    		server,
    		models
    	})
    };



    sws$1.auth = {


    	user: null,
    	teams: null,

    	authStateHooks: [],
    	teamStateHooks: [],


    	hookIntoAuthState: fn => {
    		sws$1.auth.authStateHooks.push(fn);
    		fn(sws$1.auth.user);
    	},


    	updateAuth: (user, jwt) => {
    		sws$1.auth.user = user;
    		sws$1.auth.authStateHooks.forEach(fn => fn(sws$1.auth.user));
    	},


    	signUp: (email, password, code) => {
    		return sws$1.bridge.send({
    			action: 'signUp',
    			email,
    			password,
    			code
    		})
    	},


    	signIn: (email, password) => {
    		return sws$1.bridge.send({
    			action: 'signIn',
    			email,
    			password
    		})
    	},


    	signOut: () => {
    		return sws$1.bridge.send({
    			action: 'signOut'
    		}).then(() => location.reload(true))
    	},


    	sendPasswordMail: (email) => {
    		return sws$1.bridge.send({
    			action: 'sendPasswordMail',
    			email
    		})
    	},


    	hookIntoTeamState: fn => {
    		sws$1.auth.teamStateHooks.push(fn);
    		fn(sws$1.auth.teams);
    	},


    	updateTeams: (teams) => {
    		sws$1.auth.teams = teams;
    		sws$1.auth.teamStateHooks.forEach(fn => fn(sws$1.auth.teams));
    	},


    	setTeamTitle: ({ id, title }) => {
    		return sws$1.bridge.send({
    			action: 'setTeamTitle',
    			id,
    			title
    		})
    	},


    	inviteMember: ({ teamId, email, name }) => {
    		return sws$1.bridge.send({
    			action: 'inviteMember',
    			teamId,
    			email,
    			name
    		})
    	}
    };



    sws$1.db = {


    	hooks: {},


    	new: async ({ col, data, id }) => {
    		return sws$1.bridge.send({
    			action: 'new',
    			col,
    			id,
    			data
    		})
    	},


    	update: async ({ col, id, data }) => {
    		return sws$1.bridge.send({
    			action: 'update',
    			col,
    			id,
    			data
    		})
    	},


    	get: async ({ col, id }) => {
    		return sws$1.bridge.send({
    			action: 'get',
    			col,
    			id
    		})
    	},


    	query: async ({ col, query }) => {
    		return sws$1.bridge.send({
    			action: 'query',
    			col,
    			query
    		})
    	},


    	hook: async ({ col, query, hook, fn }) => {
    		sws$1.db.hooks[hook] = fn;
    		return sws$1.bridge.send({
    			action: 'hook',
    			col,
    			query,
    			hook
    		})
    	},


    	unhook: async ({ hook }) => {
    		delete sws$1.db.hooks[hook];
    		return sws$1.bridge.send({
    			action: 'unhook',
    			hook
    		})
    	},


    	delete: async ({ col, id }) => {
    		return sws$1.bridge.send({
    			action: 'update',
    			col,
    			id,
    			data: {
    				__deleted: true
    			}
    		})
    	},


    	getReportData: async ({ team, dates, filterTasks }) => {
    		return sws$1.bridge.send({
    			action: 'getReportData',
    			team,
    			dates,
    			filterTasks
    		})
    	},


    	__processHook: async (hook, obj) => {
    		if(sws$1.db.hooks[hook]) {
    			sws$1.db.hooks[hook](obj);
    		}
    	},
    };



    sws$1.bridge = {


    	promises: {},


    	send: async json => {
    		json.promiseId = Math.floor(Math.random() * 1000000000000);
    		return new Promise((resolve, reject) => {
    			sws$1.bridge.promises[json.promiseId] = {
    				resolve,
    				reject
    			};
    			swsServer.bridge.postMessage(JSON.stringify(json));
    		})
    	},


    	postMessage: jsonString => {
    		const json = JSON.parse(jsonString);
    		if(sws$1.bridge.promises[json.promiseId]) {
    			sws$1.bridge.promises[json.promiseId][json.err ? 'reject' : 'resolve'](json.err ? json.err : json.answer);
    			delete sws$1.bridge.promises[json.promiseId];
    		} else {
    			switch(json.action) {
    				case 'updateAuth':
    					sws$1.auth.updateAuth(json.answer.user, json.answer.jwt);
    					break;
    				case 'updateTeams':
    					sws$1.auth.updateTeams(json.answer);
    					break;
    				case 'processHook':
    					sws$1.db.__processHook(json.answer.hook, json.answer.obj);
    					break;
    			}
    		}
    	}
    };

    const authStore = writable({
    	inited: false,
    	hasAuth: false,
    	user: null
    });



    function authInit() {

    	sws$1.auth.hookIntoAuthState(user => {

    		if(user) {
    			authStore.set({
    				inited: true,
    				hasAuth: true,
    				user
    			});
    		} else {
    			authStore.set({
    				inited: true,
    				hasAuth: false,
    				user: null
    			});
    		}

    		console.log(Date.now() - loadedTime);
    	});
    }


    function authSignIn(email, password) {
    	return sws$1.auth.signIn(email, password)
    }


    function authSignUp(email, password, code) {
    	return sws$1.auth.signUp(email, password, code)
    }

    function authSignOut() {
    	sws$1.auth.signOut();
    }


    function authStoreNewPassword(email) {
    	return sws$1.auth.sendPasswordMail(email)
    }


    function authStoreVerifyPasswordCode(oobCode, cb) {
    	sws$1.auth.verifyPasswordCode(oobCode).then(res => {
    		cb(null);
    	}).catch(err => {
    		cb(err);
    	});
    }


    function authStoreConfirmPasswordReset(oobCode, password, cb) {
    	sws$1.auth.resetPassword(oobCode, password).then(res => {
    		console.log('RES', res);
    		cb(null);
    	}).catch(err => {
    		cb(err);
    	});	
    }

    const teamStore = writable({
    	teams: {},
    	active: null
    });

    function teamStoreInit() {
    	setListener();
    }


    function setListener() {
    	sws$1.auth.hookIntoTeamState(teams => {
    		teams = teams ? teams : {};
    		teamStore.update(data => {
    			data.teams = teams;
    			data.active = Object.values(teams)[0];
    			return data
    		});
    	});
    }

    const timesStore = writable({
    	times: [],
    	dayIndex: {}
    });


    let teamId = null;


    function timesStoreInit() {
    	routerStore.subscribe(routerData => {
    		try {
    			let dbDate = dateToDatabaseDate(dateStringToDate(routerData.subview));
    			if(dbDate) {
    				setListener$1(dbDate, teamId);
    			}
    		} catch(err) {}
    	});

    	teamStore.subscribe(teamData => {
    		const routerData = get_store_value(routerStore);
    		try {
    			let dbDate = dateToDatabaseDate(dateStringToDate(routerData.subview));
    			if(dbDate && teamData.active && teamData.active.id != teamId) {
    				teamId = teamData.active.id;
    				setListener$1(dbDate, teamId);
    			}
    		} catch(err) {}		
    	});
    }


    function setListener$1(dbDate, teamId) {

    	const authData = get_store_value(authStore);

    	if(teamId) {

    		sws$1.db.query({
    			col: 'times',
    			query: {
    				day: dbDate,
    				team: teamId
    			}
    		}).then(res => {
    			timesStore.update(data => {
    				data.times = res.filter(entry => entry.user === authData.user.id);
    				return data
    			});
    		});

    		sws$1.db.hook({
    			hook: 'times',
    			col: 'times',
    			query: {
    				day: dbDate,
    				team: teamId
    			},
    			fn: obj => {
    				timesStore.update(data => {

    					if(obj.__deleted) {
    						data.times = data.times.filter(val => val.id != obj.id);
    					} else {
    						let found = false;
    						data.times = data.times.map(val => {
    							if(val.id === obj.id) {
    								found = true;
    								return obj
    							} 
    							return val
    						});

    						if(!found) {
    							data.times.push(obj);
    						}
    					}

    					return data
    				});
    			}
    		});
    	}
    }


    function timesStoreDeleteEntry(id) {
    	sws$1.db.delete({
    		col: 'times',
    		id
    	});
    }

    const tasksStore = writable({
    	json: {},
    	array: []
    });

    let teamId$1;


    function tasksStoreInit() {
    	teamStore.subscribe(teamData => {
    		if(teamData.active && teamData.active.id != teamId$1) {
    			teamId$1 = teamData.active.id;
    			setListener$2(teamId$1);
    		}
    	});
    }

    function setListener$2(teamId) {

    	sws$1.db.query({
    		col: 'tasks',
    		query: {
    			team: teamId
    		}
    	}).then(res => {
    		tasksStore.update(data => {
    			data.json = {};
    			data.array = res;
    			res.forEach(val => {
    				data.json[val.id] = val;
    			});
    			return data
    		});
    	});

    	sws$1.db.hook({
    		hook: 'tasks',
    		col: 'tasks',
    		query: {
    			team: teamId
    		},
    		fn: obj => {
    			console.log('OBJ', obj);
    			tasksStore.update(data => {
    				data.json[obj.id] = obj;
    				data.array = Object.values(data.json);
    				return data
    			});
    		}
    	});
    }

    const userStore = writable({
    	language: 'EN',
    	stopwatchEntryId: null,
    	stopwatchStartTime: 0,
    });

    const userStopwatchStore = writable(0);

    let interval;


    function userStoreInit() {
    	setListener$3();
    }


    function setListener$3() {
    	authStore.subscribe(authData => {
    		if(authData.hasAuth) {
    			console.log('USER ID', authData.user.id);

    			sws$1.db.get({
    				col: 'settings',
    				id: authData.user.id
    			}).then(res => {
    				userStore.update(data => {
    					return res ? res : data
    				});
    			});

    			sws$1.db.hook({
    				hook: 'settings',
    				col: 'settings',
    				query: {
    					id: authData.user.id
    				},
    				fn: obj => {
    					userStore.update(data => {
    						return obj ? obj : data
    					});
    				}
    			});
    		}
    	});
    }


    userStore.subscribe(userStoreData => {
    	if(userStoreData.stopwatchEntryId) {
    		interval = setInterval(() => {
    			userStopwatchStore.update(data =>
    				Math.floor((Date.now() - userStoreData.stopwatchStartTime) / 1000)
    			);
    		}, 1000);
    		
    		userStopwatchStore.update(data =>
    			Math.floor((Date.now() - userStoreData.stopwatchStartTime) / 1000)
    		);
    	} else {
    		clearInterval(interval);
    			userStopwatchStore.update(data => 0);
    	}
    });

    let teamId$2 = null;

    const reportsStore = writable({
    	firstDate: new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate(), 0, 0, 0),
    	lastDate: new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate(), 0, 0, 0),
    	dates: {},
    	filterTasks: [],
    	active: null
    });

    const reportsStoreBarchartData = writable({
    	total: 0,
    	tasks: {},
    	totalDayMax: 0,
    	days: {}
    });


    function reportsStoreInit() {

    	timesStore.subscribe(() => {
    		if(teamId$2) {
    			const reportsData = get_store_value(reportsStore);
    			buildChartData(reportsData, teamId$2);
    		}
    	});

    	teamStore.subscribe(teamData => {
    		if(teamData.active && teamData.active.id != teamId$2) {
    			teamId$2 = teamData.active.id;
    			const reportsData = get_store_value(reportsStore);
    			buildChartData(reportsData, teamId$2);
    		}
    	});

    	reportsStore.subscribe(reportsData => {
    		if(teamId$2) {
    			buildChartData(reportsData, teamId$2);
    		}
    	});
    }

    async function buildChartData(reportsStore, teamId) {

    	const chartData = await sws$1.db.getReportData({
    		team: teamId,
    		dates: reportsStore.dates,
    		filterTasks: reportsStore.filterTasks
    	});

    	reportsStoreBarchartData.set(chartData);	
    }

    const TITLE_MAP = {
    	'timelog': 'Timelog',
    	'reports': 'Reports',
    	'settings': 'Settings',
    };

    let view = '',
    	hours = null,
    	minutes = null,
    	seconds = null,
    	divider = ':';


    const uiStore = writable({
    	breakpoint: 'xs',
    	isTouchDevice: false
    });


    const uiStopwatchStore = writable({
    	hours: 0,
    	minutes: 0,
    	seconds: 0
    });


    function uiStoreInit() {
    	uiStore.update(data => {
    		data.isTouchDevice = ('ontouchstart' in window || navigator.msMaxTouchPoints) ? true : false;
    		return data
    	});
    }


    function uiStoreSetBreakpoint(windowWidth) {
    	uiStore.update(data => {

    		if(windowWidth < 800) {
    			var breakpoint = 'xs';
    		} else {
    			var breakpoint = 'l';
    		}

    		data.breakpoint = breakpoint;
    		return data
    	});
    }


    userStopwatchStore.subscribe(userStopwatchData => {


    	hours = dateGetHours(userStopwatchData);
    	minutes = dateGetMinutes(userStopwatchData);
    	seconds = dateGetSeconds(userStopwatchData);

    	uiStopwatchStore.update(data => {
    		return {
    			hours,
    			minutes,
    			seconds
    		}
    	});
    	setTitle(view, hours, minutes);
    });


    routerStore.subscribe(routerData => {
    	view = routerData.view;
    	setTitle(view, hours, minutes);
    });


    function setTitle(view, hours, minutes) {
    	divider = divider === ':' ? ' ' : ':';
    	const stopwatchTitle = (get_store_value(userStore).stopwatchEntryId) ? '['+ hours + divider + minutes +'] ' : '';
    	document.title = stopwatchTitle + TITLE_MAP[view] +' · Timetracker.One';
    }

    const TO_MAIN_NAV = [
    	['parent', 'body'],
    	['query', 'nav .active']
    ];

    const NAV_LEFT = [
    	['parent', 'li'], 
    	['prev'], 
    	['find']
    ];

    const NAV_RIGHT = [
    	['parent', 'li'], 
    	['next'], 
    	['find']
    ];

    const TO_ENTRIES = [
    	['parent', 'body'],
    	['query', '.entries, .container'],
    	['find']
    ];

    const TO_PARENT_LI = [
    	['parent', 'li']
    ];

    const DELETE_TIMELOG_ENTRY = e => {
    	timesStoreDeleteEntry(e.target.closest('li').dataset.id);
    };

    const KEYS_CONFIG = {

    	EMPTY: {},

    	MAIN_NAV: {
    		'box-x': 6,
    		'box-y': 6,
    		'box-width': -12,
    		'box-height': -12,
    		'left': NAV_LEFT,
    		'right': NAV_RIGHT,
    		'bottom': [
    			['parent', 'body'],
    			['query', '.spacer + *'],
    			['find']
    		]
    	},


    	SUB_NAV: {
    		'box-x': 6,
    		'box-y': 6,
    		'box-width': -12,
    		'box-height': -12,
    		'top': TO_MAIN_NAV,
    		'left': NAV_LEFT,
    		'right': NAV_RIGHT,
    		'bottom': [
    			['parent', 'body'],
    			['query', 'header'],
    			['find']
    		],
    		'esc': TO_MAIN_NAV
    	},


    	TIMELOG_HEADER_ARROW_LEFT: {
    		'top': TO_MAIN_NAV,
    		'right': [
    			['parent', 'div'],
    			['next'],
    			['find']
    		],
    		'bottom': TO_ENTRIES,
    		'esc': TO_MAIN_NAV
    	},

    	TIMELOG_HEADER_ARROW_RIGHT: {
    		'top': TO_MAIN_NAV,
    		'left': [
    			['parent', 'div'],
    			['prev'],
    			['find']
    		],
    		'right': [
    			['parent', 'body'],
    			['query', '.add-button-wrapper a']
    		],
    		'bottom': TO_ENTRIES,
    		'esc': TO_MAIN_NAV
    	},


    	TIMELOG_HEADER_ADD: {
    		'top': TO_MAIN_NAV,
    		'left': [
    			['parent', 'header'],
    			['query', '.button-wrapper + .button-wrapper a']
    		],
    		'bottom': TO_ENTRIES,
    		'esc': TO_MAIN_NAV
    	},


    	TIMELOG_ENTRY: {
    		'top': [
    			['prev']
    		],
    		'bottom': [
    			['next']
    		],
    		'left': [
    			['query', '.nav a']
    		],
    		'right': [
    			['find']
    		],
    		'enter': [
    			['find']
    		],
    		'esc': TO_MAIN_NAV,
    		'backspace': e => {
    			timesStoreDeleteEntry(e.target.dataset.id);
    		}
    	},

    	TIMELOG_ENTRY__TO_ADD: [
    		['parent', 'body'],
    		['query', '.add-button-wrapper a']
    	],

    	TIMELOG_ENTRY_STOPWATCH: {
    		'top': [
    			['parent', 'li'],
    			['prev'],
    			['query', '.stopwatch a']
    		],
    		'bottom': [
    			['parent', 'li'],
    			['next'],
    			['query', '.stopwatch a']
    		],
    		'left': TO_PARENT_LI,
    		'right': [
    			['parent', '.stopwatch'],
    			['next']
    		],
    		'esc': TO_PARENT_LI,
    		'backspace': DELETE_TIMELOG_ENTRY
    	},

    	TIMELOG_ENTRY_DURATION: {
    		'box-x': 3,
    		'box-width': -6,
    		'box-y': 3,
    		'box-height': -6,
    		'top': [
    			['parent', 'li'],
    			['prev'],
    			['query', '.duration']
    		],
    		'bottom': [
    			['parent', 'li'],
    			['next'],
    			['query', '.duration']
    		],
    		'left': [
    			['prev'],
    			['find']
    		],
    		'right': [
    			['next']
    		],
    		'esc': TO_PARENT_LI,
    		'backspace': DELETE_TIMELOG_ENTRY
    	},

    	TIMELOG_ENTRY_TASK: {
    		'box-x': 3,
    		'box-width': -6,
    		'box-y': 3,
    		'box-height': -6,
    		'top': [
    			['parent', 'li'],
    			['prev'],
    			['query', '.task']
    		],
    		'bottom': [
    			['parent', 'li'],
    			['next'],
    			['query', '.task']
    		],
    		'left': [
    			['prev']
    		],
    		'right': [
    			['next']
    		],
    		'esc': TO_PARENT_LI,
    		'backspace': DELETE_TIMELOG_ENTRY
    	},

    	TIMELOG_ENTRY_COMMENT: {
    		'box-x': 0,
    		'box-width': -48,
    		'box-y': 3,
    		'box-height': -6,
    		'top': [
    			['parent', 'li'],
    			['prev'],
    			['query', '.comment']
    		],
    		'bottom': [
    			['parent', 'li'],
    			['next'],
    			['query', '.comment']
    		],
    		'left': [
    			['prev']
    		],
    		'right': [
    			['next'],
    			['find']
    		],
    		'esc': TO_PARENT_LI,
    		'backspace': DELETE_TIMELOG_ENTRY
    	},

    	TIMELOG_ENTRY_CONEXTNAV: {
    		'top': [
    			['parent', 'li'],
    			['prev'],
    			['query', '.nav a']
    		],
    		'bottom': [
    			['parent', 'li'],
    			['next'],
    			['query', '.nav a']
    		],
    		'left': [
    			['parent', '.nav'],
    			['prev']
    		],
    		'right': TO_PARENT_LI,
    		'esc': TO_PARENT_LI,
    		'backspace': DELETE_TIMELOG_ENTRY
    	},

    	TIMELOG_EMPTY_STATE_LINK: {
    		'top': [
    			['parent', 'body'],
    			['query', '.add-button-wrapper a']
    		]
    	},



    	REPORTS_RANGE_ARROW_LEFT: {
    		'top': TO_MAIN_NAV,
    		'right': [
    			['next']
    		],
    		'bottom': [
    			['parent', 'section'],
    			['next'],
    			['find']
    		],
    		'esc': TO_MAIN_NAV
    	},

    	REPORTS_RANGE_ARROW_RIGHT: {
    		'top': TO_MAIN_NAV,
    		'right': [
    			['next']
    		],
    		'bottom': [
    			['parent', 'section'],
    			['next'],
    			['find']
    		],
    		'left': [
    			['prev']
    		],
    		'esc': TO_MAIN_NAV
    	},

    	REPORTS_RANGE_TITLE: {
    		'top': TO_MAIN_NAV,
    		'right': [
    			['parent', '.custom-range-wrapper'],
    			['next'],
    			['find']
    		],
    		'bottom': [
    			['parent', 'section'],
    			['next'],
    			['find']
    		],
    		'left': [
    			['prev']
    		],
    		'esc': TO_MAIN_NAV
    	},

    	REPORTS_RANGE_RADIO: {
    		'top': TO_MAIN_NAV,
    		'right': [
    			['next']
    		],
    		'bottom': [
    			['parent', 'section'],
    			['next'],
    			['find']
    		],
    		'left': [
    			['prev']
    		],
    		'esc': TO_MAIN_NAV
    	},

    	REPORTS_RANGE_RADIO_FIRST: [
    		['parent', 'section'],
    		['query', '.custom-range-wrapper .title']
    	],

    	REPORTS_MULTIPLE: {
    		'top': [
    			['parent', 'section'],
    			['prev'],
    			['find']
    		],
    		'esc': TO_MAIN_NAV
    	}
    };

    /* src/ui/ui-focus.svelte generated by Svelte v3.14.1 */
    const file = "src/ui/ui-focus.svelte";

    // (222:0) {#if show && isLastInputAKey && !$uiStore.isTouchDevice}
    function create_if_block(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(ctx.wiggleClass) + " svelte-g058d1"));
    			set_style(div, "top", ctx.y + "px");
    			set_style(div, "left", ctx.x + "px");
    			set_style(div, "width", ctx.width + "px");
    			set_style(div, "height", ctx.height + "px");
    			add_location(div, file, 222, 1, 5406);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (changed.wiggleClass && div_class_value !== (div_class_value = "" + (null_to_empty(ctx.wiggleClass) + " svelte-g058d1"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (changed.y) {
    				set_style(div, "top", ctx.y + "px");
    			}

    			if (changed.x) {
    				set_style(div, "left", ctx.x + "px");
    			}

    			if (changed.width) {
    				set_style(div, "width", ctx.width + "px");
    			}

    			if (changed.height) {
    				set_style(div, "height", ctx.height + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(222:0) {#if show && isLastInputAKey && !$uiStore.isTouchDevice}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let if_block = ctx.show && ctx.isLastInputAKey && !ctx.$uiStore.isTouchDevice && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (ctx.show && ctx.isLastInputAKey && !ctx.$uiStore.isTouchDevice) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const FOCUS_ELS = "a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex=\"-1\"])";

    function getNextFocusable(el) {
    	const focusableEls = document.querySelectorAll(FOCUS_ELS);
    	var activeIndex;

    	focusableEls.forEach((val, key) => {
    		if (el === val) {
    			activeIndex = key;
    		}
    	});

    	return focusableEls[activeIndex + 1] || el;
    }

    function findFocusable(el) {
    	return el.querySelector(FOCUS_ELS);
    }

    function instance($$self, $$props, $$invalidate) {
    	let $uiStore;
    	validate_store(uiStore, "uiStore");
    	component_subscribe($$self, uiStore, $$value => $$invalidate("$uiStore", $uiStore = $$value));

    	let show = false,
    		targetEl,
    		lastTargets = [],
    		elementConfig,
    		x = 0,
    		y = 0,
    		width = 0,
    		height = 0,
    		wiggleClass = "",
    		isLastInputAKey = false;

    	const blurFunction = e => {
    		removeBlurFunction(e);

    		setTimeout(() => {
    			if (!document.body.contains(targetEl)) {
    				let lastTarget, found = false;

    				while (!found && lastTargets.length > 0) {
    					lastTarget = lastTargets.pop();
    					found = document.body.contains(lastTarget);
    				}

    				if (document.body.contains(lastTarget)) {
    					lastTarget.focus();
    				} else {
    					$$invalidate("show", show = false);
    				}
    			}
    		});
    	};

    	const removeBlurFunction = e => {
    		e.target.addEventListener("keydown", keydownFunction, false);
    		e.target.addEventListener("blur", blurFunction, false);
    	};

    	onMount(() => {
    		document.addEventListener("focusin", e => {
    			$$invalidate("show", show = true);
    			lastTargets.push(targetEl);

    			if (lastTargets.length > 100) {
    				lastTargets.shift();
    			}

    			targetEl = e.target;

    			elementConfig = targetEl.dataset.config
    			? KEYS_CONFIG[targetEl.dataset.config]
    			: {};

    			setTargetBoundingRect();
    			setTimeout(setTargetBoundingRect);
    			targetEl.addEventListener("blur", blurFunction, false);

    			if (!targetEl.dataset.disable) {
    				targetEl.addEventListener("keydown", keydownFunction, false);
    			}
    		});

    		document.querySelector("body").addEventListener(
    			"trigger-focus-resize",
    			() => {
    				setTargetBoundingRect();
    			},
    			false
    		);

    		document.querySelector("body").addEventListener(
    			"keydown",
    			e => {
    				if ([9, 37, 39, 38, 40, 13, 27, 8].includes(e.keyCode)) {
    					if (!targetEl || !document.body.contains(targetEl)) {
    						console.log("Find Focus Event", e.target);
    						findFocusable(e.target).focus();
    					}
    				}

    				$$invalidate("isLastInputAKey", isLastInputAKey = true);
    			},
    			false
    		);

    		document.querySelector("body").addEventListener("mouseup", e => $$invalidate("isLastInputAKey", isLastInputAKey = false));
    		document.querySelector("body").addEventListener("mousedown", e => $$invalidate("isLastInputAKey", isLastInputAKey = false));
    	});

    	function setTargetBoundingRect() {
    		const boundingRect = targetEl.getBoundingClientRect();
    		$$invalidate("x", x = boundingRect.x - 3 + (elementConfig["box-x"] || 0));
    		$$invalidate("y", y = boundingRect.y - 3 + (elementConfig["box-y"] || 0));
    		$$invalidate("width", width = boundingRect.width + 6 + (elementConfig["box-width"] || 0));
    		$$invalidate("height", height = boundingRect.height + 6 + (elementConfig["box-height"] || 0));
    		console.log(boundingRect);
    	}

    	const keydownFunction = e => {
    		if (targetEl.dataset.disable) {
    			return;
    		}

    		if (e.keyCode === 9) ; else if (e.keyCode === 37) {
    			if (targetEl.dataset.left) {
    				doAction(KEYS_CONFIG[targetEl.dataset.left], e, true);
    			} else if (elementConfig.left) {
    				doAction(elementConfig.left, e, false);
    			} else {
    				initWiggle(false);
    			}
    		} else if (e.keyCode === 39) {
    			if (targetEl.dataset.right) {
    				doAction(KEYS_CONFIG[targetEl.dataset.right], e, true);
    			} else if (elementConfig.right) {
    				doAction(elementConfig.right, e, false);
    			} else {
    				initWiggle(false);
    			}
    		} else if (e.keyCode === 38) {
    			if (targetEl.dataset.top) {
    				doAction(KEYS_CONFIG[targetEl.dataset.top], e, true);
    			} else if (elementConfig.top) {
    				doAction(elementConfig.top, e, true);
    			} else {
    				initWiggle(true);
    			}
    		} else if (e.keyCode === 40) {
    			if (elementConfig.bottom) {
    				doAction(elementConfig.bottom, e, true);
    			} else {
    				initWiggle(true);
    			}
    		} else if (e.keyCode === 13) {
    			if (elementConfig.enter) {
    				doAction(elementConfig.enter, e);
    			} else {
    				e.stopPropagation();
    				e.preventDefault();

    				e.target.dispatchEvent(new MouseEvent("click",
    				{
    						bubbles: true,
    						cancelable: true,
    						view: window
    					}));
    			}
    		} else if (e.keyCode === 27) {
    			if (elementConfig.esc) {
    				doAction(elementConfig.esc, e);
    			}
    		} else if (e.keyCode === 8) {
    			if (elementConfig.backspace) {
    				if (typeof elementConfig.backspace === "function") {
    					elementConfig.backspace(e);
    				} else {
    					doAction(elementConfig.backspace, e);
    				}
    			}
    		}
    	};

    	const doAction = (toDo, e, vertically) => {
    		e.preventDefault();
    		e.stopPropagation();
    		let el = e.target;

    		try {
    			toDo.forEach(val => {
    				if (val[0] === "parent") {
    					el = el.closest(val[1]);
    				} else if (val[0] === "prev") {
    					el = el.previousElementSibling;
    				} else if (val[0] === "next") {
    					el = el.nextElementSibling;
    				} else if (val[0] === "query") {
    					el = el.querySelector(val[1]);
    				} else if (val[0] === "tab") {
    					el = getNextFocusable(el);
    				} else if (val[0] === "find") {
    					el = findFocusable(el);
    				}
    			});

    			el.focus();
    		} catch(err) {
    			initWiggle(vertically);
    		}
    	};

    	function initWiggle(vertically) {
    		$$invalidate("wiggleClass", wiggleClass = "wiggle-" + (vertically ? "vertically" : "horizontally"));

    		setTimeout(
    			() => {
    				$$invalidate("wiggleClass", wiggleClass = "");
    			},
    			200
    		);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("show" in $$props) $$invalidate("show", show = $$props.show);
    		if ("targetEl" in $$props) targetEl = $$props.targetEl;
    		if ("lastTargets" in $$props) lastTargets = $$props.lastTargets;
    		if ("elementConfig" in $$props) elementConfig = $$props.elementConfig;
    		if ("x" in $$props) $$invalidate("x", x = $$props.x);
    		if ("y" in $$props) $$invalidate("y", y = $$props.y);
    		if ("width" in $$props) $$invalidate("width", width = $$props.width);
    		if ("height" in $$props) $$invalidate("height", height = $$props.height);
    		if ("wiggleClass" in $$props) $$invalidate("wiggleClass", wiggleClass = $$props.wiggleClass);
    		if ("isLastInputAKey" in $$props) $$invalidate("isLastInputAKey", isLastInputAKey = $$props.isLastInputAKey);
    		if ("$uiStore" in $$props) uiStore.set($uiStore = $$props.$uiStore);
    	};

    	return {
    		show,
    		x,
    		y,
    		width,
    		height,
    		wiggleClass,
    		isLastInputAKey,
    		$uiStore
    	};
    }

    class Ui_focus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ui_focus",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/ui/ui-input.svelte generated by Svelte v3.14.1 */
    const file$1 = "src/ui/ui-input.svelte";

    // (74:1) {:else}
    function create_else_block(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			input.disabled = ctx.disabled;
    			attr_dev(input, "data-disable", "true");
    			add_location(input, file$1, 74, 2, 1372);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_2),
    				listen_dev(input, "focus", ctx.focus_handler_2, false, false, false),
    				listen_dev(input, "blur", ctx.blur_handler_2, false, false, false)
    			];
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, ctx.value);
    		},
    		p: function update(changed, ctx) {
    			if (changed.disabled) {
    				prop_dev(input, "disabled", ctx.disabled);
    			}

    			if (changed.value && input.value !== ctx.value) {
    				set_input_value(input, ctx.value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(74:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (66:31) 
    function create_if_block_2(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "password");
    			input.disabled = ctx.disabled;
    			attr_dev(input, "data-disable", "true");
    			add_location(input, file$1, 66, 2, 1221);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_1),
    				listen_dev(input, "focus", ctx.focus_handler_1, false, false, false),
    				listen_dev(input, "blur", ctx.blur_handler_1, false, false, false)
    			];
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, ctx.value);
    		},
    		p: function update(changed, ctx) {
    			if (changed.disabled) {
    				prop_dev(input, "disabled", ctx.disabled);
    			}

    			if (changed.value && input.value !== ctx.value) {
    				set_input_value(input, ctx.value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(66:31) ",
    		ctx
    	});

    	return block;
    }

    // (58:1) {#if type === 'email'}
    function create_if_block_1(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "email");
    			input.disabled = ctx.disabled;
    			attr_dev(input, "data-disable", "true");
    			add_location(input, file$1, 58, 2, 1050);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler),
    				listen_dev(input, "focus", ctx.focus_handler, false, false, false),
    				listen_dev(input, "blur", ctx.blur_handler, false, false, false)
    			];
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, ctx.value);
    		},
    		p: function update(changed, ctx) {
    			if (changed.disabled) {
    				prop_dev(input, "disabled", ctx.disabled);
    			}

    			if (changed.value && input.value !== ctx.value) {
    				set_input_value(input, ctx.value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(58:1) {#if type === 'email'}",
    		ctx
    	});

    	return block;
    }

    // (84:1) {#if error && error.length > 0}
    function create_if_block$1(ctx) {
    	let div;
    	let t;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(ctx.error);
    			attr_dev(div, "class", "error svelte-ss6g1t");
    			add_location(div, file$1, 84, 2, 1551);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			if (!current || changed.error) set_data_dev(t, ctx.error);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { delay: 0, duration: 100 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { delay: 0, duration: 100 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(84:1) {#if error && error.length > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let label_1;
    	let t0;
    	let t1;
    	let t2;
    	let div_class_value;
    	let current;
    	let dispose;

    	function select_block_type(changed, ctx) {
    		if (ctx.type === "email") return create_if_block_1;
    		if (ctx.type === "password") return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(null, ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = ctx.error && ctx.error.length > 0 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			label_1 = element("label");
    			t0 = text(ctx.label);
    			t1 = space();
    			if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			add_location(label_1, file$1, 54, 1, 996);
    			attr_dev(div, "class", div_class_value = "wrapper\n\t\t" + (ctx.focused ? "focused" : "") + "\n\t\t" + (ctx.disabled ? "disabled" : "") + "\n\t\t" + (ctx.value.length > 0 || ctx.prefilled ? "filled" : ""));
    			add_location(div, file$1, 47, 0, 814);
    			dispose = listen_dev(div, "keydown", ctx.keydown_handler, false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label_1);
    			append_dev(label_1, t0);
    			append_dev(div, t1);
    			if_block0.m(div, null);
    			append_dev(div, t2);
    			if (if_block1) if_block1.m(div, null);
    			ctx.div_binding(div);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			if (!current || changed.label) set_data_dev(t0, ctx.label);

    			if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block0) {
    				if_block0.p(changed, ctx);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, t2);
    				}
    			}

    			if (ctx.error && ctx.error.length > 0) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || (changed.focused || changed.disabled || changed.value || changed.prefilled) && div_class_value !== (div_class_value = "wrapper\n\t\t" + (ctx.focused ? "focused" : "") + "\n\t\t" + (ctx.disabled ? "disabled" : "") + "\n\t\t" + (ctx.value.length > 0 || ctx.prefilled ? "filled" : ""))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			ctx.div_binding(null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { label = "No Label" } = $$props;
    	let { type = "text" } = $$props;
    	let { value = "" } = $$props;
    	let { disabled = false } = $$props;
    	let { error = "" } = $$props;
    	let el, focused = false, prefilled = false;

    	onMount(() => {
    		setTimeout(() => {
    			if (el) {
    				const inputEl = el.querySelector("input");

    				if (inputEl) {
    					inputEl.addEventListener("animationstart", () => $$invalidate("prefilled", prefilled = true));
    				}
    			}
    		});
    	});

    	function focus(e) {
    		$$invalidate("focused", focused = true);
    		dispatch("focus");
    	}

    	function blur(e) {
    		$$invalidate("focused", focused = false);
    		dispatch("blur");
    	}

    	function keydown(e) {
    		$$invalidate("prefilled", prefilled = false);
    		$$invalidate("error", error = "");
    		dispatch("keydown", e.keyCode);
    	}

    	const writable_props = ["label", "type", "value", "disabled", "error"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Ui_input> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate("value", value);
    	}

    	const focus_handler = e => focus();
    	const blur_handler = e => blur();

    	function input_input_handler_1() {
    		value = this.value;
    		$$invalidate("value", value);
    	}

    	const focus_handler_1 = e => focus();
    	const blur_handler_1 = e => blur();

    	function input_input_handler_2() {
    		value = this.value;
    		$$invalidate("value", value);
    	}

    	const focus_handler_2 = e => focus();
    	const blur_handler_2 = e => blur();

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate("el", el = $$value);
    		});
    	}

    	const keydown_handler = e => keydown(e);

    	$$self.$set = $$props => {
    		if ("label" in $$props) $$invalidate("label", label = $$props.label);
    		if ("type" in $$props) $$invalidate("type", type = $$props.type);
    		if ("value" in $$props) $$invalidate("value", value = $$props.value);
    		if ("disabled" in $$props) $$invalidate("disabled", disabled = $$props.disabled);
    		if ("error" in $$props) $$invalidate("error", error = $$props.error);
    	};

    	$$self.$capture_state = () => {
    		return {
    			label,
    			type,
    			value,
    			disabled,
    			error,
    			el,
    			focused,
    			prefilled,
    			disabledVal
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate("label", label = $$props.label);
    		if ("type" in $$props) $$invalidate("type", type = $$props.type);
    		if ("value" in $$props) $$invalidate("value", value = $$props.value);
    		if ("disabled" in $$props) $$invalidate("disabled", disabled = $$props.disabled);
    		if ("error" in $$props) $$invalidate("error", error = $$props.error);
    		if ("el" in $$props) $$invalidate("el", el = $$props.el);
    		if ("focused" in $$props) $$invalidate("focused", focused = $$props.focused);
    		if ("prefilled" in $$props) $$invalidate("prefilled", prefilled = $$props.prefilled);
    		if ("disabledVal" in $$props) disabledVal = $$props.disabledVal;
    	};

    	let disabledVal;

    	$$self.$$.update = (changed = { disabled: 1 }) => {
    		if (changed.disabled) {
    			 disabledVal = disabled ? "disabled" : "";
    		}
    	};

    	return {
    		label,
    		type,
    		value,
    		disabled,
    		error,
    		el,
    		focused,
    		prefilled,
    		focus,
    		blur,
    		keydown,
    		input_input_handler,
    		focus_handler,
    		blur_handler,
    		input_input_handler_1,
    		focus_handler_1,
    		blur_handler_1,
    		input_input_handler_2,
    		focus_handler_2,
    		blur_handler_2,
    		div_binding,
    		keydown_handler
    	};
    }

    class Ui_input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			label: 0,
    			type: 0,
    			value: 0,
    			disabled: 0,
    			error: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ui_input",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get label() {
    		throw new Error("<Ui_input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Ui_input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Ui_input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Ui_input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Ui_input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Ui_input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Ui_input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Ui_input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Ui_input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Ui_input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ui/ui-icon.svelte generated by Svelte v3.14.1 */

    const file$2 = "src/ui/ui-icon.svelte";

    // (30:35) 
    function create_if_block_9(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M12,10.5857864 L18.363961,4.22182541 C18.7544853,3.83130112 19.3876503,3.83130112 19.7781746,4.22182541 C20.1686989,4.6123497 20.1686989,5.24551468 19.7781746,5.63603897 L13.4142136,12 L19.7781746,18.363961 C20.1686989,18.7544853 20.1686989,19.3876503 19.7781746,19.7781746 C19.3876503,20.1686989 18.7544853,20.1686989 18.363961,19.7781746 L12,13.4142136 L5.63603897,19.7781746 C5.24551468,20.1686989 4.6123497,20.1686989 4.22182541,19.7781746 C3.83130112,19.3876503 3.83130112,18.7544853 4.22182541,18.363961 L10.5857864,12 L4.22182541,5.63603897 C3.83130112,5.24551468 3.83130112,4.6123497 4.22182541,4.22182541 C4.6123497,3.83130112 5.24551468,3.83130112 5.63603897,4.22182541 L12,10.5857864 Z");
    			attr_dev(path, "fill", ctx.color);
    			attr_dev(path, "class", "svelte-1vvi5wg");
    			add_location(path, file$2, 30, 5, 5969);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (changed.color) {
    				attr_dev(path, "fill", ctx.color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(30:35) ",
    		ctx
    	});

    	return block;
    }

    // (28:31) 
    function create_if_block_8(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M16.9270225,2.62662596 L19.7554496,5.45505309 C20.1459739,5.84557738 20.1459739,6.47874236 19.7554496,6.86926665 L9.31577313,17.3089431 C9.20599827,17.418718 9.07217254,17.5014268 8.92489411,17.5505196 L4.68225343,18.9647332 C4.15831011,19.1393809 3.59199014,18.856221 3.41734236,18.3322776 C3.34892009,18.1270108 3.34892009,17.9050889 3.41734236,17.6998221 L4.83155593,13.4571814 C4.88064873,13.309903 4.96335758,13.1760773 5.07313244,13.0663024 L15.5128089,2.62662596 C15.9033332,2.23610167 16.5364982,2.23610167 16.9270225,2.62662596 Z M14.0985953,6.86926665 L6.32042074,14.6474412 L5.77142784,16.2944199 C5.75432227,16.3457366 5.75432227,16.4012171 5.77142784,16.4525338 C5.81508978,16.5835196 5.95666977,16.6543096 6.0876556,16.6106477 L7.7346343,16.0616548 L15.5128089,8.28348021 L14.0985953,6.86926665 Z M16.2199157,4.7479463 L15.5128089,5.45505309 L16.9270225,6.86926665 L17.6341292,6.16215987 L16.2199157,4.7479463 Z M10,18 L20,18 C20.5522847,18 21,18.4477153 21,19 C21,19.5522847 20.5522847,20 20,20 L10,20 C9.44771525,20 9,19.5522847 9,19 C9,18.4477153 9.44771525,18 10,18 Z");
    			attr_dev(path, "fill", ctx.color);
    			attr_dev(path, "class", "svelte-1vvi5wg");
    			add_location(path, file$2, 28, 3, 4809);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (changed.color) {
    				attr_dev(path, "fill", ctx.color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(28:31) ",
    		ctx
    	});

    	return block;
    }

    // (26:37) 
    function create_if_block_7(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M5,6 L5,13 C5,13.5522847 5.44771525,14 6,14 L19,14 C19.5522847,14 20,13.5522847 20,13 C20,12.4477153 19.5522847,12 19,12 L7,12 L7,6 C7,5.44771525 6.55228475,5 6,5 C5.44771525,5 5,5.44771525 5,6 Z");
    			attr_dev(path, "fill", ctx.color);
    			attr_dev(path, "transform", "translate(12.500000, 9.500000) rotate(-45.000000) translate(-12.500000, -9.500000) ");
    			attr_dev(path, "class", "svelte-1vvi5wg");
    			add_location(path, file$2, 26, 3, 4449);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (changed.color) {
    				attr_dev(path, "fill", ctx.color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(26:37) ",
    		ctx
    	});

    	return block;
    }

    // (24:33) 
    function create_if_block_6(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M12,23 C5.92486775,23 1,18.0751322 1,12 C1,5.92486775 5.92486775,1 12,1 C18.0751322,1 23,5.92486775 23,12 C23,18.0751322 18.0751322,23 12,23 Z M12,21 C16.9705627,21 21,16.9705627 21,12 C21,7.02943725 16.9705627,3 12,3 C7.02943725,3 3,7.02943725 3,12 C3,16.9705627 7.02943725,21 12,21 Z M11,7 C11,6.44771525 11.4477153,6 12,6 C12.5522847,6 13,6.44771525 13,7 L13,11.5 L14.7270663,12.5362398 C14.7387565,12.5432539 14.7502782,12.5505452 14.7616215,12.5581074 C15.1565799,12.821413 15.2633056,13.3550415 15,13.75 C14.7184611,14.1723084 14.1580543,14.3046025 13.7173762,14.0527864 L11.5038611,12.7879206 C11.1922861,12.6098778 11,12.2785343 11,11.9196775 L11,7 Z");
    			attr_dev(path, "fill", ctx.color);
    			attr_dev(path, "class", "svelte-1vvi5wg");
    			add_location(path, file$2, 24, 3, 3716);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (changed.color) {
    				attr_dev(path, "fill", ctx.color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(24:33) ",
    		ctx
    	});

    	return block;
    }

    // (21:29) 
    function create_if_block_5(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M7,5 L11,5 C11.5522847,5 12,5.44771525 12,6 C12,6.55228475 11.5522847,7 11,7 L7,7 L7,11 C7,11.5522847 6.55228475,12 6,12 C5.44771525,12 5,11.5522847 5,11 L5,7 L1,7 C0.44771525,7 6.76353751e-17,6.55228475 0,6 C-6.76353751e-17,5.44771525 0.44771525,5 1,5 L5,5 L5,1 C5,0.44771525 5.44771525,1.01453063e-16 6,0 C6.55228475,-1.01453063e-16 7,0.44771525 7,1 L7,5 Z");
    			attr_dev(path, "fill", ctx.color);
    			attr_dev(path, "transform", "translate(6.000000, 6.000000) rotate(45.000000) translate(-6.000000, -6.000000) ");
    			attr_dev(path, "class", "svelte-1vvi5wg");
    			add_location(path, file$2, 21, 3, 3193);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (changed.color) {
    				attr_dev(path, "fill", ctx.color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(21:29) ",
    		ctx
    	});

    	return block;
    }

    // (19:30) 
    function create_if_block_4(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M1,1 L11,1 L11,3 L1,3 L1,1 Z M1,5 L11,5 L11,7 L1,7 L1,5 Z M1,9 L11,9 L11,11 L1,11 L1,9 Z");
    			attr_dev(path, "fill", ctx.color);
    			attr_dev(path, "class", "svelte-1vvi5wg");
    			add_location(path, file$2, 19, 3, 3038);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (changed.color) {
    				attr_dev(path, "fill", ctx.color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(19:30) ",
    		ctx
    	});

    	return block;
    }

    // (17:29) 
    function create_if_block_3(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M7,1 L9,1 L9,11 L7,11 L7,1 Z M3,1 L5,1 L5,11 L3,11 L3,1 Z");
    			attr_dev(path, "fill", ctx.color);
    			attr_dev(path, "class", "svelte-1vvi5wg");
    			add_location(path, file$2, 17, 3, 2914);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (changed.color) {
    				attr_dev(path, "fill", ctx.color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(17:29) ",
    		ctx
    	});

    	return block;
    }

    // (15:28) 
    function create_if_block_2$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M10.5708451,5.14250707 C10.7115947,5.22695684 10.8293925,5.34475464 10.9138423,5.48550424 C11.1979905,5.95908451 11.0444254,6.57334477 10.5708451,6.85749293 L3.51449576,11.0913025 C3.35908035,11.1845518 3.18124395,11.2338096 3,11.2338096 C2.44771525,11.2338096 2,10.7860944 2,10.2338096 L2,1.76619038 C2,1.58494643 2.04925783,1.40711003 2.14250707,1.25169462 C2.42665523,0.778114358 3.04091549,0.624549294 3.51449576,0.908697453 L10.5708451,5.14250707 Z M7.71325845,5.56292136 L4.74282147,3.91267859 C4.5014296,3.778572 4.19702795,3.8655439 4.06292136,4.10693576 C4.02165525,4.18121477 4,4.26478511 4,4.34975723 L4,7.65024277 C4,7.92638514 4.22385763,8.15024277 4.5,8.15024277 C4.58497212,8.15024277 4.66854246,8.12858752 4.74282147,8.08732141 L7.71325845,6.43707864 C7.95465032,6.30297205 8.04162222,5.9985704 7.90751562,5.75717853 C7.86217116,5.6755585 7.79487848,5.60826582 7.71325845,5.56292136 Z");
    			attr_dev(path, "fill", ctx.color);
    			attr_dev(path, "class", "svelte-1vvi5wg");
    			add_location(path, file$2, 15, 3, 1947);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (changed.color) {
    				attr_dev(path, "fill", ctx.color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(15:28) ",
    		ctx
    	});

    	return block;
    }

    // (13:35) 
    function create_if_block_1$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M8.26117151,4.64855074 L4.70574234,0.769900734 C4.33254993,0.362781744 3.69998256,0.335278815 3.29286357,0.708471223 C3.28218648,0.718258554 3.2717233,0.728276705 3.26148142,0.738518582 L3.16673458,0.833265424 C2.79233829,1.20766171 2.77466713,1.80900052 3.12643204,2.20473604 L5.90945437,5.33563616 C6.24624194,5.71452218 6.24624194,6.28547782 5.90945437,6.66436384 L3.12643204,9.79526396 C2.77466713,10.1909995 2.79233829,10.7923383 3.16673458,11.1667346 L3.26148142,11.2614814 C3.65200571,11.6520057 4.28517069,11.6520057 4.67569498,11.2614814 C4.68593686,11.2512395 4.69595501,11.2407764 4.70574234,11.2300993 L8.26117151,7.35144926 C8.96209381,6.58680676 8.96209381,5.41319324 8.26117151,4.64855074 Z");
    			attr_dev(path, "fill", ctx.color);
    			attr_dev(path, "class", "svelte-1vvi5wg");
    			add_location(path, file$2, 13, 3, 1176);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (changed.color) {
    				attr_dev(path, "fill", ctx.color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(13:35) ",
    		ctx
    	});

    	return block;
    }

    // (11:2) {#if type === 'arrow-left'}
    function create_if_block$2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M3.73882849,4.64855074 L7.29425766,0.769900734 C7.66745007,0.362781744 8.30001744,0.335278815 8.70713643,0.708471223 C8.71781352,0.718258554 8.7282767,0.728276705 8.73851858,0.738518582 L8.83326542,0.833265424 C9.20766171,1.20766171 9.22533287,1.80900052 8.87356796,2.20473604 L6.09054563,5.33563616 C5.75375806,5.71452218 5.75375806,6.28547782 6.09054563,6.66436384 L8.87356796,9.79526396 C9.22533287,10.1909995 9.20766171,10.7923383 8.83326542,11.1667346 L8.73851858,11.2614814 C8.34799429,11.6520057 7.71482931,11.6520057 7.32430502,11.2614814 C7.31406314,11.2512395 7.30404499,11.2407764 7.29425766,11.2300993 L3.73882849,7.35144926 C3.03790619,6.58680676 3.03790619,5.41319324 3.73882849,4.64855074 Z");
    			attr_dev(path, "fill", ctx.color);
    			attr_dev(path, "class", "svelte-1vvi5wg");
    			add_location(path, file$2, 11, 3, 398);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (changed.color) {
    				attr_dev(path, "fill", ctx.color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(11:2) {#if type === 'arrow-left'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let svg;
    	let g;
    	let svg_width_value;
    	let svg_height_value;
    	let svg_viewBox_value;

    	function select_block_type(changed, ctx) {
    		if (ctx.type === "arrow-left") return create_if_block$2;
    		if (ctx.type === "arrow-right") return create_if_block_1$1;
    		if (ctx.type === "play") return create_if_block_2$1;
    		if (ctx.type === "pause") return create_if_block_3;
    		if (ctx.type === "burger") return create_if_block_4;
    		if (ctx.type === "cross") return create_if_block_5;
    		if (ctx.type === "clock-big") return create_if_block_6;
    		if (ctx.type === "checkmark-big") return create_if_block_7;
    		if (ctx.type === "pen-big") return create_if_block_8;
    		if (ctx.type === "cross-big") return create_if_block_9;
    	}

    	let current_block_type = select_block_type(null, ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			if (if_block) if_block.c();
    			attr_dev(g, "stroke", "none");
    			attr_dev(g, "fill", "none");
    			add_location(g, file$2, 9, 1, 335);
    			attr_dev(svg, "width", svg_width_value = "" + (ctx.sizeIntern + "px"));
    			attr_dev(svg, "height", svg_height_value = "" + (ctx.sizeIntern + "px"));
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + ctx.sizeIntern + " " + ctx.sizeIntern);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "class", "svelte-1vvi5wg");
    			add_location(svg, file$2, 8, 0, 149);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			if (if_block) if_block.m(g, null);
    		},
    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g, null);
    				}
    			}

    			if (changed.sizeIntern && svg_width_value !== (svg_width_value = "" + (ctx.sizeIntern + "px"))) {
    				attr_dev(svg, "width", svg_width_value);
    			}

    			if (changed.sizeIntern && svg_height_value !== (svg_height_value = "" + (ctx.sizeIntern + "px"))) {
    				attr_dev(svg, "height", svg_height_value);
    			}

    			if (changed.sizeIntern && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + ctx.sizeIntern + " " + ctx.sizeIntern)) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { type = "arrow-left" } = $$props;
    	let { color = "#000" } = $$props;
    	let { size = "small" } = $$props;
    	const writable_props = ["type", "color", "size"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Ui_icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("type" in $$props) $$invalidate("type", type = $$props.type);
    		if ("color" in $$props) $$invalidate("color", color = $$props.color);
    		if ("size" in $$props) $$invalidate("size", size = $$props.size);
    	};

    	$$self.$capture_state = () => {
    		return { type, color, size, sizeIntern };
    	};

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate("type", type = $$props.type);
    		if ("color" in $$props) $$invalidate("color", color = $$props.color);
    		if ("size" in $$props) $$invalidate("size", size = $$props.size);
    		if ("sizeIntern" in $$props) $$invalidate("sizeIntern", sizeIntern = $$props.sizeIntern);
    	};

    	let sizeIntern;

    	$$self.$$.update = (changed = { size: 1 }) => {
    		if (changed.size) {
    			 $$invalidate("sizeIntern", sizeIntern = size === "big" ? 24 : 12);
    		}
    	};

    	return { type, color, size, sizeIntern };
    }

    class Ui_icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { type: 0, color: 0, size: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ui_icon",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get type() {
    		throw new Error("<Ui_icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Ui_icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Ui_icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Ui_icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Ui_icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Ui_icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ui/ui-button.svelte generated by Svelte v3.14.1 */
    const file$3 = "src/ui/ui-button.svelte";

    // (50:82) 
    function create_if_block_2$2(ctx) {
    	let current;

    	const uiicon = new Ui_icon({
    			props: { type: ctx.icon, color: ctx.color },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(uiicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(uiicon, target, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			const uiicon_changes = {};
    			if (changed.icon) uiicon_changes.type = ctx.icon;
    			if (changed.color) uiicon_changes.color = ctx.color;
    			uiicon.$set(uiicon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uiicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uiicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(uiicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(50:82) ",
    		ctx
    	});

    	return block;
    }

    // (48:2) {#if type === 'default' || type === 'icon-right' || type === 'dark' }
    function create_if_block_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(ctx.label);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (changed.label) set_data_dev(t, ctx.label);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(48:2) {#if type === 'default' || type === 'icon-right' || type === 'dark' }",
    		ctx
    	});

    	return block;
    }

    // (54:1) {#if type === 'icon-right' }
    function create_if_block$3(ctx) {
    	let span;
    	let i;
    	let current;

    	const uiicon = new Ui_icon({
    			props: { type: ctx.icon, color: ctx.color },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			create_component(uiicon.$$.fragment);
    			set_style(i, "display", "block");
    			set_style(i, "transform", "rotate(-90deg)");
    			add_location(i, file$3, 55, 3, 1186);
    			attr_dev(span, "class", "svelte-wjiqz1");
    			add_location(span, file$3, 54, 2, 1176);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);
    			mount_component(uiicon, i, null);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			const uiicon_changes = {};
    			if (changed.icon) uiicon_changes.type = ctx.icon;
    			if (changed.color) uiicon_changes.color = ctx.color;
    			uiicon.$set(uiicon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uiicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uiicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(uiicon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(54:1) {#if type === 'icon-right' }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let a;
    	let span;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let a_href_value;
    	let a_class_value;
    	let a_style_value;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block_1$2, create_if_block_2$2];
    	const if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.type === "default" || ctx.type === "icon-right" || ctx.type === "dark") return 0;
    		if (ctx.type === "icon" || ctx.type === "entry" || ctx.type === "entry has-stopwatch") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(null, ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block1 = ctx.type === "icon-right" && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(span, "class", "svelte-wjiqz1");
    			add_location(span, file$3, 46, 1, 911);
    			attr_dev(a, "href", a_href_value = ctx.link ? ctx.link : "#");
    			attr_dev(a, "class", a_class_value = "type-" + ctx.type + " " + (ctx.hovered ? "hovered" : "") + " " + (ctx.disabled ? "disabled" : "") + " svelte-wjiqz1");
    			attr_dev(a, "style", a_style_value = "color:" + ctx.color + ";");
    			attr_dev(a, "data-config", ctx.focusConfig);
    			attr_dev(a, "data-top", ctx.focusTop);
    			add_location(a, file$3, 36, 0, 608);

    			dispose = [
    				listen_dev(a, "click", ctx.click_handler, false, false, false),
    				listen_dev(a, "mouseenter", ctx.mouseenter_handler, false, false, false),
    				listen_dev(a, "mouseleave", ctx.mouseleave_handler, false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(span, null);
    			}

    			append_dev(a, t);
    			if (if_block1) if_block1.m(a, null);
    			ctx.a_binding(a);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(changed, ctx);
    				}
    			} else {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(span, null);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if (ctx.type === "icon-right") {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(a, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || changed.link && a_href_value !== (a_href_value = ctx.link ? ctx.link : "#")) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (!current || (changed.type || changed.hovered || changed.disabled) && a_class_value !== (a_class_value = "type-" + ctx.type + " " + (ctx.hovered ? "hovered" : "") + " " + (ctx.disabled ? "disabled" : "") + " svelte-wjiqz1")) {
    				attr_dev(a, "class", a_class_value);
    			}

    			if (!current || changed.color && a_style_value !== (a_style_value = "color:" + ctx.color + ";")) {
    				attr_dev(a, "style", a_style_value);
    			}

    			if (!current || changed.focusConfig) {
    				attr_dev(a, "data-config", ctx.focusConfig);
    			}

    			if (!current || changed.focusTop) {
    				attr_dev(a, "data-top", ctx.focusTop);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (if_block1) if_block1.d();
    			ctx.a_binding(null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { label = "No Label" } = $$props;
    	let { type = "default" } = $$props;
    	let { icon = "arrow-left" } = $$props;
    	let { hovered = false } = $$props;
    	let { color = "var(--c-blue)" } = $$props;
    	let { link = null } = $$props;
    	let { disabled = false } = $$props;
    	let { focusConfig = "EMPTY" } = $$props;
    	let { focusTop = null } = $$props;
    	let el, hover = false;

    	function click(e) {
    		if (!link) {
    			e.stopPropagation();
    			e.preventDefault();
    		}

    		dispatch("click", "");
    	}

    	function focus() {
    		el.focus();
    	}

    	const writable_props = [
    		"label",
    		"type",
    		"icon",
    		"hovered",
    		"color",
    		"link",
    		"disabled",
    		"focusConfig",
    		"focusTop"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Ui_button> was created with unknown prop '${key}'`);
    	});

    	function a_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate("el", el = $$value);
    		});
    	}

    	const click_handler = e => click(e);
    	const mouseenter_handler = e => $$invalidate("hover", hover = true);
    	const mouseleave_handler = e => $$invalidate("hover", hover = false);

    	$$self.$set = $$props => {
    		if ("label" in $$props) $$invalidate("label", label = $$props.label);
    		if ("type" in $$props) $$invalidate("type", type = $$props.type);
    		if ("icon" in $$props) $$invalidate("icon", icon = $$props.icon);
    		if ("hovered" in $$props) $$invalidate("hovered", hovered = $$props.hovered);
    		if ("color" in $$props) $$invalidate("color", color = $$props.color);
    		if ("link" in $$props) $$invalidate("link", link = $$props.link);
    		if ("disabled" in $$props) $$invalidate("disabled", disabled = $$props.disabled);
    		if ("focusConfig" in $$props) $$invalidate("focusConfig", focusConfig = $$props.focusConfig);
    		if ("focusTop" in $$props) $$invalidate("focusTop", focusTop = $$props.focusTop);
    	};

    	$$self.$capture_state = () => {
    		return {
    			label,
    			type,
    			icon,
    			hovered,
    			color,
    			link,
    			disabled,
    			focusConfig,
    			focusTop,
    			el,
    			hover
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate("label", label = $$props.label);
    		if ("type" in $$props) $$invalidate("type", type = $$props.type);
    		if ("icon" in $$props) $$invalidate("icon", icon = $$props.icon);
    		if ("hovered" in $$props) $$invalidate("hovered", hovered = $$props.hovered);
    		if ("color" in $$props) $$invalidate("color", color = $$props.color);
    		if ("link" in $$props) $$invalidate("link", link = $$props.link);
    		if ("disabled" in $$props) $$invalidate("disabled", disabled = $$props.disabled);
    		if ("focusConfig" in $$props) $$invalidate("focusConfig", focusConfig = $$props.focusConfig);
    		if ("focusTop" in $$props) $$invalidate("focusTop", focusTop = $$props.focusTop);
    		if ("el" in $$props) $$invalidate("el", el = $$props.el);
    		if ("hover" in $$props) $$invalidate("hover", hover = $$props.hover);
    	};

    	return {
    		label,
    		type,
    		icon,
    		hovered,
    		color,
    		link,
    		disabled,
    		focusConfig,
    		focusTop,
    		el,
    		hover,
    		click,
    		focus,
    		a_binding,
    		click_handler,
    		mouseenter_handler,
    		mouseleave_handler
    	};
    }

    class Ui_button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			label: 0,
    			type: 0,
    			icon: 0,
    			hovered: 0,
    			color: 0,
    			link: 0,
    			disabled: 0,
    			focusConfig: 0,
    			focusTop: 0,
    			focus: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ui_button",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (ctx.focus === undefined && !("focus" in props)) {
    			console.warn("<Ui_button> was created without expected prop 'focus'");
    		}
    	}

    	get label() {
    		throw new Error("<Ui_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Ui_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Ui_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Ui_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Ui_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Ui_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hovered() {
    		throw new Error("<Ui_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hovered(value) {
    		throw new Error("<Ui_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Ui_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Ui_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<Ui_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Ui_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Ui_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Ui_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusConfig() {
    		throw new Error("<Ui_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusConfig(value) {
    		throw new Error("<Ui_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusTop() {
    		throw new Error("<Ui_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusTop(value) {
    		throw new Error("<Ui_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focus() {
    		return this.$$.ctx.focus;
    	}

    	set focus(value) {
    		throw new Error("<Ui_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/sign-in/sign-up-view.svelte generated by Svelte v3.14.1 */
    const file$4 = "src/sign-in/sign-up-view.svelte";

    // (71:1) {#if isInvitation}
    function create_if_block_1$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "You followed an invitation email to slindo.com. Please set a passwort below, and you'll be added directly to the team.";
    			attr_dev(p, "class", "svelte-kdf1yt");
    			add_location(p, file$4, 71, 2, 1683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(71:1) {#if isInvitation}",
    		ctx
    	});

    	return block;
    }

    // (98:2) {#if !isInvitation}
    function create_if_block$4(ctx) {
    	let span;
    	let t0;
    	let a;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("or\n\t\t\t\t");
    			a = element("a");
    			a.textContent = "go to sign in";
    			attr_dev(a, "href", "/sign-in/");
    			add_location(a, file$4, 100, 4, 2332);
    			attr_dev(span, "class", "svelte-kdf1yt");
    			add_location(span, file$4, 98, 3, 2314);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, a);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(98:2) {#if !isInvitation}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div0;
    	let t0;
    	let section;
    	let h2;
    	let t1;
    	let t2_value = (ctx.isInvitation ? "your team" : "slindo") + "";
    	let t2;
    	let t3;
    	let t4;
    	let form;
    	let div1;
    	let updating_value;
    	let updating_error;
    	let t5;
    	let div2;
    	let updating_value_1;
    	let updating_error_1;
    	let t6;
    	let t7;
    	let t8;
    	let div3;
    	let current;
    	let dispose;
    	let if_block0 = ctx.isInvitation && create_if_block_1$3(ctx);

    	function uiinput0_value_binding(value) {
    		ctx.uiinput0_value_binding.call(null, value);
    	}

    	function uiinput0_error_binding(value_1) {
    		ctx.uiinput0_error_binding.call(null, value_1);
    	}

    	let uiinput0_props = {
    		label: "E-Mail",
    		type: "email",
    		disabled: ctx.isInvitation
    	};

    	if (ctx.email !== void 0) {
    		uiinput0_props.value = ctx.email;
    	}

    	if (ctx.emailError !== void 0) {
    		uiinput0_props.error = ctx.emailError;
    	}

    	const uiinput0 = new Ui_input({ props: uiinput0_props, $$inline: true });
    	binding_callbacks.push(() => bind(uiinput0, "value", uiinput0_value_binding));
    	binding_callbacks.push(() => bind(uiinput0, "error", uiinput0_error_binding));

    	function uiinput1_value_binding(value_2) {
    		ctx.uiinput1_value_binding.call(null, value_2);
    	}

    	function uiinput1_error_binding(value_3) {
    		ctx.uiinput1_error_binding.call(null, value_3);
    	}

    	let uiinput1_props = { label: "Password", type: "password" };

    	if (ctx.password !== void 0) {
    		uiinput1_props.value = ctx.password;
    	}

    	if (ctx.passwordError !== void 0) {
    		uiinput1_props.error = ctx.passwordError;
    	}

    	const uiinput1 = new Ui_input({ props: uiinput1_props, $$inline: true });
    	binding_callbacks.push(() => bind(uiinput1, "value", uiinput1_value_binding));
    	binding_callbacks.push(() => bind(uiinput1, "error", uiinput1_error_binding));

    	const uibutton = new Ui_button({
    			props: {
    				label: ctx.isInvitation
    				? "Join The Team"
    				: "Create New Account"
    			},
    			$$inline: true
    		});

    	uibutton.$on("click", ctx.click_handler);
    	let if_block1 = !ctx.isInvitation && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			section = element("section");
    			h2 = element("h2");
    			t1 = text("Sign up to ");
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			form = element("form");
    			div1 = element("div");
    			create_component(uiinput0.$$.fragment);
    			t5 = space();
    			div2 = element("div");
    			create_component(uiinput1.$$.fragment);
    			t6 = space();
    			create_component(uibutton.$$.fragment);
    			t7 = space();
    			if (if_block1) if_block1.c();
    			t8 = space();
    			div3 = element("div");
    			attr_dev(div0, "class", "spacer svelte-kdf1yt");
    			add_location(div0, file$4, 62, 0, 1537);
    			attr_dev(h2, "class", "svelte-kdf1yt");
    			add_location(h2, file$4, 66, 1, 1595);
    			attr_dev(div1, "class", "form-item svelte-kdf1yt");
    			add_location(div1, file$4, 78, 2, 1864);
    			attr_dev(div2, "class", "form-item svelte-kdf1yt");
    			add_location(div2, file$4, 86, 2, 2029);
    			add_location(form, file$4, 76, 1, 1825);
    			attr_dev(section, "class", "container svelte-kdf1yt");
    			add_location(section, file$4, 64, 0, 1565);
    			attr_dev(div3, "class", "spacer svelte-kdf1yt");
    			add_location(div3, file$4, 109, 0, 2422);
    			dispose = listen_dev(form, "keydown", ctx.keydown_handler, false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(section, t3);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t4);
    			append_dev(section, form);
    			append_dev(form, div1);
    			mount_component(uiinput0, div1, null);
    			append_dev(form, t5);
    			append_dev(form, div2);
    			mount_component(uiinput1, div2, null);
    			append_dev(form, t6);
    			mount_component(uibutton, form, null);
    			append_dev(form, t7);
    			if (if_block1) if_block1.m(form, null);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div3, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			if ((!current || changed.isInvitation) && t2_value !== (t2_value = (ctx.isInvitation ? "your team" : "slindo") + "")) set_data_dev(t2, t2_value);

    			if (ctx.isInvitation) {
    				if (!if_block0) {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(section, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			const uiinput0_changes = {};
    			if (changed.isInvitation) uiinput0_changes.disabled = ctx.isInvitation;

    			if (!updating_value && changed.email) {
    				updating_value = true;
    				uiinput0_changes.value = ctx.email;
    				add_flush_callback(() => updating_value = false);
    			}

    			if (!updating_error && changed.emailError) {
    				updating_error = true;
    				uiinput0_changes.error = ctx.emailError;
    				add_flush_callback(() => updating_error = false);
    			}

    			uiinput0.$set(uiinput0_changes);
    			const uiinput1_changes = {};

    			if (!updating_value_1 && changed.password) {
    				updating_value_1 = true;
    				uiinput1_changes.value = ctx.password;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			if (!updating_error_1 && changed.passwordError) {
    				updating_error_1 = true;
    				uiinput1_changes.error = ctx.passwordError;
    				add_flush_callback(() => updating_error_1 = false);
    			}

    			uiinput1.$set(uiinput1_changes);
    			const uibutton_changes = {};

    			if (changed.isInvitation) uibutton_changes.label = ctx.isInvitation
    			? "Join The Team"
    			: "Create New Account";

    			uibutton.$set(uibutton_changes);

    			if (!ctx.isInvitation) {
    				if (!if_block1) {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					if_block1.m(form, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uiinput0.$$.fragment, local);
    			transition_in(uiinput1.$$.fragment, local);
    			transition_in(uibutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uiinput0.$$.fragment, local);
    			transition_out(uiinput1.$$.fragment, local);
    			transition_out(uibutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			destroy_component(uiinput0);
    			destroy_component(uiinput1);
    			destroy_component(uibutton);
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div3);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let isInvitation = false,
    		email = "",
    		emailError = "",
    		password = "",
    		passwordError = "",
    		code = "";

    	onMount(() => {
    		const routerStoreData = get_store_value(routerStore);

    		const url = new URL(window.location.href),
    			urlEmail = url.searchParams.get("email"),
    			urlCode = url.searchParams.get("code");

    		if (urlEmail && urlCode) {
    			setTimeout(
    				() => {
    					$$invalidate("email", email = urlEmail.toLowerCase());
    					code = urlCode;
    					$$invalidate("isInvitation", isInvitation = true);
    				},
    				10
    			);
    		}
    	});

    	function signUp() {
    		authSignUp(email, password, code).then(res => {
    			authSignIn(email, password).then(() => page_js("/")).catch(() => page_js("/sign-in/"));
    		}).catch(err => {
    			if (err.code === "duplicate-key") {
    				$$invalidate("emailError", emailError = "This email already belongs to an account");
    			} else if (err.code === "email-not-valid") {
    				$$invalidate("emailError", emailError = "Please provide a correct email address");
    			} else if (err.code === "not-connected") {
    				$$invalidate("emailError", emailError = "Connection error to the server – please try again");
    			} else {
    				console.log("ERR", err);
    			}
    		});
    	}

    	function keydown(e) {
    		if (e.keyCode === 13) {
    			signUp();
    		}
    	}

    	function uiinput0_value_binding(value) {
    		email = value;
    		$$invalidate("email", email);
    	}

    	function uiinput0_error_binding(value_1) {
    		emailError = value_1;
    		$$invalidate("emailError", emailError);
    	}

    	function uiinput1_value_binding(value_2) {
    		password = value_2;
    		$$invalidate("password", password);
    	}

    	function uiinput1_error_binding(value_3) {
    		passwordError = value_3;
    		$$invalidate("passwordError", passwordError);
    	}

    	const click_handler = e => signUp();
    	const keydown_handler = e => keydown(e);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("isInvitation" in $$props) $$invalidate("isInvitation", isInvitation = $$props.isInvitation);
    		if ("email" in $$props) $$invalidate("email", email = $$props.email);
    		if ("emailError" in $$props) $$invalidate("emailError", emailError = $$props.emailError);
    		if ("password" in $$props) $$invalidate("password", password = $$props.password);
    		if ("passwordError" in $$props) $$invalidate("passwordError", passwordError = $$props.passwordError);
    		if ("code" in $$props) code = $$props.code;
    	};

    	return {
    		isInvitation,
    		email,
    		emailError,
    		password,
    		passwordError,
    		signUp,
    		keydown,
    		uiinput0_value_binding,
    		uiinput0_error_binding,
    		uiinput1_value_binding,
    		uiinput1_error_binding,
    		click_handler,
    		keydown_handler
    	};
    }

    class Sign_up_view extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sign_up_view",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/sign-in/sign-in-view.svelte generated by Svelte v3.14.1 */
    const file$5 = "src/sign-in/sign-in-view.svelte";

    // (49:1) {#if error.length > 0}
    function create_if_block$5(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(ctx.error);
    			add_location(p, file$5, 49, 2, 1037);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(changed, ctx) {
    			if (changed.error) set_data_dev(t, ctx.error);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(49:1) {#if error.length > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div0;
    	let t0;
    	let section;
    	let h2;
    	let t2;
    	let t3;
    	let form;
    	let div1;
    	let updating_value;
    	let updating_error;
    	let t4;
    	let div2;
    	let updating_value_1;
    	let updating_error_1;
    	let t5;
    	let t6;
    	let span;
    	let t7;
    	let a0;
    	let t9;
    	let div3;
    	let a1;
    	let t11;
    	let div4;
    	let current;
    	let dispose;
    	let if_block = ctx.error.length > 0 && create_if_block$5(ctx);

    	function uiinput0_value_binding(value) {
    		ctx.uiinput0_value_binding.call(null, value);
    	}

    	function uiinput0_error_binding(value_1) {
    		ctx.uiinput0_error_binding.call(null, value_1);
    	}

    	let uiinput0_props = { label: "E-Mail", type: "email" };

    	if (ctx.email !== void 0) {
    		uiinput0_props.value = ctx.email;
    	}

    	if (ctx.emailError !== void 0) {
    		uiinput0_props.error = ctx.emailError;
    	}

    	const uiinput0 = new Ui_input({ props: uiinput0_props, $$inline: true });
    	binding_callbacks.push(() => bind(uiinput0, "value", uiinput0_value_binding));
    	binding_callbacks.push(() => bind(uiinput0, "error", uiinput0_error_binding));

    	function uiinput1_value_binding(value_2) {
    		ctx.uiinput1_value_binding.call(null, value_2);
    	}

    	function uiinput1_error_binding(value_3) {
    		ctx.uiinput1_error_binding.call(null, value_3);
    	}

    	let uiinput1_props = { label: "Password", type: "password" };

    	if (ctx.password !== void 0) {
    		uiinput1_props.value = ctx.password;
    	}

    	if (ctx.passwordError !== void 0) {
    		uiinput1_props.error = ctx.passwordError;
    	}

    	const uiinput1 = new Ui_input({ props: uiinput1_props, $$inline: true });
    	binding_callbacks.push(() => bind(uiinput1, "value", uiinput1_value_binding));
    	binding_callbacks.push(() => bind(uiinput1, "error", uiinput1_error_binding));

    	const uibutton = new Ui_button({
    			props: { label: "Sign In" },
    			$$inline: true
    		});

    	uibutton.$on("click", ctx.click_handler);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			section = element("section");
    			h2 = element("h2");
    			h2.textContent = "Sign in to slindo";
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			form = element("form");
    			div1 = element("div");
    			create_component(uiinput0.$$.fragment);
    			t4 = space();
    			div2 = element("div");
    			create_component(uiinput1.$$.fragment);
    			t5 = space();
    			create_component(uibutton.$$.fragment);
    			t6 = space();
    			span = element("span");
    			t7 = text("or\n\t\t\t");
    			a0 = element("a");
    			a0.textContent = "create a new account";
    			t9 = space();
    			div3 = element("div");
    			a1 = element("a");
    			a1.textContent = "Send new password";
    			t11 = space();
    			div4 = element("div");
    			attr_dev(div0, "class", "spacer svelte-1tjxorm");
    			add_location(div0, file$5, 40, 0, 920);
    			attr_dev(h2, "class", "svelte-1tjxorm");
    			add_location(h2, file$5, 44, 1, 978);
    			attr_dev(div1, "class", "form-item svelte-1tjxorm");
    			add_location(div1, file$5, 56, 2, 1107);
    			attr_dev(div2, "class", "form-item svelte-1tjxorm");
    			add_location(div2, file$5, 63, 2, 1244);
    			attr_dev(a0, "href", "/sign-up/");
    			add_location(a0, file$5, 74, 3, 1468);
    			attr_dev(span, "class", "svelte-1tjxorm");
    			add_location(span, file$5, 72, 2, 1452);
    			add_location(form, file$5, 54, 1, 1068);
    			attr_dev(a1, "href", "/new-password/");
    			attr_dev(a1, "class", "svelte-1tjxorm");
    			add_location(a1, file$5, 81, 2, 1573);
    			attr_dev(div3, "class", "password-link svelte-1tjxorm");
    			add_location(div3, file$5, 80, 1, 1543);
    			attr_dev(section, "class", "container svelte-1tjxorm");
    			add_location(section, file$5, 42, 0, 948);
    			attr_dev(div4, "class", "spacer svelte-1tjxorm");
    			add_location(div4, file$5, 87, 0, 1647);
    			dispose = listen_dev(form, "keydown", ctx.keydown_handler, false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			append_dev(section, t2);
    			if (if_block) if_block.m(section, null);
    			append_dev(section, t3);
    			append_dev(section, form);
    			append_dev(form, div1);
    			mount_component(uiinput0, div1, null);
    			append_dev(form, t4);
    			append_dev(form, div2);
    			mount_component(uiinput1, div2, null);
    			append_dev(form, t5);
    			mount_component(uibutton, form, null);
    			append_dev(form, t6);
    			append_dev(form, span);
    			append_dev(span, t7);
    			append_dev(span, a0);
    			append_dev(section, t9);
    			append_dev(section, div3);
    			append_dev(div3, a1);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div4, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			if (ctx.error.length > 0) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(section, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const uiinput0_changes = {};

    			if (!updating_value && changed.email) {
    				updating_value = true;
    				uiinput0_changes.value = ctx.email;
    				add_flush_callback(() => updating_value = false);
    			}

    			if (!updating_error && changed.emailError) {
    				updating_error = true;
    				uiinput0_changes.error = ctx.emailError;
    				add_flush_callback(() => updating_error = false);
    			}

    			uiinput0.$set(uiinput0_changes);
    			const uiinput1_changes = {};

    			if (!updating_value_1 && changed.password) {
    				updating_value_1 = true;
    				uiinput1_changes.value = ctx.password;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			if (!updating_error_1 && changed.passwordError) {
    				updating_error_1 = true;
    				uiinput1_changes.error = ctx.passwordError;
    				add_flush_callback(() => updating_error_1 = false);
    			}

    			uiinput1.$set(uiinput1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uiinput0.$$.fragment, local);
    			transition_in(uiinput1.$$.fragment, local);
    			transition_in(uibutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uiinput0.$$.fragment, local);
    			transition_out(uiinput1.$$.fragment, local);
    			transition_out(uibutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    			if (if_block) if_block.d();
    			destroy_component(uiinput0);
    			destroy_component(uiinput1);
    			destroy_component(uibutton);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div4);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let email = "", emailError = "", password = "", passwordError = "", error = "";

    	function signIn() {
    		authSignIn(email, password).then(res => {
    			$$invalidate("error", error = "");
    			page_js("/");
    		}).catch(err => {
    			if (err.code === "user-not-found") {
    				$$invalidate("emailError", emailError = "Account not found");
    			} else if (err.code === "email-not-valid") {
    				$$invalidate("emailError", emailError = "Please provide a correct email address");
    			} else if (err.code === "not-connected") {
    				$$invalidate("emailError", emailError = "Connection error to the server – please try again");
    			} else if (err.code === "password-not-correct") {
    				$$invalidate("passwordError", passwordError = "Password does not match");
    			} else {
    				console.log("ERR", err);
    			}
    		});
    	}

    	function keydown(e) {
    		if (e.keyCode === 13) {
    			signIn();
    		}
    	}

    	function uiinput0_value_binding(value) {
    		email = value;
    		$$invalidate("email", email);
    	}

    	function uiinput0_error_binding(value_1) {
    		emailError = value_1;
    		$$invalidate("emailError", emailError);
    	}

    	function uiinput1_value_binding(value_2) {
    		password = value_2;
    		$$invalidate("password", password);
    	}

    	function uiinput1_error_binding(value_3) {
    		passwordError = value_3;
    		$$invalidate("passwordError", passwordError);
    	}

    	const click_handler = e => signIn();
    	const keydown_handler = e => keydown(e);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("email" in $$props) $$invalidate("email", email = $$props.email);
    		if ("emailError" in $$props) $$invalidate("emailError", emailError = $$props.emailError);
    		if ("password" in $$props) $$invalidate("password", password = $$props.password);
    		if ("passwordError" in $$props) $$invalidate("passwordError", passwordError = $$props.passwordError);
    		if ("error" in $$props) $$invalidate("error", error = $$props.error);
    	};

    	return {
    		email,
    		emailError,
    		password,
    		passwordError,
    		error,
    		signIn,
    		keydown,
    		uiinput0_value_binding,
    		uiinput0_error_binding,
    		uiinput1_value_binding,
    		uiinput1_error_binding,
    		click_handler,
    		keydown_handler
    	};
    }

    class Sign_in_view extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sign_in_view",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/sign-in/new-password-view.svelte generated by Svelte v3.14.1 */
    const file$6 = "src/sign-in/new-password-view.svelte";

    function create_fragment$6(ctx) {
    	let div0;
    	let t0;
    	let section;
    	let h2;
    	let t2;
    	let form;
    	let div1;
    	let updating_value;
    	let updating_error;
    	let t3;
    	let t4;
    	let span;
    	let t5;
    	let a;
    	let t7;
    	let div2;
    	let current;
    	let dispose;

    	function uiinput_value_binding(value) {
    		ctx.uiinput_value_binding.call(null, value);
    	}

    	function uiinput_error_binding(value_1) {
    		ctx.uiinput_error_binding.call(null, value_1);
    	}

    	let uiinput_props = { label: "E-Mail", type: "email" };

    	if (ctx.email !== void 0) {
    		uiinput_props.value = ctx.email;
    	}

    	if (ctx.emailError !== void 0) {
    		uiinput_props.error = ctx.emailError;
    	}

    	const uiinput = new Ui_input({ props: uiinput_props, $$inline: true });
    	binding_callbacks.push(() => bind(uiinput, "value", uiinput_value_binding));
    	binding_callbacks.push(() => bind(uiinput, "error", uiinput_error_binding));

    	const uibutton = new Ui_button({
    			props: { label: "Get New Password" },
    			$$inline: true
    		});

    	uibutton.$on("click", ctx.click_handler);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			section = element("section");
    			h2 = element("h2");
    			h2.textContent = "New password for Timetracker.One";
    			t2 = space();
    			form = element("form");
    			div1 = element("div");
    			create_component(uiinput.$$.fragment);
    			t3 = space();
    			create_component(uibutton.$$.fragment);
    			t4 = space();
    			span = element("span");
    			t5 = text("or\n\t\t\t");
    			a = element("a");
    			a.textContent = "go to sign in";
    			t7 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "spacer svelte-qqyd49");
    			add_location(div0, file$6, 36, 0, 647);
    			attr_dev(h2, "class", "svelte-qqyd49");
    			add_location(h2, file$6, 40, 1, 705);
    			attr_dev(div1, "class", "form-item svelte-qqyd49");
    			add_location(div1, file$6, 46, 2, 793);
    			attr_dev(a, "href", "/sign-in/");
    			add_location(a, file$6, 57, 3, 1022);
    			attr_dev(span, "class", "svelte-qqyd49");
    			add_location(span, file$6, 55, 2, 1006);
    			add_location(form, file$6, 44, 1, 754);
    			attr_dev(section, "class", "container svelte-qqyd49");
    			add_location(section, file$6, 38, 0, 675);
    			attr_dev(div2, "class", "spacer svelte-qqyd49");
    			add_location(div2, file$6, 65, 0, 1101);
    			dispose = listen_dev(form, "keydown", ctx.keydown_handler, false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			append_dev(section, t2);
    			append_dev(section, form);
    			append_dev(form, div1);
    			mount_component(uiinput, div1, null);
    			append_dev(form, t3);
    			mount_component(uibutton, form, null);
    			append_dev(form, t4);
    			append_dev(form, span);
    			append_dev(span, t5);
    			append_dev(span, a);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div2, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			const uiinput_changes = {};

    			if (!updating_value && changed.email) {
    				updating_value = true;
    				uiinput_changes.value = ctx.email;
    				add_flush_callback(() => updating_value = false);
    			}

    			if (!updating_error && changed.emailError) {
    				updating_error = true;
    				uiinput_changes.error = ctx.emailError;
    				add_flush_callback(() => updating_error = false);
    			}

    			uiinput.$set(uiinput_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uiinput.$$.fragment, local);
    			transition_in(uibutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uiinput.$$.fragment, local);
    			transition_out(uibutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    			destroy_component(uiinput);
    			destroy_component(uibutton);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div2);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {

    	let email = "", emailError = "", error = "";

    	function getNewPassword() {
    		authStoreNewPassword(email).then(res => {
    			
    		}).catch(err => {
    			if (err.code === "not-connected") {
    				$$invalidate("emailError", emailError = "Connection error to the server – please try again");
    			} else {
    				console.log("ERR", err);
    			}
    		});
    	}

    	function keydown(e) {
    		if (e.keyCode === 13) {
    			getNewPassword();
    		}
    	}

    	function uiinput_value_binding(value) {
    		email = value;
    		$$invalidate("email", email);
    	}

    	function uiinput_error_binding(value_1) {
    		emailError = value_1;
    		$$invalidate("emailError", emailError);
    	}

    	const click_handler = e => getNewPassword();
    	const keydown_handler = e => keydown(e);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("email" in $$props) $$invalidate("email", email = $$props.email);
    		if ("emailError" in $$props) $$invalidate("emailError", emailError = $$props.emailError);
    		if ("error" in $$props) error = $$props.error;
    	};

    	return {
    		email,
    		emailError,
    		getNewPassword,
    		keydown,
    		uiinput_value_binding,
    		uiinput_error_binding,
    		click_handler,
    		keydown_handler
    	};
    }

    class New_password_view extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "New_password_view",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/sign-in/account-view.svelte generated by Svelte v3.14.1 */
    const file$7 = "src/sign-in/account-view.svelte";

    // (74:1) {:else}
    function create_else_block_1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Loading…";
    			attr_dev(h2, "class", "svelte-1k4jq6t");
    			add_location(h2, file$7, 74, 2, 1723);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(74:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (65:46) 
    function create_if_block_3$1(ctx) {
    	let h2;
    	let t1;
    	let p;
    	let a;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "New password is set!";
    			t1 = space();
    			p = element("p");
    			a = element("a");
    			a.textContent = "Go to sign in page";
    			attr_dev(h2, "class", "svelte-1k4jq6t");
    			add_location(h2, file$7, 65, 2, 1607);
    			attr_dev(a, "href", "/sign-in/");
    			add_location(a, file$7, 69, 3, 1653);
    			add_location(p, file$7, 68, 2, 1646);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(65:46) ",
    		ctx
    	});

    	return block;
    }

    // (45:1) {#if subview === 'resetPassword'}
    function create_if_block$6(ctx) {
    	let h2;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$4, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_1(changed, ctx) {
    		if (ctx.error && ctx.error.length > 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Set password for Timetracker.One";
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(h2, "class", "svelte-1k4jq6t");
    			add_location(h2, file$7, 45, 2, 1112);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(changed, ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(45:1) {#if subview === 'resetPassword'}",
    		ctx
    	});

    	return block;
    }

    // (53:2) {:else}
    function create_else_block$1(ctx) {
    	let t0;
    	let form;
    	let updating_value;
    	let t1;
    	let current;
    	let dispose;
    	let if_block = ctx.confirmError && ctx.confirmError.length > 0 && create_if_block_2$3(ctx);

    	function uiinput_value_binding(value) {
    		ctx.uiinput_value_binding.call(null, value);
    	}

    	let uiinput_props = { label: "Password", type: "password" };

    	if (ctx.password !== void 0) {
    		uiinput_props.value = ctx.password;
    	}

    	const uiinput = new Ui_input({ props: uiinput_props, $$inline: true });
    	binding_callbacks.push(() => bind(uiinput, "value", uiinput_value_binding));

    	const uibutton = new Ui_button({
    			props: { label: "Set New Password" },
    			$$inline: true
    		});

    	uibutton.$on("click", ctx.click_handler);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			form = element("form");
    			create_component(uiinput.$$.fragment);
    			t1 = space();
    			create_component(uibutton.$$.fragment);
    			add_location(form, file$7, 58, 3, 1330);
    			dispose = listen_dev(form, "submit", prevent_default(ctx.submit_handler), false, false, true);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, form, anchor);
    			mount_component(uiinput, form, null);
    			append_dev(form, t1);
    			mount_component(uibutton, form, null);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			if (ctx.confirmError && ctx.confirmError.length > 0) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_2$3(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const uiinput_changes = {};

    			if (!updating_value && changed.password) {
    				updating_value = true;
    				uiinput_changes.value = ctx.password;
    				add_flush_callback(() => updating_value = false);
    			}

    			uiinput.$set(uiinput_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uiinput.$$.fragment, local);
    			transition_in(uibutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uiinput.$$.fragment, local);
    			transition_out(uibutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(form);
    			destroy_component(uiinput);
    			destroy_component(uibutton);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(53:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (49:2) {#if error && error.length > 0}
    function create_if_block_1$4(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(ctx.error);
    			add_location(p, file$7, 49, 3, 1198);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(changed, ctx) {
    			if (changed.error) set_data_dev(t, ctx.error);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(49:2) {#if error && error.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (54:3) {#if confirmError && confirmError.length > 0}
    function create_if_block_2$3(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(ctx.confirmError);
    			add_location(p, file$7, 54, 4, 1285);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(changed, ctx) {
    			if (changed.confirmError) set_data_dev(t, ctx.confirmError);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(54:3) {#if confirmError && confirmError.length > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let section;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$6, create_if_block_3$1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.subview === "resetPassword") return 0;
    		if (ctx.subview === "resetPasswordSuccess") return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if_block.c();
    			attr_dev(section, "class", "container svelte-1k4jq6t");
    			add_location(section, file$7, 42, 0, 1046);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if_blocks[current_block_type_index].m(section, null);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(section, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {

    	let password = "", error = "", confirmError = "", subview = "";

    	onMount(() => {
    		if (getUrlParameter("mode", window.location.href) === "resetPassword") {
    			const oobCode = getUrlParameter("oobCode", window.location.href);

    			authStoreVerifyPasswordCode(oobCode, err => {
    				$$invalidate("subview", subview = "resetPassword");

    				if (err) {
    					$$invalidate("error", error = err.message);
    				}
    			});
    		}
    	});

    	function setNewPassword(e) {
    		const oobCode = getUrlParameter("oobCode", window.location.href);

    		authStoreConfirmPasswordReset(oobCode, password, err => {
    			if (err) {
    				$$invalidate("confirmError", confirmError = err.message);
    			} else {
    				$$invalidate("subview", subview = "resetPasswordSuccess");
    			}
    		});
    	}

    	function uiinput_value_binding(value) {
    		password = value;
    		$$invalidate("password", password);
    	}

    	const click_handler = e => setNewPassword();
    	const submit_handler = e => setNewPassword();

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("password" in $$props) $$invalidate("password", password = $$props.password);
    		if ("error" in $$props) $$invalidate("error", error = $$props.error);
    		if ("confirmError" in $$props) $$invalidate("confirmError", confirmError = $$props.confirmError);
    		if ("subview" in $$props) $$invalidate("subview", subview = $$props.subview);
    	};

    	return {
    		password,
    		error,
    		confirmError,
    		subview,
    		setNewPassword,
    		uiinput_value_binding,
    		click_handler,
    		submit_handler
    	};
    }

    class Account_view extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Account_view",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/ui/ui-view-nav.svelte generated by Svelte v3.14.1 */
    const file$8 = "src/ui/ui-view-nav.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.link = list[i];
    	return child_ctx;
    }

    // (41:2) {#each links as link}
    function create_each_block(ctx) {
    	let li;
    	let a;
    	let span;
    	let t0_value = ctx.link.title + "";
    	let t0;
    	let a_href_value;
    	let a_class_value;
    	let link = ctx.link;
    	let t1;
    	let dispose;
    	const assign_a = () => ctx.a_binding(a, link);
    	const unassign_a = () => ctx.a_binding(null, link);

    	function mouseenter_handler(...args) {
    		return ctx.mouseenter_handler(ctx, ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "svelte-q3oom");
    			add_location(span, file$8, 48, 5, 1206);
    			attr_dev(a, "href", a_href_value = getLink(ctx.$routerStore, ctx.link.slug));

    			attr_dev(a, "class", a_class_value = "" + (null_to_empty(ctx.$routerStore.subview === ctx.link.slug
    			? "active"
    			: "") + " svelte-q3oom"));

    			attr_dev(a, "data-config", "MAIN_NAV");
    			add_location(a, file$8, 42, 4, 954);
    			attr_dev(li, "class", "svelte-q3oom");
    			add_location(li, file$8, 41, 3, 945);
    			dispose = listen_dev(a, "mouseenter", mouseenter_handler, false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, span);
    			append_dev(span, t0);
    			assign_a();
    			append_dev(li, t1);
    		},
    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if (changed.links && t0_value !== (t0_value = ctx.link.title + "")) set_data_dev(t0, t0_value);

    			if ((changed.$routerStore || changed.links) && a_href_value !== (a_href_value = getLink(ctx.$routerStore, ctx.link.slug))) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((changed.$routerStore || changed.links) && a_class_value !== (a_class_value = "" + (null_to_empty(ctx.$routerStore.subview === ctx.link.slug
    			? "active"
    			: "") + " svelte-q3oom"))) {
    				attr_dev(a, "class", a_class_value);
    			}

    			if (link !== ctx.link) {
    				unassign_a();
    				link = ctx.link;
    				assign_a();
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			unassign_a();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(41:2) {#each links as link}",
    		ctx
    	});

    	return block;
    }

    // (57:1) {#if activeEl}
    function create_if_block$7(ctx) {
    	let div;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "indicator svelte-q3oom");
    			attr_dev(div, "style", div_style_value = "left:" + (ctx.activeElOffset + 9) + "px;" + "width:" + (ctx.activeElWidth - 18) + "px;");
    			add_location(div, file$8, 57, 2, 1299);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(changed, ctx) {
    			if ((changed.activeElOffset || changed.activeElWidth) && div_style_value !== (div_style_value = "left:" + (ctx.activeElOffset + 9) + "px;" + "width:" + (ctx.activeElWidth - 18) + "px;")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(57:1) {#if activeEl}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let nav;
    	let ul;
    	let t0;
    	let t1;
    	let a;
    	let t2;
    	let a_href_value;
    	let nav_class_value;
    	let t3;
    	let div;
    	let div_class_value;
    	let each_value = ctx.links;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block = ctx.activeEl && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			a = element("a");
    			t2 = text("Settings");
    			t3 = space();
    			div = element("div");
    			attr_dev(ul, "class", "svelte-q3oom");
    			add_location(ul, file$8, 39, 1, 913);
    			attr_dev(a, "href", a_href_value = "/" + ctx.$routerStore.team + "/settings/-/");
    			attr_dev(a, "class", "settings svelte-q3oom");
    			add_location(a, file$8, 64, 1, 1439);
    			attr_dev(nav, "class", nav_class_value = "bp-" + ctx.$uiStore.breakpoint + " svelte-q3oom");
    			add_location(nav, file$8, 38, 0, 873);
    			attr_dev(div, "class", div_class_value = "spacer bp-" + ctx.$uiStore.breakpoint + " svelte-q3oom");
    			add_location(div, file$8, 68, 0, 1524);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(nav, t0);
    			if (if_block) if_block.m(nav, null);
    			append_dev(nav, t1);
    			append_dev(nav, a);
    			append_dev(a, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (changed.getLink || changed.$routerStore || changed.links || changed.ELEMENTS_MAP || changed.hoverEl) {
    				each_value = ctx.links;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (ctx.activeEl) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(nav, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (changed.$routerStore && a_href_value !== (a_href_value = "/" + ctx.$routerStore.team + "/settings/-/")) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (changed.$uiStore && nav_class_value !== (nav_class_value = "bp-" + ctx.$uiStore.breakpoint + " svelte-q3oom")) {
    				attr_dev(nav, "class", nav_class_value);
    			}

    			if (changed.$uiStore && div_class_value !== (div_class_value = "spacer bp-" + ctx.$uiStore.breakpoint + " svelte-q3oom")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getLink(routerStore, slug) {
    	return `/${routerStore.team}/${routerStore.view}/${routerStore.project}/${slug != "-" ? slug + "/" : ""}`;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $routerStore;
    	let $uiStore;
    	validate_store(routerStore, "routerStore");
    	component_subscribe($$self, routerStore, $$value => $$invalidate("$routerStore", $routerStore = $$value));
    	validate_store(uiStore, "uiStore");
    	component_subscribe($$self, uiStore, $$value => $$invalidate("$uiStore", $uiStore = $$value));
    	let { links = [] } = $$props;

    	let ROUTES = ["timelog", "reports", "settings"],
    		ELEMENTS_MAP = {},
    		activeEl = ELEMENTS_MAP.timelog,
    		hoverEl = ELEMENTS_MAP.timelog,
    		mousePosition = { x: 0, y: 0 };

    	onMount(() => {
    		setTimeout(
    			() => {
    				(($$invalidate("activeEl", activeEl), $$invalidate("ELEMENTS_MAP", ELEMENTS_MAP)), $$invalidate("$routerStore", $routerStore));
    			},
    			50
    		);
    	});

    	const writable_props = ["links"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Ui_view_nav> was created with unknown prop '${key}'`);
    	});

    	function a_binding($$value, link) {
    		if (ELEMENTS_MAP[link.slug] === $$value) return;

    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			ELEMENTS_MAP[link.slug] = $$value;
    			$$invalidate("ELEMENTS_MAP", ELEMENTS_MAP);
    		});
    	}

    	const mouseenter_handler = ({ link }, e) => $$invalidate("hoverEl", hoverEl = ELEMENTS_MAP[link.slug]);

    	$$self.$set = $$props => {
    		if ("links" in $$props) $$invalidate("links", links = $$props.links);
    	};

    	$$self.$capture_state = () => {
    		return {
    			links,
    			ROUTES,
    			ELEMENTS_MAP,
    			activeEl,
    			hoverEl,
    			mousePosition,
    			$routerStore,
    			activeElOffset,
    			activeElWidth,
    			$uiStore
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("links" in $$props) $$invalidate("links", links = $$props.links);
    		if ("ROUTES" in $$props) ROUTES = $$props.ROUTES;
    		if ("ELEMENTS_MAP" in $$props) $$invalidate("ELEMENTS_MAP", ELEMENTS_MAP = $$props.ELEMENTS_MAP);
    		if ("activeEl" in $$props) $$invalidate("activeEl", activeEl = $$props.activeEl);
    		if ("hoverEl" in $$props) $$invalidate("hoverEl", hoverEl = $$props.hoverEl);
    		if ("mousePosition" in $$props) mousePosition = $$props.mousePosition;
    		if ("$routerStore" in $$props) routerStore.set($routerStore = $$props.$routerStore);
    		if ("activeElOffset" in $$props) $$invalidate("activeElOffset", activeElOffset = $$props.activeElOffset);
    		if ("activeElWidth" in $$props) $$invalidate("activeElWidth", activeElWidth = $$props.activeElWidth);
    		if ("$uiStore" in $$props) uiStore.set($uiStore = $$props.$uiStore);
    	};

    	let activeElOffset;
    	let activeElWidth;

    	$$self.$$.update = (changed = { ELEMENTS_MAP: 1, $routerStore: 1, activeEl: 1 }) => {
    		if (changed.ELEMENTS_MAP || changed.$routerStore) {
    			 $$invalidate("activeEl", activeEl = ELEMENTS_MAP[$routerStore.subview] || ELEMENTS_MAP.timelog);
    		}

    		if (changed.activeEl) {
    			 $$invalidate("activeElOffset", activeElOffset = activeEl ? activeEl.getBoundingClientRect().left : 0);
    		}

    		if (changed.activeEl) {
    			 $$invalidate("activeElWidth", activeElWidth = activeEl ? activeEl.getBoundingClientRect().width : 0);
    		}
    	};

    	return {
    		links,
    		ELEMENTS_MAP,
    		activeEl,
    		hoverEl,
    		$routerStore,
    		activeElOffset,
    		activeElWidth,
    		$uiStore,
    		a_binding,
    		mouseenter_handler
    	};
    }

    class Ui_view_nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { links: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ui_view_nav",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get links() {
    		throw new Error("<Ui_view_nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set links(value) {
    		throw new Error("<Ui_view_nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/tasks/tasks-view.svelte generated by Svelte v3.14.1 */

    function create_fragment$9(ctx) {
    	let current;

    	const uiviewnav = new Ui_view_nav({
    			props: { links: ctx.LINKS },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(uiviewnav.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(uiviewnav, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uiviewnav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uiviewnav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(uiviewnav, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self) {
    	const LINKS = [{ title: "My Tasks", slug: "-" }, { title: "Tasks", slug: "tasks" }];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return { LINKS };
    }

    class Tasks_view extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tasks_view",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/times/times-view.svelte generated by Svelte v3.14.1 */

    function create_fragment$a(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("TIMES VIEW");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Times_view extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Times_view",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/settings/settings-view.svelte generated by Svelte v3.14.1 */

    function create_fragment$b(ctx) {
    	let t;
    	let current;

    	const uiviewnav = new Ui_view_nav({
    			props: { links: ctx.LINKS },
    			$$inline: true
    		});

    	const uibutton = new Ui_button({
    			props: { label: "Sign Out" },
    			$$inline: true
    		});

    	uibutton.$on("click", ctx.click_handler);

    	const block = {
    		c: function create() {
    			create_component(uiviewnav.$$.fragment);
    			t = text("\n\nSettings\n\n");
    			create_component(uibutton.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(uiviewnav, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(uibutton, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uiviewnav.$$.fragment, local);
    			transition_in(uibutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uiviewnav.$$.fragment, local);
    			transition_out(uibutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(uiviewnav, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(uibutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self) {
    	const LINKS = [{ title: "Account", slug: "-" }, { title: "Team", slug: "team" }];
    	const click_handler = e => authSignOut();

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return { LINKS, click_handler };
    }

    class Settings_view extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings_view",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.14.1 */

    // (124:0) {#if !resizing}
    function create_if_block$8(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$5, create_if_block_2$4, create_else_block_1$1];
    	const if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.$routerStore.view === "account") return 0;
    		if (ctx.$authStore.inited && !ctx.$authStore.hasAuth) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(124:0) {#if !resizing}",
    		ctx
    	});

    	return block;
    }

    // (136:1) {:else}
    function create_else_block_1$1(ctx) {
    	let switch_instance_anchor;
    	let current;
    	var switch_value = ctx.VIEWS[ctx.$routerStore.view];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			if (switch_value !== (switch_value = ctx.VIEWS[ctx.$routerStore.view])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(136:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (128:52) 
    function create_if_block_2$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3$2, create_if_block_4$1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type_1(changed, ctx) {
    		if (ctx.$routerStore.view === "sign-up") return 0;
    		if (ctx.$routerStore.view === "new-password") return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_1(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(changed, ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(128:52) ",
    		ctx
    	});

    	return block;
    }

    // (126:1) {#if $routerStore.view === 'account'}
    function create_if_block_1$5(ctx) {
    	let current;
    	const accountview = new Account_view({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(accountview.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(accountview, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accountview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accountview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(accountview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(126:1) {#if $routerStore.view === 'account'}",
    		ctx
    	});

    	return block;
    }

    // (133:2) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const signin = new Sign_in_view({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(signin.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(signin, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(signin.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(signin.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(signin, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(133:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (131:49) 
    function create_if_block_4$1(ctx) {
    	let current;
    	const newpasswordview = new New_password_view({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(newpasswordview.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(newpasswordview, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(newpasswordview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(newpasswordview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(newpasswordview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(131:49) ",
    		ctx
    	});

    	return block;
    }

    // (129:2) {#if $routerStore.view === 'sign-up'}
    function create_if_block_3$2(ctx) {
    	let current;
    	const signup = new Sign_up_view({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(signup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(signup, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(signup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(signup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(signup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(129:2) {#if $routerStore.view === 'sign-up'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let t;
    	let current;
    	let dispose;
    	let if_block = !ctx.resizing && create_if_block$8(ctx);
    	const uifocus = new Ui_focus({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(uifocus.$$.fragment);
    			dispose = listen_dev(window, "resize", ctx.resize_handler, false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(uifocus, target, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			if (!ctx.resizing) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(uifocus.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(uifocus.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(uifocus, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $routerStore;
    	let $authStore;
    	validate_store(routerStore, "routerStore");
    	component_subscribe($$self, routerStore, $$value => $$invalidate("$routerStore", $routerStore = $$value));
    	validate_store(authStore, "authStore");
    	component_subscribe($$self, authStore, $$value => $$invalidate("$authStore", $authStore = $$value));
    	let resizing = false, debounceTimeout;

    	const VIEWS = {
    		tasks: Tasks_view,
    		times: Times_view,
    		settings: Settings_view
    	};

    	const MODELS = {
    		"teams": {
    			col: "teams",
    			attributes: { title: "", members: {} },
    			indexes: []
    		},
    		"settings": {
    			col: "settings",
    			attributes: {
    				language: "EN",
    				stopwatchEntryId: null,
    				stopwatchStartTime: 0
    			},
    			indexes: []
    		},
    		"times": {
    			col: "times",
    			attributes: {
    				duration: 0,
    				day: 20000000,
    				task: null,
    				comment: "",
    				user: null,
    				team: null
    			},
    			indexes: [["day", "team"], ["task", "team"], ["user", "team"]]
    		},
    		"tasks": {
    			col: "tasks",
    			attributes: {
    				title: "",
    				project: null,
    				color: "#333",
    				archived: false,
    				user: null,
    				team: null
    			},
    			indexes: [["team"], ["project", "team"]]
    		}
    	};

    	onMount(async () => {
    		uiStoreInit();
    		uiStoreSetBreakpoint(getWindowWidth());

    		await sws$1.init({
    			server: "ws://localhost:8080",
    			models: MODELS
    		});

    		authInit();
    		timesStoreInit();
    		tasksStoreInit();
    		userStoreInit();
    		teamStoreInit();
    		reportsStoreInit();
    	});

    	function resize() {
    		clearTimeout(debounceTimeout);

    		debounceTimeout = setTimeout(
    			() => {
    				setTimeout(
    					() => {
    						$$invalidate("resizing", resizing = false);
    					},
    					10
    				);

    				uiStoreSetBreakpoint(getWindowWidth());
    			},
    			300
    		);
    	}

    	const resize_handler = e => resize();

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("resizing" in $$props) $$invalidate("resizing", resizing = $$props.resizing);
    		if ("debounceTimeout" in $$props) debounceTimeout = $$props.debounceTimeout;
    		if ("$routerStore" in $$props) routerStore.set($routerStore = $$props.$routerStore);
    		if ("$authStore" in $$props) authStore.set($authStore = $$props.$authStore);
    	};

    	return {
    		resizing,
    		VIEWS,
    		resize,
    		$routerStore,
    		$authStore,
    		resize_handler
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
