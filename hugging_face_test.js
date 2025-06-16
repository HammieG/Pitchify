//console.log("Working")

import { InferenceClient } from "https://esm.sh/@huggingface/inference"

import { createRepo, commit, deleteRepo, listFiles } from "https://esm.sh/@huggingface/hub"
// or npm:
//import { InferenceClient } from "npm:@huggingface/inference"

//import { createRepo, commit, deleteRepo, listFiles } from "npm:@huggingface/hub"

//import { InferenceClient } from "@huggingface/inference";


//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 ap key for hugging face

//Pitchify_Access_Token_6/16/25_Rishi_Shah   name for key

const HF_TOKEN = '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';
console.log(HF_TOKEN)

const client = new InferenceClient(HF_TOKEN);

const out = await client.chatCompletion({
  model: "meta-llama/Llama-3.1-8B-Instruct",
  messages: [{ role: "user", content: "Hello, nice to meet you!" }],
  max_tokens: 512
});
console.log(out.choices[0].message);

