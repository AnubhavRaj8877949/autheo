
export class Exception {
    constructor(internal, code = 0) {
        this.code = code;
        this.internal = internal;
    }
}

export class Response {
    constructor(data, message = '') {
        this.data = data;
        this.message = message;
    }
}

export class Result {
    constructor(data, ok = true, exception = null) {
        this.ok = ok;
        this.data = data;
        this.exception = exception;
    }
};