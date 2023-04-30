import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const basePromptPrefix = `You are an intelligent and accurate, foolproof grammar checker that will follow everything your Programming Instructions say.

PROGRAMMING INSTRUCTIONS:
1. You will analyze the text of the [Inputted Passage] provided to you and CORRECT its grammar, spelling, and punctuation without ruining its context. The corrected passage
2. Make sure to also double-check grammatical errors.
3. Make sure to double-check spelling errors.
4. Make sure the [Corrected Passage] is in the same language it was originally written in.
5. DO NOT CORRECT THE PASSAGE IF THERE IS NOTHING WRONG WITH IT.
6. DO NOT MAKE UNNECESSARY CHANGES TO THE PASSAGE IF IT IS ALREADY CORRECT. \n`;
const generateAction = async (req, res) => {
  // Run first prompt
  console.log(`API: ${basePromptPrefix}${req.body.userInput}`)

  const baseCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt:
    `${basePromptPrefix}\n
    [Inputted Passage]: ${req.body.userInput}
    [Corrected Passage]:\n`,
    temperature: 0,
    max_tokens: 800,
  });
  
  const basePromptOutput = baseCompletion.data.choices.pop();

const secondPrompt = 
  `
  Old Sentence: ${req.body.userInput}
  
  New Sentence: ${basePromptOutput.text}
  Spot the difference between the Old Sentence and the New Sentence. Place these two sentences in an HTML format. Compare them by putting both in separate divs. 
  
  Then, highlight the individual changes in the words or punctuation between these two sentences. IF THERE IS NO CHANGE, write "No Changes Needed."
  
  FOLLOW THIS TEMPLATE:
  
  <div class="oldSentence"> PLACE THE OLD SENTENCE HERE </div>
  <div class="newSentence"> PLACE THE NEW SENTENCE HERE, AND HIGHLIGHT THE CHANGES USING TAGS BETWEEN EACH INDIVIDUAL WORD CHANGE. </div>
  
  <div> Here, if you detected any differences between the Old Sentence and the New Sentence, write "No Changes Needed." IF THERE WERE CHANGES, WRITE "Highlighted content is AI's suggested fix." </div>
  
  HTML output:
  `
  const secondPromptCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${secondPrompt}`,
    temperature: 0.02,
    max_tokens: 912,
  });
  
  // Grab output
  const secondPromptOutput = secondPromptCompletion.data.choices.pop();

  res.status(200).json({ output: secondPromptOutput });
};

export default generateAction;