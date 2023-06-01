const net = require('net')
const csv = require('csv-parser')
const fs = require('fs')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

let userList = []
let userNumber = 0
let adminPassword = 'admin'

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
        let splitInput = message.split(/[ ,]+/)
        console.log(splitInput)
        console.log(`${client.id}: ${message}`)
        csvWriter.writeRecords([{user: `${client.id}: `, comment: message}])
        // if ( message.startsWith('/')){
        //     console.log('boo')
        // }
        if (splitInput[0] === '/w') {
            console.log(splitInput)
            if (splitInput.length <= 2) {
                console.log('Incorrect user input')
                client.write('Incorect Input, Please enter a valid message.')
            } 
            userList.forEach( user => {
                if ( user === client) {
                    console.log('Cant wisper self. Please enter different client')
                    csvWriter.writeRecords([{user: 'Server: ', comment:`${client.id} Tried to wisper self}`}])   
                } else {
                    user.write(`${client.id}: ${splitInput[2]}`)
                }
            })
        }  else if(splitInput[0] === '/username') {
            userList.forEach( user => {
                if ( user === client) {
                    console.log(`${client.id} changed username to ${splitInput[1]}`)
                    user.id = splitInput[1]
                    csvWriter.writeRecords([{user: 'Server: ', comment:`${client.id} changed username to ${splitInput[1]}`}])
                }
            })
        }  else if(splitInput[0] === '/kick') {
            if( splitInput[2] === adminPassword) {
                userList.forEach( user => {
                    if ( user.id === splitInput[1]) {
                        console.log(`${client.id} has been kicked`)
                        user.end()
                        csvWriter.writeRecords([{user: 'Server: ', comment:`${client.id} has been kicked`}])
                    }
                })
            }
        } else if (splitInput[0] === '/clientlist') {
            userList.forEach( user => {
                client.write(user.id)
            })
        } else {

            userList.forEach( user => { 
                if ( user !== client) {
                    user.write(`${client.id} said:   ${message}`)
                }
            })
        }
    
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
    console.log('Listening on port 600')
});

server.on('error', (err) => {
    throw err;
});