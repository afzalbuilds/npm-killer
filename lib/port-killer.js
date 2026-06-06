import { execSync } from 'child_process';
import psList from 'ps-list';
import inquirer from 'inquirer';
import chalk from 'chalk';

export async function findNodeProcesses() {
  const processes = await psList();
  
  const nodeProcesses = processes.filter(proc => {
    const name = proc.name.toLowerCase();
    const cmd = proc.cmd.toLowerCase();
    return name === 'node' || 
           name.includes('node') ||
           name.includes('next-server') ||
           cmd.includes('node') || 
           cmd.includes('npm') ||
           cmd.includes('yarn') ||
           cmd.includes('pnpm') ||
           cmd.includes('bun');
  });

  const processesWithPorts = [];
  
  for (const proc of nodeProcesses) {
    const ports = await getProcessPorts(proc.pid);
    if (ports.length > 0) {
      processesWithPorts.push({
        pid: proc.pid,
        name: proc.name,
        cmd: proc.cmd,
        ports
      });
    }
  }
  
  return processesWithPorts;
}

export async function getProcessPorts(pid) {
  try {
    const output = execSync(`lsof -i -P -p ${pid} 2>/dev/null`, { 
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
    
    const ports = [];
    const lines = output.trim().split('\n');
    const pidStr = String(pid);
    
    for (const line of lines) {
      // Match lines where column 2 (PID) matches our target PID and it's LISTENing
      // lsof format: COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2 && parts[1] === pidStr) {
        const match = line.match(/:(\d+)\s+\(LISTEN\)$/);
        if (match) {
          ports.push(parseInt(match[1]));
        }
      }
    }
    
    return [...new Set(ports)];
  } catch (error) {
    return [];
  }
}

export async function killProcess(pid, signal = 'SIGTERM') {
  try {
    process.kill(pid, signal);
    
    // Wait a bit and check if process is still alive
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      process.kill(pid, 0); // Check if process exists
      // If we get here, process still exists, force kill
      if (signal !== 'SIGKILL') {
        return killProcess(pid, 'SIGKILL');
      }
    } catch (e) {
      // Process is dead, success
      return true;
    }
  } catch (error) {
    throw new Error(`Failed to kill process ${pid}: ${error.message}`);
  }
}

export async function interactiveKill() {
  const processes = await findNodeProcesses();
  
  if (processes.length === 0) {
    console.log(chalk.yellow('\n  No Node.js processes found with open ports.\n'));
    return;
  }

  console.log(chalk.bold('\n  Select processes to kill:\n'));
  
  const choices = processes.map((proc, index) => {
    const ports = proc.ports.length > 0 ? proc.ports.join(', ') : 'none';
    return {
      name: `${chalk.cyan(index + 1)}. ${chalk.white(proc.name)} ${chalk.gray(`(PID: ${proc.pid})`)} - ${chalk.yellow('Ports:')} ${chalk.yellow(ports)}`,
      value: proc,
      short: `${proc.name} (${proc.pid})`
    };
  });
  
  choices.push(new inquirer.Separator());
  choices.push({
    name: chalk.red('Kill ALL Node.js processes'),
    value: 'ALL'
  });
  choices.push({
    name: chalk.gray('Exit without killing'),
    value: 'EXIT'
  });

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Use space to select, enter to confirm:',
      choices,
      validate: (answer) => {
        if (answer.length === 0) {
          return 'Select at least one process or choose Exit';
        }
        return true;
      }
    }
  ]);

  if (selected.includes('EXIT') || selected.length === 0) {
    console.log(chalk.gray('\n  Cancelled.\n'));
    return;
  }

  const toKill = selected.includes('ALL') ? processes : selected.filter(s => s !== 'ALL');
  
  // Final confirmation
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Kill ${toKill.length} process(es)?`,
      default: false
    }
  ]);

  if (!confirm) {
    console.log(chalk.gray('\n  Cancelled.\n'));
    return;
  }

  console.log('');
  for (const proc of toKill) {
    try {
      await killProcess(proc.pid);
      console.log(chalk.green(`  ✓ Killed ${proc.name} (PID: ${proc.pid})`));
    } catch (error) {
      console.error(chalk.red(`  ✗ Failed to kill ${proc.name} (PID: ${proc.pid}):`), error.message);
    }
  }
  console.log('');
}