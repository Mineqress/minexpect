import { AssertionError } from "./assertion-error"

function fail(message): never {
    throw new AssertionError(message)
}
class Expect<T> {
    private actualValue: T | undefined | null
    private timeoutId: number = -1;
    private expectedValue?: T | undefined | null = null
    private unregisterEvent: (retry: (newValue: T) => void) => void;
    private retry: (newValue: T) => void
    private assertion: (expectedValue?: T) => Promise<void> | void | never;
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
    
    assert(expectedValue: T = this.expectedValue, 
        condition: (expectedValue: T, actualValue: T) => boolean, 
        failMessageBuilder: (expectedValue: T, actualValue: T) => string)
        : Promise<void> | void | never
        {
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
    /**
     * Checks if the actual value is the expected value using == operator
     * @param expectedValue The value that is expected
     */
    toBe(expectedValue?: T): Promise<void> | void | never {
        this.assertion = this.toBe;
        return this.assert(expectedValue, 
            (expectedValue, actualValue) => expectedValue == actualValue, 
            (expectedValue, actualValue) => "Expected \"" + expectedValue + "\n Actual: \"" + actualValue + "\""
        )
    }
    /**
     * Checks if the actual value is the expected value using strict equals (===) operator
     * @param expectedValue The value that is expected
     */
     toStrictEqual(expectedValue?: T): Promise<void> | void | never {
        this.assertion = this.toStrictEqual;
        return this.assert(expectedValue, 
            (expectedValue, actualValue) => expectedValue === actualValue, 
            (expectedValue, actualValue) => "Strict Equals: \nExpected \"" + expectedValue + "\n Actual: \"" + actualValue + "\"\n"
        )
    }

    toBeLessThan(expectedValue?: T): Promise<void> | void | never {
        if(typeof this.actualValue == "number"){
            this.assertion = this.toBeLessThan;
            return this.assert((expectedValue as unknown) as T, 
                (expectedValue, actualValue) => ((actualValue as unknown) as number) < ((expectedValue as unknown) as number), 
                (expectedValue, actualValue) => 'Expected ' + actualValue + ' to be less than ' + expectedValue
            )
        } else {
            fail("toBeLessThan only makes sense on numbers")
        }
    }

    toBeGreaterThan(expectedValue?: T): Promise<void> | void | never {
        if(typeof this.actualValue == "number"){
            this.assertion = this.toBeGreaterThan;
            return this.assert((expectedValue as unknown) as T, 
                (expectedValue, actualValue) => ((actualValue as unknown) as number) > ((expectedValue as unknown) as number), 
                (expectedValue, actualValue) => 'Expected ' + actualValue + ' to be greater than ' + expectedValue
            )
        } else {
            fail("toBeGreaterThan only makes sense on numbers")
        }
    }
    toContain(expectedValue?: T): Promise<void> | void | never {
        if(typeof this.actualValue == "string"){
            this.assertion = this.toContain;
            return this.assert((expectedValue as unknown) as T, 
                (expectedValue, actualValue) => ((actualValue as unknown) as string).includes((expectedValue as unknown) as string), 
                (expectedValue, actualValue) => 'Expected "' + actualValue + '" to contain "' + expectedValue + '"' 
            )
        } else {
            fail("toContain only makes sense on strings and arrays")
        }
    }
}

export {fail, Expect}