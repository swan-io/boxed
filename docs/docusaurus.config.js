// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/oceanicNext");

/** @type {import('@docusaurus/types').Config} */
module.exports = {
  title: "Boxed",
  tagline: "Functional utility types and functions for TypeScript",
  url: "https://swan-io.github.io",
  baseUrl: "/boxed/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.png",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "swan-io", // Usually your GitHub org/user name.
  projectName: "boxed", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/swan-io/boxed/edit/main/docs/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  scripts: [
    {
      src: "/boxed/try.js",
      async: true,
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
        appId: "LI6T7CQ5U8",
        apiKey: "c78a649315c0b39c2d8752c61e24da6f",
        indexName: "boxed",
        contextualSearch: true,
        searchParameters: {},
        searchPagePath: "search",
      },
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
    }),
};
