
console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

window.onload = function () {
  console.log('Page loaded');
  const text = document.getElementById("opinion-content");
  // console.log("Texts: \n", text.innerHTML);
  // call API to send text to backend
}

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    console.log("Message received in Content Script::", msg);
    if (port.name === "midpage") {
      if (msg.tabId) {
        const idToQuery = msg.divId;
        const text = document.getElementById(idToQuery);
        port.postMessage({
          text: text.innerHTML,
        });
      } else if (msg.answer) {
        const getStartEnd = (str, sub) => [str.indexOf(sub), str.indexOf(sub) + sub.length - 1]
        const text = document.getElementById(msg.divId);
        const [start, end] = getStartEnd(text.innerHTML, msg.answer.text)
        text.innerHTML = text.innerHTML.slice(0, start) + "<span style='background-color: yellow;' id='midpage-relevant-response'>" + text.innerHTML.slice(start, end+1) + "</span>" + text.innerHTML.slice(end+1)
        const highlightedText = document.getElementById('midpage-relevant-response');
        highlightedText.scrollIntoView();
        setTimeout(() => {
          highlightedText.style.backgroundColor = "white";
        }, 10*1000)
        console.log("Texts innerHTML after:", text.innerHTML.slice(start, end+1));
      }
    }
  });
});
