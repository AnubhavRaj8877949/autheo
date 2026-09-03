import axios from 'axios';
import { Result, Response, Exception } from '../../internal/result';
import { EXCEPTION_CODES } from '../../constants';

export class HttpRequest {
    constructor(url = '') {
        this._config = {
            url,
            method: 'get',
            data: null,
            headers: {},
            params: {},
        };
        this._key = null;
    }

    setUrl(url) {
        this._config.url = url;
        return this;
    }

    setMethod(method) {
        this._config.method = method.toLowerCase();
        return this;
    }

    setData(data) {
        this._config.data = data;
        return this;
    }

    setParams(params) {
        this._config.params = { ...this._config.params, ...params };
        return this;
    }

    setHeader(key, value) {
        this._config.headers[key] = value;
        return this;
    }

    setHeaders(headers) {
        this._config.headers = { ...this._config.headers, ...headers };
        return this;
    }

    /**
     * Set a custom key for this request to track and cancel it easily.
     */
    setKey(key) {
        this._key = key;
        return this;
    }

    build() {
        return {
            config: this._config,
            key: this._key,
        };
    }
}

class HttpRequestHandler {
    constructor(timeout = 15000, headers = null) {
        if (HttpRequestHandler.instance) {
            return HttpRequestHandler.instance;
        }

        this.client = axios.create({
            timeout,
            headers: headers || {
                'Content-Type': 'application/json',
            },
        });

        // Map to store AbortControllers for active requests
        this.controllers = new Map();

        HttpRequestHandler.instance = this;
    }

    /**
     * Sets up an AbortController for a request, cancelling any previous pending request with the same key
     * @param {string} requestKey 
     * @returns {AbortController}
     */
    _setupController(requestKey) {
        if (this.controllers.has(requestKey)) {
            this.controllers.get(requestKey).abort();
        }
        const controller = new AbortController();
        this.controllers.set(requestKey, controller);
        return controller;
    }

    /**
     * Removes the controller from the tracking map once the request finishes
     * @param {string} requestKey 
     */
    _removeController(requestKey) {
        this.controllers.delete(requestKey);
    }

    /**
     * Performs a single http request
     * @param {HttpRequest} request 
     */
    async execute(request) {
        const { config, key } = request;
        const { method, url, data, ...restConfig } = config;

        if (key) {
            const controller = this._setupController(key);
            restConfig.signal = controller.signal;
        }

        try {
            const response = await this.client({
                method,
                url,
                data,
                ...restConfig,
            });
            if (key) this._removeController(key);

            const responseData = new Response(response.data, response.statusText);
            return new Result(responseData);
        } catch (error) {
            if (key) this._removeController(key);
            if (axios.isCancel(error)) {
                return new Result(null, false, new Exception(error.message, EXCEPTION_CODES.CANCELLED_REQUEST));
            }

            const statusCode = error.response ? error.response.status : 0;
            const exception = new Exception(error.response?.data || error.message, statusCode);
            return new Result(null, false, exception);
        }
    }

    /**
     * Performs multiple http requests simultaneously
     * @param {HttpRequest[]} requests 
     */
    async executeMultiple(requests) {
        return Promise.all(requests.map((request) => this.execute(request)));
    }

    /**
     * Cancels a pending request by its key
     * @param {string} requestKey
     */
    cancelRequest(requestKey) {
        if (this.controllers.has(requestKey)) {
            this.controllers.get(requestKey).abort();
            this.controllers.delete(requestKey);
        }
    }

    /**
     * Cancels all pending requests
     */
    cancelAll() {
        for (const [key, controller] of this.controllers.entries()) {
            controller.abort();
            this.controllers.delete(key);
        }
    }
}

const requestHandler = new HttpRequestHandler();
Object.freeze(requestHandler);
export default requestHandler;
