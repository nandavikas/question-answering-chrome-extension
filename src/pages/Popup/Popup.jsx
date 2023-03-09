import React, {useRef, useState} from 'react';
import axios from 'axios';
import './Popup.css';

const Popup = () => {

    const inputRef = useRef();
    const cookieRef = useRef();
    const [answer, setAnswer] = useState("")
    // const [relevant, setRelevant] = useState("")
    const [loading, setLoading] = useState(false)
    const [document, setDocument] = useState("")
    const [openSettings, setOpenSettings] = useState(false)

    const onClickSettings = () => {
        setOpenSettings(!openSettings)
    }

    const onClickBack = () => {
        setOpenSettings(!openSettings)
    }

    const onClickSave = () => {
        const apiEndpoint = cookieRef.current.value;
        console.log("onClickSave", apiEndpoint);
        localStorage.setItem("apiEndpoint", apiEndpoint);
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            const port = chrome.tabs.connect(activeTab.id, {
                name: "cookie"
            });
            console.log("Sending api endpoint to content script", apiEndpoint);
            port.postMessage({ apiEndpoint });
        });
        setAnswer("")
        // setRelevant("")
        setOpenSettings(!openSettings)
        }

    const onKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            onClickSubmit(event);
        }
    }

    const onClickSubmit = async (event) => {
        event.preventDefault();
        setLoading(true)
        setAnswer("")
        // setRelevant("")
        // Open up connection with content script
        console.log("Connecting to content script...")
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            console.log("Active tab: ", activeTab.id);
            console.log("Current tab URL: ", activeTab.url)
            const port = chrome.tabs.connect(activeTab.id, {
                name: "midpage"
            });

            const divId = activeTab.url.includes("courtlistener.com") ? "opinion-content" : "caseBodyHtml";

            const message = {
                divId,
                tabId: activeTab.id
            }

            if (document !== "") {
                message.document = document;
            }

            port.postMessage(message);

            port.onMessage.addListener(function (msg) {
                if (msg.text) {
                    const question = inputRef.current.value;
                    const document = msg.text;
                    console.log("Query::", question);
                    console.log("Document text: ", document);
                    setDocument(document);
                    const data = JSON.stringify({
                        question,
                        document
                    });

                    const API_ENDPOINT = `${localStorage.getItem("apiEndpoint")}/predict/question/` || "https://3422-34-28-101-179.ngrok.io/predict/question/";
                    const config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: API_ENDPOINT,
                        headers: {
                            'accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        data : data
                    };

                    axios(config)
                        .then(function (response) {
                            console.log("API Response", response.data);
                            port.postMessage({
                                divId,
                                document,
                                ...response.data
                            });
                            setLoading(false);
                            setAnswer("\n" + response.data.answer)
                            // setRelevant("\n" + response.data.relevant_text)
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
            {!openSettings && <img src="https://www.iconpacks.net/icons/2/free-settings-icon-3110-thumb.png" className="Settings-icon" alt="settings" onClick={onClickSettings}/>}
            {openSettings && <img src="https://cdn-icons-png.flaticon.com/512/93/93634.png" className="Back-icon" alt="settings" onClick={onClickBack}/>}
            <img src="https://uploads-ssl.webflow.com/63243fca0c3f22499600fd48/63dd206afa80fe9af8d5f1b6_Midpage%20logo.png" className="Extension-header" alt="midpage.ai"/>
            {!openSettings && <>
            <form onSubmit={onClickSubmit}>
                <textarea className="User-input" id="user-query" name="query" rows="4" cols="30" onKeyDown={onKeyDown} ref={inputRef}/>
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
                { answer !== "" && (<p className="Midpage-response" id="answer"><span><strong>Answer: </strong></span><br/>{answer}</p>)}
                {/*{ relevant !== "" && (<p className="Midpage-response" id="relevant"><span><strong>Relevant Section: </strong></span><br/>{relevant}</p>)}*/}
            </div>
            </>}
            {openSettings && <div className="Settings-container">
                <input type="text" id="apiUrl" className="Api-endpoint" name="apiUrl" ref={cookieRef} placeholder="API endpoint"/>
                <button className="Submit-button" id="submit" type="submit" onClick={onClickSave}>Save</button>
                <p className="Settings-text">Example: https://3422-34-28-101-179.ngrok.io</p>
            </div>}
        </div>
      );
};

export default Popup;
