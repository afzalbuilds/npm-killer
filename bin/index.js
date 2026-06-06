#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { findNodeProcesses, killProcess, interactiveKill } from '../lib/port-killer.js';

program
  .name('npm-killer')
  .description('Interactive CLI tool to kill Node.js processes on ports')
  .version('1.0.0')
  .option('-p, --port <port>', 'Kill process on specific port')
  .option('-a, --all', 'Kill all Node.js processes')
  .option('-l, --list', 'List all Node.js processes with ports')
  .option('-f, --force', 'Force kill without confirmation')
  .action(async (options) => {
    try {
      if (options.list) {
        await listProcesses();
        return;
      }

      if (options.port) {
        await killByPort(options.port, options.force);
        return;
      }

      if (options.all) {
        await killAll(options.force);
        return;
      }

      // Default: interactive mode
      await interactiveMode();
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

async function listProcesses() {
  const processes = await findNodeProcesses();
  
  if (processes.length === 0) {
    console.log(chalk.yellow('No Node.js processes found with open ports.'));
    return;
  }

  console.log(chalk.bold('\n  Node.js Processes with Open Ports:\n'));
  
  // Calculate column widths
  const maxNameLen = Math.max(...processes.map(p => p.name.length), 4);
  const maxPidLen = Math.max(...processes.map(p => String(p.pid).length), 3);
  
  // Header
  console.log(`  ${chalk.cyan('#'.padEnd(3))} ${chalk.bold('Name'.padEnd(maxNameLen))}  ${chalk.bold('PID'.padStart(maxPidLen))}  ${chalk.bold('Ports')}  ${chalk.gray('Command')}`);
  console.log(`  ${chalk.gray('─'.repeat(3))} ${chalk.gray('─'.repeat(maxNameLen))}  ${chalk.gray('─'.repeat(maxPidLen))}  ${chalk.gray('─────')}  ${chalk.gray('───────')}`);
  
  processes.forEach((proc, index) => {
    const ports = proc.ports.length > 0 ? proc.ports.join(',') : '—';
    // Truncate command to fit
    const cmd = proc.cmd.length > 60 ? proc.cmd.substring(0, 57) + '...' : proc.cmd;
    const name = proc.name.length > maxNameLen ? proc.name.substring(0, maxNameLen - 1) + '…' : proc.name.padEnd(maxNameLen);
    console.log(`  ${chalk.cyan(String(index + 1).padEnd(3))} ${chalk.white(name)}  ${chalk.green(String(proc.pid).padStart(maxPidLen))}  ${chalk.yellow(ports.padEnd(5))}  ${chalk.gray(cmd)}`);
  });
  console.log();
}

async function killByPort(port, force) {
  const processes = await findNodeProcesses();
  const target = processes.find(p => p.ports.includes(parseInt(port)));
  
  if (!target) {
    console.log(chalk.yellow(`No Node.js process found on port ${port}`));
    return;
  }

  if (!force) {
    const inquirer = (await import('inquirer')).default;
    const answer = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `Kill ${target.name} (PID: ${target.pid}) on port ${port}?`,
      default: false
    }]);
    
    if (!answer.confirm) {
      console.log(chalk.gray('Cancelled.'));
      return;
    }
  }

  await killProcess(target.pid);
  console.log(chalk.green(`✓ Killed ${target.name} (PID: ${target.pid}) on port ${port}`));
}

async function killAll(force) {
  const processes = await findNodeProcesses();
  
  if (processes.length === 0) {
    console.log(chalk.yellow('No Node.js processes found with open ports.'));
    return;
  }

  if (!force) {
    const inquirer = (await import('inquirer')).default;
    const answer = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `Kill all ${processes.length} Node.js process(es)?`,
      default: false
    }]);
    
    if (!answer.confirm) {
      console.log(chalk.gray('Cancelled.'));
      return;
    }
  }

  for (const proc of processes) {
    try {
      await killProcess(proc.pid);
      console.log(chalk.green(`✓ Killed ${proc.name} (PID: ${proc.pid})`));
    } catch (error) {
      console.error(chalk.red(`✗ Failed to kill ${proc.name} (PID: ${proc.pid}):`), error.message);
    }
  }
}

async function interactiveMode() {
  await interactiveKill();
}

program.parse();