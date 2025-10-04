type Meta = Record<string, unknown>;

function log(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', msg: string, meta?: Meta) {
    const ts = new Date().toISOString();
    console.log(`${ts} ${level} ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}`);
}

export const logger = {
    debug: (msg: string, meta?: Meta) => log('DEBUG', msg, meta),
    info: (msg: string, meta?: Meta) => log('INFO', msg, meta),
    warn: (msg: string, meta?: Meta) => log('WARN', msg, meta),
    error: (msg: string, meta?: Meta) => log('ERROR', msg, meta),
};
