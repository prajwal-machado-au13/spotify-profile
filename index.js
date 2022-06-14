const express = require('express')
require('dotenv').config()
const app = express()
const axios = require('axios')
// const PORT = 8888 || process.env.PORT
const cors = require('cors')
const path = require('path')

app.use(cors()) 

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const FRONTEND_URI = process.env.FRONTEND_URI
const PORT = process.env.PORT || 8888;

//priority serve any static files
app.use(express.static(path.resolve(__dirname, './client/build')))

app.get('/',(req,res)=>{
    const data ={
        name:'Prajwal',
        isAwesome:true
    }
    res.json(data)
})

// app.get('/awesome-generator',(req,res)=>{
//     const {name,isAwesome} = req.query
//     res.send(`${name} is ${JSON.parse(isAwesome) ? 'really' : 'not'} awesome`)
// })

/**
    Generate a random string containing numbers and letters
    *@param {number} length The length of the string
*@return {string} The generated string
*/

const generateRandomString = length =>{
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i=0;i < length; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

const stateKey = 'spotify_auth_state'

app.get('/login',(req,res)=>{
    const state = generateRandomString(16)
    res.cookie(stateKey,state)

    const scope = ['user-read-private',
        'user-read-email',
        'user-top-read'
    ].join(' ')

    const queryParams = new URLSearchParams({
        client_id : CLIENT_ID,
        response_type : 'code',
        scope: scope,
        redirect_uri: REDIRECT_URI,
        state: state
    })
    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`)
})

app.get('/callback', (req, res) => {
    const code = req.query.code || null;
    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: new URLSearchParams({
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        }),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
    })
    .then(response => {
        if (response.status === 200) {
            
            const { access_token, refresh_token, expires_in } = response.data;

            const queryParams = new URLSearchParams({
                access_token,
                refresh_token,
                expires_in
            })
            
            //redirect to react app
            res.redirect(`${FRONTEND_URI}/?${queryParams}`)

        } else {
            res.redirect(`/?${new URLSearchParams({error : 'invalid_token'})}`)
        }
    })
    .catch(error => {
        res.send(error)
    })
})

app.get('/refresh_token', (req, res) => {
    const { refresh_token } = req.query;
    axios({
        method : 'post',
        url : 'https://accounts.spotify.com/api/token',
        data: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        }),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
    })
    .then(response => {
        res.send(response.data)
    })
    .catch(error=>{
        res.send(error)
    })
})


app.use('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
})

app.listen(PORT,()=>{
    console.log(`Express app listening at http://localhost:${PORT}`)
})