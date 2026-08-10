# Patched image-size dependency

This is a temporary, minimal fork of `image-size@1.2.1`, kept API-compatible
with Metro's `^1.0.2` usage.

It mitigates the infinite-loop denial-of-service issues reported as:

- GHSA-w3rx-r6r6-pgpr / CVE-2025-71330 (malformed ICNS entry length)
- GHSA-5p2g-fcmc-qvqq / CVE-2025-71329 (zero/invalid JXL and HEIF box size)

The fork can be removed once Metro accepts an upstream `image-size` release
that includes both fixes. The package version uses the unpublished local suffix
`2.0.3-neolift.1` so security scanners can distinguish it from vulnerable
upstream releases through `2.0.2`.

## Packaging

The application installs this fork from the versioned tarball at
`vendor/image-size-2.0.3-neolift.1.tgz`. This avoids platform-dependent links
created by npm for local directories and keeps clean EAS installations
deterministic.

After changing the fork, update its version and regenerate the tarball with:

```sh
npm run vendor:pack:image-size
```

Then run `npm install` to refresh `package-lock.json` and
`npm run release:check` to verify Metro can load the installed package.
