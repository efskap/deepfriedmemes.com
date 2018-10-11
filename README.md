Deep fries your pics. Serve with laundry sauce.

live @ http://deepfriedmemes.com

tl;dr on how it works:
  - All processing done locally in the browser. (This means there is **NO EXTERNAL API** to consume, and will never be one without a rewrite. See [#2](https://github.com/efskap/deepfriedmemes.com/issues/2#issuecomment-389071629).)
  - Filters applied by [CamanJS](http://camanjs.com/)
  - JPEG crushing done by drawing image to canvas, converting canvas to a jpeg data url, and repeating through recursion (because we proceed to the next step through the `img.onload` callback)
  - Bulging done using [glfx](http://evanw.github.io/glfx.js/)
  
I'm probably not going to add ~~bulging~~ (nvm) / emojis because it seems kinda out of scope. But if you know a clean / fast way to do it, submit a PR :D

