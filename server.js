console.log(process.env.GEMINI_API_KEY);
import express from "express"
import cors from "cors"

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

app.post("/chat", async (req,res)=>{

try{

const message=req.body.message

const url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+process.env.GEMINI_API_KEY

const response=await fetch(url,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
contents:[
{
parts:[
{text:message}
]
}
]
})
})

const data=await response.json()

console.log("Gemini response:",data)

if(!data.candidates){
return res.json({
reply:"Gemini API lỗi hoặc API key sai"
})
}

const reply=data.candidates[0].content.parts[0].text

res.json({reply})

}catch(err){

console.log(err)

res.json({
reply:"Lỗi kết nối AI"
})

}

})

const PORT=process.env.PORT || 3000

app.listen(PORT,()=>{
console.log("Server running on port "+PORT)
})
