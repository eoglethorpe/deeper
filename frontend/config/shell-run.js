const exec = require('child_process').exec;

function puts(error, stdout, stderr) {
    console.log(stdout, stderr);
}

class ShellRun {
    constructor(options) {
        this.opt = options;
    }
    // Configure your plugin with options...

    apply(compiler) {
        compiler.plugin('compile', (/* params */) => {
            if (this.opt.messageBefore) {
                console.log(this.opt.messageBefore);
            }
            exec(this.opt.command, puts);
            if (this.opt.messageAfter) {
                console.log(this.opt.messageAfter);
            }
        });
    }
}

module.exports = ShellRun;
