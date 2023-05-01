import { useCallback, useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';

const Home = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [textResult, setTextResult] = useState("");
  const [userInput, setUserInput] = useState('')
  const [apiOutput, setApiOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

// —————————————————————vvvvv OpenAI Generator vvvvv————————————————————— \\

  const callGenerateEndpoint = async () => {
    setIsGenerating(true);
    
    console.log("Scanning...")
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput }),
    });

    const data = await response.json();
    const { output } = data;
    console.log("HTMLizing...", output.text)
  
    setApiOutput(`${output.text}`);
    setIsGenerating(false);
  }
  console.log(apiOutput);

  const onUserChangedText = (event) => {
    console.log(event.target.value);
    setUserInput(event.target.value);
  };



  // —————————————————————^^^^ OpenAI Generator ^^^^————————————————————— \\

  // —————————————————————vvvvv OCR Worker vvvvv————————————————————— \\
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
    // —————————————————————^^^^ OCR Worker ^^^^————————————————————— \\

  return (
    <div className="App">
    {/* What the user sees */}
      <header className="App-header">
        </header>
      <div className="container">
      <div className="header">
        </div>
        </div>
      <h1 className="DashOCR">DashOCR</h1>
      <p>A contextual OCR that analyzes and reads your passages. Note from David: When you upload an image, it pastes the text on the box, but make sure to interact with it and type a letter so that it will register the OnUserChangeText function. I'll fix it later. Also, keep your console on; I haven't added any loading animation yet.</p>
      <div className="input-wrapper">

    {/* Upload Image Here */}

        <label htmlFor="upload">
        <svg className="uploadicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,13a1,1,0,0,0-1,1v.38L16.52,12.9a2.79,2.79,0,0,0-3.93,0l-.7.7L9.41,11.12a2.85,2.85,0,0,0-3.93,0L4,12.6V7A1,1,0,0,1,5,6h7a1,1,0,0,0,0-2H5A3,3,0,0,0,2,7V19a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V14A1,1,0,0,0,19,13ZM5,20a1,1,0,0,1-1-1V15.43l2.9-2.9a.79.79,0,0,1,1.09,0l3.17,3.17,0,0L15.46,20Zm13-1a.89.89,0,0,1-.18.53L13.31,15l.7-.7a.77.77,0,0,1,1.1,0L18,17.21ZM22.71,4.29l-3-3a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-3,3a1,1,0,0,0,1.42,1.42L18,4.41V10a1,1,0,0,0,2,0V4.41l1.29,1.3a1,1,0,0,0,1.42,0A1,1,0,0,0,22.71,4.29Z" fill="white"></path></svg>  
          Upload Image</label>
        <input type="file" id="upload" className="upload" accept='image/*' onChange={handleChangeImage} />
      </div>

      <br />

    {/* Text AI-Fixer Area */}
    <div className="prompt-container">
        <textarea type="hidden" className="prompt-box" placeholder="OCR text will be printed here..." value={textResult} onChange={onUserChangedText} />
        <div className="prompt-buttons">
      <div>
        <button className="AIButton" onClick={callGenerateEndpoint}>Fix Text</button> {/* This button calls the API */}
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
          {apiOutput && (
<article>
  <div className="output">
    <div className="output-header-container">
      <div className="output-header">
        <h3>OCR Grammar Check</h3>
      </div>
    </div>
    <div className="output-content">
      <div className="outputWrapper">
      {textResult}
        <div dangerouslySetInnerHTML={{__html: apiOutput}}></div>
      </div>
    </div>
  </div>
  </article>
)}
        
      </div>
    </div>
  );
}
export default Home;