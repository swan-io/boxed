---
title: Getting started
sidebar_label: Getting started
---

# Getting started

**Boxed** provides essential building-blocks to solve common issues you can run into in your application or library development.

## What does Boxed solve?

Virtually any application has to deal with the following states:

- **optionality** (a value being there or not)
- **success** (a value that can be computed or fails to be)
- **completion** (a value that is available or not)

If we use the default way JavaScript (and by extension TypeScript) provides to handle these, we generally end up with code that's growing more complex over time, and introduce _subtle_ bugs:

![A subtle bug](/img/successful-error.png)

## How does Boxed solve these bugs?

Boxed provides useful data-structures designed in way that **completely eliminates these issues** using properties from maths™ (don't worry, you don't need to know the full theory, you can just enjoy the benefits it provides).

![Monads & functors](/img/monads-functors.png)

Now, let's get into the details with the [core concepts](/core-concepts).
