---
name: Multiplier Node
status: ideating
---

# Multiplier Node

## Summary

A compute node that multiplies two number inputs together and outputs the result.

- Two inputs: `a` and `b` (both `number`)
- One output: `product` (`number`)
- Both inputs are modulatable (static value or ref), default `1.0`
- Typical uses: scaling a wave output, modulating an orbit radius

## Notes

- Lives in the compute layer
- Stateless pure function — no canvas access, no side effects
