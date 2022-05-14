# MinExpect
Assert library made for Minepress

This library is based on retry-and-timeout logic
```js
await new Expect(
    this.lastMsg,  // Initial Value
    (retry) => { // Register Event Handler
        // Here the event handler  must call the retry method to well
        // Retry the check
        this.bot?.on("messagestr", retry);
    },
    (retry) => { // Dispose Event Handler
        // This is called after the check has been successful
        // it is expected to remove the event handler
        this.bot?.removeListener("messagestr", retry)
    }).toBe("<Bot> Test")
```
