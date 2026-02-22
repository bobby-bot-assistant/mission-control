# Design Lab Screenshot Guidelines

## Adding Screenshots to Design Lab Reviews

### Standard Path Structure
All Design Lab screenshots should be stored in:
```
public/design-lab/screenshots/
```

### Naming Convention
Use descriptive filenames:
```
{project}-{page}-{description}-{YYYYMMDD}.{ext}

Examples:
- pulse-scorecard-trust-statement-20260221.png
- pulse-landing-hero-redesign-20260220.png
- mc-pipeline-dashboard-v2-20260219.jpg
```

### Required File Permissions
Screenshots must be readable by the web server:
```bash
chmod 644 public/design-lab/screenshots/your-screenshot.png
```

### Steps to Add a Screenshot

1. **Save the screenshot** to `public/design-lab/screenshots/`
2. **Set proper permissions:** `chmod 644 filename.png`
3. **Update design-lab.json** with the public path:
   ```json
   {
     "afterScreenshot": "/design-lab/screenshots/pulse-scorecard-trust-statement-20260221.png"
   }
   ```
4. **Verify** the image loads at `https://mc.bobbyalexis.com/design-lab/screenshots/filename.png`

### Common Issues

**"No screenshot available" in Design Lab**
- Check file permissions: `ls -la public/design-lab/screenshots/`
- Fix: `chmod 644 filename.png`

**Wrong path in JSON**
- Paths should start with `/design-lab/screenshots/`
- Don't use relative paths like `./` or `../`
- Don't use absolute paths like `/Users/...`

### API Upload (Preferred for Agents)
Use the upload endpoint when available:
```
POST /api/design-lab/screenshots
Content-Type: multipart/form-data

Body:
  - file: <binary image data>
  - filename: "pulse-scorecard-trust-statement-20260221.png"
```
