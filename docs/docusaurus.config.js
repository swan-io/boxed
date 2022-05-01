const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/oceanicNext");

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "Boxed",
  tagline: "Functional utility types and functions for TypeScript",
  url: "https://swan-io.github.io",
  baseUrl: "/boxed/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.png",
  organizationName: "swan-io", // Usually your GitHub org/user name.
  projectName: "boxed", // Usually your repo name.
  themeConfig: {
    navbar: {
      title: "Boxed",
      logo: {
        alt: "Boxed",
        src: "img/logo.svg",
      },
      items: [
        {
          href: "/getting-started",
          label: "Getting started",
          position: "left",
        },
        {
          href: "/option",
          label: "API",
          position: "left",
        },
        {
          href: "/react-request",
          label: "Examples",
          position: "left",
        },
        {
          href: "https://codesandbox.io/s/boxed-playground-m79x9k?file=/src/index.ts",
          label: "Playground",
          position: "left",
        },
        {
          href: "https://github.com/swan-io/boxed",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      logo: {
        alt: "Swan Open Source",
        src: "img/swan-opensource.svg",
        href: "https://swan.io",
        width: 116,
        height: 43,
      },
      style: "dark",
      copyright: `Copyright © ${new Date().getFullYear()} Swan`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  scripts: [
    {
      src: "/boxed/try.js",
      async: true,
    },
  ],
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl: "https://github.com/swan-io/boxed/edit/main/docs/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
