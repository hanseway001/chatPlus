const net = require('net')
const csv = require('csv-parser')
const fs = require('fs')
const { log } = require('console')
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
    
        console.log(`${client.id}: ${message}`)
        csvWriter.writeRecords([{user: `${client.id}: `, comment: message}])
        
        if ( message.startsWith('/')){
            let splitInput = message.split(/[ ,]+/)

            if (splitInput[0] === '/w') {
                if (splitInput.length <= 2) {
                    console.log('Incorrect user input')
                    client.write('Incorect Input, Please enter a valid message.')
                } else {
                    userList.forEach( user => {
                        if ( user.id != client.id) {
                            if (user.id === splitInput[1]){
                                console.log(`${client.id} wisper ${user.id}: ${splitInput[2]}`)
                                user.write(`${client.id} wisper ${user.id}: ${splitInput[2]}`)
                                csvWriter.writeRecords([{user: `${client.id}`, comment: `wisper ${user.id}: ${splitInput[2]}`}])
                            } 
                        }
                    })
                }
            }  else if(splitInput[0] === '/username') {
                if (splitInput.length != 2) {
                    console.log('Incorrect user input')
                    client.write('Incorect Input, Please enter a valid input.')
                } else {
                    let idExists = false

                    for (const user of userList) {
                        if (user.id === splitInput[1]) {
                            idExists = true
                            break
                        }
                    }
                    if (idExists) {
                        console.log(`This user name ${splitInput[1]} is already taken please enter a new name`)
                        client.write(`${splitInput[1]} The user name ${splitInput[1]} is already taken please enter a new name`)
                    } else {
                        userList.forEach( user => {
                            if ( user === client) {
                                console.log(`${client.id} changed username to ${splitInput[1]}`)
                                user.id = splitInput[1]
                                csvWriter.writeRecords([{user: 'Server: ', comment:`${client.id} changed username to ${splitInput[1]}`}])
                                client.write(`your user name is now ${user.id}`)
                            }
                        })
                    }

                }
            }  else if(splitInput[0] === '/kick') {
                if (splitInput.length != 3) {
                    console.log('Incorrect user input')
                    client.write('Incorect Input, Please enter a valid input.')
                } else {
                    if( splitInput[2] === adminPassword) {
                        // let idExists = false

                        for (const user of userList) {
                            if (user.id === splitInput[1]) {
                                console.log(`${client.id} has been kicked`)
                                user.end()
                                csvWriter.writeRecords([{user: 'Server: ', comment:`${client.id} has been kicked`}])
                            }
                            else {
                                console.log('Client not kicked, No client by that name')
                                client.write('Client not kicked, No client by that name')
                            }
                        }
                    } else {
                        console.log('Incorrect Password')
                        client.write('Incorect Password, Please enter a valid input.')
                    }
                    
                }   
            } else if (splitInput[0] === '/clientlist') {
                userList.forEach( user => {
                    client.write(user.id)
                })
            }
        } else {
            userList.forEach( user => { 
                if ( user !== client) {
                    user.write(`${client.id}:   ${message}`)
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
    console.log('Listening on port 6000')
});

server.on('error', (err) => {
    throw err;
});