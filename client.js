const net = require('net')
process.stdin.setEncoding('utf-8')

let client = net.createConnection(6000, () => {
    console.log('connected')
})

client.setEncoding('utf8')

client.on('data', (data) => {
    console.log(data)
})

client.on('end', () => {
    console.log('disconnected from server');
}); 

process.stdin.on('data', (data) => {
        client.write(data)
        // console.log('you wrote ' + data)
})
//you can also do the above code with the following
// process.stdin.pipe(client)

process.stdin.on('end', () => {
    //control d to exit
    process.stdout.write('Done reading\n');
})
process.stdin.on('close', () => {
    process.stdout.write('close end\n');
})

// client.write('client has connected')