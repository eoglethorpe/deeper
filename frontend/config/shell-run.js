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

        compiler.plugin('watch-run', (watching, done) => {
            const changedTimes = watching.compiler.watchFileSystem.watcher.mtimes;
            const changedFiles = Object.keys(changedTimes)
                .map(file => `\n  ${file}`)
                .join('');
            if (changedFiles.length) {
                console.log('New build triggered, files changed:', changedFiles);
            }
            done();
        });
    }
}

module.exports = ShellRun;
