# Attribution

Pi-bifrost is derived from [Pi-Bifrost](https://github.com/iamaamir/pi-bifrost), originally created by [Aamir (`@iamaamir`)](https://github.com/iamaamir).

Original project contributions include the core Pi model-routing architecture, classification pipeline, reliability/circuit-breaker design, command interface, tests, documentation, and visual assets.

This fork is maintained at [the-matt-moo/pi-bifrost](https://github.com/the-matt-moo/pi-bifrost) and adds:

- subscription-aware model steering based on weekly quota remaining;
- preference for subscription providers before paid credit providers;
- independent `--scoped` and `--free` discovery flags for init/update;
- associated schemas, examples, tests, and documentation.

The package retains the original `pi-bifrost` package name and MIT license declaration for compatibility. Copyright remains with the respective contributors.
