const { Transform, Writable } = require('stream');
const fs = require('fs');

// Points file to file in command line argument
let file = process.argv[2];

// Initialized variables for data
let start = new Date();

const data = {
    duration: 0,
    bytes: 0,
    lines: 0
}

// Read stream from file
let readable = fs.createReadStream(file);

// Transform extends the Duplex class
class DuplexTransform extends Transform{
    constructor(options){
        super(options)
    }
    
    _transform(chunk, encoding, callback) {
        // Set variables to store chunk information
        const chunkLines = chunk.toString().split(/\r\n|\r|\n/).length;
        data.lines += chunkLines;
        data.bytes += chunk.length;
        this.push(JSON.stringify(data));
        // Callback once there is nothing to do
        callback();
    }
};

// new instance of MyTransform class
const myTransform = new DuplexTransform({readableObjectMode: true});

// WriteStream class
class Writer extends Writable{
    constructor(options){
        super(options)
    }
    _write(chunk, encoding, callback){
        callback();
    }
};

const writerStream = new Writer({objectMode: true});

// Log the data once data has been flushed
writerStream.on('finish', () => {
    let time = new Date() - start;
    data.duration = time;
    console.log(`There are ${data.lines} lines, a size of ${data.bytes} bytes and load time of ${data.duration}ms, with a growth rate of ${(data.bytes/data.duration).toFixed(2)*1000} bytes/second`);
});


readable.pipe(myTransform).pipe(writerStream);