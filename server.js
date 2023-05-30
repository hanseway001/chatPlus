const net = require('net')
const csv = require('csv-parser')
const fs = require('fs')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

let userList = []
let userNumber = 0

//cerat log file
const csvWriter = createCsvWriter({
    path: 'logs/chatLog.csv',
    header: [
        {id: 'user', title:'User'},
        {id: 'comment', title: 'Comment'}
    ],
    append: false,
})

const server = net.createServer((client) => {
    client.setEncoding('utf-8')
    //on client join create new user ID
    client.id = 'Guest'+userNumber
    userNumber += 1

    userList.push(client)

    console.log(`${client.id} has joined the server`)
    csvWriter.writeRecords([{user: 'Server: ', comment:`User ${client.id} has joined.`}])
    
    userList.forEach( user => { 
        if ( user !== client) {
            user.write(`${client.id} has joined the server.`)
        } else {
            user.write('Welcome to the server ' + client.id)
        }
    })

    
    client.on("data", (data) => {
        // console.log(data)
        // console.log(data.toString())
        let message = data.trim()
        console.log(message)
        console.log(`${client.id} said: ${message}`)
        csvWriter.writeRecords([{user: `${client.id}: `, comment: message}])

        userList.forEach( user => { 
            if ( user !== client) {
                user.write(`${client.id} said:   ${data}`)
            }
        })
    })

    client.on('end', () => {
        console.log('client disconnected');
        userList.forEach( user => { 
            if ( user !== client) {
                user.write(`${client.id} disconnected`)
            }
            else {
                csvWriter.writeRecords([{user: 'Server: ', comment:`${client.id} has disconected.`}])
                removeClient = userList.indexOf(client.id)
                userList.splice(removeClient, 1)
            }
        })
        // console.log(userList)
    });


    
}).listen(6000, () => {
    console.log('Listening on port 6000')
});

server.on('error', (err) => {
    throw err;
});