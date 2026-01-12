# Public Directory - Jai Mala

This directory contains static files for the Jai Mala matrimonial platform that are served via Firebase Hosting.

## Files

### Main Pages
- **index.html** - Landing page with features, plans, and CTAs
- **404.html** - Custom error page for not found URLs
- **about.html** - About us page
- **contact.html** - Contact form and information
- **privacy.html** - Privacy policy
- **terms.html** - Terms and conditions

### Assets
- **styles.css** - Global stylesheet for static pages
- **manifest.json** - PWA manifest for mobile installation
- **robots.txt** - SEO and crawler instructions

### Missing Assets (To Be Added)
You should add the following image files:
- `favicon.png` - Site favicon (32x32 or 64x64 px)
- `apple-touch-icon.png` - iOS home screen icon (180x180 px)
- `og-image.png` - Open Graph preview image (1200x630 px)
- `icon-192.png` - PWA icon (192x192 px)
- `icon-512.png` - PWA icon (512x512 px)

## Firebase Hosting

This folder is configured in `firebase.json` to be served via Firebase Hosting. All requests are rewritten to `/index.html` for SPA routing support.

## Deployment

To deploy these files to Firebase Hosting:

```bash
firebase deploy --only hosting
```

## Notes

- The React app (client folder) should be built and its dist/build files copied here before deployment
- These static pages serve as fallback content if the React app is not deployed
- Update logo images and icons as needed for branding
