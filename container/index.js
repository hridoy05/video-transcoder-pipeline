const { S3Client, GetObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3')
const fs = require('node:fs/promises')
const path = require('path')
const ffmpeg = require("fluent-ffmpeg")

//resolution
const RESOLUTIONS = [
    { name: "360p", width: 480, height: 360 },
    { name: "480p", width: 858, height: 480 },
    { name: "720p", width: 1200, height: 720 }
]

// aws s3 client
const AWSS3Client = new S3Client({
    region: "",
    credentials: {
        accessKeyId: "",
        secretAccessKey: ""
    }
})
//process env
const BUCKET = process.env.BUCKET_NAME
const KEY = process.env.KEY

//main function
async function init() {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: KEY
    })
    //Download the original video
    const result = await S3Client.send(command)
    const originalFilePath = 'videos/original-video.mp4'
    await fs.writeFile(originalFilePath, result.body)
    const originalVideoPath = path.resolve(originalFilePath)

    // Start the transcoder 

    const promises = RESOLUTIONS.map((resolution) => {
        const output = `trancoded/video-${resolution.name}.mp4`
        return new Promise((resolve)=>{
            ffmpeg(originalVideoPath)
            .output(output)
            .withVideoCodec("libx264")
            .withAudioCodec("aac")
            .withSize(`${resolution.width}x${resolution.height}`)
            //upload the video
            .on("end", async ()=>{
                const putCommand = new PutObjectCommand({
                    Bucket: "",
                    Key: output
                })
                await AWSS3Client.send(putCommand)
                console.log(`Upload ${output}`)
                resolve()
            })
            .format("mp4")
            .run()
        })

    })
    await Promise.all(promises)

}
init().finally(()=> process.emit(0))