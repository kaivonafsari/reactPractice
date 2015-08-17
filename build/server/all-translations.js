(function() {var i18n={lc:{"en":function(n){return n===1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){i18n.c(d,k);return d[k]},
p:function(d,k,o,l,p){i18n.c(d,k);return d[k] in p?p[d[k]]:(k=i18n.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){i18n.c(d,k);return d[k] in p?p[d[k]]:p.other}};i18n._={"myMessageFormat":function(d){return i18n.s(d,"GENDER",{"male":"He","female":"She","other":"They"})+" found "+i18n.p(d,"NUM_RESULTS",0,"en",{"one":"1 result","other":i18n.n(d,"NUM_RESULTS")+" results"})+" in "+i18n.p(d,"NUM_CATEGORIES",0,"en",{"one":"1 category","other":i18n.n(d,"NUM_CATEGORIES")+" categories"})+"."},"myKey":function(d){return "The us value for myKey"}};if(__pellet__ref) {__pellet__ref.loadTranslation("en-US",i18n._);}})();

(function() {var i18n={lc:{"en":function(n){return n===1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){i18n.c(d,k);return d[k]},
p:function(d,k,o,l,p){i18n.c(d,k);return d[k] in p?p[d[k]]:(k=i18n.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){i18n.c(d,k);return d[k] in p?p[d[k]]:p.other}};i18n._={"myMessageFormat":function(d){return i18n.s(d,"GENDER",{"male":"He","female":"She","other":"They"})+" found "+i18n.p(d,"NUM_RESULTS",0,"en",{"one":"1 result","other":i18n.n(d,"NUM_RESULTS")+" results"})+" in "+i18n.p(d,"NUM_CATEGORIES",0,"en",{"one":"1 category","other":i18n.n(d,"NUM_CATEGORIES")+" categories"})+"."},"myKey":function(d){return "The us value for myKey"},"myKey":function(d){return "La valeur nous pour myKey"}};if(__pellet__ref) {__pellet__ref.loadTranslation("fr",i18n._);}})();

(function() {var i18n={lc:{"en":function(n){return n===1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"ja":function(n){return "other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){i18n.c(d,k);return d[k]},
p:function(d,k,o,l,p){i18n.c(d,k);return d[k] in p?p[d[k]]:(k=i18n.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){i18n.c(d,k);return d[k] in p?p[d[k]]:p.other}};i18n._={"myMessageFormat":function(d){return i18n.s(d,"GENDER",{"male":"He","female":"She","other":"They"})+" found "+i18n.p(d,"NUM_RESULTS",0,"en",{"one":"1 result","other":i18n.n(d,"NUM_RESULTS")+" results"})+" in "+i18n.p(d,"NUM_CATEGORIES",0,"en",{"one":"1 category","other":i18n.n(d,"NUM_CATEGORIES")+" categories"})+"."},"myKey":function(d){return "The us value for myKey"},"myKey":function(d){return "La valeur nous pour myKey"},"myKey":function(d){return "MYKEY米国の価値"}};if(__pellet__ref) {__pellet__ref.loadTranslation("ja",i18n._);}})();
