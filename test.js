const StreamrClient = require('@streamr/sdk')
const express = require('express');


const app = express();
const port = process.env.PORT || 3001;

const client = new StreamrClient({
    
    auth: {
        privateKey: 'b110a9a13a24d260fd5157f3c88c224165537efd01239958d58f2dbcbbfb2bf4' 
    },
    environment: "polygonAmoy"
    
})


client.createStream({
    id: '/ownit/3',

}).then((stream) => {
    console.log('Stream created:', stream.id)
} )    