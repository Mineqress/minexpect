import * as assert from "assert"
function fail(options?: {
    message?: string;
    actual?: unknown;
    expected?: unknown;
    operator?: string;
    stackStartFn?: Function;
}): never {
    throw new assert.AssertionError(options)
}
class Expect<T> {
    private actualValue: T | undefined | null
    private timeoutId: NodeJS.Timeout = null;
    private expectedValue?: T | undefined | null = null
    private unregisterEvent: (retry: (newValue: T) => void) => void;
    private retry: (newValue: T) => void
    private assertion: (expectedValue?: any) => Promise<void> | void | never;
    private endAssertion : () => void | undefined;
    private timeout: number;
    constructor(actualValue: T | undefined | null, registerEvent: (retry: (newValue: T) => void) => void, unregisterEvent: (retry: (newValue: T) => void) => void, timeout: number = 5000) {
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
        this.timeout = timeout;
    }
    
    assert(expectedValue: any = this.expectedValue, 
        condition: (expectedValue: any, actualValue: T) => boolean, 
        failMessageBuilder: (expectedValue: any, actualValue: T) => string,
        operator?: string)
        : Promise<void> | void | never
        {
            this.expectedValue = expectedValue
            if(!condition(expectedValue, this.actualValue)){
                if(!this.timeoutId){
                    return new Promise<void>((resolve, reject) => {
                        this.endAssertion = resolve;
                        this.timeoutId = setTimeout(() => {
                            reject(new assert.AssertionError({
                                expected: expectedValue,
                                actual: this.actualValue,
                                operator,
                                message: failMessageBuilder(expectedValue, this.actualValue)
                            }))
                        }, this.timeout)
                    })
                    
                }
            } else {
                this.unregisterEvent(this.retry);
                if(this.timeoutId){
                    clearTimeout(this.timeoutId);
                    this.timeoutId = null;
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
            (expectedValue, actualValue) => "Expected \"" + expectedValue + "\"\n Actual: \"" + actualValue + "\"",
            "=="
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
            (expectedValue, actualValue) => "Strict Equals: \nExpected \"" + expectedValue + "\n Actual: \"" + actualValue + "\"\n",
            "==="
        )
    }

    toBeLessThan(expectedValue?: number): Promise<void> | void | never {

        if(typeof this.actualValue == "number" && typeof expectedValue == "number"){
            this.assertion = this.toBeLessThan;
            return this.assert(expectedValue, 
                (expectedValue, actualValue) => ((actualValue as unknown) as number) < ((expectedValue as unknown) as number), 
                (expectedValue, actualValue) => 'Expected ' + actualValue + ' to be less than ' + expectedValue,
                "<"
            )
        } else {
            throw "toBeLessThan only makes sense on numbers"
        }
    }

    toBeGreaterThan(expectedValue?: number): Promise<void> | void | never {
        if(typeof this.actualValue == "number" && typeof expectedValue == "number"){
            this.assertion = this.toBeGreaterThan;
            return this.assert(expectedValue, 
                (expectedValue, actualValue) => ((actualValue as unknown) as number) > ((expectedValue as unknown) as number), 
                (expectedValue, actualValue) => 'Expected ' + actualValue + ' to be greater than ' + expectedValue,
                ">"
            )
        } else {
            throw "toBeGreaterThan only makes sense on numbers"
        }
    }
    toContain(expectedValue?: T): Promise<void> | void | never {
        if(typeof this.actualValue == "string" && typeof expectedValue == "string"){
            this.assertion = this.toContain;
            return this.assert(expectedValue, 
                (expectedValue, actualValue) => ((actualValue as unknown) as string).includes((expectedValue as unknown) as string), 
                (expectedValue, actualValue) => 'Expected "' + actualValue + '" to contain "' + expectedValue + '"' 
            )
        } else if(this.actualValue instanceof Array && expectedValue instanceof Array){
            this.assertion = this.toContain;
            return this.assert(expectedValue, 
                (expectedValue, actualValue) => ((actualValue as unknown) as Array<unknown>).includes(expectedValue), 
                (expectedValue, actualValue) => 'Expected "' + actualValue + '" to contain "' + expectedValue + '"' 
            )
        } else {
            throw "toContain only makes sense on strings and arrays"
        }
    }
    toMatchRegex(regex: RegExp): Promise<void> | void | never {
        if(typeof this.actualValue == "string"){
            this.assertion = this.toMatchRegex;
            return this.assert(regex.source, 
                (_, actualValue) => (actualValue as unknown as string).match(regex) != null, 
                (_, actualValue) => `Expected ${actualValue} to match ${regex}`
            )
        } else {
            throw `Expected string type, found "${typeof this.actualValue}"`
        }
    }
}

export {fail, Expect}
