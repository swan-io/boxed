"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[437],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var r=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=r.createContext({}),s=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},p=function(e){var t=s(e.components);return r.createElement(l.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,l=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),d=s(n),m=i,f=d["".concat(l,".").concat(m)]||d[m]||u[m]||o;return n?r.createElement(f,a(a({ref:t},p),{},{components:n})):r.createElement(f,a({ref:t},p))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=m;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c[d]="string"==typeof e?e:i,a[1]=c;for(var s=2;s<o;s++)a[s]=n[s];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},2496:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>a,default:()=>u,frontMatter:()=>o,metadata:()=>c,toc:()=>s});var r=n(7462),i=(n(7294),n(3905));const o={title:"Dict",sidebar_label:"Dict"},a=void 0,c={unversionedId:"dict",id:"dict",title:"Dict",description:"Dict.entries(dict)",source:"@site/docs/dict.md",sourceDirName:".",slug:"/dict",permalink:"/boxed/dict",draft:!1,editUrl:"https://github.com/swan-io/boxed/edit/main/docs/docs/dict.md",tags:[],version:"current",frontMatter:{title:"Dict",sidebar_label:"Dict"},sidebar:"docs",previous:{title:"Array",permalink:"/boxed/array"},next:{title:"Lazy",permalink:"/boxed/lazy"}},l={},s=[{value:"Dict.entries(dict)",id:"dictentriesdict",level:2},{value:"Dict.keys(dict)",id:"dictkeysdict",level:2},{value:"Dict.values(dict)",id:"dictvaluesdict",level:2},{value:"Dict.fromOptional(dictOfOptions)",id:"dictfromoptionaldictofoptions",level:2}],p={toc:s},d="wrapper";function u(e){let{components:t,...n}=e;return(0,i.kt)(d,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts"},'import { Dict } from "@swan-io/boxed";\n')),(0,i.kt)("h2",{id:"dictentriesdict"},"Dict.entries(dict)"),(0,i.kt)("p",null,"Returns the entries in the dict."),(0,i.kt)("p",null,"Contrary to the TS bindings for ",(0,i.kt)("inlineCode",{parentName:"p"},"Object.entries"),", the types are refined."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="Examples"',title:'"Examples"'},'const index = Dict.entries({ foo: 1, bar: 2, baz: 3 });\n// [["foo", 1], ["bar", 2], ["baz", 3]];\n')),(0,i.kt)("h2",{id:"dictkeysdict"},"Dict.keys(dict)"),(0,i.kt)("p",null,"Returns the keys in the dict."),(0,i.kt)("p",null,"Contrary to the TS bindings for ",(0,i.kt)("inlineCode",{parentName:"p"},"Object.keys"),", the types are refined."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="Examples"',title:'"Examples"'},'const index = Dict.keys({ foo: 1, bar: 2, baz: 3 });\n// ["foo", "bar", "baz"];\n')),(0,i.kt)("h2",{id:"dictvaluesdict"},"Dict.values(dict)"),(0,i.kt)("p",null,"Returns the values in the dict."),(0,i.kt)("p",null,"Contrary to the TS bindings for ",(0,i.kt)("inlineCode",{parentName:"p"},"Object.values"),", the types are refined."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="Examples"',title:'"Examples"'},"const index = Dict.values({ foo: 1, bar: 2, baz: 3 });\n// [1, 2, 3];\n")),(0,i.kt)("h2",{id:"dictfromoptionaldictofoptions"},"Dict.fromOptional(dictOfOptions)"),(0,i.kt)("p",null,"Takes a dict whose values are ",(0,i.kt)("inlineCode",{parentName:"p"},"Option<unknown>")," and returns a dict containing only the values contained in ",(0,i.kt)("inlineCode",{parentName:"p"},"Some"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-ts",metastring:'title="Examples"',title:'"Examples"'},"Dict.fromOptional({\n  foo: Option.Some(1),\n  bar: Option.None(),\n  baz: Option.None(),\n});\n// {foo: 1}\n\nDict.fromOptional({\n  foo: Option.Some(1),\n  bar: Option.Some(2),\n  baz: Option.None(),\n});\n// {foo: 1, bar: 2}\n\nDict.fromOptional({\n  foo: Option.None(),\n  bar: Option.None(),\n  baz: Option.None(),\n});\n// {}\n")))}u.isMDXComponent=!0}}]);