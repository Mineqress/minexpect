const { AssertionError } = require("assert")
const { Expect } = require("..")
describe("Matchers", () => {
    
    describe("number", () => {
        describe("greater than", () => {
            let expectObj;
            beforeEach(() => {
                expectObj = new Expect(69, () => {}, () => {}, 1000);
            })
            it("should pass if actualValue > expectedValue", () => {
                expect(expectObj.toBeGreaterThan(30)).toBeUndefined()
            })
            it("should fail if actualValue <= expectedValue", async() => {
                await expect(expectObj.toBeGreaterThan(100)).rejects.toBeInstanceOf(AssertionError)
            })
            it("should fail if the actual value is not a number", () => {
                expect(() => {
                    expectObj.toBeGreaterThan("30")
                }).toThrow()
            })
        })
        describe("less than", () => {
            let expectObj;
            beforeEach(() => {
                expectObj = new Expect(69, () => {}, () => {}, 1000);
            })
            it("should pass if actualValue < expectedValue", () => {
                expect(expectObj.toBeLessThan(100)).toBeUndefined()
            })
            it("should fail if actualValue >= expectedValue", async() => {
                await expect(expectObj.toBeLessThan(30)).rejects.toBeInstanceOf(AssertionError)
            })
            it("should fail if the actual value is not a number", () => {
                expect(() => {
                    expectObj.toBeLessThan("30")
                }).toThrow()
            })
        })
    })
    describe("equals", () => {
        let expectObj;
        beforeEach(() => {
            expectObj = new Expect("This is some text", () => {}, () => {}, 1000);
        })
        it("should pass if actualValue == expectedValue", () => {
            expect(expectObj.toBe("This is some text")).toBeUndefined()
        })
        it("should fail if actualValue != expectedValue", async() => {
            await expect(expectObj.toBe("This should fail")).rejects.toBeInstanceOf(AssertionError)
        })
    })
    describe("strings", () => {
        let expectObj;
        beforeEach(() => {
            expectObj = new Expect("This is some text", () => {}, () => {}, 1000);
        })
        describe("contain", () => {
            it("should pass if it the string contains the passed string", () => {
                expect(expectObj.toContain("some text")).toBeUndefined()
            })
            it("should fail if it the string does NOT contain the passed string", async() => {
                await expect(expectObj.toContain("not contain")).rejects.toBeInstanceOf(AssertionError)
            })
        })
        describe("match regex", () => {
            it("should pass if it the regex matches the string", () => {
                expect(expectObj.toMatchRegex(/This is some text/)).toBeUndefined()
            })
            it("should fail if it the regex does NOT match the string", async() => {
                await expect(expectObj.toMatchRegex(/something/)).rejects.toBeInstanceOf(AssertionError)
            })
        })
    })
    it.todo("strict equal")
})