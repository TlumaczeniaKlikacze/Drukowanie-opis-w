const FONT_SIZE = 5
const WIDTH = 300
const HEIGHT = 400

const express = require('express')
const app = express()
const csv = require('csvtojson')
const PDFDocument = require('pdfkit')
const getStream = require('get-stream')
const id_display = `IAI(id) towaru`
const ean_display = `Kod producenta (ten z produktu prawdziwy)`
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(express.json())
let list_of_object = []

app.post('/getByEan',(req,res)=>{
    const id = req.body.id
    const find = list_of_object.find(e=>e[ean_display] == id)
    const find2 =  list_of_object.find(e=>e[id_display] == id)
    if(find){
        const newOne = {...find}
        delete newOne[id_display]
        delete newOne[ean_display]
        return res.status(200).json({data:newOne})
    }else if(find2){
        const newOne2 = {...find2}
        delete newOne2[id_display]
        delete newOne2[ean_display]
        return res.status(200).json({data:newOne2})
    }
    return res.status(400).json({message:'Opis dla takiego EANU/ID nie istnieje'})
})
app.post('/getBase64',async(req,res)=>{
    try {
        const text = req.body.text
        const pdf = async() => {
            const doc = new PDFDocument({
                size:[WIDTH,HEIGHT],
                margins:{
                    top:20,
                    bottom:0,
                    left:20,
                    right:0
                }
            });
            doc
            .fontSize(FONT_SIZE)
            .font('./fonts/NotoSans-Light.ttf')
            .text(text)
            doc.end()
            return await getStream.buffer(doc)
          }
          
          
          // Caller could do this:
          const pdfBuffer = await pdf()
          const pdfBase64string = pdfBuffer.toString('base64')

          return res.json({base:pdfBase64string})

    } catch (error) {
        console.log(error)
        return res.json({base:null})
    }
    
})

app.get('/',(req,res)=>{
    res.render('index.ejs')
})
csv({ignoreEmpty:false,delimiter:','})
.fromFile('./data.csv')
.subscribe((jsonObject)=>{
    list_of_object.push(jsonObject)
})
.on('error',()=>{
    throw 'Błąd podczas wczytywania plików'
})
.on('done',()=>{
    app.listen(3000,()=>{
        console.log('App listen')
    })
})


