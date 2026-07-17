# Security Policy

## Supported Versions

| Version | Supported |
|:---|:---|
| 1.2.x | ✅ |
| < 1.2.0 | ❌ |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

**DO NOT** open a public GitHub issue for security vulnerabilities.

### How to Report

1. **Email:** Send details to [iamnaime@builderhall.com](mailto:iamnaime@builderhall.com)
2. **Subject:** `[SECURITY] engineering-docs - [brief description]`
3. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment** within 48 hours
- **Status update** within 7 days
- **Fix timeline** depends on severity

## Security Considerations

### Plugin Security

This plugin:
- ✅ Does not collect or transmit user data
- ✅ Does not require network access
- ✅ Does not execute arbitrary code (skills are markdown instructions)
- ✅ Does not store credentials or tokens
- ✅ All scripts are open source and auditable

### Agent Security

When using this plugin with AI agents:
- Skills are markdown instructions — they don't execute code directly
- Scripts in `scripts/` and `scripts/` are utility tools that run locally
- The MCP server (`scripts/validate.js`) only reads files, doesn't modify them
- Hooks (`hooks/check-progress.js`) only read status, don't modify anything

### Best Practices

1. **Review skills before use** — Read SKILL.md files to understand what instructions the agent will follow
2. **Don't share sensitive data** — Skills don't need your credentials or API keys
3. **Use version control** — Track all documentation changes in git
4. **Validate outputs** — Review generated documents before using them

## Responsible Disclosure

We appreciate responsible disclosure and will credit reporters (unless they prefer anonymity).

## Contact

- **Security:** [iamnaime@builderhall.com](mailto:iamnaime@builderhall.com)
- **General:** [GitHub Issues](https://github.com/fattain-naime/engineering-docs/issues)
