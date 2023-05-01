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
5. DO NOT CORRECT THE PASSAGE IF THERE IS NOTHING WRONG WITH IT. Also, do not remove arrows or special symbols if they are necessary.
6. DO NOT CHANGE CAPITALIZATION UNLESS NECESSARY. For example, if all the text are in caps, don't change it.
7. DO NOT MAKE UNNECESSARY CHANGES TO THE PASSAGE IF IT IS ALREADY CORRECT. \n`;
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
  Old Passage: "${req.body.userInput}"
  
  New Passage: "${basePromptOutput.text}"
  Spot the difference between the Old Passage and the New Passage. Place thes new passage in an HTML format BUT DO NOT CHANGE ANY OF THE WORDS INSIDE THESE PASSAGES AT ALL.
  
  Then, highlight EACH individual change in the words or punctuation between these two passages. Also highlight changes in punctuation, grammar, AND spelling. IF THERE IS NO CHANGE, write "No Changes Needed."
  
  FOLLOW THIS TEMPLATE:
  
  <div class="newPassage"> PLACE THE NEW PASSAGE HERE. INCLUDE ALL OF IT, AND HIGHLIGHT THE CHANGES USING TAGS BETWEEN EACH INDIVIDUAL WORD/SYMBOL CHANGE. Do it for ALL THE WORDS THAT HAVE BEEN CHANGED. </div>
  
  <div> Here, if you detected any differences between the Old Passage and the New Passage, write "No Changes Needed." IF THERE WERE CHANGES, WRITE "Highlighted content is AI's suggested fix." </div>
  
  HTML output:
  `
  const secondPromptCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${secondPrompt}`,
    temperature: 0,
    max_tokens: 912,
  });
  
  // Grab output
  const secondPromptOutput = secondPromptCompletion.data.choices.pop();

  res.status(200).json({ output: secondPromptOutput });
};

export default generateAction;