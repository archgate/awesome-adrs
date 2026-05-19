---
id: ARCH-011
title: Python for Data-Related Tasks
domain: architecture
rules: true
files: ["packages/jobs/**"]
---

## Context

TypeScript is the primary language for general-purpose application development (backend APIs, frontend UIs, business logic). However, certain specialized domains have toolchains overwhelmingly standardized on Python. For data-related tasks, specifically data engineering (jobs) and machine learning (ML), the industry standard is Python. The ecosystem of libraries (e.g., Pandas, NumPy, Scikit-learn, PyTorch, TensorFlow) and platforms for these tasks is almost exclusively Python-based.

Forcing TypeScript for these specific tasks would be counter-productive, requiring teams to use immature or non-existent JavaScript/TypeScript data libraries, build complex bridges to shell out to Python scripts, and force data scientists and data engineers to work in an unfamiliar language.

## Decision

**Python** is the primary programming language for **data-related tasks** (jobs and machine learning functions). This applies to two specific categories of work:

- **Data Jobs:** Batch processing, ETL/ELT pipelines, data cleaning, data aggregation, and any asynchronous heavy data-processing task.
- **Machine Learning Functions:** All aspects of the ML lifecycle including data analysis, feature engineering, model training, model evaluation, and model inference.

This serves as a targeted exception to TypeScript as the primary language:

- For all general application code (APIs, UIs, etc.), TypeScript remains the standard.
- For the specific tasks defined above, Python takes precedence.
- Python code must be confined to designated directories (`packages/jobs/`).

## Do's and Don'ts

### Do

- Use Python for all new code related to data processing jobs and ML model development/inference.
- Leverage the mature Python data ecosystem (e.g., Pandas, Scikit-learn, PyTorch, TensorFlow).
- Package Python code so it can be invoked by the main TypeScript application (e.g., as a sidecar process, containerized job, or subprocess).
- Maintain clear, well-defined API contracts between TypeScript services and Python services/jobs.

### Don't

- Use Python to build general-purpose backend APIs, frontend components, or business logic that is not directly related to a data job or ML function.
- Attempt to use JavaScript/TypeScript libraries for heavy data manipulation or ML training where a mature Python equivalent exists.
- Mix Python and TypeScript within the same service or codebase; maintain a clear separation of concerns.
- Place Python files outside the designated `packages/jobs/` directory.

## Consequences

### Positive

- Leverage the entire mature, industry-standard Python ecosystem for data science and ML.
- Data scientists and data engineers can use the tools they are most proficient with.
- Enforces clear separation of concerns between core application logic (TypeScript) and specialized data processing (Python).

### Negative

- Introduces a polyglot (multi-language) architecture, adding complexity to the ecosystem.
- Requires building, testing, and deploying pipelines for two different languages.
- Requires careful management of the boundary between TypeScript and Python components.
