
console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

window.onload = function () {
  const API_ENDPOINT = localStorage.getItem('apiEndpoint')
  console.log('Page loaded', API_ENDPOINT);
  const currentUrl = window.location.href;
  if (currentUrl.includes("courtlistener.com") || currentUrl.includes("casetext.com")) {
    const divId = currentUrl.includes("courtlistener.com") ? "opinion-content" : "caseBodyHtml"
    const text = document.getElementById(divId);
    // console.log(`Text from if condition with divId ${divId}:`, text.innerHTML);
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "document": text.innerHTML
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch(`${API_ENDPOINT}/index_document`, requestOptions)
        .then(response => response.text())
        .then(result => console.log("Indexing API result :::::", result))
        .catch(error => console.log('error', error));
  }
}

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    console.log("Message received in Content Script::", msg);

    if (port.name == 'cookie') {
      console.log("Cookie received in Content Script::", msg.apiEndpoint)
      localStorage.setItem('apiEndpoint', msg.apiEndpoint)
    }

    if (port.name === "midpage") {
      if (msg.tabId) {
        const idToQuery = msg.divId;
        const text = document.getElementById(idToQuery);

        // If already a relevant text is highlighted, remove it
        if (msg.document) {
          text.innerHTML = msg.document;
        }

        port.postMessage({
          text: text.innerHTML,
        });
      } else if (msg.answer) {
        const getStartEnd = (str, sub) => [str.indexOf(sub), str.indexOf(sub) + sub.length - 1]
        if (msg.relevant_text.trim() !== "") {
          const text = document.getElementById(msg.divId);
          const [start, end] = getStartEnd(text.innerHTML, msg.to_highlight.trim());
          text.innerHTML = text.innerHTML.slice(0, start) + "<span style='background-color: yellow;' id='midpage-relevant-response'>" + text.innerHTML.slice(start, end+1) + "</span>" + text.innerHTML.slice(end+1)
          console.log("Highlighted part", text.innerHTML.slice(start, end+1));
          const highlightedText = document.getElementById('midpage-relevant-response');
          highlightedText.scrollIntoView();
          setTimeout(() => {
            text.innerHTML = msg.document;
            console.log("Texts innerHTML after:", text.innerHTML.slice(start, end+1));
          }, 30*1000)
        }
      }
    }
  });
});
