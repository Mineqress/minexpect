import { AssertionError } from "./assertion-error"

function fail_test(message){
    throw new AssertionError(message)
}
export {fail_test}