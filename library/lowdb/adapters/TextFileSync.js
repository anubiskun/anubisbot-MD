const fs = require('fs');
const path = require('path');
class TextFileSync {
    constructor(filename) {
        this.filename = filename;
        this.tempFilename = path.join(path.dirname(filename), `.${path.basename(filename)}.tmp`);
    }
    read() {
        let data;
        try {
            data = fs.readFileSync(this.filename, 'utf-8');
        }
        catch (e) {
            if (e.code === 'ENOENT') {
                return null;
            }
            throw e;
        }
        return data;
    }
    write(str) {
        try {
            fs.writeFileSync(this.tempFilename, str);
            fs.renameSync(this.tempFilename, this.filename);
        } catch (e) {}
    }
}
module.exports = { TextFileSync };
