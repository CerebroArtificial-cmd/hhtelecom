// Cross-platform Next start wrapper that honors PORT and HOST
// Uses PORT env if provided, otherwise defaults to 3010
const { spawn } = require('child_process');
const path = require('path');

const portEnv = process.env.PORT || process.env.port;
const port = Number(portEnv) >= 0 ? Number(portEnv) : 3010;
const host = process.env.HOST || process.env.HOSTNAME;

const bin = path.join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'next.cmd' : 'next'
);

const args = ['start', '-p', String(port)];
if (host) {
  args.push('--hostname', host);
}

const child = spawn(bin, args, { stdio: 'inherit', shell: false });
child.on('exit', (code) => process.exit(code ?? 0));

