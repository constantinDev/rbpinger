let package = require("./package.json")
let chalk = require("chalk")
let net = require("net")

let {
    ArgumentParser
} = require("argparse")
let parser = new ArgumentParser({
    addHelp: true,
    description: package.description,
    version: package.version
})
parser.addArgument(["-t", "--target"], {
    help: "The target",
    required: true
})
parser.addArgument(["-p", "--port"], {
    help: "The port to ping on",
    required: true
})
parser.addArgument(["-f", "--forever"], {
    help: "Run the ping forever",
    required: false,
    action: "storeTrue",
    defaultValue: false
})
parser.addArgument(["-d", "--data"], {
    help: "The amount of data in bytes to send with each request",
    defaultValue: 60,
    required: false
})

let args = parser.parseArgs()
if (isNaN(args.port)) return console.log(chalk `{red [ArgErr]} {redBright -p/--port} {yellowBright Argument has to be a number}`)
if (isNaN(args.data)) return console.log(chalk `{red [ArgErr]} {redBright -d/--data} {yellowBright Argument has to be a number}`)

function delay(ms) {
    let dat = Date.now()
    while (dat + ms > Date.now()) {}
}

function connect() {
    try {
        let sock = new net.Socket()
        let dat = Date.now();
        sock.connect(args.port, args.target, () => {
            console.log(chalk.rgb(Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255))("Response from " + args.target + " in " + (Date.now() - dat) + "ms"))
            sock.write(("\x00").repeat(args.data), "utf8", (err) => {
                sock.end()
                delay(100)
                if (args.forever) connect();
            })

        }).on("error",(err)=>{
            console.log(chalk `{red [ECONERR]} {redBright Failed to connect}\n   {yellowBright IP: ${args.target}}\n   {yellowBright PORT: ${args.port}}`)
            delay(300)
            if (args.forever) connect();
        })
    } catch (err) {
        console.log(chalk`{red [ECONERR]} {redBright Failed to connect}\n   {yellowBright IP: ${args.target}}\n   {yellowBright PORT: ${args.port}}`)
    }
}
connect()