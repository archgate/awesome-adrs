/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "e2e-type-safety-setup": {
      description:
        "The frontend must depend on the backend package and import hc/hcWithType for end-to-end type safety",
      async check(ctx) {
        let frontendPkg: PackageJson | undefined;
        try {
          frontendPkg = (await ctx.readJSON("packages/frontend/package.json")) as PackageJson;
        } catch {
          ctx.report.warning({
            message:
              "packages/frontend/package.json not found — cannot verify e2e type safety setup",
            file: "packages/frontend/package.json",
          });
          return;
        }

        const deps = frontendPkg.dependencies ?? {};
        const devDeps = frontendPkg.devDependencies ?? {};
        const allDeps = { ...deps, ...devDeps };

        // Check that the frontend depends on the backend workspace package
        const backendDepNames = Object.keys(allDeps).filter(
          (name) => name.includes("backend") || allDeps[name]?.startsWith("workspace:"),
        );

        // Look for a backend workspace dependency
        let hasBackendDep = false;
        for (const name of backendDepNames) {
          const value = allDeps[name];
          if (value?.startsWith("workspace:") && name.includes("backend")) {
            hasBackendDep = true;
            break;
          }
        }

        if (!hasBackendDep) {
          // Also check for any workspace:* dep that references the backend
          const workspaceDeps = Object.entries(allDeps).filter(([, v]) =>
            v?.startsWith("workspace:"),
          );
          if (workspaceDeps.length === 0) {
            ctx.report.warning({
              message:
                "packages/frontend/package.json has no workspace dependency on the backend package — e2e type safety requires the backend as a workspace dependency",
              file: "packages/frontend/package.json",
              fix: 'Add the backend package as a workspace dependency (e.g., "@myapp/backend": "workspace:*")',
            });
          }
        }

        // Check for hc or hcWithType import in frontend source files
        const apiClientFiles = await ctx.glob("packages/frontend/src/api/client.ts");

        if (apiClientFiles.length === 0) {
          // Also check for .tsx variant
          const apiClientTsx = await ctx.glob("packages/frontend/src/api/client.tsx");
          if (apiClientTsx.length === 0) {
            ctx.report.warning({
              message:
                "packages/frontend/src/api/client.ts not found — expected Hono RPC client setup file",
              file: "packages/frontend/src/api/client.ts",
              fix: "Create packages/frontend/src/api/client.ts with hc or hcWithType import from hono/client",
            });
            return;
          }
        }

        // Check that the client file imports hc or hcWithType
        const clientFile =
          apiClientFiles[0] ?? (await ctx.glob("packages/frontend/src/api/client.tsx"))[0];

        if (clientFile) {
          const content = await ctx.readFile(clientFile);
          const hasHcImport = /\bhc\b/.test(content) || /\bhcWithType\b/.test(content);

          if (!hasHcImport) {
            ctx.report.violation({
              message: `${clientFile}: does not import hc or hcWithType from hono/client`,
              file: clientFile,
              fix: "Import hc or hcWithType from hono/client and create a typed API client",
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
