



const _results = [];
let _testSubject = 'It';

class _TestEvent extends EventTarget{}
const _testEvent = new _TestEvent();

export const EVENTS = class{
    static NEW_TEST_RESULT = "newTestResult";
    static NEW_TEST_SUBJECT = "newTestSubject";
};

export class TestResult{
    constructor(description, func, success, errorMessage=null) {
        this.description = description;
        this.func = func;
        this.success = success;
        this.errorMessage = errorMessage;
    }
}

export function getTestResults(){
    return _results;
}

export function getTestEvents(){
    return _testEvent;
}

export function setTestSubject(testSubject){
    _testSubject = testSubject;
    _testEvent.dispatchEvent(new Event(EVENTS.NEW_TEST_SUBJECT));
}

export function getTestSubject(){
    return _testSubject;
}

export function it(description, func){
    description = _testSubject + ' ' + description;
    let success = true;
    let errorMessage = null;
    try{
        func();
        console.log(`> ${description}`);
    }catch(error){
        success = false
        errorMessage = error;
        console.error(`> ${description}: \t${errorMessage}`);
    }
    let testResult = new TestResult(description, func, success, errorMessage);
    _results.push(testResult);
    _testEvent.dispatchEvent(new Event(EVENTS.NEW_TEST_RESULT));
}

export function assert(success){
    if(!success)
        throw new Error('Assert failed');
}