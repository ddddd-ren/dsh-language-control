# Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/my-feature`).
3. Commit your changes (`git commit -am 'feat: add something'`).
4. Push to the branch (`git push origin feat/my-feature`).
5. Open a Pull Request.

## Development

```sh
# Link locally for testing
dsh plugin --profile web add file:.
# Or after publishing
dsh plugin --profile web add @deepseek-ai/dsh-language-control
```

## Release

1. Bump version in `package.json`.
2. Update `CHANGELOG.md`.
3. Tag the release (`git tag v1.0.1`).
4. Push tag (`git push origin v1.0.1`).