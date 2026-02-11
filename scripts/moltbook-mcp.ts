import { moltbookService } from "../utils/moltbook-service";

// Simple JSON-RPC 2.0 handler for MCP
async function handleMessage(message: any) {
    if (message.method === "initialize") {
        return {
            jsonrpc: "2.0",
            id: message.id,
            result: {
                protocolVersion: "2024-11-05",
                capabilities: {
                    tools: {}
                },
                serverInfo: {
                    name: "moltbook-mcp",
                    version: "1.0.0"
                }
            }
        };
    }

    if (message.method === "notifications/initialized") {
        // No response needed for notifications
        return null;
    }

    if (message.method === "tools/list") {
        return {
            jsonrpc: "2.0",
            id: message.id,
            result: {
                tools: [
                    {
                        name: "checkNotifications",
                        description: "Check for new notifications (mentions, replies) on Moltbook.",
                        inputSchema: {
                            type: "object",
                            properties: {},
                        }
                    },
                    {
                        name: "postToMoltbook",
                        description: "Post a new status update or thought to Moltbook.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                content: {
                                    type: "string",
                                    description: "The text content to post."
                                },
                                submolt: {
                                    type: "string",
                                    description: "Optional submolt (topic) to post to.",
                                    default: "strategy"
                                }
                            },
                            required: ["content"]
                        }
                    }
                ]
            }
        };
    }

    if (message.method === "tools/call") {
        const { name, arguments: args } = message.params;
        
        try {
            let result;
            if (name === "checkNotifications") {
                const notifications = await moltbookService.checkNotifications();
                result = JSON.stringify(notifications, null, 2);
            } else if (name === "postToMoltbook") {
                const { content, submolt } = args;
                const response = await moltbookService.postToMoltbook(content, submolt);
                result = JSON.stringify(response, null, 2);
            } else {
                throw new Error(`Unknown tool: ${name}`);
            }

            return {
                jsonrpc: "2.0",
                id: message.id,
                result: {
                    content: [
                        {
                            type: "text",
                            text: result
                        }
                    ]
                }
            };
        } catch (error: any) {
            return {
                jsonrpc: "2.0",
                id: message.id,
                error: {
                    code: -32603,
                    message: error.message
                }
            };
        }
    }

    // Default: Method not found
    if (message.id) {
         return {
            jsonrpc: "2.0",
            id: message.id,
            error: {
                code: -32601,
                message: "Method not found"
            }
        };
    }
    
    return null;
}

// Stdio Loop
process.stdin.setEncoding('utf8');

let buffer = '';

process.stdin.on('data', async (chunk) => {
    buffer += chunk;
    
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

    for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
            const message = JSON.parse(line);
            const response = await handleMessage(message);
            if (response) {
                process.stdout.write(JSON.stringify(response) + '\n');
            }
        } catch (error) {
            console.error("Failed to process message:", error, line);
        }
    }
});

console.error("Moltbook MCP Server running...");
