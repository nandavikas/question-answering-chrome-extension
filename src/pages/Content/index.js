
console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    // console.log("Message received", msg);
    if (port.name === "midpage") {
      if (msg.divId) {
        const idToQuery = msg.divId;
        console.log("Class name to be queried: \n", idToQuery);
        const text = document.getElementById(idToQuery);
        console.log("Texts: \n", text);
        // if (text.length > 0) {
          port.postMessage({
            text: text.innerHTML,
          });
        // } else {
        //   port.postMessage({
        //     text: "None",
        //   });
        // }
      } else if (msg.answer) {
        const answer = msg.relevantText === msg.answer ? msg.answer : msg.relevantText;
        const getStartEnd = (str, sub) => [str.indexOf(sub), str.indexOf(sub) + sub.length - 1]
        console.log("Message: ", msg);
        console.log("Relevant text: ", msg.relevantText);
        console.log("Document:", msg.answer.document);
        // const defaultText = document.getElementById("default-text")
        // defaultText.style.backgroundColor = "yellow";
        const text = document.getElementById("opinion-content");
        const [start, end] = getStartEnd(text.innerHTML, msg.relevantText)
        console.log("Texts innerHTML before:", text.innerHTML);
        // const [alternateStart, alternateEnd] = getStartEnd(msg.answer.document, answer)
        // console.log("alternate start:", alternateStart, "alternate end:", alternateEnd)
        // console.log("Sliced text", msg.answer.document.slice(alternateStart, alternateEnd+1));
        // text.innerHTML = msg.answer.document.slice(0, alternateStart) + "<span style='background-color: yellow;'>" + msg.answer.document.slice(alternateStart, alternateEnd+1) + "</span>" + msg.answer.document.slice(alternateEnd+1)
        text.innerHTML = text.innerHTML.slice(0, start) + "<span style='background-color: yellow;'>" + text.innerHTML.slice(start, end+1) + "</span>" + text.innerHTML.slice(end+1)
        console.log("Texts innerHTML after:", text.innerHTML.slice(start, end+1));
      }
    }
  });
});
