import { useCallback, useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';
import './App.css';
 

// Configurations and stuff

const API_KEY = "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"
// q: HOLD ON, THAT IS UNSAFE. How do I safely reference it from a .env file?
// a: https://create-react-app.dev/docs/adding-custom-environment-variables/

// Let's hope this works.

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [textResult, setTextResult] = useState("");
  const [userInput, setUserInput] = useState('')
  const [apiOutput, setApiOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

/* 
  const callOpenAIAPI = async () => {
    
    console.log("Calling the OpenAI API");

    const APIBody = {
      "model": "text-davinci-003",
      "prompt": "Turn this into a story:" + {textResult},
      "temperature": 0,
      "max_tokens": 600,
      "top_p": 1.0,
      "frequency_penalty": 0.0,
      "presence_penalty": 0.0
    }

    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + API_KEY
      },
      body: JSON.stringify({ textResult })
    });

    const data = await response.json();
    const { output } = data;

      console.log("man what", data);
      setApiOutput(`${data}`);
  }

  console.log(apiOutput); */

  

  // For Inputs
  const onUserChangedText = (event) => {
    console.log(event.target.value);
    setUserInput({textResult});
  };

  // OCR Worker
  const worker = createWorker();
  const convertImageToText = useCallback(async () => {
    if(!selectedImage) return;
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const { data } = await worker.recognize(selectedImage);
    setTextResult(data.text);
  }, [worker, selectedImage]);

  useEffect(() => {
    convertImageToText();
  }, [selectedImage, convertImageToText])

  const handleChangeImage = e => {
    if(e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setUserInput({textResult});
    } else {
      setSelectedImage(null);
      setTextResult("")
      setUserInput({textResult});
    }
  }

  console.log({textResult});

  return (
    <div className="App">

    {/* What the user sees */}

      <h1>DashOCR</h1>
      <p>Slightly more accurate OCR.</p>
      <div className="input-wrapper">

    {/* Upload Files Here */}

        <label htmlFor="upload">Upload Image</label>
        <input type="file" id="upload" accept='image/*' onChange={handleChangeImage} />
      </div>

      <br />

    {/* Text Extraction Area */}
    <div className="prompt-container">
        <textarea type="hidden" className="prompt-box" placeholder="" value={textResult} onChange={onUserChangedText} />
        <div className="prompt-buttons">
      <div>
        <button onClick={callOpenAIAPI}>Extract Text</button>
      </div>
      </div>
      </div>
    {/* Results */}

      <div className="result">
        {selectedImage && (
          <div className="box-image">
            <img src={URL.createObjectURL(selectedImage)} alt="thumb" />
          </div>
        )}
        {textResult && (
          <div className="box-p">
            <p>{textResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default App;
