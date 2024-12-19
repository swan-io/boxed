"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[658],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>h});var a=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,o=function(e,t){if(null==e)return{};var n,a,o={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=a.createContext({}),p=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,r=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=p(n),m=o,h=u["".concat(s,".").concat(m)]||u[m]||d[m]||r;return n?a.createElement(h,i(i({ref:t},c),{},{components:n})):a.createElement(h,i({ref:t},c))}));function h(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var r=n.length,i=new Array(r);i[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[u]="string"==typeof e?e:o,i[1]=l;for(var p=2;p<r;p++)i[p]=n[p];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},7035:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>d,frontMatter:()=>r,metadata:()=>l,toc:()=>p});var a=n(7462),o=(n(7294),n(3905));const r={title:"Core Concepts",sidebar_label:"Core Concepts"},i=void 0,l={unversionedId:"core-concepts",id:"core-concepts",title:"Core Concepts",description:"The Boxed approach takes root in typed functional paradigms. We know that these concepts can be overwhelming, especially with their jargon and mathematical concepts, and therefore want to make them more accessible.",source:"@site/docs/core-concepts.md",sourceDirName:".",slug:"/core-concepts",permalink:"/core-concepts",draft:!1,editUrl:"https://github.com/swan-io/boxed/edit/main/docs/docs/core-concepts.md",tags:[],version:"current",frontMatter:{title:"Core Concepts",sidebar_label:"Core Concepts"},sidebar:"docs",previous:{title:"Getting started",permalink:"/getting-started"},next:{title:"Installation",permalink:"/installation"}},s={},p=[{value:"Schr\xf6dinger&#39;s cat",id:"schr\xf6dingers-cat",level:2},{value:"Boxes",id:"boxes",level:2},{value:"Data-manipulation basics",id:"data-manipulation-basics",level:2},{value:"The main kind of boxes",id:"the-main-kind-of-boxes",level:2},{value:"<strong>Option&lt;Value&gt;</strong>",id:"optionvalue",level:3},{value:"<strong>Result&lt;Ok, Error&gt;</strong>",id:"resultok-error",level:3},{value:"<strong>AsyncData&lt;Value&gt;</strong>",id:"asyncdatavalue",level:3},{value:"<strong>Future&lt;Value&gt;</strong>",id:"futurevalue",level:3}],c={toc:p},u="wrapper";function d(e){let{components:t,...r}=e;return(0,o.kt)(u,(0,a.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"The Boxed approach takes root in ",(0,o.kt)("strong",{parentName:"p"},"typed functional paradigms"),". We know that these concepts can be overwhelming, especially with their jargon and mathematical concepts, and therefore want to make them more ",(0,o.kt)("strong",{parentName:"p"},"accessible"),"."),(0,o.kt)("p",null,(0,o.kt)("img",{src:n(2522).Z,width:"600",height:"600"})),(0,o.kt)("p",null,"As beautiful and powerful these concepts are, they come with a huge learning curve that we want to avoid. We also want your code to be ",(0,o.kt)("strong",{parentName:"p"},"simple to read, write and reason about")," without having to know the full theory behind."),(0,o.kt)("admonition",{type:"warning"},(0,o.kt)("p",{parentName:"admonition"},"If you have a strong opinion on what metaphor to use to describe monads, please stop reading this page immediately and visit the ",(0,o.kt)("a",{parentName:"p",href:"./option"},"API reference"),".")),(0,o.kt)("h2",{id:"schr\xf6dingers-cat"},"Schr\xf6dinger's cat"),(0,o.kt)("p",null,"When physicists discovered that particules do weird stuff, they decided that while we don't look at them, they're in a ",(0,o.kt)("strong",{parentName:"p"},"superposition of states"),"."),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/Erwin_Schr%C3%B6dinger"},"Erwin Schr\xf6dinger")," didn't like that one bit and decided to show them how utterly stupid it was. For that, he created a thought experiment now called the ",(0,o.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/Schr%C3%B6dinger%27s_cat"},"Schr\xf6dinger's cat")," experiment, in which a cat is put into a ",(0,o.kt)("strong",{parentName:"p"},"box")," (",(0,o.kt)("em",{parentName:"p"},"roll credits"),") with a cat-killing device reacting to some quantum stuff. While we don't open the box, the cat is both alive and dead as the same time, when we open the box, we fix an outcome."),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"Schr\xf6dinger&#39;s cat experiment",src:n(986).Z,width:"1074",height:"954"})),(0,o.kt)("admonition",{type:"info"},(0,o.kt)("p",{parentName:"admonition"},"We ",(0,o.kt)("strong",{parentName:"p"},"love")," cats and the boxes used in the following explanations will only contain JavaScript values.")),(0,o.kt)("h2",{id:"boxes"},"Boxes"),(0,o.kt)("p",null,"The way we like to think of the data-structures we expose are that they're ",(0,o.kt)("strong",{parentName:"p"},"boxes")," (think of it as containers) that ",(0,o.kt)("strong",{parentName:"p"},"may or may not contain a value"),"."),(0,o.kt)("p",null,"Here's a visual example using the ",(0,o.kt)("strong",{parentName:"p"},"Option type"),". The Option represents an optional value, ",(0,o.kt)("strong",{parentName:"p"},"it can have two possible states"),": either ",(0,o.kt)("inlineCode",{parentName:"p"},"Some(value)")," or ",(0,o.kt)("inlineCode",{parentName:"p"},"None()"),"."),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"Option of blue circle, it can be either a box containing a blue circle, which we call Some blue circle, or an empty box, which we call None",src:n(5202).Z,width:"1385",height:"767"})),(0,o.kt)("p",null,"Option is a generic type, meaning you can define what type of value it holds: ",(0,o.kt)("inlineCode",{parentName:"p"},"Option<User>"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"Option<string>")," (just like an array: ",(0,o.kt)("inlineCode",{parentName:"p"},"Array<User>"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"Array<string>"),")."),(0,o.kt)("p",null,"In your program flow, you don't know what's inside, ",(0,o.kt)("strong",{parentName:"p"},"as if the box was closed"),"."),(0,o.kt)("p",null,"When you extract the value from the box, you have a few options:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"// Let's assument we have `option` be of type `Option<number>`\n\n// Returns the value if present or the fallback otherwise\nconst a = option.getOr(0);\n\n// Explode the box\nconst b = option.match({\n  Some: (value) => value,\n  None: () => 0,\n});\n")),(0,o.kt)("h2",{id:"data-manipulation-basics"},"Data-manipulation basics"),(0,o.kt)("p",null,"Most of the data-manipulation you'll do comes down to two function: ",(0,o.kt)("inlineCode",{parentName:"p"},"map")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"flatMap"),"."),(0,o.kt)("p",null,"Here's a visual explanation:"),(0,o.kt)("p",null,(0,o.kt)("img",{alt:"The map function transforms the value with a callback, the flatMap function returns an box itself",src:n(6320).Z,width:"3110",height:"4326"})),(0,o.kt)("p",null,"The ",(0,o.kt)("inlineCode",{parentName:"p"},"map")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"flatMap")," functions allow you to transform data in a typesafe way:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"const some = Option.Some(1);\n// Option.Some<1>\n\nconst none = Option.None();\n// Option.None\n\nconst doubledSome = some.map((x) => x * 2);\n// Option.Some<2>\n\nconst doubledNone = none.map((x) => x * 2);\n// Option.None -> Nothing to transform!\n")),(0,o.kt)("p",null,"The ",(0,o.kt)("inlineCode",{parentName:"p"},"flatMap")," lets you return another option, which can be useful for nested optional values:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},'type UserInfo = {\n  name: Option<string>;\n};\n\ntype User = {\n  id: string;\n  info: Option<UserInfo>;\n};\n\nconst name = user\n  .flatMap((user) => user.info) // Returns the Option<UserInfo>\n  .flatMap((info) => info.name) // Returns the Option<string>\n  .getOr("Anonymous user");\n')),(0,o.kt)("h2",{id:"the-main-kind-of-boxes"},"The main kind of boxes"),(0,o.kt)("h3",{id:"optionvalue"},(0,o.kt)("a",{parentName:"h3",href:"/option"},(0,o.kt)("strong",{parentName:"a"},"Option<Value",">"))),(0,o.kt)("p",null,"Represents optional values:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Replaces ",(0,o.kt)("inlineCode",{parentName:"li"},"undefined")," and ",(0,o.kt)("inlineCode",{parentName:"li"},"null")),(0,o.kt)("li",{parentName:"ul"},"Makes it possible to differentiate nested optionality (",(0,o.kt)("inlineCode",{parentName:"li"},"Some(None())")," vs ",(0,o.kt)("inlineCode",{parentName:"li"},"None()"),")"),(0,o.kt)("li",{parentName:"ul"},"Reduces the number of codepaths needed to read and transform such values")),(0,o.kt)("h3",{id:"resultok-error"},(0,o.kt)("a",{parentName:"h3",href:"/result"},(0,o.kt)("strong",{parentName:"a"},"Result<Ok, Error",">"))),(0,o.kt)("p",null,"Represents a computation that can either succeed or fail:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Replaces exceptions"),(0,o.kt)("li",{parentName:"ul"},'Allows you to have a single codepath instead or "return or throw".'),(0,o.kt)("li",{parentName:"ul"},"Makes it easy to aggregate all possible errors a stack can generate")),(0,o.kt)("h3",{id:"asyncdatavalue"},(0,o.kt)("a",{parentName:"h3",href:"/async-data"},(0,o.kt)("strong",{parentName:"a"},"AsyncData<Value",">"))),(0,o.kt)("p",null,"Represents a value with an asynchronous lifecycle:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Eliminates impossibles cases in your state"),(0,o.kt)("li",{parentName:"ul"},"Avoids inconsistent states induced by traditional modeling"),(0,o.kt)("li",{parentName:"ul"},"Allows you to tie the lifecycle information with the value itself")),(0,o.kt)("h3",{id:"futurevalue"},(0,o.kt)("a",{parentName:"h3",href:"/future"},(0,o.kt)("strong",{parentName:"a"},"Future<Value",">"))),(0,o.kt)("p",null,"Represents an asynchronous value:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Replaces promises"),(0,o.kt)("li",{parentName:"ul"},"Supports cancellation"),(0,o.kt)("li",{parentName:"ul"},"Delegates success/failure to the Result type"),(0,o.kt)("li",{parentName:"ul"},"Exposes a ",(0,o.kt)("inlineCode",{parentName:"li"},"map")," & ",(0,o.kt)("inlineCode",{parentName:"li"},"flatMap")," API")))}d.isMDXComponent=!0},986:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/experiment-565324f87cbe4e36c830c1c333093fc4.png"},6320:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/map-flatmap-f95738f76dbe79a5b58ffa3a5184645d.webp"},5202:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/option-3a6b71386fd878a3acb86dbe414fec5f.png"},2522:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/profunctor-optics-5da0c027fb8f430abacd7390d1fa6393.jpg"}}]);