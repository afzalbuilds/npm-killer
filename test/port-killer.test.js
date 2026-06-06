import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'child_process';
import { findNodeProcesses, killProcess, getProcessPorts } from '../lib/port-killer.js';

describe('port-killer', () => {
  let testServer;
  let testPort = 34567;
  
  before(async () => {
    // Start a test HTTP server
    testServer = spawn('node', ['-e', `
      const http = require('http');
      const server = http.createServer((req, res) => res.end('test'));
      server.listen(${testPort}, () => console.log('Server started on port ${testPort}'));
    `], { stdio: ['ignore', 'pipe', 'pipe'] });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1500));
  });
  
  after(async () => {
    if (testServer) {
      testServer.kill();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  });

  it('should find Node.js processes with open ports', async () => {
    const processes = await findNodeProcesses();
    assert.ok(Array.isArray(processes));
    
    // Our test server should be in the list
    const testProc = processes.find(p => p.ports.includes(testPort));
    assert.ok(testProc, `Should find test process on port ${testPort}`);
    assert.ok(testProc.pid > 0);
    // Name might be 'node' or include 'node' 
    assert.ok(testProc.name.toLowerCase() === 'node' || testProc.name.toLowerCase().includes('node'));
  });

  it('should get process ports correctly', async () => {
    const processes = await findNodeProcesses();
    const testProc = processes.find(p => p.ports.includes(testPort));
    
    if (testProc) {
      const ports = await getProcessPorts(testProc.pid);
      assert.ok(ports.includes(testPort));
    }
  });

  it('should kill a process by PID', async () => {
    // Start another test process to kill
    const killServer = spawn('node', ['-e', `
      const http = require('http');
      const server = http.createServer((req, res) => res.end('test'));
      server.listen(34568, () => console.log('Server started on port 34568'));
    `], { stdio: ['ignore', 'pipe', 'pipe'] });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const processes = await findNodeProcesses();
    const killProc = processes.find(p => p.ports.includes(34568));
    
    assert.ok(killProc, 'Should find process to kill');
    
    await killProcess(killProc.pid);
    
    // Verify it's dead
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const processesAfter = await findNodeProcesses();
    const deadProc = processesAfter.find(p => p.pid === killProc.pid);
    assert.strictEqual(deadProc, undefined, 'Process should be dead');
  });
});