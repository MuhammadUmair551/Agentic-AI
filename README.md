"# code_base_squid" 
"# nutshyll" 

## Security exceptions

`GHSA-vfj7-8cjw-p6xm` (braces) is temporarily allowlisted in `security-exceptions.json`. npm currently publishes only 3.0.3 despite the advisory declaring 3.0.4 as the first patched version. It is a dev-only transitive dependency through shadcn/fast-glob/micromatch. Remove the exception as soon as an upstream patched release is available.
