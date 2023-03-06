
console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    // console.log("Message received", msg);
    if (port.name === "midpage") {
      if (msg.class) {
        const classToQuery = msg.class;
        console.log("Class name to be queried: \n", classToQuery);
        const texts = document.getElementsByClassName(classToQuery);
        if (texts.length > 0) {
          port.postMessage({
            text: texts[0].innerHTML,
          });
        } else {
          port.postMessage({
            text: "None",
          });
        }
      } else if (msg.answer) {
        const answer = msg.answer
        console.log("Answer", answer);
        console.log("Tab ID", msg.tabId);
        const defaultText = document.getElementById("default-text")
        defaultText.style.backgroundColor = "yellow";
        console.log("Default-Text data", defaultText.innerHTML.slice(answer.snippet.start_position, answer.snippet.start_position+25));
        // chrome.tabs.executeScript(msg.tabId, {
        //     file: 'highlight.js',
        // })

        // const innerFunction = () => chrome.tabs.executeScript(msg.tabId, {file: 'highlight.js'});

        // chrome.tabs.executeScript(msg.tabId, {
        //   code: 'var answer = ' + answer
        // }, () => {
        //   chrome.tabs.executeScript(msg.tabId, {file: 'highlight.js'});
          // innerFunction();
        // });
      }
    }
  });
});
