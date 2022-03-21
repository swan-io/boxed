import * as React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import CodeBlock from "@theme/CodeBlock";
import Layout from "@theme/Layout";
import HomepageFeatures from "../components/HomepageFeatures";
import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={"hero hero--primary " + styles.hero}>
      <img src={"./img/logo.svg"} alt="" className={styles.logo} />
      <div className="container">
        <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div>
          <Link className="button button--lg" to="/getting-started">
            Get started
          </Link>
          <span className={styles.separator} />
          <Link className="button button--lg" to="/option">
            API reference
          </Link>
        </div>
      </div>
      <div className={styles.code}>
        <CodeBlock className={styles.codeBlock} language={"typescript"}>
          {`import { AsyncData } from "@swan-io/boxed";

const UserCard = ({user}: {user: AsyncData<User>}) => {
  return user.match({
    NotAsked: () => null,
    Loading: () => \`Loading\`,
    Done: (user) => {
      const name = user.name.getWithDefault("anonymous");
      return \`Hello \${name}!\`;
    },
  });
};`}
        </CodeBlock>
      </div>
    </header>
  );
}

const Home = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`Boxed: ${siteConfig.tagline}`}
      description="Functional utility types and functions for TypeScript"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
};

export default Home;
