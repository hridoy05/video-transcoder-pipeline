import {ReceiveMessageCommand, SQSClient} from "@aws-sdk/client-sqs"
import type {S3Event} from 'aws-lambda'

const client = new SQSClient( {
    credentials: {
        accessKeyId: "",
        secretAccessKey: ""  
    }
})

async function init (){
    const command = new ReceiveMessageCommand({
        QueueUrl:"https://sqs.ap-south-1.amazonaws.com/471112739863/tempTranscoderQueue",
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20
    })

    while(true){
        const {Messages} = await client.send(command)
        if(!Messages){
            console.log(`NO message in aws sns Queue`)
            break
        }

        try {
            for( const message of Messages){
                const {MessageId, Body} = message
                console.log(`Message received`, {MessageId, Body})

                if(!Body) continue
                //validate the event from queue
                const event = JSON.parse(Body) as S3Event
                //ignore the test event

                if("service" in event && "Event" in event){
                    if(event.Event === "s3.TestEvent") continue
                }

                //spin the docker conatiner
                for(const record of event.Records){
                    const {s3} = record
                    const {bucket, object:{key}} = s3
                }

                //delete the message from queue
            }
            
        } catch (error) {
            
        }
    }
}

init()

