/**
 * Chapter 1 vault object AR (Kitchen Microwave Cupboard).
 * Placeholder only — do not train object targets in this build.
 */
export function createVaultObjectArStub({ vault = 'Kitchen Microwave Cupboard' } = {}) {
  return {
    kind: 'object-ar-stub',
    vault,
    trained: false,
    engine: 'stub',
    start() {
      return this
    },
    stop() {},
  }
}
