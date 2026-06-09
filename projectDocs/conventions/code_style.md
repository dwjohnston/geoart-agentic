--- 
canon: CANONICAL STATUS 👑 - 2026-05-16
title: "Code Style"
description: "ES modules, no enums, assertion style"
---

## Tooling 

- Use Bun as package manager and for runtime.

## Code Style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Do not use the `interface` keyword. 
- Do not use the TypeScript `enum` keyword. 
- Do not use the TypeScript `!` non-null assertion operator. Instead if a thing is typed as optional, but it's certain that in practise the thing will always exist, check for its non existence and throw `NeverShouldHappenError` if it does not exist. 
  - eg. 
   ```tsx
  function handleClick() {
      if(!someRef.value){
         throw new NeverShouldHappenError();
      }
      someRef.value.doSomething(); 
  }
   ```
  - Exception - `!` is ok in tests. Although better test data would be the more optimal solution.

