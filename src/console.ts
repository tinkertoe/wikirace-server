import chalk from 'chalk'

export function log(...args: any[]) {
    // move everything in arguments array one ahead
    const len = args.length
    for (let i = 0; i < args.length; i++) {
        args[len - i] = args[len - i - 1]
    }
    // 0 is now empty and array is now one index longer
    // set 0 to prefix
    args[0] = '[wikirace-server]'
    console.log(...args)
}

export function warn(...args: any[]) {
    for (let i = 0; i < args.length; i++) {
        args[i] = chalk.red(args[i])
    }
    log(...args)
}