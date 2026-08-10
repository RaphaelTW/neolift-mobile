# Patched image-size dependency

This is a temporary, minimal fork of `image-size@1.2.1`, kept API-compatible
with Metro's `^1.0.2` usage.

It mitigates the infinite-loop denial-of-service issues reported as:

- GHSA-w3rx-r6r6-pgpr / CVE-2025-71330 (malformed ICNS entry length)
- GHSA-5p2g-fcmc-qvqq / CVE-2025-71329 (zero/invalid JXL and HEIF box size)

The fork can be removed once Metro accepts an upstream `image-size` release
that includes both fixes. The package version uses the unpublished local suffix
`2.0.3-neolift.0` so security scanners can distinguish it from vulnerable
upstream releases through `2.0.2`.
