import { AssertionError } from "./assertion-error"

function fail(message){
    console.log("message")
    throw new AssertionError(message)
}
class Expect<T> {
    private actualValue: T | undefined | null
    private timeoutId: number = -1;
    private expectedValue?: T | undefined | null = null
    private unregisterEvent: (retry: (newValue: T) => void) => void;
    private retry: (newValue: T) => void
    private assertion: (expectedValue?: T) => void;
    private endAssertion : () => void | undefined;
    constructor(actualValue: T | undefined | null, registerEvent: (retry: (newValue: T) => void) => void, unregisterEvent: (retry: (newValue: T) => void) => void) {
        const retry = (newValue: T) => {
            this.actualValue = newValue;
            if(this.expectedValue != null){
                this.assertion()
            }
        }
        this.actualValue = actualValue;
        registerEvent(retry);
        this.unregisterEvent = unregisterEvent;
        this.retry = retry;
    }
    
    assert(expectedValue: T = this.expectedValue, condition: (expectedValue: T, actualValue: T) => boolean, failMessageBuilder: (expectedValue: T, actualValue: T) => string){
            this.expectedValue = expectedValue
            if(!condition(expectedValue, this.actualValue)){
                if(this.timeoutId == -1){
                    return new Promise<void>(resolve => {
                        this.endAssertion = resolve;
                        this.timeoutId = setTimeout(() => {
                            fail(failMessageBuilder(expectedValue, this.actualValue))
                        }, 2000)
                    })
                    
                }
            } else {
                this.unregisterEvent(this.retry);
                if(this.timeoutId != -1){
                    clearTimeout(this.timeoutId);
                    this.timeoutId = -1;
                }
                if(this.endAssertion){
                    this.endAssertion();
                }
            }
        
    }
    toBe(expectedValue: T) {
        this.assertion = this.toBe;
        return this.assert(expectedValue, 
            (expectedValue, actualValue) => expectedValue == actualValue, 
            (expectedValue, actualValue) => "Expected \"" + expectedValue + "\n Actual: \"" + actualValue + "\""
        )
    }
}

export {fail, Expect}