const clientSocket=require("socket.io-client");
const rl=require('readline')
const crypto=require("crypto");
const socket=clientSocket("http://localhost:3000");
const readline=rl.createInterface({
    input:process.stdin,
    output:process.stdout
});
const {publicKey,privateKey}=crypto.generateKeyPairSync("rsa",{
    modulusLength:2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      }
})

console.log("Sending Client Public key",publicKey)
socket.emit('ClientPublicKey',publicKey)

socket.on("connect",()=>{
    console.log("connected to server")
})


socket.on("ServerPublicKey",(publicKey)=>{
    console.log("Received Public key:",publicKey)
    console.log("Start the communication")

const serverPublicKey=crypto.createPublicKey(publicKey)



readline.on('line',(data)=>{
    const encryptedMessage=crypto.publicEncrypt({
        key:serverPublicKey,
    },
    Buffer.from(data))
    console.log("Send Encrypted Message",encryptedMessage)
    socket.emit("encryptedmsg",encryptedMessage)
})

})
socket.on('encryptedmsg',(data)=>{
    console.log("Received Encrypted Message:",data)
    const decryptedMessage=crypto.privateDecrypt({
        key:privateKey,
    },
    Buffer.from(data))
    console.log("Decrypted Message:",decryptedMessage.toString())
})

socket.on("disconnect",()=>{
    console.log("disconnected from server")
})