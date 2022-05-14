// This is from assertion-error of chai
// I'm not the owner of this code

const canElideFrames = 'captureStackTrace' in Error;
const startStackFrames = new WeakMap();
class AssertionError extends Error {
    constructor(message = 'Unspecified AssertionError', props, ssf) {
        super(message);
        this.message = message;
        if (canElideFrames && ssf)
            startStackFrames.set(this, ssf);
        for (const key in props) {
            if (!(key in this)) {
                this[key] = props[key];
            }
        }
    }
    get name() {
        return 'AssertionError';
    }
    get ok() {
        return false;
    }
    get stack() {
        if (canElideFrames) {
            return Error.captureStackTrace(this, startStackFrames.get(this) || AssertionError);
        }
        else {
            return super.stack;
        }
    }
    toJSON(stack) {
        return Object.assign(Object.assign({}, this), { name: this.name, message: this.message, ok: false, stack: stack !== false ? this.stack : undefined });
    }
}
class AssertionResult {
    get name() {
        return 'AssertionResult';
    }
    get ok() {
        return true;
    }
    constructor(props) {
        for (const key in props) {
            if (!(key in this)) {
                this[key] = props[key];
            }
        }
    }
    toJSON() {
        return Object.assign(Object.assign({}, this), { name: this.name, ok: this.ok });
    }
}
module.exports = {
    AssertionError,
    AssertionResult
}