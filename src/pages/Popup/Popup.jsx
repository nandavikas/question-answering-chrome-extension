import React, {useRef, useState} from 'react';
import axios from 'axios';
import './Popup.css';

const Popup = () => {

    const inputRef = useRef();
    const [answer, setAnswer] = useState("")
    console.log("Hello from popup");

    const onClickSubmit = async (event) => {
        // Open up connection with content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            console.log("Active tab: ", activeTab.id);
            const port = chrome.tabs.connect(activeTab.id, {
                name: "midpage"
            });

            port.postMessage({
                class: "plaintext",
                tabId: activeTab.id
            });

            port.onMessage.addListener(function (msg) {
                if (msg.text) {
                    const question = inputRef.current.value;
                    const document = msg.text;
                    console.log("Query::", question);
                    console.log("Document text: ", document);
                    const data = JSON.stringify({
                        question,
                        document
                    });

                    const config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: 'https://e575-34-28-101-179.ngrok.io/predict/question/',
                        headers: {
                            'accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        data : data
                    };

                    axios(config)
                        .then(function (response) {
                            console.log("API Response", JSON.stringify(response.data));
                            const answerStart = response.data.snippet.start
                            const answerEnd = response.data.snippet.start + response.data.snippet.length
                            console.log("Answer start: ", document.slice(answerStart, answerEnd));
                            port.postMessage({
                                answer: response.data,
                                tabId: activeTab.id
                            });
                            setAnswer(response.data.answer)
                        })
                        .catch(function (error) {
                            console.log(error);
                        });

                } else {
                    console.log("text does not exist");
                }
            });
        });
    }

    return (
        <div className="App">
            {/*<p className="Midpage-response"><strong>Midpage.ai</strong></p>*/}
            <img src="https://uploads-ssl.webflow.com/63243fca0c3f22499600fd48/63dd206afa80fe9af8d5f1b6_Midpage%20logo.png" className="Extension-header" alt="midpage.ai"/>
            <textarea className="User-input" id="user-query" name="query" rows="4" cols="30" ref={inputRef}/>
            <button className="Submit-button" id="submit" onClick={onClickSubmit}>Submit</button>
            { answer !== "" && <p className="Midpage-response" id="answer"><strong>Answer: </strong>{answer}</p>}
        </div>
      );
};

export default Popup;
