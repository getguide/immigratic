# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please email us at security@immigratic.ca

Please do NOT create a public GitHub issue for security vulnerabilities.

## Security Measures

### Development
- Regular dependency updates
- Security audits via `npm audit`
- Code review process
- Environment variable protection

### Production
- HTTPS enforcement
- Secure headers
- Content Security Policy
- Regular security monitoring

### Data Protection
- Client data encryption
- Secure file storage
- GDPR compliance
- Privacy by design

## Security Headers

Our deployment includes:
- Strict-Transport-Security
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
