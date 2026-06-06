# npm-killer

Interactive CLI tool to find and kill Node.js processes running on ports. Unlike other port killers, this tool is designed to be **interactive and developer-friendly**.

## Features

- 🎯 **Interactive Mode** - Visual process selection with checkboxes
- 🔍 **Smart Detection** - Finds only Node.js processes (node, npm, yarn, pnpm, bun)
- 📋 **List Mode** - See all Node.js processes with their ports
- ⚡ **Quick Kill** - Kill by port number or kill all at once
- 🛡️ **Safe by Default** - Confirmation prompts before killing
- 🎨 **Beautiful Output** - Color-coded, easy to read

## Installation

```bash
npm install -g npm-killer
```

Or use with npx:
```bash
npx npm-killer
```

## Usage

### Interactive Mode (Default)
```bash
npm-killer
```
Shows a checklist of all Node.js processes with open ports. Select multiple processes with spacebar, press Enter to confirm.

### List Processes
```bash
npm-killer --list
# or
npm-killer -l
```

### Kill by Port
```bash
npm-killer --port 3000
# or
npm-killer -p 3000
```

### Kill All Node.js Processes
```bash
npm-killer --all
# or
npm-killer -a
```

### Force Kill (No Confirmation)
```bash
npm-killer --port 3000 --force
npm-killer -p 3000 -f

npm-killer --all --force
npm-killer -a -f
```

## Example Output

```
$ npm-killer

  Select processes to kill:

  ✓ 1. node (PID: 12345) - Ports: 3000, 3001
  ✓ 2. npm (PID: 12346) - Ports: 8080
  ──────────────
  ◯ Kill ALL Node.js processes
  ◯ Exit without killing

  Kill 2 process(es)? (y/N) y

  ✓ Killed node (PID: 12345)
  ✓ Killed npm (PID: 12346)
```

## Why npm-killer?

Existing tools like `fuser`, `lsof`, or `kill-port` require you to know the port or PID upfront. `npm-killer` is built for developers who:
- Run multiple Node.js services and forget which is on which port
- Want a visual overview before killing anything
- Prefer interactive selection over memorizing commands
- Work with npm, yarn, pnpm, bun - all detected automatically

## Requirements

- Node.js 18+
- macOS, Linux, or Windows (WSL)

## License

MIT