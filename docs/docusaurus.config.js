const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "Boxed",
  tagline: "Functional utility types and functions for TypeScript",
  url: "https://bloodyowl.github.io",
  baseUrl: "/boxed/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.png",
  organizationName: "bloodyowl", // Usually your GitHub org/user name.
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
          href: "https://github.com/swan-io/boxed",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      copyright: `Copyright © ${new Date().getFullYear()} Swan`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl: "https://github.com/bloodyowl/rescript-test/edit/main/docs/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
