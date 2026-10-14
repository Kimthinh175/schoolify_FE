import { NextRequest, NextResponse } from 'next/server';
import { exec, spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

interface ExecuteRequest {
  language: 'cpp' | 'c' | 'python';
  code?: string;
  sourceCode?: string;
  input?: string;
  stdin?: string;
  timeLimitMs?: number;
  timeoutMs?: number;
}

export async function POST(req: NextRequest) {
  let tmpDir = '';
  try {
    const body: ExecuteRequest = await req.json();
    const language = body.language;
    const code = body.code || body.sourceCode || '';
    const input = body.input !== undefined ? body.input : (body.stdin !== undefined ? body.stdin : '');
    const timeLimitMs = body.timeLimitMs || body.timeoutMs || 2500;

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp mã nguồn (code/sourceCode) và ngôn ngữ (language)' },
        { status: 400 }
      );
    }

    if (!['cpp', 'c', 'python'].includes(language)) {
      return NextResponse.json(
        { error: 'Ngôn ngữ chưa được hỗ trợ. Chỉ hỗ trợ cpp, c, python' },
        { status: 400 }
      );
    }

    // Tạo thư mục tạm an toàn
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'schoolify_code_'));

    let sourceFile = '';
    let execFile = '';
    let compileCmd = '';

    if (language === 'cpp') {
      sourceFile = path.join(tmpDir, 'solution.cpp');
      execFile = path.join(tmpDir, 'solution.out');
      await fs.writeFile(sourceFile, code, 'utf-8');
      compileCmd = `g++ -O2 -std=c++20 "${sourceFile}" -o "${execFile}"`;
    } else if (language === 'c') {
      sourceFile = path.join(tmpDir, 'solution.c');
      execFile = path.join(tmpDir, 'solution.out');
      await fs.writeFile(sourceFile, code, 'utf-8');
      compileCmd = `gcc -O2 "${sourceFile}" -o "${execFile}"`;
    } else if (language === 'python') {
      sourceFile = path.join(tmpDir, 'solution.py');
      await fs.writeFile(sourceFile, code, 'utf-8');
    }

    // 1. Biên dịch đối với C / C++
    if (compileCmd) {
      try {
        await new Promise<void>((resolve, reject) => {
          exec(compileCmd, { timeout: 10000 }, (error, stdout, stderr) => {
            if (error) {
              reject(stderr || stdout || error.message);
            } else {
              resolve();
            }
          });
        });
      } catch (compileErr: any) {
        return NextResponse.json({
          status: 'COMPILE_ERROR',
          stdout: '',
          stderr: String(compileErr).slice(0, 4000),
          timeMs: 0,
        });
      }
    }

    // 2. Thực thi chương trình kèm giới hạn thời gian (Timeout)
    const runCmd =
      language === 'python'
        ? 'python3'
        : execFile;
    const runArgs = language === 'python' ? [sourceFile] : [];

    const startTime = Date.now();

    const runResult = await new Promise<{
      status: 'SUCCESS' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR';
      stdout: string;
      stderr: string;
      timeMs: number;
    }>((resolve) => {
      const child = spawn(runCmd, runArgs, {
        cwd: tmpDir,
        env: {
          ...process.env,
          LANG: 'en_US.UTF-8',
          PYTHONDONTWRITEBYTECODE: '1',
        },
      });

      let stdoutData = '';
      let stderrData = '';
      let timedOut = false;

      const timeoutId = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, timeLimitMs);

      child.stdout.on('data', (chunk) => {
        if (stdoutData.length < 50000) {
          stdoutData += chunk.toString();
        }
      });

      child.stderr.on('data', (chunk) => {
        if (stderrData.length < 10000) {
          stderrData += chunk.toString();
        }
      });

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        const elapsed = Date.now() - startTime;

        if (timedOut) {
          resolve({
            status: 'TIME_LIMIT_EXCEEDED',
            stdout: stdoutData,
            stderr: `Quá thời gian thực thi (Time Limit Exceeded > ${timeLimitMs}ms)`,
            timeMs: timeLimitMs,
          });
          return;
        }

        if (code !== 0) {
          resolve({
            status: 'RUNTIME_ERROR',
            stdout: stdoutData,
            stderr: stderrData || `Chương trình thoát với mã lỗi ${code} (Runtime Error)`,
            timeMs: elapsed,
          });
          return;
        }

        resolve({
          status: 'SUCCESS',
          stdout: stdoutData,
          stderr: '',
          timeMs: elapsed,
        });
      });

      child.on('error', (err) => {
        clearTimeout(timeoutId);
        resolve({
          status: 'RUNTIME_ERROR',
          stdout: stdoutData,
          stderr: err.message,
          timeMs: Date.now() - startTime,
        });
      });

      // Bơm input vào stdin
      if (input) {
        child.stdin.write(input);
      }
      child.stdin.end();
    });

    return NextResponse.json(runResult);
  } catch (err: any) {
    console.error('Error executing code:', err);
    return NextResponse.json(
      {
        status: 'RUNTIME_ERROR',
        stdout: '',
        stderr: err?.message || 'Lỗi máy chủ khi chạy code',
        timeMs: 0,
      },
      { status: 500 }
    );
  } finally {
    if (tmpDir) {
      try {
        await fs.rm(tmpDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup error
      }
    }
  }
}
