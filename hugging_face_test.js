//console.log("Working")

import { InferenceClient } from "https://esm.sh/@huggingface/inference"


const HF_TOKEN = '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';


const client = new InferenceClient(HF_TOKEN);

//testing the speech function
const speech = "Four score and seven years ago our fathers brought forth, upon this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived, and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting-place for those who here gave their lives, that that nation might live. It is altogether fitting and proper that we should do this. But, in a larger sense, we can not dedicate, we can not consecrate we can not hallow this ground. The brave men, living and dead, who struggled here, have consecrated it far above our poor power to add or detract. The world will little note, nor long remember what we say here, but it can never forget what they did here. It is for us, the living, rather, to be dedicated here to the unfinished work which they who fought here, have, thus far, so nobly advanced. It is rather for us to be here dedicated to the great task remaining before us that from these honored dead we take increased devotion to that cause for which they here gave the last full measure of devotion that we here highly resolve that these dead shall not have died in vain that this nation, under God, shall have a new birth of freedom and that government of the people, by the people, for the people, shall not perish from the earth."

const prompt = "You are a world-class public speaking coach. You help students and professionals improve their speeches by giving clear, constructive, and structured feedback. Evaluate the following speech as if it were presented aloud. Focus on the following areas: 1. **Clarity and Structure** – Is the speech well-organized and easy to follow? Are the transitions effective? 2. **Language and Word Choice** – Are the words appropriate, persuasive, and vivid? Any awkward phrasing or better alternatives? 3. **Tone and Engagement** – Is the tone appropriate for the context and audience? Is it engaging and expressive? 4. **Persuasiveness and Impact** – How convincing is the speech? Does it have a strong opening and a memorable closing? 5. **Suggestions for Improvement** – Provide 2–3 specific, actionable ways the speaker can improve. Be honest but encouraging. If possible, rewrite a small section of the speech to demonstrate how to improve it. Here is the Speech: "

const out = await client.chatCompletion({
  model: "mistralai/Mistral-7B-Instruct-v0.2",
  messages: [{ role: "user", content: prompt + speech}],
  max_tokens: 512
});
console.log(out.choices[0].message.content);


