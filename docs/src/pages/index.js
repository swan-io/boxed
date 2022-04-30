import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import CodeBlock from "@theme/CodeBlock";
import Layout from "@theme/Layout";
import * as React from "react";
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

const Block = ({ reversed = false, code, title, description }) => {
  return (
    <div className={reversed ? styles.blockReversed : styles.block}>
      <div className={styles.blockSide}>
        <CodeBlock className={styles.codeBlock} language={"typescript"}>
          {code}
        </CodeBlock>
      </div>
      <div className={styles.blockSide}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
};

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
        <div className="container">
          <Block
            code={`
// Future<Result<User, DBError>>
getUserById(id)
  // Future<Result<User, Unsubcribed | DBError>>
  .mapResult(validateSubcription)
  // Future<Result<string, Unsubcribed | DBError>>
  .mapOk(getName)
  .get(user => {
    user.match({
      // string
      Ok: name => res.send(\`Hello \${name}\`),
      // Unsubcribed | DBError
      Error: error => res.status(400).send(error),
    })
  })
`}
            title={"Type-safe building blocks"}
            description={
              <>
                Use <strong>functional type-safe constructs</strong> like{" "}
                <a href="./option">Option</a>, <a href="./result">Result</a> and{" "}
                <a href="./asyncdata">AsyncData</a>. Those types will help you
                to get rid of any kind of impossible state:{" "}
                <strong>eliminating bugs right from the modeling</strong>
                .
                <br />
                <br />
                Thanks to the tight integration with TypeScript, you'll{" "}
                <strong>get the most of the compiler</strong>.
              </>
            }
          />

          <Block
            reversed
            code={`myOption.flatMap
// (method) Option<number>.flatMap<B>(f: (value: number) => Option<B>): Option<B>
// Returns the Option containing the value from the callback
// (Option<A>, A => Option<B>) => Option<B>

myOption.map
// (method) Option<number>.map<B>(f: (value: number) => B): Option<B>
// Returns the Option containing the value from the callback
// (Option<A>, A => B) => Option<B>
`}
            title={"Taylored for your IDE"}
            description={
              <>
                Thanks to our <strong>chaining API</strong>, you get a nice{" "}
                <strong>autocomplete</strong> right from the value.
                <br />
                <br />
                Boxed leverages the JavaScript class API so that you don't need
                to import any module to work with a Boxed value:{" "}
                <strong>it's all available as a method</strong>.
                <br />
                <br />
                On top of that, the Boxed API is minimal, so that your tooling
                doesn't feel overwhelming.
              </>
            }
          />
        </div>
      </main>
    </Layout>
  );
};

export default Home;
