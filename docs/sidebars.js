/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation
 The sidebars can be generated from the filesystem, or explicitly defined here.
 Create as many sidebars as you want.
 */

module.exports = {
  docs: [
    {
      type: "doc",
      id: "getting-started",
    },
    {
      type: "doc",
      id: "core-concepts",
    },
    {
      type: "doc",
      id: "trivia",
    },
    {
      type: "category",
      label: "API",
      collapsed: false,
      items: [
        "option",
        "result",
        "async-data",
        "future",
        "future-result",
        "deferred",
        "array",
        "dict",
        "lazy",
        "serializer",
      ],
    },
    {
      type: "category",
      label: "Examples",
      collapsed: false,
      items: [
        "react-request",
        "form-validation",
        "defaults",
        "cancellable-request",
      ],
    },
  ],
};
