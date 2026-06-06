# npm-killer

[![npm version](https://img.shields.io/npm/v/npm-killer.svg)](https://www.npmjs.com/package/npm-killer)
[![npm downloads](https://img.shields.io/npm/dm/npm-killer.svg)](https://www.npmjs.com/package/npm-killer)
[![license](https://img.shields.io/npm/l/npm-killer.svg)](https://github.com/afzalbuilds/npm-killer/blob/main/LICENSE)
[![Node.js version](https://img.shields.io/node/v/npm-killer.svg)](https://nodejs.org)

> **Interactive CLI tool to find and kill Node.js processes running on ports** — Built for developers who run multiple services and need a visual, interactive way to manage port conflicts.

---

## Why npm-killer?

Most port killers (`fuser`, `lsof`, `kill-port`) require you to know the exact PID or port upfront. **npm-killer** is different:

- 🎯 **Interactive by default** — Visual checkbox selection, no memorization needed
- 🔍 **Smart detection** — Finds Node.js, npm, yarn, pnpm, bun, Next.js processes automatically
- 📋 **Clean table output** — See all processes with ports at a glance
- ⚡ **Flexible modes** — Interactive, list, single-port, or kill-all
- 🛡️ **Safe by default** — Confirmation prompts prevent accidental kills
- 🎨 **Developer-friendly** — Color-coded, readable output

---

## Installation

```bash
# Global install (recommended)
npm install -g npm-killer

# Or use without installing
npx npm-killer
```

**Requirements:** Node.js 18+, macOS / Linux / Windows (WSL)

---

## Quick Start

```bash
# Interactive mode — select processes with spacebar, press Enter to kill
npm-killer

# List all Node.js processes with ports
npm-killer -l

# Kill process on specific port (with confirmation)
npm-killer -p 3000

# Force kill on port (no confirmation)
npm-killer -p 3000 -f

# Kill all Node.js processes (with confirmation)
npm-killer -a

# Force kill all
npm-killer -a -f
```

---

## Commands Reference

| Command | Alias | Description |
|---------|-------|-------------|
| `npm-killer` | | Interactive mode (default) |
| `npm-killer --list` | `-l` | List all Node.js processes with ports in a table |
| `npm-killer --port <port>` | `-p <port>` | Kill process on specific port |
| `npm-killer --all` | `-a` | Kill all detected Node.js processes |
| `npm-killer --force` | `-f` | Skip confirmation prompts |
| `npm-killer --version` | `-V` | Show version |
| `npm-killer --help` | `-h` | Show help |

---

## Output Examples

### Interactive Mode (Default)
```bash
$ npm-killer

  Select processes to kill:

  ✓ 1. node                    32724  3001   node /path/to/server.ts
  ✓ 2. next-server (v14.2.35)  48706  3000   next-server (v14.2.35)
  ─────────────────────────────────────────────────────────────
  ◯ Kill ALL Node.js processes
  ◯ Exit without killing

  Kill 2 process(es)? (y/N) y

  ✓ Killed node (PID: 32724)
  ✓ Killed next-server (v14.2.35) (PID: 48706)
```

### List Mode (`-l`)
```bash
$ npm-killer -l

  Node.js Processes with Open Ports:

  #   Name                      PID  Ports  Command
  ─── ──────────────────────  ─────  ─────  ───────
  1   Code Helper (Plugin)    30509  62481  /Applications/VS Code/...
  2   node                    32724  3001   node /project/server.ts
  3   next-server (v14.2.35)  48706  3000   next-server (v14.2.35)
  4   next-server (v16.1.1)   33053  3002   next-server (v16.1.1)
```

---

## Detected Process Types

npm-killer automatically detects and lists:

- **Node.js** — `node`, `node.js`
- **Package managers** — `npm`, `yarn`, `pnpm`, `bun`
- **Frameworks** — `next-server` (Next.js), `nuxt`, `vite`, `webpack-dev-server`
- **TypeScript runners** — `ts-node`, `tsx`, `nodemon`

---

## Use Cases

- **Microservices development** — Multiple services on different ports
- **Frontend + backend** — Next.js (3000), API (3001), WebSocket (3002)
- **CI/CD pipelines** — Clean up stray processes before deployments
- **Port conflicts** — Quickly identify and resolve `EADDRINUSE` errors
- **Team onboarding** — New developers can see running services instantly

---

## How It Works

1. Uses `ps-list` to enumerate all running processes
2. Filters for Node.js-related processes by name and command
3. Uses `lsof` to detect listening TCP ports per PID
4. Presents an interactive UI via `inquirer` or formatted table output
5. Sends `SIGTERM` → `SIGKILL` for graceful then forced termination

---

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) first.

```bash
# Clone and install
git clone https://github.com/afzalbuilds/npm-killer.git
cd npm-killer
npm install

# Run tests
npm test

# Build / test locally
npm pack
npm install -g ./npm-killer-*.tgz
```

---

## Author

**Muhammad Afzal** — Full-stack Developer & Open Source Enthusiast

- 🐦 **X (Twitter):** [@AfzalBuilds](https://x.com/AfzalBuilds)
- 🐙 **GitHub:** [afzalbuilds](https://github.com/afzalbuilds)
- 💼 **LinkedIn:** [afzalbuilds](https://www.linkedin.com/in/afzalbuilds/)
- 📺 **YouTube:** [@AfzalBuilds](https://www.youtube.com/@AfzalBuilds)
- 📘 **Facebook:** [AfzalBuilds](https://www.facebook.com/AfzalBuilds)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Related Tools

- [`kill-port`](https://www.npmjs.com/package/kill-port) — Simple port killer
- [`fkill-cli`](https://github.com/sindresorhus/fkill-cli) — Cross-platform process killer
- [`lsof`](https://man7.org/linux/man-pages/man8/lsof.8.html) — List open files (system tool)

---

**Made with ❤️ for developers who hate port conflicts.**

*Star this repo if it saved you time!* ⭐