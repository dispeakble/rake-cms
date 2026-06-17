/**
 * Simple SMTP email sender using raw Node.js net/tls sockets.
 * No external dependencies — connects directly to SMTP server over TLS.
 */

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send email via SMTP using STARTTLS.
 */
export async function sendSmtpEmail(config: SmtpConfig): Promise<void> {
  const net = await import("net");
  const tls = await import("tls");

  return new Promise((resolve, reject) => {
    const connectOpts = { host: config.host, port: config.port };
    let socket: import("net").Socket | import("tls").TLSSocket;
    let buffer = "";
    let step = 0;
    let authenticated = false;
    let mailSent = false;

    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Build MIME message
    const buildMessage = () => {
      const headers = [
        `From: ${config.from}`,
        `To: ${config.to}`,
        `Subject: ${encodeMimeHeader(config.subject)}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        `Date: ${new Date().toUTCString()}`,
        "",
        `--${boundary}`,
        `Content-Type: text/plain; charset="utf-8"`,
        `Content-Transfer-Encoding: 7bit`,
        "",
        config.text,
        "",
        `--${boundary}`,
        `Content-Type: text/html; charset="utf-8"`,
        `Content-Transfer-Encoding: 7bit`,
        "",
        config.html || config.text.replace(/\n/g, "<br>"),
        "",
        `--${boundary}--`,
        ".",
      ].join("\r\n");
      return `DATA\r\n${headers}\r\n`;
    };

    const sendLine = (line: string) => {
      socket.write(line + "\r\n");
    };

    const onData = async (data: Buffer) => {
      buffer += data.toString();
      const lines = buffer.split("\r\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        // Skip continuations
        if (line.startsWith(" ") || line.startsWith("\t")) continue;

        const code = parseInt(line.substring(0, 3));
        if (line[3] === "-") continue; // Multi-line response

        switch (step) {
          case 0: // Connected, read greeting
            sendLine(`EHLO ${config.host}`);
            step = 1;
            break;

          case 1: {
            // Check for STARTTLS
            if (code === 250) {
              if (!authenticated && config.port !== 465) {
                sendLine("STARTTLS");
                step = 2;
              } else if (authenticated || config.port === 465) {
                // Already authenticated or implicit TLS
                sendLine(`AUTH LOGIN`);
                step = 4;
              } else {
                sendLine(`AUTH LOGIN`);
                step = 3;
              }
            } else {
              reject(new Error(`EHLO failed: ${line}`));
            }
            break;
          }

          case 2: // STARTTLS response
            if (code === 220) {
              // Upgrade to TLS
              const tlsSocket = tls.connect(
                { socket: socket as import("net").Socket, host: config.host },
                () => {
                  socket = tlsSocket;
                  buffer = "";
                  sendLine(`EHLO ${config.host}`);
                  step = 3;
                }
              );
              tlsSocket.on("data", (d) => onData(d));
              socket.on("error", reject);
              return;
            } else {
              reject(new Error(`STARTTLS failed: ${line}`));
            }
            break;

          case 3: // EHLO after STARTTLS
            if (code === 250) {
              sendLine(`AUTH LOGIN`);
              step = 4;
            } else {
              reject(new Error(`EHLO after STARTTLS failed: ${line}`));
            }
            break;

          case 4: // AUTH LOGIN
            if (code === 334) {
              sendLine(Buffer.from(config.user).toString("base64"));
              step = 5;
            } else {
              reject(new Error(`AUTH LOGIN failed: ${line}`));
            }
            break;

          case 5: // Password
            if (code === 334) {
              sendLine(Buffer.from(config.pass).toString("base64"));
              step = 6;
            } else {
              reject(new Error(`AUTH username rejected: ${line}`));
            }
            break;

          case 6: // Auth result
            if (code === 235) {
              authenticated = true;
              sendLine(`MAIL FROM:<${config.from}>`);
              step = 7;
            } else {
              reject(new Error(`Authentication failed: ${line}`));
            }
            break;

          case 7: // MAIL FROM
            if (code === 250) {
              sendLine(`RCPT TO:<${config.to}>`);
              step = 8;
            } else {
              reject(new Error(`MAIL FROM failed: ${line}`));
            }
            break;

          case 8: // RCPT TO
            if (code === 250 || code === 251) {
              sendLine(buildMessage());
              step = 9;
            } else {
              reject(new Error(`RCPT TO failed: ${line}`));
            }
            break;

          case 9: // DATA
            if (code === 354) {
              // Message body was already sent with DATA
              step = 10;
            } else {
              reject(new Error(`DATA command failed: ${line}`));
            }
            break;

          case 10: // Message sent
            if (code === 250) {
              mailSent = true;
              sendLine("QUIT");
              step = 11;
            } else {
              reject(new Error(`Message rejected: ${line}`));
            }
            break;

          case 11: // QUIT
            if (code === 221) {
              socket.end();
              resolve();
            }
            break;
        }
      }
    };

    // Connect with implicit TLS for port 465
    if (config.port === 465) {
      socket = tls.connect(
        { host: config.host, port: config.port, rejectUnauthorized: false },
        () => {
          sendLine(`EHLO ${config.host}`);
          authenticated = true;
          step = 4;
        }
      );
    } else {
      socket = net.createConnection(
        { host: config.host, port: config.port },
        () => {
          step = 0;
        }
      );
    }

    socket.on("data", onData);
    socket.on("error", reject);
    socket.on("close", () => {
      if (!mailSent && !authenticated) {
        reject(new Error("Connection closed unexpectedly"));
      }
    });

    // Timeout
    setTimeout(() => {
      if (!mailSent) {
        socket.destroy();
        reject(new Error("SMTP timeout"));
      }
    }, 15000);
  });
}

/**
 * Encode a UTF-8 header for SMTP (MIME encoded-word).
 */
function encodeMimeHeader(text: string): string {
  const encoded = Buffer.from(text, "utf-8").toString("base64");
  return `=?UTF-8?B?${encoded}?=`;
}
