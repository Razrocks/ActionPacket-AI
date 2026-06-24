# Tool Boundary & MCP Model (Phase 8)

The model is handed zero tools. For the lease-renewal request it reads the text and returns JSON — it can't open a browser, run code, or touch Drive. Filing and tracking are done by our own code *after* the model returns. This doc states that boundary plainly (and why there's no MCP server in the picture): one request in, validated structure out.

## Tool surfaces
**None exposed to the model.** The single Skill (`analyze-request`) uses zero tools — it is one structured-output call (`messages.parse` + `zodOutputFormat`), no tool-use loop, no sub-agents.

The external systems (Anthropic, Drive, Sheets, Puppeteer) are wrapped as **internal adapters/services**, invoked by deterministic code — they are not tools the model can call.

## MCP
**MCP candidate list: empty.** Justified: single-call structured extraction needs no tool/agent surface. Adding MCP here would be architecture vanity.

## Boundary summary
| Surface | Model-facing? | Kind |
|---|---|---|
| Anthropic API | n/a (this *is* the model call) | inference |
| Drive adapter | No | internal service |
| Sheets adapter | No | internal service |
| Puppeteer | No | internal service |
| SQLite | No | internal store |

## Anti-pattern
Turning every internal capability into a model tool or MCP server. Keep the model boundary minimal: one call in, validated JSON out.
