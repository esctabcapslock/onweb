 function parseargv(argv_reduce={},_argv=undefined) {
    const argv = _argv ? _argv : process.argv.map(v=>v).splice(2)
    const argvs = {}
    // const argv_reduce = { 'h': 'help', 'p': 'port' }

    let argvs_name_flag = null
    for (const tr of argv) {
        if (tr.startsWith('--')) {
            argvs_name_flag = tr.replace(/^../, '')
        } else if (tr.startsWith('-')) {
            const trr = tr.replace(/^./, '')
            argvs_name_flag = (trr in argv_reduce) ? argv_reduce[trr] : trr
        }
        else argvs[argvs_name_flag] = tr
    }
    return argvs
}

// console.log(parseargv())

module.exports = parseargv