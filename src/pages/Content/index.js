
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
        const getStartEnd = (str, sub) => [str.indexOf(sub), str.indexOf(sub) + sub.length - 1]
        console.log("Answer", answer);
        console.log("Tab ID", msg.tabId);
        console.log("Document:", msg.answer.document);
        // const defaultText = document.getElementById("default-text")
        // defaultText.style.backgroundColor = "yellow";
        const texts = document.getElementsByClassName("plaintext");
        const [start, end] = getStartEnd(texts[0].innerHTML, answer.text)
        const [alternateStart, alternateEnd] = getStartEnd(msg.answer.document, answer.text)
        console.log("Sliced text", msg.answer.document.slice(alternateStart, alternateEnd+1));
        texts[0].innerHTML = msg.answer.document.slice(0, alternateStart) + "<span style='background-color: yellow;'>" + msg.answer.document.slice(alternateStart, alternateEnd+1) + "</span>" + msg.answer.document.slice(alternateEnd+1)
        // texts[0].innerHTML = texts[0].innerHTML.slice(0, start) + "<span style='background-color: yellow;'>" + texts[0].innerHTML.slice(start, end+1) + "</span>" + texts[0].innerHTML.slice(end+1)
        console.log("Texts innerHTML:", texts[0].innerHTML.slice(start, end+1));
      }
    }
  });
});
