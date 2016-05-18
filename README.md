# edition-node-gulp
The gulp wrapper around patternlab-node core.

**Work In Progress** **Unstable** **Infantile** **Borked**

Be warned, this is work-in-progress development, aligning with the broader [Pattern Lab Node Roadmap](https://github.com/pattern-lab/patternlab-node/wiki/Roadmap#v2xx-upcoming--future).

#### Fuzzy Steps to Launch (possibly missing things)

1. `npm install pattern-lab/edition-node-gulp#dev`
2. cd to node_modules/styleguidekit-assets-default (this needs improvements as a post install step)
3. `npm install` (this needs improvements as a post install step)
4. `gulp` to build the dist assets (this needs improvements as a post install step)
  * you might run into some `bower_components` errors. I did this once and just copied src to dist
5. cd back to root
6. `gulp pl-serve`


#### Running Against Local Core

Alter the entry within the gulpfile that requirs the npm-installed core module, and replace it with a local copy, like below.

```
/******************************************************
 * PATTERN LAB CONFIGURATION
******************************************************/
//read all paths from our namespaced config file
var config = require('./patternlab-config.json'),
    //pl = require('patternlab-node')(config);
    pl = require('C:\\src\\pln\\core\\lib\\patternlab.js')(config);
```
