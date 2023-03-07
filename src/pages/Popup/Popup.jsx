import React, {useRef, useState} from 'react';
import axios from 'axios';
import './Popup.css';

const Popup = () => {

    const inputRef = useRef();
    const [answer, setAnswer] = useState("")
    const [relevant, setRelevant] = useState("")
    const [loading, setLoading] = useState(false)
    console.log("Hello from popup");

    const onClickSubmit = async (event) => {
        event.preventDefault();
        setLoading(true)
        setAnswer("")
        setRelevant("")
        // Open up connection with content script
        console.log("Connecting to content script...")
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            console.log("Active tab: ", activeTab.id);
            const port = chrome.tabs.connect(activeTab.id, {
                name: "midpage"
            });

            port.postMessage({
                divId: "opinion-content",
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
                        url: 'https://3422-34-28-101-179.ngrok.io/predict/question/',
                        headers: {
                            'accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        data : data
                    };

                    axios(config)
                        .then(function (response) {
                            console.log("API Response", response.data);
                            let answerData = response.data.answer.split("Relevant text:")[0];
                            const relevantData = response.data.answer.split("Relevant text:")[1];
                            answerData = answerData.replace("Answer: ", "");
                            port.postMessage({
                                answer: { ...response.data.snippet, document},
                                relevantText: relevantData,
                                tabId: activeTab.id
                            });
                            setLoading(false);
                            setAnswer(answerData)
                            setRelevant(relevantData)
                        })
                        .catch(function (error) {
                            setLoading(false);
                            setAnswer("Sorry, we couldn't find an answer to your question.")
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
            <img src="https://uploads-ssl.webflow.com/63243fca0c3f22499600fd48/63dd206afa80fe9af8d5f1b6_Midpage%20logo.png" className="Extension-header" alt="midpage.ai"/>
            <form onSubmit={onClickSubmit}>
                <textarea className="User-input" id="user-query" name="query" rows="4" cols="30" ref={inputRef}/>
                <button className="Submit-button" id="submit" type="submit">Submit</button>
            </form>
            { loading && (<div className="ticontainer">
                <div className="tiblock">
                    <div className="tidot"></div>
                    <div className="tidot"></div>
                    <div className="tidot"></div>
                </div>
            </div>)}
            <div className="Response-container">
                { answer !== "" && <p className="Midpage-response" id="answer"><strong>Answer: </strong>{answer}</p>}
                { relevant !== "" && <p className="Midpage-response" id="relevant"><strong>Relevant text: </strong>{relevant}</p>}
            </div>
        </div>
      );
};

export default Popup;
