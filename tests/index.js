import {getTestEvents, getTestResults, getTestSubject, EVENTS as TEST_EVENTS} from "./test-utils.js";
import {testAll as testAllVideo} from "./models/video.js";
import {testAll as testAllVideoCollection} from "./models/video-collection.js";
import {testAll as testAllVideoHistory} from "./models/video-history.js";
import {testAll as testAllVideoQueue} from "./models/video-queue.js";


function updateTestResults(){
    let testResult = getTestResults().pop();
    let showEl = document.createElement('DIV');
    showEl.classList.add(testResult.success ? 'success' : 'error');
    showEl.innerText = `> ${testResult.description}\t`;
    if(testResult.errorMessage)
        showEl.innerHTML += `<span class='error-message'>${testResult.errorMessage}</span>`;
    document.body.appendChild(showEl);
}

function updateTestSubject(){
    document.body.innerHTML += `<div class='subject'>${getTestSubject()}</div>`;
}

function testAll(){
    getTestEvents().addEventListener(TEST_EVENTS.NEW_TEST_RESULT, updateTestResults);
    getTestEvents().addEventListener(TEST_EVENTS.NEW_TEST_SUBJECT, updateTestSubject);

    testAllVideo();
    testAllVideoCollection();
    testAllVideoHistory();
    testAllVideoQueue();
}

testAll();
